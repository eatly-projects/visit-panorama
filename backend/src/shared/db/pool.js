/**
 * Satu pool Postgres (Supabase) yang dipakai semua service. Frontend tidak
 * pernah mengakses Supabase langsung; semua lewat backend ini.
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL belum diisi. Salin backend/.env.example ke backend/.env lalu isi.');
}

// Di Vercel setiap instance fungsi membuka pool sendiri. Pooler Supabase
// (transaction mode, port 6543) yang melakukan multiplexing sebenarnya,
// jadi cukup 1 koneksi per instance supaya batas koneksi tidak jebol.
const IS_SERVERLESS = Boolean(process.env.VERCEL);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  ...(IS_SERVERLESS ? { max: 1 } : {}),
});

/** Menjalankan fn(client) di dalam satu transaksi; rollback kalau gagal. */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (err) {
    await client.query('rollback').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
