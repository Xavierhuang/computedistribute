const config = require('./config');
const { createPool, migrate } = require('./db');
const { createApp } = require('./app');
const { reapExpiredLeases } = require('./queue');
const { createStripeBilling } = require('./billing');

async function main() {
  const pool = createPool(config.databaseUrl);
  const applied = await migrate(pool);
  if (applied.length) console.log(`Applied migrations: ${applied.join(', ')}`);

  const stripeBilling = createStripeBilling({
    secretKey: config.stripeSecretKey,
    webhookSecret: config.stripeWebhookSecret,
    publicUrl: config.publicUrl,
  });
  console.log(`Card top-ups: ${stripeBilling ? 'enabled' : 'disabled (set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)'}`);
  console.log(`Admin API: ${config.adminToken ? 'enabled' : 'disabled (set ADMIN_TOKEN)'}`);

  const app = createApp({
    pool,
    leaseSeconds: config.leaseSeconds,
    verifyRate: config.verifyRate,
    adminToken: config.adminToken,
    stripeBilling,
    cookieSecure: config.cookieSecure,
    trustProxy: config.trustProxy,
  });
  // Bind all interfaces: LingCode hosted apps must listen on 0.0.0.0:$PORT.
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`computedistribute API listening on port ${config.port}`);
  });

  const reaper = setInterval(() => {
    reapExpiredLeases(pool)
      .then((n) => n && console.log(`Requeued ${n} job(s) with expired leases`))
      .catch((err) => console.error('Lease reaper failed:', err.message));
  }, config.reaperIntervalMs);

  const shutdown = () => {
    clearInterval(reaper);
    server.close(() => pool.end().then(() => process.exit(0)));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
