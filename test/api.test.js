const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { createPool, migrate } = require('../src/db');
const { createAccount } = require('../src/auth');
const { createApp } = require('../src/app');
const { reapExpiredLeases } = require('../src/queue');

const DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres@127.0.0.1:54329/computedistribute_test';

let pool;
let server;
let base;

before(async () => {
  pool = createPool(DB_URL);
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await migrate(pool);
  server = createApp({ pool, leaseSeconds: 60 }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  await pool.end();
});

beforeEach(async () => {
  await pool.query('TRUNCATE jobs, workers, api_keys, accounts CASCADE');
});

async function call(key, method, path, body, headers = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function setup({ vramGb = 24 } = {}) {
  const buyer = (await createAccount(pool, { name: 'buyer', kind: 'buyer' })).apiKey;
  const host = (await createAccount(pool, { name: 'host', kind: 'host' })).apiKey;
  const worker = await call(host, 'POST', '/v1/host/workers', { name: 'rig-1', job_types: ['echo'], vram_gb: vramGb });
  assert.equal(worker.status, 201);
  return { buyer, host, workerId: worker.body.id };
}

const submit = (key, extra = {}, headers) =>
  call(key, 'POST', '/v1/jobs', { type: 'echo', input: { msg: 'hi' }, ...extra }, headers);
const claim = (host, workerId) => call(host, 'POST', `/v1/host/workers/${workerId}/claim`);

test('full lifecycle: submit → claim → complete → buyer sees output', async () => {
  const { buyer, host, workerId } = await setup();
  const created = await submit(buyer);
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'queued');

  const claimed = await claim(host, workerId);
  assert.equal(claimed.status, 200);
  assert.equal(claimed.body.job.id, created.body.id);
  assert.deepEqual(claimed.body.job.input, { msg: 'hi' });

  assert.equal((await call(host, 'POST', `/v1/host/leases/${claimed.body.lease_id}/heartbeat`)).status, 200);
  // Array output exercises the explicit JSON serialisation (pg would otherwise send a Postgres array).
  const done = await call(host, 'POST', `/v1/host/leases/${claimed.body.lease_id}/complete`, { output: [1, 'two'] });
  assert.equal(done.status, 200);

  const job = await call(buyer, 'GET', `/v1/jobs/${created.body.id}`);
  assert.equal(job.body.status, 'succeeded');
  assert.deepEqual(job.body.output, [1, 'two']);
  assert.equal(job.body.attempts, 1);
  assert.ok(job.body.finished_at);

  assert.equal((await claim(host, workerId)).status, 204, 'queue is empty afterwards');
});

test('concurrent claims never hand out the same job twice', async () => {
  const { buyer, host, workerId } = await setup();
  for (let i = 0; i < 10; i++) await submit(buyer, { input: { i } });
  const results = await Promise.all(Array.from({ length: 25 }, () => claim(host, workerId)));
  const ids = results.filter((r) => r.status === 200).map((r) => r.body.job.id);
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids).size, 10);
  assert.equal(results.filter((r) => r.status === 204).length, 15);
});

test('higher priority jobs are claimed first', async () => {
  const { buyer, host, workerId } = await setup();
  await submit(buyer, { input: { n: 'low' } });
  const high = await submit(buyer, { input: { n: 'high' }, priority: 10 });
  assert.equal((await claim(host, workerId)).body.job.id, high.body.id);
});

test('expired lease is requeued and the stale worker is fenced out', async () => {
  const { buyer, host, workerId } = await setup();
  const created = await submit(buyer);
  const first = await claim(host, workerId);
  await pool.query("UPDATE jobs SET lease_expires_at = now() - interval '1 second'");

  assert.equal(await reapExpiredLeases(pool), 1);
  assert.equal((await call(buyer, 'GET', `/v1/jobs/${created.body.id}`)).body.status, 'queued');

  const second = await claim(host, workerId);
  assert.equal(second.body.job.id, created.body.id);
  assert.equal(second.body.job.attempt, 2);
  assert.notEqual(second.body.lease_id, first.body.lease_id);

  const stale = await call(host, 'POST', `/v1/host/leases/${first.body.lease_id}/complete`, { output: 'stale' });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.error, 'lease_lost');
  assert.equal((await call(host, 'POST', `/v1/host/leases/${second.body.lease_id}/complete`, { output: 'ok' })).status, 200);
});

test('retryable failures requeue until max_attempts, then fail', async () => {
  const { buyer, host, workerId } = await setup();
  const created = await submit(buyer, { max_attempts: 2 });

  const a1 = await claim(host, workerId);
  const f1 = await call(host, 'POST', `/v1/host/leases/${a1.body.lease_id}/fail`, { error: 'oom', retryable: true });
  assert.equal(f1.body.status, 'queued');

  const a2 = await claim(host, workerId);
  const f2 = await call(host, 'POST', `/v1/host/leases/${a2.body.lease_id}/fail`, { error: 'oom again', retryable: true });
  assert.equal(f2.body.status, 'failed');

  const job = await call(buyer, 'GET', `/v1/jobs/${created.body.id}`);
  assert.equal(job.body.status, 'failed');
  assert.equal(job.body.error, 'oom again');
  assert.equal(job.body.attempts, 2);
});

test('lease expiry on the last attempt fails the job', async () => {
  const { buyer, host, workerId } = await setup();
  const created = await submit(buyer, { max_attempts: 1 });
  await claim(host, workerId);
  await pool.query("UPDATE jobs SET lease_expires_at = now() - interval '1 second'");
  await reapExpiredLeases(pool);
  const job = await call(buyer, 'GET', `/v1/jobs/${created.body.id}`);
  assert.equal(job.body.status, 'failed');
  assert.match(job.body.error, /lease expired/);
});

test('canceling a running job makes the worker lose its lease', async () => {
  const { buyer, host, workerId } = await setup();
  const created = await submit(buyer);
  const claimed = await claim(host, workerId);

  const canceled = await call(buyer, 'POST', `/v1/jobs/${created.body.id}/cancel`);
  assert.equal(canceled.body.status, 'canceled');
  assert.equal((await call(host, 'POST', `/v1/host/leases/${claimed.body.lease_id}/heartbeat`)).status, 409);
  assert.equal((await call(host, 'POST', `/v1/host/leases/${claimed.body.lease_id}/complete`, { output: 1 })).status, 409);

  const again = await call(buyer, 'POST', `/v1/jobs/${created.body.id}/cancel`);
  assert.equal(again.status, 409);
  assert.equal(again.body.error, 'already_finished');
});

test('workers only receive jobs that fit their VRAM', async () => {
  const { buyer, host, workerId } = await setup({ vramGb: 12 });
  await submit(buyer, { min_vram_gb: 24 });
  assert.equal((await claim(host, workerId)).status, 204);
  const small = await submit(buyer, { min_vram_gb: 8 });
  assert.equal((await claim(host, workerId)).body.job.id, small.body.id);
});

test('idempotency key returns the original job instead of a duplicate', async () => {
  const { buyer } = await setup();
  const first = await submit(buyer, {}, { 'idempotency-key': 'abc' });
  const second = await submit(buyer, { input: { different: true } }, { 'idempotency-key': 'abc' });
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal(second.body.id, first.body.id);
  assert.equal((await call(buyer, 'GET', '/v1/jobs')).body.jobs.length, 1);
});

test('auth: keys are required, scoped by kind, and buyers only see their own jobs', async () => {
  const { buyer, host, workerId } = await setup();
  const other = (await createAccount(pool, { name: 'other', kind: 'buyer' })).apiKey;
  const otherHost = (await createAccount(pool, { name: 'other-host', kind: 'host' })).apiKey;
  const created = await submit(buyer);

  assert.equal((await submit(null)).status, 401);
  assert.equal((await submit('cd_not-a-real-key')).status, 401);
  assert.equal((await submit(host)).status, 403, 'host keys cannot submit jobs');
  assert.equal((await claim(buyer, workerId)).status, 403, 'buyer keys cannot claim');
  assert.equal((await call(other, 'GET', `/v1/jobs/${created.body.id}`)).status, 404);
  assert.equal((await call(other, 'GET', '/v1/jobs')).body.jobs.length, 0);
  assert.equal((await claim(otherHost, workerId)).status, 404, "hosts cannot use another host's worker");

  // Another host cannot complete a job leased to this host's worker.
  const claimed = await claim(host, workerId);
  assert.equal((await call(otherHost, 'POST', `/v1/host/leases/${claimed.body.lease_id}/complete`, { output: 1 })).status, 409);
});

test('validation rejects bad input with 400 and bad ids with 404', async () => {
  const { buyer, host } = await setup();
  assert.equal((await call(buyer, 'POST', '/v1/jobs', { type: 'nope', input: {} })).status, 400);
  assert.equal((await call(buyer, 'POST', '/v1/jobs', { type: 'echo', input: [1] })).status, 400);
  assert.equal((await submit(buyer, { priority: 1.5 })).status, 400);
  assert.equal((await submit(buyer, { max_attempts: 0 })).status, 400);
  assert.equal((await submit(buyer, { input: { big: 'x'.repeat(70 * 1024) } })).status, 400);
  assert.equal((await call(buyer, 'GET', '/v1/jobs?status=bogus')).status, 400);
  assert.equal((await call(buyer, 'GET', '/v1/jobs/not-a-uuid')).status, 404);
  assert.equal((await call(host, 'POST', '/v1/host/workers', { name: 'x', job_types: ['nope'] })).status, 400);
  const badJson = await fetch(`${base}/v1/jobs`, {
    method: 'POST',
    headers: { authorization: `Bearer ${buyer}`, 'content-type': 'application/json' },
    body: '{not json',
  });
  assert.equal(badJson.status, 400);
});

test('transcribe: validates input and defaults min_vram_gb from the model', async () => {
  const { buyer } = await setup();
  const t = (input) => call(buyer, 'POST', '/v1/jobs', { type: 'transcribe', input });
  for (const [input, why] of [
    [{}, 'missing url'],
    [{ audio_url: 'ftp://example.com/a.mp3' }, 'non-http scheme'],
    [{ audio_url: 'http://localhost/a.mp3' }, 'localhost'],
    [{ audio_url: 'http://192.168.1.1/a.mp3' }, 'IP literal'],
    [{ audio_url: 'http://[::1]/a.mp3' }, 'IPv6 literal'],
    [{ audio_url: 'https://user:pw@example.com/a.mp3' }, 'credentials'],
    [{ audio_url: 'https://example.com/a.mp3', model: 'huge' }, 'bad model'],
    [{ audio_url: 'https://example.com/a.mp3', language: 'English' }, 'bad language'],
    [{ audio_url: 'https://example.com/a.mp3', task: 'summarize' }, 'bad task'],
    [{ audio_url: 'https://example.com/a.mp3', prompt: 'x' }, 'unknown field'],
  ]) {
    assert.equal((await t(input)).status, 400, why);
  }

  const small = await t({ audio_url: 'https://example.com/a.mp3' });
  assert.equal(small.status, 201);
  assert.equal(small.body.min_vram_gb, 2, 'default model is small');
  assert.equal((await t({ audio_url: 'https://example.com/a.mp3', model: 'large-v3', language: 'en', task: 'translate' })).body.min_vram_gb, 10);
  const explicit = await call(buyer, 'POST', '/v1/jobs', { type: 'transcribe', input: { audio_url: 'https://example.com/a.mp3' }, min_vram_gb: 0 });
  assert.equal(explicit.body.min_vram_gb, 0, 'explicit min_vram_gb wins, even 0');
});

test('PUT /workers/:id updates job types so a reused worker can take new work', async () => {
  const { buyer, host, workerId } = await setup({ vramGb: 0 });
  const job = await call(buyer, 'POST', '/v1/jobs', { type: 'transcribe', input: { audio_url: 'https://example.com/a.mp3' } });
  assert.equal((await claim(host, workerId)).status, 204, 'echo-only worker without VRAM gets nothing');

  const updated = await call(host, 'PUT', `/v1/host/workers/${workerId}`, { name: 'rig-1', job_types: ['echo', 'transcribe'], vram_gb: 8 });
  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body.job_types, ['echo', 'transcribe']);
  assert.equal((await claim(host, workerId)).body.job.id, job.body.id);

  const otherHost = (await createAccount(pool, { name: 'h2', kind: 'host' })).apiKey;
  assert.equal((await call(otherHost, 'PUT', `/v1/host/workers/${workerId}`, { name: 'x', job_types: ['echo'] })).status, 404);
});
