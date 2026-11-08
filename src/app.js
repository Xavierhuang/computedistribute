const express = require('express');
const { requireAccount } = require('./auth');
const { validateJobInput, defaultMinVramGb, jobTypes } = require('./jobTypes');
const queue = require('./queue');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ['queued', 'running', 'succeeded', 'failed', 'canceled'];

class BadRequest extends Error {}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function intInRange(value, name, min, max, fallback) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new BadRequest(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function numInRange(value, name, min, max, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new BadRequest(`${name} must be a number between ${min} and ${max}`);
  }
  return value;
}

// Rejects malformed ids up front so they read as "not found" rather than a database error.
function uuidParam(req, res, next, id) {
  if (!UUID_RE.test(id)) return res.status(404).json({ error: 'not_found' });
  next();
}

function createApp({ pool, leaseSeconds }) {
  const app = express();
  // Job inputs are capped at 64 KB separately; this limit is sized for worker
  // results such as long transcripts. Anything bigger should go to file storage.
  app.use(express.json({ limit: '5mb' }));

  app.get('/', (req, res) => res.json({ service: 'computedistribute', job_types: Object.keys(jobTypes) }));
  app.get('/health', wrap(async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  }));

  // ---------- Buyer API ----------
  const buyer = express.Router();
  buyer.use(requireAccount(pool, 'buyer'));
  buyer.param('id', uuidParam);

  buyer.post('/', wrap(async (req, res) => {
    const body = req.body || {};
    const problem = validateJobInput(body.type, body.input);
    if (problem) throw new BadRequest(problem);
    const idempotencyKey = req.get('idempotency-key') || null;
    if (idempotencyKey && idempotencyKey.length > 200) throw new BadRequest('Idempotency-Key is too long');

    const { job, created } = await queue.enqueue(pool, req.account.id, {
      type: body.type,
      input: body.input,
      minVramGb: numInRange(body.min_vram_gb, 'min_vram_gb', 0, 1024, defaultMinVramGb(body.type, body.input)),
      priority: intInRange(body.priority, 'priority', -100, 100, 0),
      maxAttempts: intInRange(body.max_attempts, 'max_attempts', 1, 10, 3),
      idempotencyKey,
    });
    res.status(created ? 201 : 200).json(queue.toPublicJob(job));
  }));

  buyer.get('/', wrap(async (req, res) => {
    const status = req.query.status ?? null;
    if (status !== null && !STATUSES.includes(status)) throw new BadRequest(`status must be one of ${STATUSES.join(', ')}`);
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    const jobs = await queue.listBuyerJobs(pool, req.account.id, {
      status,
      limit: intInRange(limit, 'limit', 1, 100, 20),
    });
    res.json({ jobs: jobs.map(queue.toPublicJob) });
  }));

  buyer.get('/:id', wrap(async (req, res) => {
    const job = await queue.getBuyerJob(pool, req.account.id, req.params.id);
    if (!job) return res.status(404).json({ error: 'not_found' });
    res.json(queue.toPublicJob(job));
  }));

  buyer.post('/:id/cancel', wrap(async (req, res) => {
    const job = await queue.cancel(pool, req.account.id, req.params.id);
    if (job) return res.json(queue.toPublicJob(job));
    const existing = await queue.getBuyerJob(pool, req.account.id, req.params.id);
    if (!existing) return res.status(404).json({ error: 'not_found' });
    res.status(409).json({ error: 'already_finished', status: existing.status });
  }));

  // ---------- Host / worker API ----------
  const host = express.Router();
  host.use(requireAccount(pool, 'host'));
  host.param('id', uuidParam);

  function parseWorkerBody(body = {}) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100) {
      throw new BadRequest('name is required (max 100 characters)');
    }
    const types = body.job_types;
    if (!Array.isArray(types) || types.length === 0 || !types.every((t) => Object.hasOwn(jobTypes, t))) {
      throw new BadRequest(`job_types must be a non-empty list drawn from: ${Object.keys(jobTypes).join(', ')}`);
    }
    const capabilities = body.capabilities ?? {};
    if (typeof capabilities !== 'object' || Array.isArray(capabilities) || capabilities === null) {
      throw new BadRequest('capabilities must be a JSON object');
    }
    return {
      name: body.name.trim(),
      jobTypes: [...new Set(types)],
      vramGb: numInRange(body.vram_gb, 'vram_gb', 0, 1024, 0),
      capabilities,
    };
  }
  const publicWorker = (w) => ({ id: w.id, name: w.name, job_types: w.job_types, vram_gb: Number(w.vram_gb) });

  host.post('/workers', wrap(async (req, res) => {
    const worker = await queue.registerWorker(pool, req.account.id, parseWorkerBody(req.body));
    res.status(201).json(publicWorker(worker));
  }));

  // Replaces a worker's declared job types, VRAM and capabilities (agents call this on start).
  host.put('/workers/:id', wrap(async (req, res) => {
    const worker = await queue.updateWorker(pool, req.account.id, req.params.id, parseWorkerBody(req.body));
    if (!worker) return res.status(404).json({ error: 'worker_not_found' });
    res.json(publicWorker(worker));
  }));

  host.post('/workers/:id/claim', wrap(async (req, res) => {
    const result = await queue.claim(pool, req.account.id, req.params.id, leaseSeconds);
    if (result.error) return res.status(404).json({ error: result.error });
    if (!result.job) return res.status(204).end();
    const job = result.job;
    res.json({
      lease_id: job.lease_id,
      lease_expires_at: job.lease_expires_at,
      lease_seconds: leaseSeconds,
      job: { id: job.id, type: job.type, input: job.input, attempt: job.attempts },
    });
  }));

  // All lease operations answer 409 lease_lost when the job was canceled, reassigned
  // after the lease expired, or already finished. The worker must stop working on it.
  host.param('leaseId', uuidParam);
  const leaseLost = (res) => res.status(409).json({ error: 'lease_lost' });

  host.post('/leases/:leaseId/heartbeat', wrap(async (req, res) => {
    const job = await queue.heartbeat(pool, req.account.id, req.params.leaseId, leaseSeconds);
    if (!job) return leaseLost(res);
    res.json({ lease_expires_at: job.lease_expires_at });
  }));

  host.post('/leases/:leaseId/complete', wrap(async (req, res) => {
    const output = (req.body || {}).output;
    if (output === undefined) throw new BadRequest('output is required');
    const job = await queue.complete(pool, req.account.id, req.params.leaseId, output);
    if (!job) return leaseLost(res);
    res.json({ job_id: job.id, status: job.status });
  }));

  host.post('/leases/:leaseId/fail', wrap(async (req, res) => {
    const body = req.body || {};
    const error = typeof body.error === 'string' && body.error ? body.error.slice(0, 2000) : 'worker reported failure';
    const job = await queue.fail(pool, req.account.id, req.params.leaseId, { error, retryable: body.retryable === true });
    if (!job) return leaseLost(res);
    res.json({ job_id: job.id, status: job.status });
  }));

  app.use('/v1/jobs', buyer);
  app.use('/v1/host', host);

  app.use((req, res) => res.status(404).json({ error: 'not_found' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof BadRequest) return res.status(400).json({ error: 'bad_request', message: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad_request', message: 'invalid JSON body' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'payload_too_large' });
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}

module.exports = { createApp };
