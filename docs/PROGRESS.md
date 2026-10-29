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
- Deploy Vercel (29 Oktober 2026):
  - Backend `https://visit-panorama-server.vercel.app` (Root Directory `backend`, env `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`).
  - Frontend `https://visit-panorama.vercel.app` (Root Directory `frontend`, tanpa env). Panggilan `/api` diteruskan ke backend lewat rewrite di `frontend/vercel.json`.
- Kode QR mengarah ke domain tempat halaman QR dibuka, jadi cetak QR dari situs Vercel, bukan dari localhost.
- Daftar karyawan tidak perlu diisi lagi, karena tamu mengetik sendiri nama karyawan dan departemennya.

### Tambahan setelah deploy (29 Oktober 2026)
- Mode terang jadi tampilan bawaan.
- Akun petugas Lutfi (`lutfi@visit-panorama.local`) dibuat, dan password-nya sudah diganti sesuai pilihan Lutfi. Login sudah diuji ke situs Vercel.
- Nama karyawan dan departemen sekarang diketik bebas oleh tamu, dan menu Karyawan disembunyikan (migrasi `0003`).
- Tombol kirim nonaktif sampai semua kolom wajib terisi. Sudah dicek di browser: tombol nonaktif saat form kosong dan aktif setelah semua lengkap.
- Poster QR dibuat dalam versi PDF dan PNG di `docs/poster/`.
- Label "Departemen atau perusahaan".
- Riwayat berubah jadi dashboard (periode bawaan bulan ini, kartu angka, dan grafik), plus export Excel dan PDF.
  - Sudah dicek di browser: dashboard tampil rapi di desktop dan HP; file Excel diperiksa isinya (sheet, format tanggal, nomor HP, judul kolom membeku); halaman PDF dilihat sebagai gambar.
  - Belum dicek: membuka file hasil unduhan di Microsoft Excel sungguhan.
- Unduh Excel sekarang bisa memilih periode: harian, minggu lalu, bulan ini, bulan lalu, atau rentang tertentu. Sudah dicek di browser:
  - "Minggu lalu" menghasilkan file 19–25 Oktober 2026 berisi 65 kunjungan, dan semua tanggalnya di dalam rentang.
  - "Bulan lalu" yang kosong memunculkan pesan tanpa mengunduh file.
  - Kalender harian dan rentang berfungsi.
- Penegasan kartu identitas di form dan poster, form tamu dua bahasa (Indonesia dan English), dan nomor HP luar negeri.
  - Sudah dicek di browser: jendela pilih bahasa muncul saat pertama kali dibuka, seluruh form dan layar terima kasih tampil dalam bahasa Inggris, form berhasil terkirim dengan nomor +65, dan bahasa bisa diganti kembali lewat tombol.
  - Data uji sudah dihapus.
- Data dummy bulan ini sudah diisi: 274 kunjungan bernomor HP `0899000…`. Hapus dengan `npm run dummy -- hapus` dari folder `backend/` sebelum dipakai sungguhan.
- Catatan `npm audit`: ada celah tingkat sedang di pustaka `uuid` milik exceljs. Tidak berdampak di sini, karena exceljs hanya menyusun file di browser dari data aplikasi sendiri.

### Langkah berikutnya
- Lutfi mencoba di lokal dan meneruskan masukan atasan.
- Deploy backend dan frontend ke Vercel.
- Foto kartu visitor asli (opsional) untuk menyamakan tampilan nomor kartu.
