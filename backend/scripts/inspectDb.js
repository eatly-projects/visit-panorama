/**
 * Melihat isi database sebelum migrasi: versi Postgres, schema, dan tabel
 * yang sudah ada. Tidak mengubah apa pun.
 *
 * Cara pakai (dari folder backend/): node scripts/inspectDb.js
 */

import { pool } from '../src/shared/db/pool.js';

const { rows: [info] } = await pool.query('select version(), current_user, current_database()');
console.log(info);

const { rows: tables } = await pool.query(`
  select table_schema, table_name
  from information_schema.tables
  where table_schema not in ('pg_catalog', 'information_schema')
    and table_schema not like 'pg_%'
    and table_schema not in ('auth', 'storage', 'realtime', 'extensions', 'graphql', 'graphql_public', 'vault', 'supabase_functions', 'supabase_migrations', 'pgsodium', 'pgsodium_masks', 'net', 'cron')
  order by 1, 2`);
console.log('Tabel aplikasi yang sudah ada:', tables.length ? tables : 'tidak ada');

const { rows: ext } = await pool.query(`select extname, extversion from pg_extension order by 1`);
console.log('Extension:', ext.map((e) => e.extname).join(', '));

await pool.end();
