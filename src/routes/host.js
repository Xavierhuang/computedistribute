// Host / worker API used by the agent: register machines, claim jobs, heartbeat, report results.
const express = require('express');
const { requireAccount } = require('../auth');
const { jobTypes } = require('../jobTypes');
const queue = require('../queue');
const { BadRequest, wrap, numInRange, requiredString, uuidParam } = require('../http');

function parseWorkerBody(body = {}) {
  const types = body.job_types;
  if (!Array.isArray(types) || types.length === 0 || !types.every((t) => Object.hasOwn(jobTypes, t))) {
    throw new BadRequest(`job_types must be a non-empty list drawn from: ${Object.keys(jobTypes).join(', ')}`);
  }
  const capabilities = body.capabilities ?? {};
  if (typeof capabilities !== 'object' || Array.isArray(capabilities) || capabilities === null) {
    throw new BadRequest('capabilities must be a JSON object');
  }
  return {
    name: requiredString(body.name, 'name', 100),
    jobTypes: [...new Set(types)],
    vramGb: numInRange(body.vram_gb, 'vram_gb', 0, 1024, 0),
    capabilities,
  };
}

const publicWorker = (w) => ({ id: w.id, name: w.name, job_types: w.job_types, vram_gb: Number(w.vram_gb) });

function hostRouter({ pool, leaseSeconds, verifyRate }) {
  const r = express.Router();
  r.use(requireAccount(pool, 'host'));
  r.param('id', uuidParam);
  r.param('leaseId', uuidParam);

  r.post('/workers', wrap(async (req, res) => {
    const worker = await queue.registerWorker(pool, req.account.id, parseWorkerBody(req.body));
    res.status(201).json(publicWorker(worker));
  }));

  // Replaces a worker's declared job types, VRAM and capabilities (agents call this on start).
  r.put('/workers/:id', wrap(async (req, res) => {
    const worker = await queue.updateWorker(pool, req.account.id, req.params.id, parseWorkerBody(req.body));
    if (!worker) return res.status(404).json({ error: 'worker_not_found' });
    res.json(publicWorker(worker));
  }));

  r.post('/workers/:id/claim', wrap(async (req, res) => {
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

  // Lease operations answer 409 lease_lost when the job was canceled, reassigned after
  // its lease expired, or already finished. The worker must stop working on it.
  const leaseLost = (res) => res.status(409).json({ error: 'lease_lost' });

  r.post('/leases/:leaseId/heartbeat', wrap(async (req, res) => {
    const job = await queue.heartbeat(pool, req.account.id, req.params.leaseId, leaseSeconds);
    if (!job) return leaseLost(res);
    res.json({ lease_expires_at: job.lease_expires_at });
  }));

  r.post('/leases/:leaseId/complete', wrap(async (req, res) => {
    const output = (req.body || {}).output;
    if (output === undefined) throw new BadRequest('output is required');
    const result = await queue.complete(pool, req.account.id, req.params.leaseId, output, { verifyRate });
    if (result.error === 'lease_lost') return leaseLost(res);
    if (result.error === 'invalid_output') throw new BadRequest(result.message);
    res.json({ job_id: result.job.id, status: result.job.status });
  }));

  r.post('/leases/:leaseId/fail', wrap(async (req, res) => {
    const body = req.body || {};
    const error = typeof body.error === 'string' && body.error ? body.error.slice(0, 2000) : 'worker reported failure';
    const job = await queue.fail(pool, req.account.id, req.params.leaseId, { error, retryable: body.retryable === true });
    if (!job) return leaseLost(res);
    res.json({ job_id: job.id, status: job.status });
  }));

  return r;
}

module.exports = { hostRouter };
