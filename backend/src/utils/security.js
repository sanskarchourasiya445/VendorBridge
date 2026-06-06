// =============================================================================
// utils/security.js — password hashing & verification (bcrypt).
// bootstrapPasswords() upgrades the plaintext demo passwords in the seed to
// bcrypt hashes at startup, so the running app never stores plaintext.
// =============================================================================
import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, ROUNDS);
}

export function comparePassword(plain, hash) {
  if (!hash) return false;
  // Support both already-hashed seeds and any accidental plaintext.
  if (hash.startsWith('$2')) return bcrypt.compareSync(plain, hash);
  return plain === hash;
}

export function bootstrapPasswords(collection) {
  for (const user of collection.all()) {
    if (user.password && !user.password.startsWith('$2')) {
      collection.update(user.id, { password: hashPassword(user.password) });
    }
  }
}

export default { hashPassword, comparePassword, bootstrapPasswords };
