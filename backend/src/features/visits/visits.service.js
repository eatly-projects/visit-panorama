/**
 * Alur kunjungan (docs/PLANNING.md §3, §6, §17):
 * menunggu → berkunjung (Setujui + nomor kartu) → selesai (kartu kembali)
 *                                              → tidak_kembali (kartu tidak kembali)
 * menunggu → ditolak
 */

import { pool, withTransaction } from '../../shared/db/pool.js';
import { HttpError } from '../../shared/middleware/errorHandler.js';

const PAGE_SIZE = 20;
const TZ = 'Asia/Jakarta';

// Status yang masih "berjalan": tidak boleh ikut terhapus.
const ACTIVE_STATUSES = ['menunggu', 'berkunjung'];

const VISIT_SELECT = `
  select v.id, v.visitor_name, v.phone, v.company_id, c.name as company_name,
         v.employee_name, v.employee_department,
         v.purpose, v.status, v.card_number, v.consent_at, v.submitted_at,
         v.approved_at, oa.name as approved_by_name,
         v.returned_at, ort.name as returned_by_name,
         v.rejected_at, orj.name as rejected_by_name,
         v.card_lost_at, ol.name as card_lost_by_name,
         ofl.name as filled_by_name
  from visits v
  left join companies c on c.id = v.company_id
  left join officers oa on oa.id = v.approved_by
  left join officers ort on ort.id = v.returned_by
  left join officers orj on orj.id = v.rejected_by
  left join officers ol on ol.id = v.card_lost_by
  left join officers ofl on ofl.id = v.filled_by`;

export async function createFromForm(data, filledBy) {
  const { rowCount } = await pool.query('select 1 from companies where id = $1', [data.company_id]);
  if (!rowCount) throw new HttpError(400, 'Perusahaan atau asal tidak ditemukan. Silakan pilih ulang.');

  const { rows } = await pool.query(
    `insert into visits (visitor_name, phone, company_id, employee_name, employee_department, purpose, consent_at, filled_by)
     values ($1, $2, $3, $4, $5, $6, now(), $7)
     returning visitor_name, submitted_at`,
    [data.visitor_name, data.phone, data.company_id, data.employee_name, data.employee_department, data.purpose, filledBy]
  );
  return rows[0];
}

export async function summary() {
  const { rows } = await pool.query(
    `with today as (select (date_trunc('day', now() at time zone '${TZ}') at time zone '${TZ}') as start)
     select count(*) filter (where status = 'menunggu')::int as menunggu,
            count(*) filter (where status = 'berkunjung')::int as berkunjung,
            count(*) filter (where status = 'selesai' and returned_at >= today.start)::int as selesai_hari_ini,
            count(*) filter (where submitted_at >= today.start)::int as total_hari_ini
     from visits, today`
  );
  return rows[0];
}

// Daftar di beranda dibagi per halaman supaya tetap ringan saat ramai.
const LIVE_PAGE_SIZE = 10;

const likePattern = (text) => `%${text.replace(/[\\%_]/g, '\\$&')}%`;

async function paginate(where, params, orderBy, page, pageSize) {
  const { rows: [{ total }] } = await pool.query(`select count(*)::int as total from visits v where ${where}`, params);
  const { rows: items } = await pool.query(
    `${VISIT_SELECT} where ${where} order by ${orderBy} limit ${pageSize} offset ${(page - 1) * pageSize}`,
    params
  );
  return { items, total, page, page_size: pageSize };
}

/** Tamu yang menunggu persetujuan. q = nama tamu. */
export async function pending({ q, page }) {
  const text = (q ?? '').trim();
  const params = [];
  let where = `v.status = 'menunggu'`;
  if (text) {
    params.push(likePattern(text));
    where += ' and v.visitor_name ilike $1';
  }
  return paginate(where, params, 'v.submitted_at desc', page, LIVE_PAGE_SIZE);
}

/** Tamu yang masih memegang kartu. q = nama atau nomor kartu. */
export async function active({ q, page }) {
  const text = (q ?? '').trim();
  const params = [];
  let where = `v.status = 'berkunjung'`;
  if (/^\d{1,9}$/.test(text)) {
    params.push(Number(text));
    where += ' and v.card_number = $1';
  } else if (text) {
    params.push(likePattern(text));
    where += ' and v.visitor_name ilike $1';
  }
  return paginate(where, params, 'v.approved_at desc', page, LIVE_PAGE_SIZE);
}

export async function findById(id) {
  const { rows } = await pool.query(`${VISIT_SELECT} where v.id = $1`, [id]);
  if (!rows[0]) throw new HttpError(404, 'Data kunjungan tidak ditemukan');
  return rows[0];
}

export async function approve(id, cardNumber, officerId) {
  try {
    await withTransaction(async (client) => {
      const { rows: [visit] } = await client.query('select status from visits where id = $1 for update', [id]);
      if (!visit) throw new HttpError(404, 'Data kunjungan tidak ditemukan');
      if (visit.status !== 'menunggu') throw new HttpError(409, 'Tamu ini sudah diproses oleh petugas lain');

      await assertCardFree(client, cardNumber);
      await client.query(
        `update visits set status = 'berkunjung', card_number = $2, approved_at = now(), approved_by = $3
         where id = $1`,
        [id, cardNumber, officerId]
      );
    });
  } catch (err) {
    // Dua petugas memakai nomor kartu yang sama hampir bersamaan: indeks
    // unik visits_active_card yang menolak salah satunya.
    if (err.code === '23505') await assertCardFree(pool, cardNumber);
    throw err;
  }
  return findById(id);
}

async function assertCardFree(db, cardNumber) {
  const { rows: [holder] } = await db.query(
    `select visitor_name from visits where status = 'berkunjung' and card_number = $1`,
    [cardNumber]
  );
  if (holder) {
    throw new HttpError(409, `Kartu nomor ${cardNumber} masih dipakai oleh ${holder.visitor_name}`);
  }
}

const TRANSITIONS = {
  reject: { from: 'menunggu', to: 'ditolak', at: 'rejected_at', by: 'rejected_by' },
  return: { from: 'berkunjung', to: 'selesai', at: 'returned_at', by: 'returned_by' },
  cardLost: { from: 'berkunjung', to: 'tidak_kembali', at: 'card_lost_at', by: 'card_lost_by' },
};

export async function transition(action, id, officerId) {
  const t = TRANSITIONS[action];
  const { rowCount } = await pool.query(
    `update visits set status = '${t.to}', ${t.at} = now(), ${t.by} = $2 where id = $1 and status = '${t.from}'`,
    [id, officerId]
  );
  if (!rowCount) {
    await findById(id); // 404 kalau datanya memang tidak ada
    throw new HttpError(409, 'Status tamu ini sudah berubah. Muat ulang halaman untuk melihat data terbaru.');
  }
  return findById(id);
}

/**
 * Menyusun klausa WHERE dari filter riwayat. Semua nilai lewat parameter.
 * `q` (pencarian bebas) tidak dipakai saat menghapus, lihat deleteByFilter.
 */
function buildWhere(f, { includeSearch = true } = {}) {
  const params = [];
  const where = [];
  const add = (sql, value) => {
    params.push(value);
    where.push(sql.replaceAll('?', `$${params.length}`));
  };

  if (includeSearch && f.q) {
    const digits = f.q.replace(/\D/g, '');
    params.push(likePattern(f.q));
    const nameIdx = params.length;
    if (digits.length >= 4) {
      params.push(`%${digits}%`);
      where.push(`(v.visitor_name ilike $${nameIdx} or v.phone like $${params.length})`);
    } else {
      where.push(`v.visitor_name ilike $${nameIdx}`);
    }
  }
  if (f.phone) add('v.phone = ?', f.phone);
  if (f.from) add(`v.submitted_at >= (?::date::timestamp at time zone '${TZ}')`, f.from);
  if (f.to) add(`v.submitted_at < ((?::date + 1)::timestamp at time zone '${TZ}')`, f.to);
  if (f.status) add('v.status = ?', f.status);
  if (f.company_id) add('v.company_id = ?', f.company_id);
  // Nama karyawan diketik bebas oleh tamu, jadi dicari yang mengandung kata ini.
  if (f.employee) add('v.employee_name ilike ?', likePattern(f.employee));

  return { where, params };
}

export async function list(filters, page) {
  const { where, params } = buildWhere(filters);
  return paginate(where.length ? where.join(' and ') : 'true', params, 'v.submitted_at desc', page, PAGE_SIZE);
}

// Batas baris export supaya file tetap ringan dan fungsi Vercel tidak kehabisan waktu.
const EXPORT_LIMIT = 10000;

/** Semua kunjungan sesuai filter (urut dari yang paling lama), untuk Excel dan PDF. */
export async function exportRows(filters) {
  const { where, params } = buildWhere(filters);
  const clause = where.length ? `where ${where.join(' and ')}` : '';
  const { rows } = await pool.query(
    `${VISIT_SELECT} ${clause} order by v.submitted_at asc limit ${EXPORT_LIMIT + 1}`,
    params
  );
  return { rows: rows.slice(0, EXPORT_LIMIT), truncated: rows.length > EXPORT_LIMIT, limit: EXPORT_LIMIT };
}

function deletionWhere(filters) {
  if (!filters.from && !filters.to && !filters.phone && !filters.employee) {
    throw new HttpError(400, 'Pilih minimal rentang tanggal, tamu tertentu, atau orang yang ditemui sebelum menghapus');
  }
  const { where, params } = buildWhere(filters, { includeSearch: false });
  params.push(ACTIVE_STATUSES);
  where.push(`v.status <> all($${params.length})`);
  return { clause: `where ${where.join(' and ')}`, params };
}

export async function deletePreview(filters) {
  const { clause, params } = deletionWhere(filters);
  const { rows } = await pool.query(`select count(*)::int as count from visits v ${clause}`, params);
  return rows[0];
}

export async function deleteByFilter(filters) {
  const { clause, params } = deletionWhere(filters);
  const { rowCount } = await pool.query(`delete from visits v ${clause}`, params);
  return { deleted: rowCount };
}

export async function remove(id) {
  const { rowCount } = await pool.query('delete from visits where id = $1 and status <> all($2)', [
    id,
    ACTIVE_STATUSES,
  ]);
  if (rowCount) return;
  await findById(id);
  throw new HttpError(409, 'Tamu ini masih menunggu atau sedang berkunjung, jadi datanya belum bisa dihapus');
}
