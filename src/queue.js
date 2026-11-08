// Job queue backed by Postgres. Each state change is a conditional UPDATE, and any
// money that moves with it (holds, charges, host earnings) is written in the same
// transaction, so a job is charged or released exactly once.

const { withTx, addEntry, balanceMicros, lockAccount } = require('./ledger');
const { pricing, settle, usd } = require('./pricing');
const { maybeScheduleVerification, evaluateVerification } = require('./verify');

class InsufficientFunds extends Error {
  constructor(needed, available) {
    super(`this job needs a $${usd(needed).toFixed(4)} hold but the balance is $${usd(available).toFixed(4)}`);
    this.needed = needed;
    this.available = available;
  }
}

// Jobs owned by a host: the lease must match AND the job's worker must belong to that host.
const OWNED_LEASE = `lease_id = $1 AND status = 'running'
  AND worker_id IN (SELECT id FROM workers WHERE account_id = $2)`;

function toPublicJob(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    input: row.input,
    output: row.output,
    error: row.error,
    priority: row.priority,
    min_vram_gb: Number(row.min_vram_gb),
    attempts: row.attempts,
    max_attempts: row.max_attempts,
    hold_usd: usd(row.hold_micros ?? 0),
    cost_usd: row.cost_micros == null ? null : usd(row.cost_micros),
    worker_name: row.worker_name,
    created_at: row.created_at,
    started_at: row.started_at,
    finished_at: row.finished_at,
  };
}

// Places the job and its funds hold atomically. Returns { job, created }; a repeated
// idempotency key returns the original job. Throws InsufficientFunds.
async function enqueue(pool, buyerId, { type, input, minVramGb = 0, priority = 0, maxAttempts = 3, idempotencyKey = null }) {
  return withTx(pool, async (client) => {
    const account = await lockAccount(client, buyerId); // serialises this buyer's submissions
    if (idempotencyKey) {
      const { rows } = await client.query(
        'SELECT * FROM jobs WHERE buyer_id = $1 AND idempotency_key = $2',
        [buyerId, idempotencyKey],
      );
      if (rows[0]) return { job: rows[0], created: false };
    }
    const hold = account.is_system ? 0 : pricing[type].hold(input);
    if (hold > 0) {
      const available = await balanceMicros(client, buyerId);
      if (available < hold) throw new InsufficientFunds(hold, available);
    }
    const { rows: [job] } = await client.query(
      `INSERT INTO jobs (buyer_id, type, input, min_vram_gb, priority, max_attempts, idempotency_key, hold_micros)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [buyerId, type, JSON.stringify(input), minVramGb, priority, maxAttempts, idempotencyKey, hold],
    );
    if (hold > 0) {
      await addEntry(client, { accountId: buyerId, amountMicros: -hold, kind: 'hold', jobId: job.id, ref: job.id, memo: `Hold for ${type} job` });
    }
    return { job, created: true };
  });
}

// Returns a finished job's unused hold to the buyer (idempotent per job).
function releaseHold(client, job) {
  if (Number(job.hold_micros) <= 0) return null;
  return addEntry(client, { accountId: job.buyer_id, amountMicros: Number(job.hold_micros), kind: 'release', jobId: job.id, ref: job.id, memo: 'Hold released' });
}

async function getBuyerJob(pool, buyerId, jobId) {
  const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1 AND buyer_id = $2', [jobId, buyerId]);
  return rows[0] || null;
}

async function listBuyerJobs(pool, buyerId, { status = null, limit = 20 }) {
  const { rows } = await pool.query(
    `SELECT j.*, w.name AS worker_name FROM jobs j LEFT JOIN workers w ON w.id = j.worker_id
     WHERE j.buyer_id = $1 AND ($2::text IS NULL OR j.status = $2)
     ORDER BY j.created_at DESC LIMIT $3`,
    [buyerId, status, limit],
  );
  return rows;
}

// Cancels a queued or running job and releases its hold. A running job's lease is
// dropped, so the worker's next heartbeat or completion is rejected and it stops.
async function cancel(pool, buyerId, jobId) {
  return withTx(pool, async (client) => {
    const { rows } = await client.query(
      `UPDATE jobs SET status = 'canceled', finished_at = now(), lease_id = NULL, lease_expires_at = NULL
       WHERE id = $1 AND buyer_id = $2 AND status IN ('queued', 'running') RETURNING *`,
      [jobId, buyerId],
    );
    if (rows[0]) await releaseHold(client, rows[0]);
    return rows[0] || null;
  });
}

async function registerWorker(pool, hostId, { name, jobTypes, vramGb = 0, capabilities = {} }) {
  const { rows } = await pool.query(
    `INSERT INTO workers (account_id, name, job_types, vram_gb, capabilities, last_seen_at)
     VALUES ($1, $2, $3, $4, $5, now()) RETURNING *`,
    [hostId, name, jobTypes, vramGb, JSON.stringify(capabilities)],
  );
  return rows[0];
}

async function updateWorker(pool, hostId, workerId, { name, jobTypes, vramGb = 0, capabilities = {} }) {
  const { rows } = await pool.query(
    `UPDATE workers SET name = $3, job_types = $4, vram_gb = $5, capabilities = $6, last_seen_at = now()
     WHERE id = $1 AND account_id = $2 RETURNING *`,
    [workerId, hostId, name, jobTypes, vramGb, JSON.stringify(capabilities)],
  );
  return rows[0] || null;
}

// A host's workers with lifetime stats, for the dashboard.
async function listHostWorkers(pool, hostId) {
  const { rows } = await pool.query(
    `SELECT w.id, w.name, w.job_types, w.vram_gb, w.last_seen_at, w.created_at,
       count(j.id) FILTER (WHERE j.status = 'succeeded')::int AS jobs_succeeded,
       count(j.id) FILTER (WHERE j.status = 'running')::int AS jobs_running,
       coalesce(sum(j.host_earning_micros) FILTER (WHERE j.status = 'succeeded'), 0)::bigint AS earned_micros
     FROM workers w LEFT JOIN jobs j ON j.worker_id = w.id
     WHERE w.account_id = $1 GROUP BY w.id ORDER BY w.created_at`,
    [hostId],
  );
  return rows.map((w) => ({ ...w, vram_gb: Number(w.vram_gb), earned_usd: usd(w.earned_micros), earned_micros: undefined }));
}

// Atomically hands the highest-priority matching job to this worker, or returns null.
// SKIP LOCKED lets many workers claim concurrently without ever taking the same job.
// A verification job is never given to the host whose result it is checking.
async function claim(pool, hostId, workerId, leaseSeconds) {
  const { rows: [worker] } = await pool.query(
    'SELECT * FROM workers WHERE id = $1 AND account_id = $2',
    [workerId, hostId],
  );
  if (!worker) return { error: 'worker_not_found' };
  await touchWorker(pool, worker.id);
  const { rows } = await pool.query(
    `UPDATE jobs SET status = 'running', worker_id = $1, host_account_id = $5, lease_id = gen_random_uuid(),
       lease_expires_at = now() + make_interval(secs => $4), attempts = attempts + 1,
       started_at = coalesce(started_at, now())
     WHERE id = (
       SELECT j.id FROM jobs j
       WHERE j.status = 'queued' AND j.type = ANY($2) AND j.min_vram_gb <= $3
         AND (j.verifies_job_id IS NULL OR NOT EXISTS (
           SELECT 1 FROM jobs o WHERE o.id = j.verifies_job_id AND o.host_account_id = $5))
       ORDER BY j.priority DESC, j.created_at
       FOR UPDATE SKIP LOCKED
       LIMIT 1
     )
     RETURNING *`,
    [worker.id, worker.job_types, worker.vram_gb, leaseSeconds, hostId],
  );
  return { job: rows[0] || null };
}

async function heartbeat(pool, hostId, leaseId, leaseSeconds) {
  const { rows } = await pool.query(
    `UPDATE jobs SET lease_expires_at = now() + make_interval(secs => $3)
     WHERE ${OWNED_LEASE} RETURNING *`,
    [leaseId, hostId, leaseSeconds],
  );
  if (rows[0]) await touchWorker(pool, rows[0].worker_id);
  return rows[0] || null;
}

// Records that a worker is alive, at most every 30s, so frequent polls and
// heartbeats don't rewrite the row each time.
function touchWorker(pool, workerId) {
  return pool.query(
    `UPDATE workers SET last_seen_at = now()
     WHERE id = $1 AND (last_seen_at IS NULL OR last_seen_at < now() - interval '30 seconds')`,
    [workerId],
  );
}

// Completes a job and settles it: release the hold, charge the buyer, credit the host.
// Returns { job } | { error: 'lease_lost' } | { error: 'invalid_output', message }.
async function complete(pool, hostId, leaseId, output, { verifyRate = 0 } = {}) {
  return withTx(pool, async (client) => {
    const { rows: [job] } = await client.query(`SELECT * FROM jobs WHERE ${OWNED_LEASE} FOR UPDATE`, [leaseId, hostId]);
    if (!job) return { error: 'lease_lost' };
    const problem = pricing[job.type].validateOutput(output);
    if (problem) return { error: 'invalid_output', message: problem };

    const { costMicros, hostEarningMicros } = settle(job.type, job.input, output, job.verifies_job_id ? Infinity : job.hold_micros);
    const { rows: [done] } = await client.query(
      `UPDATE jobs SET status = 'succeeded', output = $2, error = NULL, finished_at = now(),
         lease_id = NULL, lease_expires_at = NULL, cost_micros = $3, host_earning_micros = $4
       WHERE id = $1 RETURNING *`,
      [job.id, JSON.stringify(output), job.verifies_job_id ? 0 : costMicros, hostEarningMicros],
    );

    await releaseHold(client, done);
    if (!job.verifies_job_id && costMicros > 0) {
      await addEntry(client, { accountId: done.buyer_id, amountMicros: -costMicros, kind: 'charge', jobId: done.id, ref: done.id, memo: `${done.type} job` });
    }
    // Verification re-runs are paid by the platform, so the checking host earns too.
    if (hostEarningMicros > 0) {
      await addEntry(client, { accountId: hostId, amountMicros: hostEarningMicros, kind: 'earning', jobId: done.id, ref: done.id, memo: `${done.type} job` });
    }
    if (done.verifies_job_id) await evaluateVerification(client, done);
    else await maybeScheduleVerification(client, done, verifyRate);
    return { job: done };
  });
}

// A retryable failure goes back in the queue until max_attempts is used up. A job
// that finally fails releases its hold; the buyer pays nothing.
async function fail(pool, hostId, leaseId, { error, retryable }) {
  return withTx(pool, async (client) => {
    const { rows } = await client.query(
      `UPDATE jobs SET
         status = CASE WHEN $4 AND attempts < max_attempts THEN 'queued' ELSE 'failed' END,
         finished_at = CASE WHEN $4 AND attempts < max_attempts THEN NULL ELSE now() END,
         error = $3, worker_id = NULL, lease_id = NULL, lease_expires_at = NULL
       WHERE ${OWNED_LEASE} RETURNING *`,
      [leaseId, hostId, error, retryable],
    );
    if (rows[0]?.status === 'failed') await releaseHold(client, rows[0]);
    return rows[0] || null;
  });
}

// Requeues jobs whose worker stopped heartbeating, or fails them once out of attempts
// and releases their holds, in a single statement.
async function reapExpiredLeases(pool) {
  const { rows } = await pool.query(
    `WITH reaped AS (
       UPDATE jobs SET
         status = CASE WHEN attempts < max_attempts THEN 'queued' ELSE 'failed' END,
         finished_at = CASE WHEN attempts < max_attempts THEN NULL ELSE now() END,
         error = 'lease expired: worker stopped responding',
         worker_id = NULL, lease_id = NULL, lease_expires_at = NULL
       WHERE status = 'running' AND lease_expires_at < now()
       RETURNING id, buyer_id, status, hold_micros
     ), released AS (
       INSERT INTO ledger_entries (account_id, amount_micros, kind, job_id, ref, memo)
       SELECT buyer_id, hold_micros, 'release', id, id::text, 'Hold released'
       FROM reaped WHERE status = 'failed' AND hold_micros > 0
       ON CONFLICT (kind, ref) WHERE ref IS NOT NULL DO NOTHING
     )
     SELECT count(*)::int AS n FROM reaped`,
  );
  return rows[0].n;
}

module.exports = {
  InsufficientFunds,
  toPublicJob,
  enqueue,
  getBuyerJob,
  listBuyerJobs,
  cancel,
  registerWorker,
  updateWorker,
  listHostWorkers,
  claim,
  heartbeat,
  complete,
  fail,
  reapExpiredLeases,
};
