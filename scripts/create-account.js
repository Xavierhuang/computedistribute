// Usage: npm run create-account -- <buyer|host> "<name>"
// Prints a new API key once. Store it; only its hash is kept in the database.
const config = require('../src/config');
const { createPool, migrate } = require('../src/db');
const { createAccount } = require('../src/auth');

async function main() {
  const [kind, name] = process.argv.slice(2);
  if (!['buyer', 'host'].includes(kind) || !name) {
    console.error('Usage: npm run create-account -- <buyer|host> "<name>"');
    process.exit(2);
  }
  const pool = createPool(config.databaseUrl);
  try {
    await migrate(pool);
    const { account, apiKey } = await createAccount(pool, { name, kind });
    console.log(`Created ${kind} account "${account.name}" (${account.id})`);
    console.log(`API key (shown once): ${apiKey}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
