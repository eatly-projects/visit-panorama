/**
 * Menjalankan semua berkas migrasi di src/db/migrations yang belum pernah
 * dijalankan, berurutan menurut nama. Setiap berkas dijalankan dalam satu
 * transaksi dan dicatat di tabel schema_migrations, jadi aman diulang.
 *
 * Cara pakai (dari folder backend/): npm run migrate
 */

import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { pool, withTransaction } from '../src/shared/db/pool.js';

const folder = path.resolve(import.meta.dirname, '../src/db/migrations');

async function main() {
  await pool.query(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`);
  await pool.query('alter table schema_migrations enable row level security');

  const { rows } = await pool.query('select name from schema_migrations');
  const applied = new Set(rows.map((r) => r.name));
  const pending = readdirSync(folder).filter((f) => f.endsWith('.sql') && !applied.has(f)).sort();

  if (!pending.length) {
    console.log('Tidak ada migrasi baru.');
    return;
  }

  for (const name of pending) {
    await withTransaction(async (client) => {
      await client.query(readFileSync(path.join(folder, name), 'utf8'));
      await client.query('insert into schema_migrations (name) values ($1)', [name]);
    });
    console.log(`Selesai: ${name}`);
  }
}

main()
  .catch((err) => {
    console.error(`\nMigrasi gagal, berkas yang gagal tidak disimpan: ${err.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
