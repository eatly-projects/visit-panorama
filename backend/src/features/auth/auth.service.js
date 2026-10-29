/**
 * Login petugas dengan email + password (bukan Supabase Auth), mengikuti
 * pola project sebelumnya. Tidak ada pendaftaran mandiri: akun dibuat lewat
 * menu Akun Petugas atau scripts/seedOfficer.js.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../shared/db/pool.js';

const SALT_ROUNDS = 12;
export const TOKEN_TTL_HOURS = 12;

export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function findOfficerByEmail(email) {
  const { rows } = await pool.query(
    'select id, name, email, password_hash, is_active from officers where email = lower($1)',
    [email]
  );
  return rows[0] ?? null;
}

export async function findActiveOfficerById(id) {
  const { rows } = await pool.query(
    'select id, name, email from officers where id = $1 and is_active',
    [id]
  );
  return rows[0] ?? null;
}

export function issueToken(officer) {
  return jwt.sign({ sub: officer.id }, process.env.JWT_SECRET, { expiresIn: `${TOKEN_TTL_HOURS}h` });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
