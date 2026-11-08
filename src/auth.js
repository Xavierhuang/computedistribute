const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const KEY_PREFIX = 'cd_';
const SESSION_COOKIE = 'cd_session';
const SESSION_DAYS = 30;
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hashKey = sha256;
const newToken = (prefix = '') => prefix + crypto.randomBytes(32).toString('base64url');

// ---------- Passwords ----------

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), hash.toString('base64')].join('$');
}

async function verifyPassword(password, stored) {
  const [alg, N, r, p, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(actual, expected);
}

// Spent on unknown emails too, so response time doesn't reveal which emails exist.
const DUMMY_HASH = hashPassword('not-a-real-password');

// ---------- Accounts and API keys ----------

async function insertApiKey(db, accountId, name = null) {
  const apiKey = newToken(KEY_PREFIX);
  const { rows: [row] } = await db.query(
    `INSERT INTO api_keys (account_id, key_hash, key_prefix, name) VALUES ($1, $2, $3, $4)
     RETURNING id, key_prefix, name, created_at`,
    [accountId, hashKey(apiKey), apiKey.slice(0, 10), name],
  );
  return { apiKey, key: row };
}

// Creates an account and its first API key (used by scripts and tests).
// The plaintext key is returned once and never stored.
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
    const { apiKey } = await insertApiKey(client, account.id, 'default');
    await client.query('COMMIT');
    return { account, apiKey };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listApiKeys(db, accountId) {
  const { rows } = await db.query(
    `SELECT id, key_prefix, name, created_at, last_used_at FROM api_keys
     WHERE account_id = $1 AND revoked_at IS NULL ORDER BY created_at`,
    [accountId],
  );
  return rows;
}

async function revokeApiKey(db, accountId, keyId) {
  const { rowCount } = await db.query(
    'UPDATE api_keys SET revoked_at = now() WHERE id = $1 AND account_id = $2 AND revoked_at IS NULL',
    [keyId, accountId],
  );
  return rowCount === 1;
}

// ---------- Users and sessions ----------

async function createUser(pool, { email, password, name, kind }) {
  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [account] } = await client.query(
      'INSERT INTO accounts (name, kind) VALUES ($1, $2) RETURNING *', [name, kind],
    );
    const { rows: [user] } = await client.query(
      'INSERT INTO users (account_id, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [account.id, email, passwordHash],
    );
    await client.query('COMMIT');
    return { user, account };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return { error: 'email_taken' };
    throw err;
  } finally {
    client.release();
  }
}

async function authenticateUser(pool, email, password) {
  const { rows: [user] } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email]);
  if (!user) {
    await verifyPassword(password, await DUMMY_HASH);
    return null;
  }
  return (await verifyPassword(password, user.password_hash)) ? user : null;
}

async function createSession(pool, userId) {
  const token = newToken();
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(days => $3))`,
    [sha256(token), userId, SESSION_DAYS],
  );
  return token;
}

function destroySession(pool, token) {
  return pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]);
}

function sessionCookie(token, { secure }) {
  const attrs = [`${SESSION_COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${SESSION_DAYS * 86400}`];
  if (secure) attrs.push('Secure');
  return attrs.join('; ');
}

function clearedCookie({ secure }) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

function readSessionToken(req) {
  const header = req.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === SESSION_COOKIE) return v.join('=') || null;
  }
  return null;
}

// Resolves the caller from `Authorization: Bearer <api key>` or the dashboard session
// cookie. Sets req.account (+ req.user for sessions). Returns null if neither is valid.
async function resolveCaller(pool, req) {
  const bearer = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '');
  if (bearer) {
    const { rows: [row] } = await pool.query(
      `SELECT a.*, k.id AS key_id, k.last_used_at AS key_last_used_at
       FROM api_keys k JOIN accounts a ON a.id = k.account_id
       WHERE k.key_hash = $1 AND k.revoked_at IS NULL`,
      [hashKey(bearer[1])],
    );
    if (!row) return { error: 'invalid_api_key' };
    // Record usage at most every 5 minutes to avoid a write per request.
    if (!row.key_last_used_at || Date.now() - new Date(row.key_last_used_at) > 5 * 60_000) {
      await pool.query('UPDATE api_keys SET last_used_at = now() WHERE id = $1', [row.key_id]);
    }
    return { account: row, via: 'api_key' };
  }
  const token = readSessionToken(req);
  if (token) {
    const { rows: [row] } = await pool.query(
      `SELECT u.id AS user_id, u.email, a.* FROM sessions s
       JOIN users u ON u.id = s.user_id JOIN accounts a ON a.id = u.account_id
       WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha256(token)],
    );
    if (row) return { account: row, user: { id: row.user_id, email: row.email }, via: 'session' };
  }
  return null;
}

// Express middleware requiring an account of `kind` ('buyer' | 'host' | null for any).
// Cookie-authenticated POSTs must be JSON: an HTML form can only send form encodings,
// and a cross-site JSON fetch needs a CORS preflight we never grant. Other write
// methods (PUT/DELETE) always need a preflight. With SameSite=Lax this blocks CSRF.
function requireAccount(pool, kind, { allowSuspended = false } = {}) {
  return async (req, res, next) => {
    try {
      const caller = await resolveCaller(pool, req);
      if (!caller) return res.status(401).json({ error: 'not_authenticated' });
      if (caller.error) return res.status(401).json({ error: caller.error });
      if (kind && caller.account.kind !== kind) return res.status(403).json({ error: `requires_${kind}_account` });
      if (caller.account.suspended_at && !allowSuspended) {
        return res.status(403).json({ error: 'account_suspended', reason: caller.account.suspended_reason });
      }
      if (caller.via === 'session' && req.method === 'POST' && !req.is('application/json')) {
        return res.status(415).json({ error: 'json_required' });
      }
      req.account = caller.account;
      req.user = caller.user || null;
      req.authVia = caller.via;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  hashKey,
  hashPassword,
  verifyPassword,
  createAccount,
  insertApiKey,
  listApiKeys,
  revokeApiKey,
  createUser,
  authenticateUser,
  createSession,
  destroySession,
  sessionCookie,
  clearedCookie,
  readSessionToken,
  requireAccount,
};
