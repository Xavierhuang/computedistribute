const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function createPool(connectionString) {
  if (!connectionString) throw new Error('DATABASE_URL is not set (see .env.example)');
  return new Pool({ connectionString });
}

function ddlHint(err) {
  return err.code === '42501'
    ? ' (this database role cannot run DDL: apply the migration with the LingCode Cloud migration tool, then restart)'
    : '';
}

// Applies each migrations/*.sql file once, in filename order, each in its own transaction.
//
// On LingCode Cloud the app's database role cannot run DDL, so migrations are applied
// there with the Cloud migration tool (which also records them in schema_migrations).
// This function then finds nothing pending and runs no DDL at all. Note that Postgres
// checks CREATE permission before IF NOT EXISTS, hence the explicit existence check.
async function migrate(pool) {
  const { rows: [{ exists }] } = await pool.query(
    "SELECT to_regclass('schema_migrations') IS NOT NULL AS exists",
  );
  if (!exists) {
    await pool.query(`CREATE TABLE schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`).catch((err) => {
      throw new Error(`creating schema_migrations failed: ${err.message}${ddlHint(err)}`);
    });
  }
  const done = new Set((await pool.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql') && !done.has(f)).sort();
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
      throw new Error(`migration ${file} failed: ${err.message}${ddlHint(err)}`);
    } finally {
      client.release();
    }
  }
  return applied;
}

module.exports = { createPool, migrate };
