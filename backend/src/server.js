import { app } from './app.js';
import { env } from './config/env.js';
import { pool, checkDatabase } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

checkDatabase()
  .then(() => console.log('MySQL connection OK'))
  .catch((err) => console.error('MySQL connection FAILED:', err.code || err.message));

// Graceful shutdown so in-flight bookings complete and pooled connections close cleanly.
async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
