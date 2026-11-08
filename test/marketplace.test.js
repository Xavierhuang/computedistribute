const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const Stripe = require('stripe');
const { createPool, migrate } = require('../src/db');
const { createAccount } = require('../src/auth');
const { createApp } = require('../src/app');
const { addEntry, balanceMicros } = require('../src/ledger');
const { reapExpiredLeases } = require('../src/queue');
const { createStripeBilling } = require('../src/billing');
const { transcriptSimilarity } = require('../src/verify');

const DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres@127.0.0.1:54329/computedistribute_test';
const ADMIN = 'test-admin-token-0123456789';
const WEBHOOK_SECRET = 'whsec_test_secret';
const AUDIO = 'https://example.com/talk.mp3';
const TEXT = 'And so my fellow Americans, ask not what your country can do for you, ask what you can do for your country.';

let pool;
const servers = [];
let plain; // verifyRate 0, admin enabled, Stripe enabled (checkout stubbed)
let verifying; // verifyRate 1
let bare; // no admin token, no Stripe

async function start(options) {
  const server = createApp({ pool, leaseSeconds: 60, ...options }).listen(0);
  await new Promise((r) => server.once('listening', r));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

before(async () => {
  pool = createPool(DB_URL);
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await migrate(pool);
  const stripeBilling = createStripeBilling({ secretKey: 'sk_test_dummy', webhookSecret: WEBHOOK_SECRET, publicUrl: 'http://x' });
  stripeBilling.createTopupSession = async ({ amountCents }) => `https://checkout.stripe.test/session?amount=${amountCents}`;
  plain = await start({ verifyRate: 0, adminToken: ADMIN, stripeBilling });
  verifying = await start({ verifyRate: 1 });
  bare = await start({});
});

after(async () => {
  await Promise.all(servers.map((s) => new Promise((r) => s.close(r))));
  await pool.end();
});

beforeEach(async () => {
  await pool.query('TRUNCATE jobs, workers, api_keys, accounts, ledger_entries, users, sessions, payout_requests, verifications CASCADE');
});

async function call(base, auth, method, path, body, headers = {}) {
  const h = { ...headers };
  if (body !== undefined && !h['content-type']) h['content-type'] = 'application/json';
  if (auth?.key) h.authorization = `Bearer ${auth.key}`;
  if (auth?.cookie) h.cookie = auth.cookie;
  const res = await fetch(base + path, { method, headers: h, body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)) });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { status: res.status, body: parsed, cookie: (res.headers.getSetCookie()[0] || '').split(';')[0] };
}

async function account(kind, { credit = 0 } = {}) {
  const { account: a, apiKey } = await createAccount(pool, { name: kind, kind });
  if (credit) await addEntry(pool, { accountId: a.id, amountMicros: Math.round(credit * 1e6), kind: 'grant' });
  return { id: a.id, key: apiKey };
}

async function worker(base, host, { jobTypes = ['echo', 'transcribe'], vram = 24 } = {}) {
  const r = await call(base, host, 'POST', '/v1/host/workers', { name: 'w', job_types: jobTypes, vram_gb: vram });
  assert.equal(r.status, 201);
  return r.body.id;
}

const balance = async (id) => (await balanceMicros(pool, id)) / 1e6;
const submit = (base, buyer, input = { audio_url: AUDIO }) => call(base, buyer, 'POST', '/v1/jobs', { type: 'transcribe', input });
const claim = (base, host, workerId) => call(base, host, 'POST', `/v1/host/workers/${workerId}/claim`);
const complete = (base, host, leaseId, output) => call(base, host, 'POST', `/v1/host/leases/${leaseId}/complete`, { output });
const transcript = (text = TEXT, duration = 90) => ({ text, duration_s: duration, language: 'en', segments: [] });
const admin = { key: ADMIN };

// ---------- Billing ----------

test('billing: hold on submit, charge actual usage, host earns 70%', async () => {
  const buyer = await account('buyer', { credit: 1 });
  const host = await account('host');
  const w = await worker(plain, host);

  const job = await submit(plain, buyer); // small model: 240 min × $0.002 = $0.48 hold
  assert.equal(job.status, 201);
  assert.equal(job.body.hold_usd, 0.48);
  assert.equal(await balance(buyer.id), 0.52);

  const c = await claim(plain, host, w);
  assert.equal((await complete(plain, host, c.body.lease_id, transcript(TEXT, 90))).status, 200);

  // 90 s at $0.002/min = $0.003; the host keeps 70% = $0.0021.
  assert.equal(await balance(buyer.id), 0.997);
  assert.equal(await balance(host.id), 0.0021);
  const done = await call(plain, buyer, 'GET', `/v1/jobs/${job.body.id}`);
  assert.equal(done.body.cost_usd, 0.003);

  const kinds = (await pool.query('SELECT kind, amount_micros FROM ledger_entries WHERE job_id = $1 ORDER BY id', [job.body.id])).rows;
  assert.deepEqual(kinds.map((k) => [k.kind, Number(k.amount_micros)]), [['hold', -480000], ['release', 480000], ['charge', -3000], ['earning', 2100]]);
});

test('billing: no credit means 402, echo stays free', async () => {
  const buyer = await account('buyer', { credit: 0.5 });
  assert.equal((await submit(plain, buyer)).status, 201); // $0.48 hold fits in $0.50
  const second = await submit(plain, buyer);
  assert.equal(second.status, 402);
  assert.equal(second.body.error, 'insufficient_funds');
  assert.equal((await call(plain, buyer, 'POST', '/v1/jobs', { type: 'echo', input: {} })).status, 201);
});

test('billing: failed, canceled and expired jobs release their hold exactly once', async () => {
  const buyer = await account('buyer', { credit: 5 });
  const host = await account('host');
  const w = await worker(plain, host);

  const failed = await call(plain, buyer, 'POST', '/v1/jobs', { type: 'transcribe', input: { audio_url: AUDIO }, max_attempts: 1 });
  const c1 = await claim(plain, host, w);
  await call(plain, host, 'POST', `/v1/host/leases/${c1.body.lease_id}/fail`, { error: '404', retryable: false });

  const canceled = await submit(plain, buyer);
  await call(plain, buyer, 'POST', `/v1/jobs/${canceled.body.id}/cancel`);

  const expired = await call(plain, buyer, 'POST', '/v1/jobs', { type: 'transcribe', input: { audio_url: AUDIO }, max_attempts: 1 });
  await claim(plain, host, w);
  await pool.query("UPDATE jobs SET lease_expires_at = now() - interval '1 second' WHERE id = $1", [expired.body.id]);
  await reapExpiredLeases(pool);
  await reapExpiredLeases(pool);

  assert.equal(await balance(buyer.id), 5, 'every hold came back, nothing charged');
  assert.equal(await balance(host.id), 0);
  for (const id of [failed.body.id, canceled.body.id, expired.body.id]) {
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM ledger_entries WHERE job_id = $1 AND kind = 'release'", [id]);
    assert.equal(rows[0].n, 1, `one release for ${id}`);
  }
});

test('billing: malformed output is rejected and the job stays running', async () => {
  const buyer = await account('buyer', { credit: 1 });
  const host = await account('host');
  const w = await worker(plain, host);
  const job = await submit(plain, buyer);
  const c = await claim(plain, host, w);
  for (const bad of [{ text: 'x' }, { text: 1, duration_s: 5, segments: [] }, { text: 'x', duration_s: -1, segments: [] }, 'nope']) {
    assert.equal((await complete(plain, host, c.body.lease_id, bad)).status, 400);
  }
  assert.equal((await call(plain, buyer, 'GET', `/v1/jobs/${job.body.id}`)).body.status, 'running');
  assert.equal((await complete(plain, host, c.body.lease_id, transcript())).status, 200);
});

// ---------- Verification ----------

test('similarity: identical ≈ 1, punctuation-only changes stay high, unrelated text is low', () => {
  assert.equal(transcriptSimilarity(TEXT, TEXT), 1);
  assert.ok(transcriptSimilarity(TEXT, TEXT.toLowerCase().replace(/[,.]/g, '')) > 0.99);
  assert.ok(transcriptSimilarity(TEXT, TEXT.replace('fellow', 'dear')) > 0.85);
  assert.ok(transcriptSimilarity(TEXT, 'The quick brown fox jumps over the lazy dog.') < 0.1);
  assert.equal(transcriptSimilarity('', ''), 1);
});

test('verification: re-run goes to a different host; a mismatch refunds and claws back', async () => {
  const buyer = await account('buyer', { credit: 1 });
  const hostA = await account('host');
  const hostB = await account('host');
  const wA = await worker(verifying, hostA);
  const wB = await worker(verifying, hostB);

  // Agreeing results pass.
  await submit(verifying, buyer);
  let c = await claim(verifying, hostA, wA);
  await complete(verifying, hostA, c.body.lease_id, transcript());
  assert.equal((await claim(verifying, hostA, wA)).status, 204, 'host A never verifies itself');
  c = await claim(verifying, hostB, wB);
  await complete(verifying, hostB, c.body.lease_id, transcript(TEXT.replace(/,/g, '')));
  let v = (await pool.query('SELECT * FROM verifications')).rows;
  assert.equal(v.length, 1);
  assert.equal(v[0].passed, true);
  const afterPass = await balance(buyer.id);

  // A fabricated result fails: the buyer is refunded and host A loses that job's earning.
  const fake = await submit(verifying, buyer);
  c = await claim(verifying, hostA, wA);
  await complete(verifying, hostA, c.body.lease_id, transcript('lorem ipsum dolor sit amet consectetur', 90));
  const hostABefore = await balance(hostA.id);
  c = await claim(verifying, hostB, wB);
  await complete(verifying, hostB, c.body.lease_id, transcript());
  v = (await pool.query('SELECT * FROM verifications WHERE job_id = $1', [fake.body.id])).rows;
  assert.equal(v[0].passed, false);
  assert.equal(await balance(buyer.id), afterPass, 'refunded: net cost of the fake job is zero');
  assert.equal(await balance(hostA.id), hostABefore - 0.0021, 'earning clawed back');
  assert.ok((await balance(hostB.id)) > 0, 'the verifying host is paid by the platform');
});

test('verification: repeated failures suspend the host', async () => {
  const buyer = await account('buyer', { credit: 5 });
  const cheat = await account('host');
  const honest = await account('host');
  const wC = await worker(verifying, cheat);
  const wH = await worker(verifying, honest);
  for (let i = 0; i < 3; i++) {
    await submit(verifying, buyer);
    let c = await claim(verifying, cheat, wC);
    await complete(verifying, cheat, c.body.lease_id, transcript(`made up words number ${i} nothing real here`));
    c = await claim(verifying, honest, wH);
    await complete(verifying, honest, c.body.lease_id, transcript());
  }
  const r = await claim(verifying, cheat, wC);
  assert.equal(r.status, 403);
  assert.equal(r.body.error, 'account_suspended');
  assert.match(r.body.reason, /failed 3 of 3/);
});

// ---------- Accounts ----------

test('accounts: signup, session, API keys, CSRF guard, logout', async () => {
  const signup = await call(plain, null, 'POST', '/v1/auth/signup', { email: 'Ada@Example.com', password: 'correct horse battery', kind: 'buyer' });
  assert.equal(signup.status, 201);
  const session = { cookie: signup.cookie };
  assert.match(session.cookie, /^cd_session=/);

  const me = await call(plain, session, 'GET', '/v1/me');
  assert.equal(me.body.account.kind, 'buyer');
  assert.equal(me.body.balance_usd, 0);
  assert.equal(me.body.topups_enabled, true);

  assert.equal((await call(plain, null, 'POST', '/v1/auth/signup', { email: 'ada@example.com', password: 'another password', kind: 'host' })).status, 409);
  assert.equal((await call(plain, null, 'POST', '/v1/auth/signup', { email: 'x@y.co', password: 'short', kind: 'buyer' })).status, 400);
  assert.equal((await call(plain, null, 'POST', '/v1/auth/login', { email: 'ada@example.com', password: 'wrong password!' })).status, 401);
  const login = await call(plain, null, 'POST', '/v1/auth/login', { email: 'ADA@example.com', password: 'correct horse battery' });
  assert.equal(login.status, 200);

  // Session-authenticated writes must be JSON (CSRF protection).
  const form = await call(plain, session, 'POST', '/v1/jobs', 'type=echo', { 'content-type': 'application/x-www-form-urlencoded' });
  assert.equal(form.status, 415);
  assert.equal((await call(plain, session, 'POST', '/v1/jobs', { type: 'echo', input: { a: 1 } })).status, 201);

  const created = await call(plain, session, 'POST', '/v1/me/api-keys', { name: 'ci' });
  assert.equal(created.status, 201);
  const key = { key: created.body.api_key };
  assert.equal((await call(plain, key, 'GET', '/v1/jobs')).body.jobs.length, 1);
  const keys = await call(plain, session, 'GET', '/v1/me/api-keys');
  assert.equal(keys.body.keys.length, 1);
  assert.equal(keys.body.keys[0].key_hash, undefined, 'hashes are never exposed');
  assert.equal((await call(plain, session, 'DELETE', `/v1/me/api-keys/${created.body.id}`)).status, 200);
  assert.equal((await call(plain, key, 'GET', '/v1/jobs')).status, 401);

  await call(plain, session, 'POST', '/v1/auth/logout', {});
  assert.equal((await call(plain, session, 'GET', '/v1/me')).status, 401);
});

test('accounts: deleting requires the password and removes everything', async () => {
  const signup = await call(plain, null, 'POST', '/v1/auth/signup', { email: 'del@example.com', password: 'delete me please', kind: 'host' });
  const session = { cookie: signup.cookie };
  assert.equal((await call(plain, session, 'DELETE', '/v1/me', { password: 'nope nope nope' })).status, 401);
  assert.equal((await call(plain, session, 'DELETE', '/v1/me', { password: 'delete me please' })).status, 200);
  assert.equal((await call(plain, session, 'GET', '/v1/me')).status, 401);
  assert.equal((await call(plain, null, 'POST', '/v1/auth/login', { email: 'del@example.com', password: 'delete me please' })).status, 401);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM accounts WHERE kind = 'host'")).rows[0].n, 0);
});

test('accounts: repeated wrong passwords are rate limited', async () => {
  await call(plain, null, 'POST', '/v1/auth/signup', { email: 'rl@example.com', password: 'right password', kind: 'buyer' });
  const statuses = [];
  for (let i = 0; i < 11; i++) {
    statuses.push((await call(plain, null, 'POST', '/v1/auth/login', { email: 'rl@example.com', password: 'wrong password' })).status);
  }
  assert.deepEqual(statuses.slice(0, 10), Array(10).fill(401));
  assert.equal(statuses[10], 429);
});

// ---------- Money in and out ----------

test('stripe: a signed webhook credits once; bad signatures are refused', async () => {
  const buyer = await account('buyer');
  const stripe = new Stripe('sk_test_dummy');
  const payload = JSON.stringify({
    id: 'evt_1', type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_1', payment_status: 'paid', currency: 'usd', amount_total: 2500, metadata: { account_id: buyer.id } } },
  });
  const signed = { 'content-type': 'application/json', 'stripe-signature': stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET }) };

  assert.equal((await call(plain, null, 'POST', '/v1/stripe/webhook', payload, signed)).body.result, 'credited');
  assert.equal((await call(plain, null, 'POST', '/v1/stripe/webhook', payload, signed)).body.result, 'duplicate');
  assert.equal(await balance(buyer.id), 25);

  const forged = { 'content-type': 'application/json', 'stripe-signature': stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_wrong' }) };
  assert.equal((await call(plain, null, 'POST', '/v1/stripe/webhook', payload, forged)).status, 400);
  assert.equal((await call(bare, null, 'POST', '/v1/stripe/webhook', payload, signed)).status, 404, 'disabled without Stripe');
  assert.equal(await balance(buyer.id), 25);
});

test('top-ups: checkout link when Stripe is configured, 503 when not', async () => {
  const s1 = await call(plain, null, 'POST', '/v1/auth/signup', { email: 'pay@example.com', password: 'pay me money', kind: 'buyer' });
  const r = await call(plain, { cookie: s1.cookie }, 'POST', '/v1/me/topups', { amount_usd: 20 });
  assert.equal(r.status, 201);
  assert.match(r.body.checkout_url, /amount=2000/);
  assert.equal((await call(plain, { cookie: s1.cookie }, 'POST', '/v1/me/topups', { amount_usd: 2 })).status, 400);
  const s2 = await call(bare, null, 'POST', '/v1/auth/signup', { email: 'nopay@example.com', password: 'pay me money', kind: 'buyer' });
  assert.equal((await call(bare, { cookie: s2.cookie }, 'POST', '/v1/me/topups', { amount_usd: 20 })).status, 503);
});

test('payouts: hosts withdraw earnings; admins pay or reject', async () => {
  const signup = await call(plain, null, 'POST', '/v1/auth/signup', { email: 'host@example.com', password: 'host password', kind: 'host' });
  const host = { cookie: signup.cookie };
  const hostId = (await call(plain, host, 'GET', '/v1/me')).body.account.id;
  await addEntry(pool, { accountId: hostId, amountMicros: 12_340_000, kind: 'earning' });

  assert.equal((await call(plain, host, 'POST', '/v1/me/payouts', { amount_usd: 5, destination: 'pp@example.com' })).body.error, 'below_minimum');
  assert.equal((await call(plain, host, 'POST', '/v1/me/payouts', { amount_usd: 50, destination: 'pp@example.com' })).body.error, 'insufficient_balance');
  const p1 = await call(plain, host, 'POST', '/v1/me/payouts', { amount_usd: 10.29, destination: 'pp@example.com' });
  assert.equal(p1.status, 201);
  assert.equal(await balance(hostId), 2.05);

  assert.equal((await call(plain, host, 'GET', '/v1/admin/payouts')).status, 401, 'session is not admin');
  const pending = await call(plain, admin, 'GET', '/v1/admin/payouts');
  assert.equal(pending.body.payouts.length, 1);
  assert.equal((await call(plain, admin, 'POST', `/v1/admin/payouts/${p1.body.id}/reject`, { note: 'wrong email' })).status, 200);
  assert.equal(await balance(hostId), 12.34, 'rejection returns the money');
  assert.equal((await call(plain, admin, 'POST', `/v1/admin/payouts/${p1.body.id}/paid`, {})).status, 409, 'already resolved');

  const p2 = await call(plain, host, 'POST', '/v1/me/payouts', { amount_usd: 12, destination: 'pp@example.com' });
  assert.equal((await call(plain, admin, 'POST', `/v1/admin/payouts/${p2.body.id}/paid`, { note: 'PayPal 9XY' })).body.status, 'paid');
  assert.equal((await call(plain, host, 'GET', '/v1/me/payouts')).body.payouts[0].status, 'paid');
  assert.equal((await call(plain, { cookie: (await call(plain, null, 'POST', '/v1/auth/signup', { email: 'b@example.com', password: 'buyer password', kind: 'buyer' })).cookie }, 'GET', '/v1/me/payouts')).status, 403);
});

test('admin: grants, stats, suspension; disabled without a token', async () => {
  const buyer = await account('buyer');
  assert.equal((await call(plain, admin, 'POST', '/v1/admin/grants', { account_id: buyer.id, amount_usd: 0.29, memo: 'pilot' })).status, 201);
  assert.equal(await balance(buyer.id), 0.29);
  assert.equal((await call(plain, admin, 'POST', '/v1/admin/grants', { account_id: buyer.id, amount_usd: 0.001 })).status, 400);
  assert.equal((await call(plain, { key: 'wrong' }, 'GET', '/v1/admin/stats')).status, 401);
  assert.equal((await call(bare, admin, 'GET', '/v1/admin/stats')).status, 404);

  const stats = await call(plain, admin, 'GET', '/v1/admin/stats');
  assert.equal(stats.body.buyers, 1);
  assert.equal((await call(plain, admin, 'GET', '/v1/admin/accounts')).body.accounts[0].balance_usd, 0.29);

  await call(plain, admin, 'POST', `/v1/admin/accounts/${buyer.id}/suspend`, { reason: 'chargeback' });
  assert.equal((await call(plain, buyer, 'GET', '/v1/jobs')).status, 403);
  await call(plain, admin, 'POST', `/v1/admin/accounts/${buyer.id}/unsuspend`, {});
  assert.equal((await call(plain, buyer, 'GET', '/v1/jobs')).status, 200);
});

test('public: pricing and dashboard are served', async () => {
  const p = await call(plain, null, 'GET', '/v1/pricing');
  assert.equal(p.body.job_types.transcribe.per_minute_usd['large-v3'], 0.004);
  const page = await fetch(`${plain}/`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(page.headers.get('content-security-policy'), /default-src 'self'/);
});

// ---------- Hackathon demo features ----------

test('chunks: clip ranges validate, hold only the clip, and show which machine ran them', async () => {
  const buyer = await account('buyer', { credit: 1 });
  const host = await account('host');
  const w = await worker(plain, host);
  const bad = [{ clip_start_s: 5 }, { clip_start_s: 10, clip_end_s: 5 }, { clip_start_s: -1, clip_end_s: 5 }, { clip_start_s: 0, clip_end_s: 5, group: 'bad group!' }];
  for (const extra of bad) assert.equal((await submit(plain, buyer, { audio_url: AUDIO, ...extra })).status, 400, JSON.stringify(extra));

  const chunk = await submit(plain, buyer, { audio_url: AUDIO, clip_start_s: 60, clip_end_s: 120, group: 'g1' });
  assert.equal(chunk.status, 201);
  assert.equal(chunk.body.hold_usd, 0.002067, '62 s × $0.002/min, rounded up to the micro-dollar');
  const c = await claim(plain, host, w);
  await complete(plain, host, c.body.lease_id, transcript('chunk two', 60));
  const listed = (await call(plain, buyer, 'GET', '/v1/jobs')).body.jobs[0];
  assert.equal(listed.worker_name, 'w');
  assert.equal(listed.cost_usd, 0.002);
});

test('demo mode: new buyers get credit and can top up for free', async () => {
  const demo = await start({ demoCreditUsd: 5 });
  const s = await call(demo, null, 'POST', '/v1/auth/signup', { email: 'judge@example.com', password: 'judge password', kind: 'buyer' });
  const session = { cookie: s.cookie };
  const me = await call(demo, session, 'GET', '/v1/me');
  assert.equal(me.body.balance_usd, 5);
  assert.equal(me.body.demo_credit_usd, 5);
  assert.equal((await call(demo, session, 'POST', '/v1/me/demo-credit', {})).body.balance_usd, 10);
  await call(demo, session, 'POST', '/v1/me/demo-credit', {});
  await call(demo, session, 'POST', '/v1/me/demo-credit', {});
  assert.equal((await call(demo, session, 'POST', '/v1/me/demo-credit', {})).body.error, 'enough_credit', 'capped at 4× the demo amount');
  const host = await call(demo, null, 'POST', '/v1/auth/signup', { email: 'h@example.com', password: 'host password', kind: 'host' });
  assert.equal((await call(demo, { cookie: host.cookie }, 'GET', '/v1/me')).body.balance_usd, 0, 'hosts get no free credit');
  assert.equal((await call(plain, session, 'POST', '/v1/me/demo-credit', {})).status, 404, 'off unless DEMO_CREDIT_USD is set');
});

test('network: public view of online machines and job flow', async () => {
  const buyer = await account('buyer', { credit: 1 });
  const host = await account('host');
  const w = await worker(plain, host);
  await submit(plain, buyer);
  await submit(plain, buyer);
  await claim(plain, host, w);
  const n = (await call(plain, null, 'GET', '/v1/network')).body;
  assert.equal(n.workers_online.length, 1);
  assert.equal(n.workers_online[0].running, 1);
  assert.equal(n.running, 1);
  assert.equal(n.queued, 1);
});
