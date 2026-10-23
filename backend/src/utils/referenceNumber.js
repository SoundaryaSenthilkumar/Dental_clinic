import { randomBytes } from 'node:crypto';

// Unambiguous alphabet (no 0/O/1/I) for references people read out loud.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Format: DC-YYYYMMDD-XXXXX. The database also enforces uniqueness.
export function generateReference(now = new Date()) {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  let suffix = '';
  for (const b of randomBytes(5)) suffix += ALPHABET[b % ALPHABET.length];
  return `DC-${datePart}-${suffix}`;
}
