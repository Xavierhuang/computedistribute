const crypto = require('node:crypto');

const KEY_PREFIX = 'cd_';

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Creates an account and its first API key. The plaintext key is returned once and never stored.
async function createAccount(pool, { name, kind }) {
  if (!['buyer', 'host'].includes(kind)) throw new Error('kind must be "buyer" or "host"');
  if (!name || typeof name !== 'string') throw new Error('name is required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [account] } = await client.query(
      'INSERT INTO accounts (name, kind) VALUES ($1, $2) RETURNING id, name, kind, created_at',
      [name, kind],
    );
    const apiKey = KEY_PREFIX + crypto.randomBytes(32).toString('base64url');
    await client.query(
      'INSERT INTO api_keys (account_id, key_hash, key_prefix) VALUES ($1, $2, $3)',
      [account.id, hashKey(apiKey), apiKey.slice(0, 10)],
    );
    await client.query('COMMIT');
    return { account, apiKey };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Express middleware: resolves `Authorization: Bearer <key>` to req.account and checks its kind.
function requireAccount(pool, kind) {
  return async (req, res, next) => {
    try {
      const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '');
      if (!match) return res.status(401).json({ error: 'missing_api_key' });
      const { rows } = await pool.query(
        `SELECT a.id, a.name, a.kind FROM api_keys k JOIN accounts a ON a.id = k.account_id
         WHERE k.key_hash = $1 AND k.revoked_at IS NULL`,
        [hashKey(match[1])],
      );
      if (rows.length === 0) return res.status(401).json({ error: 'invalid_api_key' });
      if (rows[0].kind !== kind) return res.status(403).json({ error: `requires_${kind}_key` });
      req.account = rows[0];
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { createAccount, requireAccount, hashKey };
