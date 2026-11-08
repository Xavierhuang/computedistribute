// Spot-check verification: a sample of successful jobs is re-run on a different
// host. If the two results disagree, the buyer is refunded, the original host's
// earning is clawed back, and hosts that keep failing checks are suspended.
//
// With only two runs we can't tell which host was wrong, so a single mismatch
// only costs the original host that job's earning; suspension needs a pattern.

const { addEntry } = require('./ledger');

const VERIFIABLE_TYPES = new Set(['transcribe']);
const MIN_SIMILARITY = 0.8;
const SUSPEND_AFTER_FAILS = 3;
const SUSPEND_FAIL_RATE = 0.25;

function words(text) {
  return String(text).toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, ' ').split(/\s+/).filter(Boolean);
}

// Dice coefficient over word bigrams: 1 for identical transcripts, near 0 for
// unrelated text. Linear time, so long transcripts are cheap to compare.
function transcriptSimilarity(a, b) {
  const grams = (ws) => {
    const counts = new Map();
    const list = ws.length === 1 ? ws : ws.slice(1).map((w, i) => `${ws[i]} ${w}`);
    for (const g of list) counts.set(g, (counts.get(g) || 0) + 1);
    return { counts, size: list.length };
  };
  const A = grams(words(a));
  const B = grams(words(b));
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let overlap = 0;
  for (const [g, n] of A.counts) overlap += Math.min(n, B.counts.get(g) || 0);
  return (2 * overlap) / (A.size + B.size);
}

function compareOutputs(type, original, check) {
  if (type !== 'transcribe') return { similarity: 1, passed: true };
  const similarity = transcriptSimilarity(original.text, check.text);
  const tolerance = Math.max(1, 0.02 * Math.max(original.duration_s, check.duration_s));
  const durationOk = Math.abs(original.duration_s - check.duration_s) <= tolerance;
  return { similarity: Math.round(similarity * 1000) / 1000, passed: similarity >= MIN_SIMILARITY && durationOk };
}

async function systemAccountId(client) {
  await client.query(
    `INSERT INTO accounts (name, kind, is_system) VALUES ('system:verifier', 'buyer', true)
     ON CONFLICT (is_system) WHERE is_system DO NOTHING`,
  );
  const { rows } = await client.query('SELECT id FROM accounts WHERE is_system LIMIT 1');
  return rows[0].id;
}

// Called inside the completion transaction of a normal (non-verification) job.
async function maybeScheduleVerification(client, job, verifyRate) {
  if (!VERIFIABLE_TYPES.has(job.type) || job.verifies_job_id || !(Math.random() < verifyRate)) return null;
  const buyerId = await systemAccountId(client);
  if (job.buyer_id === buyerId) return null;
  const { rows } = await client.query(
    `INSERT INTO jobs (buyer_id, type, input, min_vram_gb, priority, max_attempts, verifies_job_id)
     VALUES ($1, $2, $3, $4, -10, 2, $5) RETURNING id`,
    [buyerId, job.type, JSON.stringify(job.input), job.min_vram_gb, job.id],
  );
  return rows[0].id;
}

// Called inside the completion transaction of a verification job.
async function evaluateVerification(client, verifyJob) {
  const { rows: [original] } = await client.query(
    "SELECT * FROM jobs WHERE id = $1 AND status = 'succeeded' FOR UPDATE",
    [verifyJob.verifies_job_id],
  );
  if (!original) return null; // canceled or deleted meanwhile
  const result = compareOutputs(original.type, original.output, verifyJob.output);
  const inserted = await client.query(
    `INSERT INTO verifications (job_id, verify_job_id, host_account_id, similarity, passed)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (job_id) DO NOTHING`,
    [original.id, verifyJob.id, original.host_account_id, result.similarity, result.passed],
  );
  if (inserted.rowCount === 0 || result.passed) return result;

  const cost = Number(original.cost_micros || 0);
  const earning = Number(original.host_earning_micros || 0);
  if (cost > 0) {
    await addEntry(client, { accountId: original.buyer_id, amountMicros: cost, kind: 'refund', jobId: original.id, ref: original.id, memo: 'Result failed a verification re-run' });
  }
  if (earning > 0 && original.host_account_id) {
    await addEntry(client, { accountId: original.host_account_id, amountMicros: -earning, kind: 'clawback', jobId: original.id, ref: original.id, memo: 'Result failed a verification re-run' });
  }
  if (original.host_account_id) await maybeSuspendHost(client, original.host_account_id);
  return result;
}

async function maybeSuspendHost(client, hostAccountId) {
  const { rows: [stats] } = await client.query(
    `SELECT count(*) FILTER (WHERE NOT passed)::int AS fails, count(*)::int AS total
     FROM verifications WHERE host_account_id = $1`,
    [hostAccountId],
  );
  if (stats.fails >= SUSPEND_AFTER_FAILS && stats.fails / stats.total > SUSPEND_FAIL_RATE) {
    await client.query(
      `UPDATE accounts SET suspended_at = now(), suspended_reason = $2
       WHERE id = $1 AND suspended_at IS NULL`,
      [hostAccountId, `failed ${stats.fails} of ${stats.total} verification checks`],
    );
  }
}

module.exports = { transcriptSimilarity, compareOutputs, maybeScheduleVerification, evaluateVerification, systemAccountId };
