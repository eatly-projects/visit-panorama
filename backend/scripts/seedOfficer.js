/**
 * Membuat (atau memperbarui password) akun petugas pertama dari isi
 * SEED_OFFICER_NAME / SEED_OFFICER_EMAIL / SEED_OFFICER_PASSWORD di .env.
 * Akun berikutnya dibuat lewat menu Akun Petugas.
 *
 * Cara pakai (dari folder backend/): npm run seed
 */

import { pool } from '../src/shared/db/pool.js';
import { hashPassword } from '../src/features/auth/auth.service.js';

const name = process.env.SEED_OFFICER_NAME;
const email = process.env.SEED_OFFICER_EMAIL;
const password = process.env.SEED_OFFICER_PASSWORD;

if (!name || !email || !password) {
  console.error('Isi SEED_OFFICER_NAME, SEED_OFFICER_EMAIL, dan SEED_OFFICER_PASSWORD di backend/.env dulu.');
  process.exit(1);
}

const { rows } = await pool.query(
  `insert into officers (name, email, password_hash)
   values ($1, lower($2), $3)
   on conflict (email) do update set password_hash = excluded.password_hash, is_active = true
   returning name, email`,
  [name, email, await hashPassword(password)]
);

console.log('Akun petugas siap:', rows[0]);
await pool.end();
