/**
 * Daftar karyawan yang bisa dipilih tamu sebagai "orang yang ingin ditemui".
 * Karyawan dinonaktifkan, tidak dihapus, supaya riwayat kunjungan tetap utuh.
 */

import { pool } from '../../shared/db/pool.js';
import { HttpError } from '../../shared/middleware/errorHandler.js';

const SEARCH_THRESHOLD = 0.4;

const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

/** Pencarian di form tamu: minimal 2 huruf, maksimal 8 hasil, aktif saja. */
export async function searchPublic(q) {
  const text = (q ?? '').trim().toLowerCase();
  if (text.length < 2) return [];
  const { rows } = await pool.query(
    `select id, name, department
     from employees
     where is_active
       and (lower(name) like '%' || $1 || '%' or extensions.word_similarity($2, lower(name)) >= $3)
     order by (lower(name) like $1 || '%') desc,
              extensions.word_similarity($2, lower(name)) desc,
              name
     limit 8`,
    [escapeLike(text), text, SEARCH_THRESHOLD]
  );
  return rows;
}

const PAGE_SIZE = 20;

export async function list({ q, status, page }) {
  const params = [];
  const where = [];
  if (status === 'aktif') where.push('is_active');
  if (status === 'nonaktif') where.push('not is_active');
  const text = (q ?? '').trim().toLowerCase();
  if (text) {
    params.push(`%${escapeLike(text)}%`);
    where.push(`(lower(name) like $1 or lower(coalesce(department, '')) like $1)`);
  }
  const clause = where.length ? `where ${where.join(' and ')}` : '';
  const { rows: [{ total }] } = await pool.query(`select count(*)::int as total from employees e ${clause}`, params);
  const { rows: items } = await pool.query(
    `select e.id, e.name, e.department, e.is_active, e.created_at,
            (select count(*)::int from visits v where v.employee_id = e.id) as visit_count
     from employees e
     ${clause}
     order by e.is_active desc, e.name
     limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`,
    params
  );
  return { items, total, page, page_size: PAGE_SIZE };
}

export async function create({ name, department }) {
  const { rows } = await pool.query(
    'insert into employees (name, department) values ($1, $2) returning id, name, department, is_active',
    [name, department]
  );
  return rows[0];
}

export async function update(id, changes) {
  const fields = Object.entries(changes).filter(([, v]) => v !== undefined);
  if (!fields.length) throw new HttpError(400, 'Tidak ada perubahan yang dikirim');
  const sets = fields.map(([key], i) => `${key} = $${i + 2}`);
  const { rows } = await pool.query(
    `update employees set ${sets.join(', ')}, updated_at = now() where id = $1
     returning id, name, department, is_active`,
    [id, ...fields.map(([, v]) => v)]
  );
  if (!rows[0]) throw new HttpError(404, 'Karyawan tidak ditemukan');
  return rows[0];
}
