// Creates or updates an administrator account.
//   ADMIN_EMAIL=you@clinic.example ADMIN_PASSWORD='a-long-passphrase' npm run create-admin
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error('Set ADMIN_EMAIL to a valid email address.');
  process.exit(1);
}
if (password.length < 12) {
  console.error('Set ADMIN_PASSWORD to at least 12 characters.');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
await pool.execute(
  `INSERT INTO admin_users (email, password_hash) VALUES (?, ?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  [email, hash],
);
console.log(`Admin account ready for ${email}`);
await pool.end();
