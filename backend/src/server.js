// =============================================================================
// server.js — entry point. Connects the database, bootstraps security, then
// starts the HTTP server.
// =============================================================================
import app from './app.js';
import { config } from './config/env.js';
import { Users } from './models/index.js';
import { bootstrapPasswords } from './utils/security.js';
import { initDatabase, closeDatabase } from './config/db.js';

async function start() {
  // Attach MongoDB (Atlas) if configured; otherwise stay in-memory.
  await initDatabase();

  // Upgrade demo seed passwords to bcrypt hashes before accepting traffic.
  // (Runs after hydrate + persistence binding, so the hashes are saved too.)
  bootstrapPasswords(Users);

  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`\n  VendorBridge API running`);
    // eslint-disable-next-line no-console
    console.log(`  → http://localhost:${config.port}/api  (${config.nodeEnv})\n`);
  });

  // Clean shutdown so MongoDB connections are released.
  const shutdown = async () => {
    await closeDatabase();
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('  [fatal] Failed to start VendorBridge API:', err.message);
  process.exit(1);
});
