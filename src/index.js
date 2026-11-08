const config = require('./config');
const { createPool, migrate } = require('./db');
const { createApp } = require('./app');
const { reapExpiredLeases } = require('./queue');

async function main() {
  const pool = createPool(config.databaseUrl);
  const applied = await migrate(pool);
  if (applied.length) console.log(`Applied migrations: ${applied.join(', ')}`);

  const app = createApp({ pool, leaseSeconds: config.leaseSeconds });
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
