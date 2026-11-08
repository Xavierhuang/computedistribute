function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} must be a positive integer`);
  return n;
}

function rateEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!(n >= 0 && n <= 1)) throw new Error(`${name} must be between 0 and 1`);
  return n;
}

const publicUrl = (process.env.PUBLIC_URL || `http://localhost:${intEnv('PORT', 3000)}`).replace(/\/$/, '');

module.exports = {
  port: intEnv('PORT', 3000),
  databaseUrl: process.env.DATABASE_URL,
  // How long a worker owns a job without heartbeating before it is requeued.
  leaseSeconds: intEnv('LEASE_SECONDS', 60),
  reaperIntervalMs: intEnv('REAPER_INTERVAL_MS', 10_000),
  // Share of successful jobs re-run on another host to check the result.
  verifyRate: rateEnv('VERIFY_RATE', 0.05),
  // Enables /v1/admin. Use a long random value.
  adminToken: process.env.ADMIN_TOKEN || null,
  // Card top-ups are enabled only when both Stripe values are set.
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
  // Public base URL, used for Stripe Checkout return links. An https URL also
  // marks session cookies Secure.
  publicUrl,
  cookieSecure: publicUrl.startsWith('https://'),
  // Set TRUST_PROXY=1 behind a reverse proxy (LingCode Cloud) so rate limits key on
  // the client IP from X-Forwarded-For instead of the proxy's address.
  trustProxy: process.env.TRUST_PROXY === '1',
};
