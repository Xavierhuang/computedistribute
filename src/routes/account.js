// Self-serve accounts: signup/login (dashboard sessions) and the /v1/me endpoints
// for balance, ledger, API keys, top-ups, workers, payouts and account deletion.
const express = require('express');
const auth = require('../auth');
const { balanceMicros, listEntries } = require('../ledger');
const { listHostWorkers } = require('../queue');
const { requestPayout, listPayouts, toPublicPayout, PayoutError } = require('../payouts');
const { usd } = require('../pricing');
const { createRateLimiter } = require('../rateLimit');
const { BadRequest, wrap, requiredString, uuidParam, intInRange, centsFromUsd } = require('../http');

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function parseCredentials(body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!EMAIL_RE.test(email)) throw new BadRequest('a valid email is required');
  if (typeof body.password !== 'string' || body.password.length < 10 || body.password.length > 200) {
    throw new BadRequest('password must be 10–200 characters');
  }
  return { email, password: body.password };
}

function accountRouter({ pool, cookieSecure, stripeBilling }) {
  const r = express.Router();
  const signupLimiter = createRateLimiter({ limit: 20, windowMs: 60 * 60_000 });
  const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60_000 });

  const startSession = async (res, userId) => {
    const token = await auth.createSession(pool, userId);
    res.setHeader('Set-Cookie', auth.sessionCookie(token, { secure: cookieSecure }));
  };

  // ---------- Auth ----------
  r.post('/auth/signup', wrap(async (req, res) => {
    if (!signupLimiter.take(req.ip)) return res.status(429).json({ error: 'too_many_requests' });
    const { email, password } = parseCredentials(req.body);
    const kind = req.body.kind;
    if (!['buyer', 'host'].includes(kind)) throw new BadRequest('kind must be "buyer" or "host"');
    const name = requiredString(req.body.name ?? email.split('@')[0], 'name', 100);
    const result = await auth.createUser(pool, { email, password, name, kind });
    if (result.error === 'email_taken') return res.status(409).json({ error: 'email_taken' });
    await startSession(res, result.user.id);
    res.status(201).json({ account: { id: result.account.id, name: result.account.name, kind: result.account.kind }, email });
  }));

  r.post('/auth/login', wrap(async (req, res) => {
    const { email, password } = parseCredentials(req.body);
    const key = `${req.ip}|${email.toLowerCase()}`;
    if (!loginLimiter.take(key)) return res.status(429).json({ error: 'too_many_requests' });
    const user = await auth.authenticateUser(pool, email, password);
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    loginLimiter.reset(key);
    await startSession(res, user.id);
    res.json({ ok: true });
  }));

  r.post('/auth/logout', wrap(async (req, res) => {
    const token = auth.readSessionToken(req);
    if (token) await auth.destroySession(pool, token);
    res.setHeader('Set-Cookie', auth.clearedCookie({ secure: cookieSecure }));
    res.json({ ok: true });
  }));

  // ---------- Me ----------
  const me = express.Router();
  // Suspended accounts may still sign in to see their status, balance and history.
  me.use(auth.requireAccount(pool, null, { allowSuspended: true }));
  me.param('id', uuidParam);
  const onlyKind = (kind) => (req, res, next) =>
    req.account.kind === kind ? next() : res.status(403).json({ error: `requires_${kind}_account` });

  me.get('/', wrap(async (req, res) => {
    const a = req.account;
    res.json({
      account: { id: a.id, name: a.name, kind: a.kind, created_at: a.created_at, suspended: Boolean(a.suspended_at), suspended_reason: a.suspended_reason },
      email: req.user?.email ?? null,
      balance_usd: usd(await balanceMicros(pool, a.id)),
      topups_enabled: Boolean(stripeBilling),
    });
  }));

  me.get('/ledger', wrap(async (req, res) => {
    const entries = await listEntries(pool, req.account.id, 100);
    res.json({ entries: entries.map((e) => ({ ...e, id: String(e.id), amount_usd: usd(e.amount_micros), amount_micros: undefined })) });
  }));

  me.get('/api-keys', wrap(async (req, res) => {
    res.json({ keys: await auth.listApiKeys(pool, req.account.id) });
  }));

  me.post('/api-keys', wrap(async (req, res) => {
    const name = requiredString(req.body?.name ?? 'key', 'name', 100);
    const existing = await auth.listApiKeys(pool, req.account.id);
    if (existing.length >= 20) throw new BadRequest('an account can have at most 20 active keys');
    const { apiKey, key } = await auth.insertApiKey(pool, req.account.id, name);
    res.status(201).json({ ...key, api_key: apiKey, note: 'This key is shown once. Store it now.' });
  }));

  me.delete('/api-keys/:id', wrap(async (req, res) => {
    if (!(await auth.revokeApiKey(pool, req.account.id, req.params.id))) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  }));

  // Deletes the account and everything it owns. Requires the password.
  me.delete('/', wrap(async (req, res) => {
    if (!req.user) return res.status(403).json({ error: 'sign_in_required', message: 'delete the account from the dashboard' });
    const { rows: [user] } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (typeof req.body?.password !== 'string' || !(await auth.verifyPassword(req.body.password, user.password_hash))) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    await pool.query('DELETE FROM accounts WHERE id = $1', [req.account.id]);
    res.setHeader('Set-Cookie', auth.clearedCookie({ secure: cookieSecure }));
    res.json({ ok: true, deleted: true });
  }));

  // ---------- Buyer: top-ups ----------
  me.post('/topups', onlyKind('buyer'), wrap(async (req, res) => {
    if (!stripeBilling) return res.status(503).json({ error: 'topups_unavailable', message: 'card payments are not configured yet' });
    if (req.account.suspended_at) return res.status(403).json({ error: 'account_suspended' });
    const dollars = intInRange(req.body?.amount_usd, 'amount_usd', 5, 1000);
    const url = await stripeBilling.createTopupSession({ account: req.account, email: req.user?.email, amountCents: dollars * 100 });
    res.status(201).json({ checkout_url: url });
  }));

  // ---------- Host: workers and payouts ----------
  me.get('/workers', onlyKind('host'), wrap(async (req, res) => {
    res.json({ workers: await listHostWorkers(pool, req.account.id) });
  }));

  me.get('/payouts', onlyKind('host'), wrap(async (req, res) => {
    res.json({ payouts: (await listPayouts(pool, { accountId: req.account.id })).map(toPublicPayout) });
  }));

  me.post('/payouts', onlyKind('host'), wrap(async (req, res) => {
    const cents = centsFromUsd(req.body?.amount_usd, 'amount_usd', 0.01, 100_000);
    const destination = requiredString(req.body?.destination, 'destination (e.g. your PayPal email)', 200);
    try {
      const payout = await requestPayout(pool, req.account.id, { amountMicros: cents * 10_000, destination });
      res.status(201).json(toPublicPayout(payout));
    } catch (err) {
      if (err instanceof PayoutError) return res.status(err.code === 'account_suspended' ? 403 : 400).json({ error: err.code, message: err.message });
      throw err;
    }
  }));

  r.use('/me', me);
  return r;
}

module.exports = { accountRouter };
