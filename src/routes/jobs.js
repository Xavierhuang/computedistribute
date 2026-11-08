// Buyer API: submit, list, inspect and cancel jobs. Works with an API key or a dashboard session.
const express = require('express');
const { requireAccount } = require('../auth');
const { validateJobInput, defaultMinVramGb } = require('../jobTypes');
const queue = require('../queue');
const { BadRequest, wrap, intInRange, numInRange, uuidParam } = require('../http');

const STATUSES = ['queued', 'running', 'succeeded', 'failed', 'canceled'];

function jobsRouter({ pool }) {
  const r = express.Router();
  r.use(requireAccount(pool, 'buyer'));
  r.param('id', uuidParam);

  r.post('/', wrap(async (req, res) => {
    const body = req.body || {};
    const problem = validateJobInput(body.type, body.input);
    if (problem) throw new BadRequest(problem);
    const idempotencyKey = req.get('idempotency-key') || null;
    if (idempotencyKey && idempotencyKey.length > 200) throw new BadRequest('Idempotency-Key is too long');
    try {
      const { job, created } = await queue.enqueue(pool, req.account.id, {
        type: body.type,
        input: body.input,
        minVramGb: numInRange(body.min_vram_gb, 'min_vram_gb', 0, 1024, defaultMinVramGb(body.type, body.input)),
        priority: intInRange(body.priority, 'priority', -100, 100, 0),
        maxAttempts: intInRange(body.max_attempts, 'max_attempts', 1, 10, 3),
        idempotencyKey,
      });
      res.status(created ? 201 : 200).json(queue.toPublicJob(job));
    } catch (err) {
      if (err instanceof queue.InsufficientFunds) {
        return res.status(402).json({ error: 'insufficient_funds', message: err.message });
      }
      throw err;
    }
  }));

  r.get('/', wrap(async (req, res) => {
    const status = req.query.status ?? null;
    if (status !== null && !STATUSES.includes(status)) throw new BadRequest(`status must be one of ${STATUSES.join(', ')}`);
    const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
    const jobs = await queue.listBuyerJobs(pool, req.account.id, {
      status,
      limit: intInRange(limit, 'limit', 1, 100, 20),
    });
    res.json({ jobs: jobs.map(queue.toPublicJob) });
  }));

  r.get('/:id', wrap(async (req, res) => {
    const job = await queue.getBuyerJob(pool, req.account.id, req.params.id);
    if (!job) return res.status(404).json({ error: 'not_found' });
    res.json(queue.toPublicJob(job));
  }));

  r.post('/:id/cancel', wrap(async (req, res) => {
    const job = await queue.cancel(pool, req.account.id, req.params.id);
    if (job) return res.json(queue.toPublicJob(job));
    const existing = await queue.getBuyerJob(pool, req.account.id, req.params.id);
    if (!existing) return res.status(404).json({ error: 'not_found' });
    res.status(409).json({ error: 'already_finished', status: existing.status });
  }));

  return r;
}

module.exports = { jobsRouter };
