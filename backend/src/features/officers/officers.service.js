/**
 * Akun petugas. Resepsionis dan admin disatukan jadi satu peran, jadi
 * semua petugas yang login boleh mengelola akun.
 */

import { pool } from '../../shared/db/pool.js';
import { HttpError } from '../../shared/middleware/errorHandler.js';
import { hashPassword } from '../auth/auth.service.js';

const PAGE_SIZE = 20;

export async function list(page) {
  const { rows: [{ total }] } = await pool.query('select count(*)::int as total from officers');
  const { rows: items } = await pool.query(
    `select id, name, email, is_active, created_at from officers
     order by is_active desc, name
     limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`
  );
  return { items, total, page, page_size: PAGE_SIZE };
}

export async function create({ name, email, password }) {
  try {
    const { rows } = await pool.query(
      `insert into officers (name, email, password_hash) values ($1, lower($2), $3)
       returning id, name, email, is_active, created_at`,
      [name, email, await hashPassword(password)]
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Email ini sudah dipakai akun lain');
    throw err;
  }
}

export async function update(id, { name, password, is_active }, currentOfficerId) {
  if (is_active === false && id === currentOfficerId) {
    throw new HttpError(400, 'Anda tidak bisa menonaktifkan akun sendiri');
  }
  const fields = [];
  const params = [id];
  if (name !== undefined) fields.push(['name', name]);
  if (password !== undefined) fields.push(['password_hash', await hashPassword(password)]);
  if (is_active !== undefined) fields.push(['is_active', is_active]);
  if (!fields.length) throw new HttpError(400, 'Tidak ada perubahan yang dikirim');

  const sets = fields.map(([key, value]) => {
    params.push(value);
    return `${key} = $${params.length}`;
  });
  const { rows } = await pool.query(
    `update officers set ${sets.join(', ')} where id = $1 returning id, name, email, is_active, created_at`,
    params
  );
  if (!rows[0]) throw new HttpError(404, 'Akun tidak ditemukan');
  return rows[0];
}
