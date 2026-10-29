/**
 * Data dummy kunjungan bulan ini (permintaan Lutfi, 29 Oktober 2026), supaya
 * dashboard Riwayat terlihat terisi saat dicoba atau dipresentasikan.
 *
 * Penanda data dummy: nomor HP berawalan 0899000. Perusahaan dummy hanya
 * yang ada di daftar COMPANIES di bawah. Data asli tidak pernah tersentuh.
 *
 * Cara pakai (dari folder backend/):
 *   npm run dummy -- isi     hapus dummy lama lalu isi ulang untuk bulan ini
 *   npm run dummy -- hapus   hapus semua data dummy
 */

import { pool, withTransaction } from '../src/shared/db/pool.js';
import { normalizeCompanyName } from '../src/shared/utils/companyName.js';

const PHONE_PREFIX = '0899000';
const TZ_OFFSET = '+07';

const COMPANIES = [
  'PT Nusa Indah Travel', 'PT Bahtera Samudra Logistik', 'CV Karya Mandiri Sejahtera', 'PT Cahaya Digital Solusi',
  'Bank Dana Sentosa', 'PT Mitra Wisata Nusantara', 'Universitas Harapan Bangsa', 'PT Aneka Hotel Indonesia',
  'CV Sumber Rejeki Abadi', 'PT Garuda Kreasi Media', 'PT Arta Graha Konsultan', 'PT Prima Event Organizer',
  'Koperasi Maju Bersama', 'Pribadi, Bekasi', 'Pribadi, Depok',
];
// [nama, departemen atau perusahaan, bobot seberapa sering dikunjungi]
const EMPLOYEES = [
  ['Budi Hartono', 'Keuangan', 6], ['Siti Rahmawati', 'Pemasaran', 5], ['Maria Gunadi', 'Penjualan Korporat', 5],
  ['Andreas Wijaya', 'Direksi', 2], ['Dewi Lestari', 'HRD', 4], ['Rudi Saputra', 'IT', 3], ['Fikri Ramadhan', 'Legal', 2],
  ['Yohana Situmorang', 'Operasional Tur', 4], ['Arif Setiawan', 'Pengadaan', 3], ['Linda Kurniawan', 'Keuangan', 2],
];
const FIRST = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko', 'Kartika', 'Lukman', 'Maya', 'Nanda', 'Oki', 'Putri', 'Rizky', 'Sari', 'Teguh', 'Utami', 'Vina', 'Wahyu', 'Yoga', 'Zahra', 'Agus', 'Bayu', 'Dian', 'Fitri', 'Galih', 'Hana'];
const LAST = ['Pratama', 'Saputra', 'Wijaya', 'Lestari', 'Hidayat', 'Nugroho', 'Kusuma', 'Siregar', 'Simanjuntak', 'Wibowo', 'Setiawan', 'Permata', 'Hakim', 'Santoso', 'Halim', 'Gunawan', 'Susanto', 'Rahman'];
const PURPOSES = [
  'Rapat penawaran kerja sama paket wisata korporat', 'Antar dokumen kontrak', 'Wawancara kerja', 'Presentasi produk',
  'Rapat evaluasi proyek', 'Penagihan invoice', 'Konsultasi pajak', 'Survei lokasi acara', 'Pengambilan tiket rombongan',
  'Diskusi kerja sama hotel', 'Serah terima barang pengadaan', 'Pelatihan sistem baru', 'Audit dokumen keuangan',
  'Rapat persiapan acara tahunan', 'Silaturahmi dengan direksi',
];
// Bobot jam kedatangan: ramai pagi menjelang siang dan setelah makan siang.
const HOURS = [[8, 1], [9, 3], [10, 4], [11, 3], [12, 1], [13, 3], [14, 3], [15, 2], [16, 1]];

// Angka acak yang bisa diulang (hasil sama setiap kali diisi ulang).
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20261029);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));
const weighted = (pairs) => {
  const total = pairs.reduce((s, p) => s + p[p.length - 1], 0);
  let r = rand() * total;
  for (const p of pairs) if ((r -= p[p.length - 1]) < 0) return p;
  return pairs[0];
};
const pad = (n) => String(n).padStart(2, '0');

async function remove(client) {
  const { rowCount } = await client.query(`delete from visits where phone like '${PHONE_PREFIX}%'`);
  const keys = COMPANIES.map(normalizeCompanyName);
  const { rowCount: companies } = await client.query(
    `delete from companies c where c.normalized_name = any($1) and not exists (select 1 from visits v where v.company_id = c.id)`,
    [keys]
  );
  return { visits: rowCount, companies };
}

async function fill(client) {
  const { rows: [officer] } = await client.query('select id from officers where is_active order by created_at limit 1');
  if (!officer) throw new Error('Belum ada akun petugas aktif. Jalankan npm run seed dulu.');

  const companyIds = [];
  for (const name of COMPANIES) {
    const key = normalizeCompanyName(name);
    await client.query('insert into companies (name, normalized_name) values ($1, $2) on conflict (normalized_name) do nothing', [name, key]);
    const { rows } = await client.query('select id from companies where normalized_name = $1', [key]);
    companyIds.push(rows[0].id);
  }

  // Tanggal dan jam sekarang di WIB.
  const nowWib = new Date(Date.now() + 7 * 3600_000);
  const year = nowWib.getUTCFullYear();
  const month = nowWib.getUTCMonth() + 1;
  const today = nowWib.getUTCDate();
  const nowMinutes = nowWib.getUTCHours() * 60 + nowWib.getUTCMinutes();

  let serial = 0;
  let inserted = 0;
  const activeCards = new Set();

  for (let day = 1; day <= today; day++) {
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Minggu
    const count = weekday === 0 ? between(0, 2) : weekday === 6 ? between(2, 5) : between(9, 15);
    const arrivals = Array.from({ length: count }, () => {
      const [hour] = weighted(HOURS);
      return hour * 60 + between(0, 59);
    }).sort((a, b) => a - b);

    for (let i = 0; i < arrivals.length; i++) {
      let arrive = arrivals[i];
      const isToday = day === today;
      if (isToday && arrive > nowMinutes - 2) continue; // belum terjadi
      serial++;
      const stay = between(25, 75) + (rand() < 0.3 ? between(30, 110) : 0);
      const fromEnd = arrivals.filter((a) => a <= nowMinutes - 2).length - 1 - i; // 0 = tamu paling baru hari ini

      let status;
      if (isToday && fromEnd < 3) status = 'menunggu';
      else if (isToday && (fromEnd < 8 || arrive + stay > nowMinutes)) status = 'berkunjung';
      else {
        const r = rand();
        status = r < 0.86 ? 'selesai' : r < 0.93 ? 'ditolak' : 'tidak_kembali';
      }

      let card = null;
      if (['berkunjung', 'selesai', 'tidak_kembali'].includes(status)) {
        card = between(1, 40);
        if (status === 'berkunjung') {
          while (activeCards.has(card)) card = between(1, 60);
          activeCards.add(card);
        }
      }

      const [empName, empDept] = weighted(EMPLOYEES);
      const at = (minutes) => `${year}-${pad(month)}-${pad(day)} ${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:${pad(between(0, 59))}${TZ_OFFSET}`;
      const submitted = at(Math.max(0, arrive - between(2, 6)));
      const approved = at(arrive);

      await client.query(
        `insert into visits (visitor_name, phone, company_id, employee_name, employee_department, purpose, consent_at, status,
                             card_number, submitted_at, approved_at, approved_by, returned_at, returned_by,
                             rejected_at, rejected_by, card_lost_at, card_lost_by, filled_by)
         values ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8, $9, $7::timestamptz,
                 $10::timestamptz, $11, $12::timestamptz, $13, $14::timestamptz, $15, $16::timestamptz, $17, $18)`,
        [
          `${pick(FIRST)} ${pick(LAST)}`,
          `${PHONE_PREFIX}${String(10000 + serial).slice(-5)}`,
          pick(companyIds),
          rand() < 0.12 ? empName.toLowerCase() : empName, // sebagian tamu mengetik huruf kecil
          empDept,
          pick(PURPOSES),
          submitted,
          status,
          card,
          ['berkunjung', 'selesai', 'tidak_kembali'].includes(status) ? approved : null,
          ['berkunjung', 'selesai', 'tidak_kembali'].includes(status) ? officer.id : null,
          status === 'selesai' ? at(Math.min(arrive + stay, 23 * 60 + 59)) : null,
          status === 'selesai' ? officer.id : null,
          status === 'ditolak' ? approved : null,
          status === 'ditolak' ? officer.id : null,
          status === 'tidak_kembali' ? at(Math.min(arrive + 300, 23 * 60 + 59)) : null,
          status === 'tidak_kembali' ? officer.id : null,
          rand() < 0.06 ? officer.id : null,
        ]
      );
      inserted++;
    }
  }
  return inserted;
}

const mode = process.argv[2];
if (!['isi', 'hapus'].includes(mode)) {
  console.error('Cara pakai: npm run dummy -- isi   atau   npm run dummy -- hapus');
  process.exit(1);
}

withTransaction(async (client) => {
  const removed = await remove(client);
  if (mode === 'hapus') {
    console.log(`Data dummy dihapus: ${removed.visits} kunjungan, ${removed.companies} perusahaan.`);
    return;
  }
  const inserted = await fill(client);
  console.log(`Data dummy bulan ini diisi: ${inserted} kunjungan (dummy lama yang dihapus: ${removed.visits}).`);
})
  .catch((err) => {
    console.error(`Gagal, tidak ada perubahan yang disimpan: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
