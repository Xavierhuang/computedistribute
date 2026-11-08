// Job queue backed by Postgres. Every state change is a single conditional UPDATE,
// so concurrent workers, buyers and the reaper never need application-level locks.

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
    created_at: row.created_at,
    started_at: row.started_at,
    finished_at: row.finished_at,
  };
}

// Returns { job, created }. A repeated idempotency key returns the original job.
async function enqueue(pool, buyerId, { type, input, minVramGb = 0, priority = 0, maxAttempts = 3, idempotencyKey = null }) {
  const { rows } = await pool.query(
    `INSERT INTO jobs (buyer_id, type, input, min_vram_gb, priority, max_attempts, idempotency_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (buyer_id, idempotency_key) DO NOTHING
     RETURNING *`,
    [buyerId, type, JSON.stringify(input), minVramGb, priority, maxAttempts, idempotencyKey],
  );
  if (rows.length) return { job: rows[0], created: true };
  const existing = await pool.query(
    'SELECT * FROM jobs WHERE buyer_id = $1 AND idempotency_key = $2',
    [buyerId, idempotencyKey],
  );
  return { job: existing.rows[0], created: false };
}

async function getBuyerJob(pool, buyerId, jobId) {
  const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1 AND buyer_id = $2', [jobId, buyerId]);
  return rows[0] || null;
}

async function listBuyerJobs(pool, buyerId, { status = null, limit = 20 }) {
  const { rows } = await pool.query(
    `SELECT * FROM jobs WHERE buyer_id = $1 AND ($2::text IS NULL OR status = $2)
     ORDER BY created_at DESC LIMIT $3`,
    [buyerId, status, limit],
  );
  return rows;
}

// Cancels a queued or running job. A running job's lease is dropped, so the
// worker's next heartbeat or completion is rejected and it stops.
async function cancel(pool, buyerId, jobId) {
  const { rows } = await pool.query(
    `UPDATE jobs SET status = 'canceled', finished_at = now(),
       lease_id = NULL, lease_expires_at = NULL
     WHERE id = $1 AND buyer_id = $2 AND status IN ('queued', 'running')
     RETURNING *`,
    [jobId, buyerId],
  );
  return rows[0] || null;
}

async function registerWorker(pool, hostId, { name, jobTypes, vramGb = 0, capabilities = {} }) {
  const { rows } = await pool.query(
    `INSERT INTO workers (account_id, name, job_types, vram_gb, capabilities, last_seen_at)
     VALUES ($1, $2, $3, $4, $5, now()) RETURNING *`,
    [hostId, name, jobTypes, vramGb, JSON.stringify(capabilities)],
  );
  return rows[0];
}

// Atomically hands the highest-priority matching job to this worker, or returns null.
// SKIP LOCKED lets many workers claim concurrently without ever taking the same job.
async function claim(pool, hostId, workerId, leaseSeconds) {
  const { rows: [worker] } = await pool.query(
    'SELECT * FROM workers WHERE id = $1 AND account_id = $2',
    [workerId, hostId],
  );
  if (!worker) return { error: 'worker_not_found' };
  await touchWorker(pool, worker.id);
  const { rows } = await pool.query(
    `UPDATE jobs SET status = 'running', worker_id = $1, lease_id = gen_random_uuid(),
       lease_expires_at = now() + make_interval(secs => $4), attempts = attempts + 1,
       started_at = coalesce(started_at, now())
     WHERE id = (
       SELECT id FROM jobs
       WHERE status = 'queued' AND type = ANY($2) AND min_vram_gb <= $3
       ORDER BY priority DESC, created_at
       FOR UPDATE SKIP LOCKED
       LIMIT 1
     )
     RETURNING *`,
    [worker.id, worker.job_types, worker.vram_gb, leaseSeconds],
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

async function complete(pool, hostId, leaseId, output) {
  const { rows } = await pool.query(
    `UPDATE jobs SET status = 'succeeded', output = $3, error = NULL, finished_at = now(),
       lease_id = NULL, lease_expires_at = NULL
     WHERE ${OWNED_LEASE} RETURNING *`,
    [leaseId, hostId, JSON.stringify(output ?? null)],
  );
  return rows[0] || null;
}

// A retryable failure goes back in the queue until max_attempts is used up.
async function fail(pool, hostId, leaseId, { error, retryable }) {
  const { rows } = await pool.query(
    `UPDATE jobs SET
       status = CASE WHEN $4 AND attempts < max_attempts THEN 'queued' ELSE 'failed' END,
       finished_at = CASE WHEN $4 AND attempts < max_attempts THEN NULL ELSE now() END,
       error = $3, worker_id = NULL, lease_id = NULL, lease_expires_at = NULL
     WHERE ${OWNED_LEASE} RETURNING *`,
    [leaseId, hostId, error, retryable],
  );
  return rows[0] || null;
}

// Requeues jobs whose worker stopped heartbeating (or fails them once out of attempts).
async function reapExpiredLeases(pool) {
  const { rowCount } = await pool.query(
    `UPDATE jobs SET
       status = CASE WHEN attempts < max_attempts THEN 'queued' ELSE 'failed' END,
       finished_at = CASE WHEN attempts < max_attempts THEN NULL ELSE now() END,
       error = 'lease expired: worker stopped responding',
       worker_id = NULL, lease_id = NULL, lease_expires_at = NULL
     WHERE status = 'running' AND lease_expires_at < now()`,
  );
  return rowCount;
}

module.exports = {
  toPublicJob,
  enqueue,
  getBuyerJob,
  listBuyerJobs,
  cancel,
  registerWorker,
  claim,
  heartbeat,
  complete,
  fail,
  reapExpiredLeases,
};
