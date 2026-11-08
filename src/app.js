const path = require('node:path');
const express = require('express');
const { jobTypes } = require('./jobTypes');
const { publicPriceList } = require('./pricing');
const { handleStripeEvent } = require('./billing');
const { jobsRouter } = require('./routes/jobs');
const { hostRouter } = require('./routes/host');
const { accountRouter } = require('./routes/account');
const { adminRouter } = require('./routes/admin');
const { BadRequest, wrap } = require('./http');

// options: pool, leaseSeconds, verifyRate (0–1), adminToken, stripeBilling, cookieSecure, trustProxy
function createApp(options) {
  const { pool, leaseSeconds = 60, verifyRate = 0, adminToken = null, stripeBilling = null, cookieSecure = false, trustProxy = false } = options;
  const app = express();
  app.disable('x-powered-by');
  if (trustProxy) app.set('trust proxy', 1); // so req.ip is the client, not the platform proxy

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    next();
  });

  // Stripe needs the exact raw body to verify its signature, so this precedes express.json.
  app.post('/v1/stripe/webhook', express.raw({ type: 'application/json', limit: '1mb' }), wrap(async (req, res) => {
    if (!stripeBilling) return res.status(404).json({ error: 'not_found' });
    let event;
    try {
      event = stripeBilling.parseWebhook(req.body, req.get('stripe-signature'));
    } catch {
      return res.status(400).json({ error: 'invalid_signature' });
    }
    res.json({ received: true, result: await handleStripeEvent(pool, event) });
  }));

  // Job inputs are capped at 64 KB separately; this limit is sized for worker
  // results such as long transcripts. Anything bigger should go to file storage.
  app.use(express.json({ limit: '5mb' }));

  app.get('/health', wrap(async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  }));
  app.get('/v1', (req, res) => res.json({ service: 'computedistribute', job_types: Object.keys(jobTypes) }));
  app.get('/v1/pricing', (req, res) => res.json(publicPriceList()));

  app.use('/v1/jobs', jobsRouter({ pool }));
  app.use('/v1/host', hostRouter({ pool, leaseSeconds, verifyRate }));
  app.use('/v1/admin', adminRouter({ pool, adminToken }));
  app.use('/v1', accountRouter({ pool, cookieSecure, stripeBilling }));

  app.use('/v1', (req, res) => res.status(404).json({ error: 'not_found' }));
  app.use(express.static(path.join(__dirname, '..', 'public'), { index: 'index.html', maxAge: '5m' }));
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
