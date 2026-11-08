function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} must be a positive integer`);
  return n;
}

module.exports = {
  port: intEnv('PORT', 3000),
  databaseUrl: process.env.DATABASE_URL,
  // How long a worker owns a job without heartbeating before it is requeued.
  leaseSeconds: intEnv('LEASE_SECONDS', 60),
  reaperIntervalMs: intEnv('REAPER_INTERVAL_MS', 10_000),
};
