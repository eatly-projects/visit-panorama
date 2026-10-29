/**
 * Ringkasan untuk dashboard Riwayat kunjungan (docs/PLANNING.md §21).
 * Semua angka dihitung dari kunjungan yang form-nya dikirim di dalam periode
 * (tanggal WIB), kecuali "sedang berkunjung saat ini" yang selalu keadaan
 * sekarang.
 */

import { pool } from '../../shared/db/pool.js';

const TZ = 'Asia/Jakarta';
// Rentang lebih panjang dari ini ditampilkan per bulan supaya grafik tetap terbaca.
const MAX_DAILY_DAYS = 62;

const IN_RANGE = `v.submitted_at >= ($1::date::timestamp at time zone '${TZ}')
  and v.submitted_at < (($2::date + 1)::timestamp at time zone '${TZ}')`;

/** Periode kosong (semua tanggal) dimulai dari kunjungan pertama sampai hari ini. */
async function resolveRange({ from, to }) {
  const { rows: [r] } = await pool.query(
    `select to_char((now() at time zone '${TZ}')::date, 'YYYY-MM-DD') as today,
            to_char(min(submitted_at at time zone '${TZ}')::date, 'YYYY-MM-DD') as first_day
     from visits`
  );
  const end = to ?? r.today;
  const start = from ?? r.first_day ?? end;
  return start <= end ? { start, end } : { start: end, end: start };
}

export async function stats(filters) {
  const { start, end } = await resolveRange(filters);
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
  const unit = days > MAX_DAILY_DAYS ? 'month' : 'day';
  const params = [start, end];

  const [totals, current, series, hours, companies, employees] = await Promise.all([
    pool.query(
      `select count(*)::int as total,
              count(*) filter (where v.approved_at is not null)::int as hadir,
              count(*) filter (where v.status = 'selesai')::int as selesai,
              count(*) filter (where v.status = 'menunggu')::int as menunggu,
              count(*) filter (where v.status = 'ditolak')::int as ditolak,
              count(*) filter (where v.status = 'tidak_kembali')::int as tidak_kembali,
              round(avg(extract(epoch from (v.returned_at - v.approved_at)) / 60)
                    filter (where v.status = 'selesai'))::int as rata_rata_menit
       from visits v where ${IN_RANGE}`,
      params
    ),
    pool.query(`select count(*)::int as berkunjung from visits where status = 'berkunjung'`),
    pool.query(
      `with buckets as (
         select generate_series(date_trunc('${unit}', $1::date), date_trunc('${unit}', $2::date), interval '1 ${unit}')::date as bucket
       ),
       counts as (
         select date_trunc('${unit}', (v.submitted_at at time zone '${TZ}'))::date as bucket,
                count(*)::int as total,
                count(*) filter (where v.approved_at is not null)::int as hadir
         from visits v where ${IN_RANGE}
         group by 1
       )
       select to_char(b.bucket, 'YYYY-MM-DD') as date, coalesce(c.total, 0) as total, coalesce(c.hadir, 0) as hadir
       from buckets b left join counts c using (bucket)
       order by b.bucket`,
      params
    ),
    pool.query(
      `select extract(hour from v.approved_at at time zone '${TZ}')::int as hour, count(*)::int as count
       from visits v where v.approved_at is not null and ${IN_RANGE}
       group by 1 order by 1`,
      params
    ),
    pool.query(
      `select c.name, count(*)::int as count
       from visits v join companies c on c.id = v.company_id
       where ${IN_RANGE}
       group by c.id, c.name order by count desc, c.name limit 5`,
      params
    ),
    // Nama karyawan diketik bebas oleh tamu: dikelompokkan tanpa membedakan
    // huruf besar/kecil dan spasi di ujung, lalu ditampilkan dengan ejaan
    // yang paling sering dipakai.
    pool.query(
      `select mode() within group (order by btrim(v.employee_name)) as name, count(*)::int as count
       from visits v
       where v.employee_name is not null and btrim(v.employee_name) <> '' and ${IN_RANGE}
       group by lower(btrim(v.employee_name)) order by count desc, name limit 5`,
      params
    ),
  ]);

  return {
    period: { from: start, to: end, unit },
    totals: { ...totals.rows[0], berkunjung_sekarang: current.rows[0].berkunjung },
    series: series.rows,
    hours: hours.rows,
    top_companies: companies.rows,
    top_employees: employees.rows,
  };
}
