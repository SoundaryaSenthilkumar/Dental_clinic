import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';

// Compared against when the email is unknown, so response timing does not reveal valid accounts.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 10);

export async function verifyAdminCredentials(email, password) {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash AS passwordHash FROM admin_users WHERE email = ? LIMIT 1',
    [email],
  );
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  return ok && user ? { id: user.id, email: user.email } : null;
}

export function signAdminToken(user) {
  return jwt.sign({ sub: String(user.id), role: 'admin' }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyAdminToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (payload.role !== 'admin') throw new Error('Not an admin token');
  return payload;
}
