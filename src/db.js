const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function createPool(connectionString) {
  if (!connectionString) throw new Error('DATABASE_URL is not set (see .env.example)');
  return new Pool({ connectionString });
}

// Applies each migrations/*.sql file once, in filename order, each in its own transaction.
async function migrate(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  const applied = [];
  for (const file of files) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Serialise concurrent migrators (e.g. two app instances starting at once).
      await client.query('SELECT pg_advisory_xact_lock(727274)');
      const done = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if (done.rowCount === 0) {
        await client.query(await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8'));
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        applied.push(file);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`migration ${file} failed: ${err.message}`);
    } finally {
      client.release();
    }
  }
  return applied;
}

module.exports = { createPool, migrate };
