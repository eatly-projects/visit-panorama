# Progres

## 29 Oktober 2026

### Selesai
- Rencana disetujui (`docs/PLANNING.md`), rencana kerja di `docs/superpowers/plans/2026-10-29-visit-panorama.md`.
- **Backend** (`backend/`, Express + Supabase Postgres):
  - Migrasi `0001_init.sql` (tabel petugas, karyawan, perusahaan, kunjungan; RLS aktif) dan `0002_hapus_alamat.sql` sudah dijalankan ke database Supabase Lutfi.
  - Endpoint publik form tamu, login petugas (cookie httpOnly + JWT), kunjungan (setujui, tolak, kartu kembali, kartu tidak kembali, riwayat, hapus satuan/sesuai filter), karyawan, perusahaan (ganti nama, gabungkan, hapus), akun petugas. Semua daftar berhalaman.
  - Akun petugas pertama dibuat dari `SEED_OFFICER_*` di `backend/.env`.
- **Frontend** (`frontend/`, Vite + React JS + Tailwind + shadcn):
  - Form tamu (`/`), halaman masuk (`/masuk`), dashboard petugas (`/petugas`): beranda, riwayat, karyawan, perusahaan, akun petugas, kode QR (bisa dicetak), isi form untuk tamu.
  - Warna logo Panorama, mode terang dan gelap, huruf Plus Jakarta Sans.
- Perubahan dari atasan (alamat dihapus, nomor HP/perusahaan/tujuan wajib, departemen karyawan wajib), pagination, dan pencarian nama di daftar menunggu.

### Sudah diverifikasi
- `npm test` backend: 6 tes fungsi perapi nama perusahaan dan nomor HP lulus.
- Uji alur API end-to-end terhadap database Supabase sungguhan: seluruh cek lulus, termasuk nama perusahaan anti-dobel, kartu yang sedang dipakai ditolak, hapus tanpa filter ditolak, dan tamu aktif tidak ikut terhapus. Data uji sudah dibersihkan.
- `npm run build` frontend lulus, lint tanpa error.
- Dicek langsung di browser (Chrome, localhost):
  - Isi form tamu dengan salah ketik nama perusahaan; validasi semua kolom wajib.
  - Login petugas; setujui dengan nomor kartu yang sedang dipakai (ditolak) lalu nomor lain (berhasil).
  - Pencarian nomor kartu, kartu dikembalikan, isi pesan WhatsApp.
  - Riwayat dengan filter tanggal, detail, dan pratinjau hapus; pencarian daftar menunggu; pagination.
  - Mode terang dan gelap.
  - Ukuran HP 390 piksel dan tablet 820 piksel, tanpa geser ke samping di semua halaman.

### Belum diverifikasi
- Deploy ke Vercel (belum dilakukan).
- Dibuka langsung di HP sungguhan, termasuk Safari iPhone.
- Hasil cetak kode QR di kertas.
- Tombol WhatsApp benar-benar membuka aplikasi WhatsApp. Yang sudah dicek baru isi tautannya: nomor `62…` dan teks pesan.

### Catatan
- Database Supabase ada di region Eropa (Irlandia), jadi pencarian terasa sekitar 1–2 detik. Kalau ingin lebih cepat, pindahkan project Supabase ke region Singapore lalu ganti `regions` di `backend/vercel.json` menjadi `sin1`.
- Deploy Vercel: project backend bernama `visit-panorama-api` (Root Directory `backend`, env `DATABASE_URL` dan `JWT_SECRET`), project frontend bernama `visit-panorama` (Root Directory `frontend`, tanpa env). `frontend/vercel.json` sudah mengarah ke `https://visit-panorama-api.vercel.app`. Kalau Vercel memberi domain lain, ganti di file itu.
- Kode QR mengarah ke domain tempat halaman QR dibuka, jadi cetak QR dari situs Vercel, bukan dari localhost.
- Daftar karyawan masih kosong. Isi lewat menu Karyawan sebelum dipakai tamu.

### Langkah berikutnya
- Lutfi mencoba di lokal dan meneruskan masukan atasan.
- Isi daftar karyawan asli.
- Deploy backend dan frontend ke Vercel.
- Foto kartu visitor asli (opsional) untuk menyamakan tampilan nomor kartu.
