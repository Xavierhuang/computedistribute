// Append-only money ledger. All amounts are integer micro-dollars.

async function withTx(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// Inserts an entry. Entries with a ref are idempotent per (kind, ref): a repeat
// returns false and changes nothing.
async function addEntry(db, { accountId, amountMicros, kind, jobId = null, ref = null, memo = null }) {
  const { rowCount } = await db.query(
    `INSERT INTO ledger_entries (account_id, amount_micros, kind, job_id, ref, memo)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (kind, ref) WHERE ref IS NOT NULL DO NOTHING`,
    [accountId, amountMicros, kind, jobId, ref, memo],
  );
  return rowCount === 1;
}

async function balanceMicros(db, accountId) {
  const { rows } = await db.query(
    'SELECT coalesce(sum(amount_micros), 0)::bigint AS balance FROM ledger_entries WHERE account_id = $1',
    [accountId],
  );
  return Number(rows[0].balance);
}

// Serialises money movements for one account within the current transaction.
async function lockAccount(client, accountId) {
  const { rows } = await client.query('SELECT * FROM accounts WHERE id = $1 FOR UPDATE', [accountId]);
  return rows[0] || null;
}

async function listEntries(db, accountId, limit = 50) {
  const { rows } = await db.query(
    `SELECT id, amount_micros, kind, job_id, memo, created_at FROM ledger_entries
     WHERE account_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2`,
    [accountId, limit],
  );
  return rows;
}

module.exports = { withTx, addEntry, balanceMicros, lockAccount, listEntries };
