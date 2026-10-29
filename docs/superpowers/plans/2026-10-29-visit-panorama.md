# Visit Panorama Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplikasi web pendataan tamu Panorama Head Office (pengganti penahanan KTP): form tamu publik lewat QR + dashboard petugas.

**Architecture:** Monorepo dua folder yang di-deploy terpisah di Vercel. `backend/` = Express (ESM) + `pg` ke Supabase Postgres (transaction pooler), auth cookie httpOnly + JWT. `frontend/` = Vite + React JS + Tailwind v4 + shadcn, memanggil `/api` relatif (Vite proxy saat dev, rewrite Vercel saat produksi → cookie pihak pertama, aman di Safari/iPhone; pola dari boombo-dashboard).

**Tech Stack:** Node 22, Express 4, pg, zod, bcrypt, jsonwebtoken, cookie-parser, express-rate-limit · React 19, Vite, Tailwind 4, shadcn (radix), TanStack Query 5, Zustand 5, axios, react-router-dom 7, react-icons, react-hot-toast, qrcode.react, date-fns + react-day-picker.

**Spec:** `docs/PLANNING.md`

## Global Constraints

- JavaScript saja (bukan TypeScript). Port dev: frontend **5180**, backend **4100** (bukan 4000/5173).
- Semua teks layar Bahasa Indonesia, tanpa singkatan, tanggal lengkap: "Kamis, 29 Oktober 2026 pukul 09.15 WIB"; zona tampil `Asia/Jakarta`.
- Kolom opsional kosong tampil "Tidak diisi"; tidak boleh error karena data kosong.
- Status: `menunggu`, `berkunjung`, `selesai`, `ditolak`, `tidak_kembali` → label "Menunggu persetujuan", "Sedang berkunjung", "Selesai", "Ditolak", "Kartu tidak kembali".
- Keperluan maksimal 1000 karakter. Nomor telepon disimpan berawalan `0`, 10–15 digit.
- Semua tabel `enable row level security` (tanpa policy) supaya REST API Supabase anon tidak bisa membaca; backend memakai peran `postgres` (melewati RLS).
- Mutasi frontend → toast (react-hot-toast); query → toast hanya saat gagal. Loading → skeleton.
- Responsif HP/tablet/desktop; sidebar sticky setinggi layar; section bersusun, bukan tab.

## Review Focus

1. Dua petugas menyetujui tamu dengan nomor kartu yang sama hampir bersamaan → satu ditolak dengan pesan nama pemakai kartu (indeks unik parsial + tangkap kode `23505`).
2. Nama perusahaan yang hanya beda huruf/tanda baca/awalan PT → tidak pernah jadi baris baru (indeks unik `normalized_name`, `ON CONFLICT`).
3. Hapus sesuai filter tanpa filter tanggal/tamu/orang ditemui → ditolak server (bukan hanya tombol nonaktif).
4. Nomor telepon dengan spasi/strip/`+62` → dinormalkan; link WhatsApp memakai `62…`.
5. Tamu sedang berkunjung tidak ikut terhapus (hapus satuan maupun sesuai filter).

---

### Task 1: Backend fondasi + database
**Files:** `backend/{package.json,.env,.env.example,vercel.json,api/index.js}`, `backend/src/{app.js,server.js}`, `backend/src/shared/db/pool.js`, `backend/src/shared/middleware/{errorHandler.js,authMiddleware.js,rateLimit.js}`, `backend/src/db/migrations/0001_init.sql`, `backend/scripts/{migrate.js,seedOfficer.js}`
- Tabel: `officers`, `employees`, `companies` (`normalized_name` unik + indeks trigram), `visits` (kolom sesuai PLANNING §9 + `card_lost_at/by`), `schema_migrations`.
- Indeks unik parsial `visits(card_number) where status='berkunjung'`.
- Cek dulu tabel yang sudah ada di database sebelum migrasi.
- Verifikasi: `npm run migrate` sukses, `npm run seed` membuat akun, `GET /api/health` → `{status:'ok'}`.

### Task 2: Utilitas murni + tes
**Files:** `backend/src/shared/utils/{companyName.js,phone.js}`, `backend/test/{companyName.test.js,phone.test.js}`
- `normalizeCompanyName(name: string) -> string` ("PT. Maju Jaya", "pt maju jaya", "Maju Jaya Tbk" → `maju jaya`; "PT" → `''`).
- `tidyDisplayName(name) -> string` (trim + spasi tunggal).
- `normalizePhone(raw) -> string|null` (`+62 812-3456-7890` → `081234567890`; `812…` → `0812…`; <10 / >15 digit → `null`).
- Verifikasi: `npm test` (node --test) lulus.

### Task 3: API publik
**Files:** `backend/src/features/public/{public.routes.js,public.controller.js,public.schema.js}`, `backend/src/features/companies/companies.service.js` (fungsi bersama)
- `GET /api/public/employees?q=` (min 2 huruf, maks 8, aktif saja) → `[{id,name,department}]`
- `GET /api/public/companies?q=` (perusahaan yang punya ≥1 kunjungan, maks 8) → `[{id,name}]`
- `POST /api/public/companies {name, force?}` → `{status:'exists'|'similar'|'created', company?, candidates?}`
- `POST /api/public/visits {visitor_name, phone, company_id?, address, employee_id, purpose?, consent:true}` → `{visitor_name, submitted_at}`; kalau ada cookie petugas valid → `filled_by` terisi.
- Rate limit per IP (header `x-vercel-forwarded-for` / `x-forwarded-for`).

### Task 4: Auth + petugas
**Files:** `backend/src/features/auth/*`, `backend/src/features/officers/*`
- `POST /api/auth/login {email,password}`, `GET /api/auth/me`, `POST /api/auth/logout`. Cookie `panorama_session` httpOnly, `sameSite:'lax'`, `secure` saat produksi, 12 jam.
- `GET/POST /api/officers`, `PATCH /api/officers/:id {name?,password?,is_active?}` (tidak bisa menonaktifkan diri sendiri).

### Task 5: Kunjungan (petugas)
**Files:** `backend/src/features/visits/*`
- `GET /api/visits/summary` → `{menunggu, berkunjung, selesai_hari_ini, total_hari_ini}`
- `GET /api/visits/pending`, `GET /api/visits/active?q=` (nama atau nomor kartu)
- `POST /api/visits/:id/{approve {card_number}|reject|return|card-lost}` — 409 kalau status tidak sesuai / kartu dipakai ("Kartu nomor 7 masih dipakai oleh Budi Santoso").
- `GET /api/visits?q&phone&from&to&status&company_id&employee_id&page` → `{items,total,page,page_size:20}`; `GET /api/visits/:id`
- `DELETE /api/visits/:id` (bukan `berkunjung`); `GET /api/visits/delete-preview?…` → `{count}`; `POST /api/visits/delete-by-filter {filters}` → `{deleted}` (wajib `from/to` atau `phone` atau `employee_id`; `berkunjung` tidak ikut).

### Task 6: Karyawan + perusahaan (petugas)
**Files:** `backend/src/features/{employees,companies}/*`
- Karyawan: `GET ?q&status`, `POST`, `PATCH /:id`.
- Perusahaan: `GET ?q&page` (+`visit_count`), `PATCH /:id {name}` (bentrok → 409), `POST /:id/merge {target_id}` (transaksi), `DELETE /:id` (hanya 0 kunjungan).

### Task 7: Frontend fondasi + desain
**Files:** `frontend/{package.json,vite.config.js,jsconfig.json,components.json,index.html,vercel.json,.env.example}`, `frontend/src/{main.jsx,index.css}`, `frontend/src/app/*`, `frontend/src/lib/{axios.js,utils.js,format.js,whatsapp.js}`, `frontend/src/components/ui/*`, `frontend/src/layouts/DashboardLayout.jsx`
- Token warna: latar putih, aksen oranye `#F0852F` dan merah `#ED1C24` dari logo.
- Router: `/` form tamu, `/masuk` login, `/petugas` beranda, `/petugas/riwayat`, `/petugas/karyawan`, `/petugas/perusahaan`, `/petugas/akun`, `/petugas/qr`, `/petugas/isi-form`.

### Task 8: Form tamu
**Files:** `frontend/src/features/visitor-form/*`
- Combobox perusahaan (cari + tambah + "Apakah maksud Anda"), combobox karyawan (min 2 huruf), penghitung 1000 karakter, centang persetujuan, layar sukses.

### Task 9: Dashboard petugas
**Files:** `frontend/src/features/{auth,reception,history,employees,companies,officers,qr}/*`
- Beranda: kartu angka, section Menunggu (polling 5 detik + toast tamu baru), section Sedang berkunjung (cari nama/nomor kartu, Kartu dikembalikan, Tandai kartu tidak kembali, WhatsApp).
- Riwayat: filter + tabel + detail + hapus sesuai filter.
- Karyawan, Perusahaan (gabungkan/hapus), Akun, QR (cetak).

### Task 10: Verifikasi + commit
- Jalankan backend (4100) + frontend (5180); uji alur penuh di browser pada lebar HP (390), tablet (820), desktop (1440).
- `npm run build` frontend lulus. Commit + push (diizinkan Lutfi). Catat di `docs/PROGRESS.md`.
