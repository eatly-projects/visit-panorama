/**
 * Perusahaan tanpa duplikat (docs/PLANNING.md §7 dan §6.4).
 */

import { pool, withTransaction } from '../../shared/db/pool.js';
import { HttpError } from '../../shared/middleware/errorHandler.js';
import { normalizeCompanyName, tidyDisplayName } from '../../shared/utils/companyName.js';

// Ambang kemiripan untuk "Apakah maksud Anda…?". "maju jya" vs "maju jaya"
// bernilai sekitar 0,58.
const SIMILAR_THRESHOLD = 0.45;
// Ambang untuk pencarian sambil mengetik (mencocokkan sebagian kata).
const SEARCH_THRESHOLD = 0.4;
const PAGE_SIZE = 20;

/** Pencarian di form tamu: hanya perusahaan yang sudah pernah berkunjung. */
export async function searchPublic(q) {
  const key = normalizeCompanyName(q);
  if (key.length < 2) return [];
  // normalizeCompanyName sudah membuang semua karakter selain huruf/angka,
  // jadi % dan _ tidak mungkin ada di `key`.
  const { rows } = await pool.query(
    `select c.id, c.name
     from companies c
     where exists (select 1 from visits v where v.company_id = c.id)
       and (c.normalized_name like '%' || $1 || '%'
            or extensions.word_similarity($1, c.normalized_name) >= $2)
     order by (c.normalized_name like $1 || '%') desc,
              extensions.word_similarity($1, c.normalized_name) desc,
              c.name
     limit 8`,
    [key, SEARCH_THRESHOLD]
  );
  return rows;
}

/**
 * Menambah perusahaan dari form tamu.
 * - Nama pembanding sama persis → kembalikan yang sudah ada (status 'exists').
 * - Ada yang mirip dan belum dipaksa → kembalikan kandidat (status 'similar').
 * - Selain itu → simpan baru (status 'created').
 */
export async function createFromPublic({ name, force }) {
  const display = tidyDisplayName(name);
  const key = normalizeCompanyName(display);
  if (!key) throw new HttpError(400, 'Nama perusahaan tidak valid');

  const existing = await findByKey(key);
  if (existing) return { status: 'exists', company: existing };

  if (!force) {
    const { rows: candidates } = await pool.query(
      `select id, name
       from companies
       where extensions.similarity(normalized_name, $1) >= $2
       order by extensions.similarity(normalized_name, $1) desc
       limit 3`,
      [key, SIMILAR_THRESHOLD]
    );
    if (candidates.length) return { status: 'similar', candidates };
  }

  // ON CONFLICT menjaga dari dua tamu yang menambahkan nama yang sama
  // pada saat bersamaan.
  const { rows } = await pool.query(
    `insert into companies (name, normalized_name) values ($1, $2)
     on conflict (normalized_name) do nothing
     returning id, name`,
    [display, key]
  );
  if (rows[0]) return { status: 'created', company: rows[0] };
  return { status: 'exists', company: await findByKey(key) };
}

async function findByKey(key) {
  const { rows } = await pool.query('select id, name from companies where normalized_name = $1', [key]);
  return rows[0] ?? null;
}

export async function listForOfficer({ q, page }) {
  const key = normalizeCompanyName(q ?? '');
  const params = [];
  let where = '';
  if (key) {
    params.push(key, SEARCH_THRESHOLD);
    where = `where c.normalized_name like '%' || $1 || '%' or extensions.word_similarity($1, c.normalized_name) >= $2`;
  }
  const { rows: [{ total }] } = await pool.query(`select count(*)::int as total from companies c ${where}`, params);
  const { rows: items } = await pool.query(
    `select c.id, c.name, c.created_at,
            (select count(*)::int from visits v where v.company_id = c.id) as visit_count
     from companies c
     ${where}
     order by c.name
     limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`,
    params
  );
  return { items, total, page, page_size: PAGE_SIZE };
}

export async function rename(id, name) {
  const display = tidyDisplayName(name);
  const key = normalizeCompanyName(display);
  if (!key) throw new HttpError(400, 'Nama perusahaan tidak valid');

  const other = await findByKey(key);
  if (other && other.id !== id) {
    throw new HttpError(409, `Sudah ada perusahaan "${other.name}". Gunakan Gabungkan untuk menyatukan keduanya.`);
  }
  const { rows } = await pool.query(
    'update companies set name = $2, normalized_name = $3 where id = $1 returning id, name',
    [id, display, key]
  );
  if (!rows[0]) throw new HttpError(404, 'Perusahaan tidak ditemukan');
  return rows[0];
}

/** Memindahkan semua kunjungan dari source ke target, lalu menghapus source. */
export async function merge(sourceId, targetId) {
  if (sourceId === targetId) throw new HttpError(400, 'Pilih perusahaan lain sebagai tujuan penggabungan');
  return withTransaction(async (client) => {
    const { rows } = await client.query('select id, name from companies where id = any($1) for update', [
      [sourceId, targetId],
    ]);
    const target = rows.find((r) => r.id === targetId);
    if (rows.length !== 2 || !target) throw new HttpError(404, 'Perusahaan tidak ditemukan');

    const { rowCount: moved } = await client.query('update visits set company_id = $2 where company_id = $1', [
      sourceId,
      targetId,
    ]);
    await client.query('delete from companies where id = $1', [sourceId]);
    return { target, moved };
  });
}

export async function remove(id) {
  const { rows } = await pool.query(
    `delete from companies c
     where c.id = $1 and not exists (select 1 from visits v where v.company_id = c.id)
     returning id`,
    [id]
  );
  if (rows[0]) return;
  const { rowCount } = await pool.query('select 1 from companies where id = $1', [id]);
  if (!rowCount) throw new HttpError(404, 'Perusahaan tidak ditemukan');
  throw new HttpError(409, 'Perusahaan ini sudah punya data kunjungan, jadi tidak bisa dihapus. Gunakan Gabungkan kalau namanya dobel.');
}
