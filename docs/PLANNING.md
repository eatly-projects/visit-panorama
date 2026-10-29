# Rencana: Aplikasi Pendataan Tamu Kantor (visit-panorama)

Tanggal: 29 Oktober 2026
Status: **disetujui Lutfi, versi pertama sudah dibangun** (lihat `docs/PROGRESS.md`)

---

## 1. Latar belakang

Ada aturan baru yang melarang perusahaan menyita, menukar, atau menyimpan sementara kartu identitas (KTP) tamu. Dasarnya UU Pelindungan Data Pribadi (UU PDP). Selama ini kantor Lutfi menahan KTP tamu di resepsionis sebagai "jaminan" kartu visitor.

Aplikasi ini menggantikan cara itu. Tamu mengisi data sendiri lewat HP, resepsionis menyetujui dan memberikan kartu visitor, lalu kartu dikembalikan saat tamu pulang. Semua tercatat dengan jam datang dan jam pulang.

Karena aplikasi ini juga mengumpulkan data pribadi (nama, nomor telepon, alamat), aplikasinya sendiri harus patuh UU PDP. Kalau tidak, masalahnya hanya pindah dari kartu fisik ke database.

## 2. Tujuan

- Tidak ada lagi KTP yang ditahan, difoto, atau dicatat nomornya.
- Setiap tamu tercatat: siapa, dari perusahaan mana, menemui siapa, kartu visitor nomor berapa, jam datang, dan jam pulang.
- Resepsionis tahu kapan saja kartu visitor mana yang belum kembali, dan bisa menghubungi tamunya.
- Nama perusahaan di database tidak dobel, termasuk yang hanya beda huruf besar/kecil atau salah ketik sedikit.
- Bisa dipakai orang awam dan dipahami dalam 10 detik.

## 3. Alur utama

1. Tamu datang ke meja resepsionis.
2. Resepsionis meminta tamu scan QR. Hanya ada **satu QR tetap** yang dicetak dan ditaruh di meja resepsionis.
3. Tamu mengisi form di HP-nya sendiri lalu mengirimnya. Layar tamu menampilkan "Silakan menuju meja resepsionis" beserta nama tamu.
4. Data tamu muncul otomatis di dashboard resepsionis dengan status **Menunggu persetujuan**.
5. Resepsionis boleh **melihat** KTP tamu sebentar untuk mencocokkan nama, lalu langsung mengembalikannya. Proses ini tidak dicatat di sistem.
6. Resepsionis menekan **Setujui** lalu mengetik nomor kartu visitor yang diberikan. Status berubah menjadi **Sedang berkunjung**, dan **jam datang** tercatat. Resepsionis juga bisa menekan **Tolak**.
7. Tamu menemui karyawan yang dituju.
8. Tamu mengembalikan kartu visitor. Resepsionis mencari tamu berdasarkan nama atau nomor kartu, lalu menekan **Kartu dikembalikan**. Status berubah menjadi **Selesai**, dan **jam pulang** tercatat.
9. Admin (orang yang sama dengan resepsionis) melihat riwayat dan mengelola data.

**Tamu yang tidak punya HP atau tidak ada kuota:** resepsionis membuka form yang sama dari dashboard, mengisinya untuk tamu, lalu lanjut ke langkah 4. Data itu ditandai "Diisi oleh petugas: [nama petugas]" sebagai bukti siapa yang mencentang persetujuan atas nama tamu.

**Rombongan:** setiap orang mengisi form sendiri, sehingga 1 orang = 1 data = 1 kartu visitor.

## 4. Peran

| Peran | Keterangan |
|---|---|
| **Tamu** | Tidak login. Hanya bisa membuka form dan mengirimnya |
| **Petugas** | Wajib login. Resepsionis dan admin **disatukan** menjadi satu peran (keputusan Lutfi). Semua akun petugas punya akses yang sama ke semua menu |

## 5. Form tamu

| Kolom | Wajib? | Aturan |
|---|---|---|
> **Diperbarui 29 Oktober 2026 sesuai arahan atasan** (tabel dari atasan dan percakapan Bu Mei dengan Bu Sallu, diteruskan Lutfi): alamat **dihapus** karena termasuk data pribadi, nomor HP **tetap wajib**, perusahaan atau asal dan tujuan kunjungan sekarang **wajib**.

| Kolom | Wajib? | Aturan |
|---|---|---|
| Nama lengkap | Wajib | Teks, maksimal 100 karakter |
| Nomor HP atau WhatsApp | Wajib | Hanya angka. Boleh diawali `+62`, `62`, atau `0`, lalu disimpan seragam dengan awalan `0`. Panjangnya 10–15 digit |
| Perusahaan atau asal | Wajib | Kolom pencarian dengan tombol tambah (lihat bagian 7). Tamu yang datang atas nama pribadi menulis asalnya, misalnya nama kota |
| Bertemu dengan | Wajib | Dipilih dari daftar karyawan aktif yang bisa dicari, ditampilkan sebagai nama beserta departemennya. Tidak boleh diketik bebas |
| Tujuan kunjungan | Wajib | Textarea, maksimal 1000 karakter, dengan penghitung sisa karakter |
| Persetujuan | Wajib dicentang | Kalimat persetujuan, lihat di bawah |
| ~~Alamat~~ | Dihapus | Kolom dan isinya dihapus dari database (migrasi `0002_hapus_alamat.sql`) |

Waktu masuk, waktu keluar, dan nomor kartu visitor wajib diisi oleh resepsionis, bukan oleh tamu (bagian 6.1).

**Kalimat persetujuan (draf):**
> Saya setuju data di atas digunakan oleh [Nama Perusahaan] untuk pencatatan tamu dan keamanan kantor. Data disimpan selama diperlukan dan dihapus secara berkala.

**Aturan lain:**
- Kalau nama karyawan yang dicari tidak ada di daftar, tamu diminta bertanya ke resepsionis. Resepsionis menambahkan karyawan itu di menu Karyawan, lalu tamu mencari ulang.
- Tombol kirim dinonaktifkan selama data sedang dikirim, supaya tidak terkirim dua kali.
- Setelah terkirim, layar sukses menampilkan nama tamu, waktu kirim, dan kalimat "Silakan menuju meja resepsionis".

## 6. Dashboard petugas

Navigasinya berupa sidebar yang tetap terlihat setinggi layar di desktop, dan menjadi menu lipat di HP. Isi halaman disusun sebagai **section bersusun**, bukan tab.

### 6.1 Beranda: Tamu Hari Ini

**Section A: Menunggu persetujuan**
- Daftar diurutkan dari yang terbaru dan **diperbarui otomatis** sekitar setiap 5 detik tanpa perlu refresh. Saat ada tamu baru, muncul notifikasi kecil (toast) "Tamu baru: [nama]".
- Setiap tamu menampilkan nama, nomor telepon, perusahaan, orang yang dituju, keperluan, dan waktu kirim.
- **Setujui** membuka dialog untuk mengetik nomor kartu visitor. Nomor wajib diisi dan berupa angka. Tidak ada daftar kartu atau batas jumlah kartu (keputusan Lutfi). Kalau nomor itu sedang dipakai tamu lain yang masih berkunjung, sistem menolak dengan pesan "Kartu nomor 7 masih dipakai oleh Budi Santoso".
- **Tolak** meminta konfirmasi dulu. Data tetap tersimpan dengan status Ditolak.

**Section B: Sedang berkunjung (kartu belum kembali)**
- Kotak pencarian besar bertuliskan "Cari nama atau nomor kartu visitor" (permintaan Lutfi).
- Setiap tamu menampilkan nomor kartu (besar), nama, nomor telepon, perusahaan, orang yang dituju, jam datang, dan lama berkunjung sejauh ini.
- Tamu dari hari sebelumnya yang kartunya belum kembali tetap ada di daftar ini, dengan tanda "Belum kembali sejak Rabu, 28 Oktober 2026".
- **Kartu dikembalikan** meminta konfirmasi, lalu status berubah menjadi Selesai dan jam pulang tercatat.

### 6.2 Riwayat Kunjungan
- Tabel dengan pencarian **nama** atau **nomor telepon**.
- Filter: **rentang tanggal**, **status**, **perusahaan**, dan **orang yang ditemui**. Filter boleh dipakai sendiri-sendiri atau digabung.
- Kolom tabel: tanggal, nama, nomor telepon, perusahaan, orang yang ditemui, nomor kartu, jam datang, jam pulang, lama berkunjung, dan status.
- Klik baris untuk melihat detail lengkap: tujuan kunjungan, waktu kirim, waktu disetujui atau ditolak, serta petugas yang menyetujui dan yang menerima kartu kembali.
- Pembagian halaman diproses di server, 20 baris per halaman.

**Hapus data (manual, keputusan Lutfi):**
- Tombol "Hapus data sesuai filter" menghapus semua data yang cocok dengan filter yang sedang aktif. Jadi Lutfi bisa menghapus berdasarkan orang saja, waktu saja, atau gabungan keduanya.
- "Orang" di sini bisa berarti dua filter:
  - **Tamu tertentu**, dicocokkan **persis** dengan nomor teleponnya. Misalnya untuk tamu yang meminta datanya dihapus.
  - **Orang yang ditemui**.
- Kotak pencarian nama tidak ikut menentukan data yang dihapus. Tanpa aturan ini, mencari "Budi" lalu menghapus akan menghapus semua tamu bernama Budi.
- Tombol hanya aktif kalau minimal satu dari tiga filter berikut dipakai: rentang tanggal, tamu tertentu, atau orang yang ditemui. Filter status atau perusahaan saja tidak cukup. Aturan ini mencegah semua data terhapus tidak sengaja.
- Sebelum menghapus, muncul dialog konfirmasi yang menyebut jumlah data dan ringkasan filternya, misalnya "48 data kunjungan dari 1–31 Agustus 2026 akan dihapus permanen".
- Tamu yang masih berstatus Sedang berkunjung tidak ikut terhapus.
- Satu data juga bisa dihapus dari halaman detailnya.
- Penghapusan bersifat permanen dan dijalankan dalam satu transaksi.

### 6.3 Karyawan
- Daftar karyawan dengan pencarian, plus tombol tambah, ubah, dan nonaktifkan/aktifkan.
- Kolomnya: nama (wajib) dan bagian/divisi (tidak wajib, untuk membedakan karyawan yang namanya sama).
- Karyawan **dinonaktifkan, bukan dihapus**, supaya riwayat kunjungan tetap utuh. Karyawan nonaktif tidak muncul di form tamu.

### 6.4 Perusahaan
- Daftar perusahaan beserta jumlah kunjungannya, dengan pencarian dan tombol ubah nama.
- **Gabungkan:** petugas memilih perusahaan A, menekan "Gabungkan ke…", lalu memilih perusahaan B. Semua kunjungan milik A dipindah ke B, kemudian A dihapus. Semuanya dijalankan dalam satu transaksi.
- **Hapus:** hanya bisa dilakukan untuk perusahaan yang belum punya kunjungan sama sekali. Gunanya untuk membersihkan nama iseng atau nama yang tidak jadi dipakai.
- Pencarian di form tamu hanya menampilkan perusahaan yang **sudah punya minimal satu kunjungan**, supaya nama iseng tidak terlihat oleh tamu lain. Pengecekan duplikat tetap membandingkan dengan semua perusahaan.

### 6.5 Akun Petugas
- Daftar akun dengan tombol tambah (nama, email, password), ganti password, dan nonaktifkan.
- Petugas tidak bisa menonaktifkan akunnya sendiri.
- Akun pertama dibuat lewat skrip awal (seed).

### 6.6 QR Pendaftaran
- Menampilkan QR yang mengarah ke form tamu, dengan tombol **Cetak**.
- Tata letak cetaknya berisi QR besar dan tulisan "Scan untuk mengisi data tamu".

### 6.7 Login
- Email dan password, dengan tombol lihat password.

## 7. Nama perusahaan tanpa duplikat

**Cara nama dibandingkan.** Nama dirapikan dulu menjadi "nama pembanding":
1. Huruf dijadikan kecil dan spasi di awal dan akhir dibuang.
2. Tanda baca (`. , - ( ) / &` dan sejenisnya) diganti spasi.
3. Kata bentuk badan usaha yang berdiri sendiri dibuang: `pt`, `cv`, `ud`, `tbk`, `persero`, `firma`. Daftarnya disimpan di satu tempat supaya mudah ditambah.
4. Spasi ganda dijadikan satu.

Hasilnya, "PT. Maju Jaya", "pt maju jaya", dan "Maju Jaya Tbk" punya nama pembanding yang sama: `maju jaya`. Kolom nama pembanding diberi **indeks unik** di database, sehingga duplikat jenis ini mustahil tersimpan.

**Pencarian.** Pencarian memakai kemiripan teks (extension `pg_trgm` di Postgres) ditambah pencarian "mengandung kata". Hasilnya maksimal 8 nama, sehingga "Maju Jya" tetap menemukan "PT Maju Jaya".

**Alur menambah perusahaan baru (di form tamu):**
1. Tamu mengetik nama. Kalau tidak ada yang cocok, muncul tombol "Tambahkan '[teks]' sebagai perusahaan baru".
2. Server menghitung nama pembandingnya.
   - Kalau nama pembanding yang **sama persis** sudah ada, sistem memilih perusahaan yang sudah ada itu dan tidak membuat data baru.
   - Kalau ada nama yang **mirip** (di atas ambang kemiripan), muncul "Apakah maksud Anda: PT Maju Jaya?" dengan pilihan nama-nama mirip tersebut dan tombol "Bukan, tetap tambahkan".
   - Kalau tidak ada yang mirip, atau tamu memilih tetap menambahkan, nama baru disimpan dan langsung terpilih di form.
3. Perusahaan langsung tersimpan di database saat ditambahkan, walaupun form tamu belum dikirim (sesuai alur Lutfi).
4. Nama tampilan disimpan seperti yang diketik, dengan spasi berlebih dirapikan. Petugas bisa mengubahnya di menu Perusahaan.

**Jaring pengaman:** menu Gabungkan di bagian 6.4.

**Konsekuensi yang diterima:** "PT Maju Jaya" dan "CV Maju Jaya" dianggap perusahaan yang sama. Kasus ini sangat jarang, dan menghindari duplikat jauh lebih penting.

## 8. Waktu

- Semua waktu dicatat oleh **server**, bukan diambil dari HP tamu.
- Waktu disimpan dalam format zona waktu standar dan ditampilkan dalam **WIB (Asia/Jakarta)**.
- Format tampilan: "Kamis, 29 Oktober 2026 pukul 09.15 WIB".
- Lama berkunjung ditampilkan seperti "1 jam 20 menit".

| Waktu | Kapan tercatat |
|---|---|
| Waktu kirim | Saat tamu mengirim form |
| Jam datang | Saat petugas menekan Setujui |
| Jam pulang | Saat petugas menekan Kartu dikembalikan |
| Waktu ditolak | Saat petugas menekan Tolak |

## 9. Struktur data

| Tabel | Isi |
|---|---|
| `officers` | Akun petugas: id, nama, email (unik), hash password, aktif atau tidak, waktu dibuat |
| `employees` | Karyawan: id, nama, bagian (boleh kosong), aktif atau tidak, waktu dibuat dan diubah |
| `companies` | Perusahaan: id, nama tampilan, nama pembanding (unik), waktu dibuat |
| `visits` | Kunjungan: id, nama tamu, nomor telepon, `company_id` (boleh kosong), alamat, `employee_id`, keperluan (boleh kosong, maksimal 1000 karakter), waktu persetujuan dicentang, status, nomor kartu (angka, boleh kosong), waktu kirim, `approved_at` dan `approved_by`, `returned_at` dan `returned_by`, `rejected_at` dan `rejected_by`, `filled_by` (petugas yang mengisi; kosong kalau tamu mengisi sendiri) |

- Status kunjungan ada empat: `menunggu`, `berkunjung`, `selesai`, `ditolak`. Teks yang tampil di layar memakai kata-kata lengkap.
- **Indeks unik sebagian** pada nomor kartu untuk status `berkunjung` menjamin satu nomor kartu tidak bisa dipakai dua tamu sekaligus.
- Tidak ada tabel "tamu" terpisah, dan form tidak mengisi otomatis data tamu lama. Ini disengaja demi privasi, karena siapa pun bisa mengetik nomor telepon orang lain.

## 10. Teknologi

Teknologi mengikuti pola standar project Lutfi.

| Bagian | Pilihan |
|---|---|
| Frontend (`frontend/`) | Vite + React (**JavaScript**), Tailwind, shadcn/ui, Zustand (status login), TanStack Query, axios, react-router-dom, react-icons, react-hot-toast, dan library QR code. Arsitektur Feature-Sliced |
| Backend (`backend/`) | Express (JavaScript) + nodemon. Validasi input di backend, login dengan bcrypt + JWT (pola yang sama dengan boombo-dashboard), dan `express-rate-limit` untuk endpoint publik |
| Database | Supabase Postgres dengan extension `pg_trgm`. Diakses dari backend memakai `pg` lewat **connection pooler Supabase**, bukan host `db.*.supabase.co` langsung, karena cara langsung itu gagal di Vercel (pelajaran dari pos-boomboo). Struktur database dibuat dari file SQL migrasi |
| Deploy | Vercel, dengan frontend dan backend sebagai dua project terpisah. Masing-masing punya `vercel.json` tanpa properti `comment` |
| Port lokal | Frontend 5180, backend 4100. Tidak memakai 4000 dan 5173 |

- Frontend tidak pernah mengakses Supabase langsung. Semua lewat backend.
- `.gitignore` (termasuk `.env.*`) dipasang sebelum push pertama.

## 11. Tampilan

- Responsif di HP, tablet, dan desktop. Form tamu dirancang untuk HP lebih dulu, sedangkan dashboard untuk desktop dan tablet tapi tetap nyaman di HP.
- Latar putih netral, dengan warna brand hanya sebagai aksen kecil. Kesannya modern, elegan, dan tidak berlebihan. Konten dibungkus wadah yang jelas.
- Loading memakai skeleton. Setiap request ke backend memakai toast. Kolom password punya tombol lihat.
- Teks di layar: Bahasa Indonesia, tanpa singkatan, angka tidak terpotong, tanggal dan rentang tanggal ditulis lengkap (misalnya "1–7 September 2026"), dan tanpa istilah teknis atau ID mentah.
- Kolom yang tidak diisi tampil sebagai "Tidak diisi", dan aplikasi tidak boleh error karena data kosong.

## 12. Keamanan dan UU PDP

- Endpoint publik (tanpa login) hanya empat: daftar karyawan aktif (nama dan bagian saja), cari perusahaan, tambah perusahaan, dan kirim form. Endpoint lainnya wajib login.
- Respons endpoint publik tidak pernah memuat data tamu lain.
- Endpoint publik dibatasi jumlah permintaannya (rate limit).
- Tidak ada foto KTP dan tidak ada nomor KTP.
- Tamu wajib mencentang kalimat persetujuan.
- Penghapusan data dilakukan manual oleh petugas (bagian 6.2).

## 13. Di luar cakupan

- Notifikasi WhatsApp atau email ke karyawan yang dituju.
- Penghapusan data otomatis terjadwal.
- Foto atau nomor KTP.
- Daftar master kartu visitor atau batas jumlah kartu.
- Isi otomatis data tamu yang pernah datang.
- Pemisahan peran resepsionis dan admin.
- Export ke Excel atau PDF.
- Petugas mengubah data isian tamu. Kalau tamu salah isi, petugas menolak dan tamu mengisi ulang.
- Lebih dari satu kantor atau cabang.

## 14. Yang membuat aplikasi ini gagal walaupun secara teknis berjalan

- Data KTP "pindah" ke database dalam bentuk foto, nomor, atau salinan.
- Tamu bisa melihat data tamu lain.
- Nama perusahaan dobel.
- Resepsionis tidak tahu kartu mana yang belum kembali.
- Aplikasi error karena kolom tidak wajib dibiarkan kosong.
- Ada istilah teknis atau singkatan di layar yang membingungkan orang awam.

## 15. Bahan dari Lutfi

**Sudah ada:**
- Nama perusahaan: **Panorama Group**. Nama ini dipakai di kalimat persetujuan dan judul aplikasi.
- Logo dalam 4 varian (hitam, putih, transparan, dan JPEG) di folder utama project. Warna brand: **oranye** (tulisan "Panorama") dan **merah** (gambar burung), dipakai sebagai aksen kecil di atas latar putih.
- Database Supabase. Koneksinya sudah lewat pooler dan tersimpan di `.env`, yang tidak ikut ke Git.

**Masih dibutuhkan:**
- Daftar karyawan awal. Ini tidak wajib, karena bisa diisi manual lewat menu Karyawan.
- Akses project Vercel, saat tahap deploy.

## 16. Keputusan yang Claude ambil sendiri (silakan dikoreksi)

1. Hanya ada satu QR tetap, dan ada halaman cetak QR di dashboard.
2. Nomor telepon disimpan seragam dengan awalan `0`, panjangnya 10–15 digit.
3. Nomor kartu visitor berupa angka. Sistem menolak nomor yang sedang dipakai tamu lain.
4. Kalau karyawan yang dicari tidak ada di daftar, resepsionis menambahkannya dulu. Form tidak menyediakan isian bebas.
5. Tombol Tolak tidak meminta alasan.
6. Petugas tidak bisa mengubah isian tamu.
7. Hapus data sesuai filter wajib memakai minimal satu filter, dan tamu yang masih berkunjung tidak ikut terhapus.
8. Kata bentuk badan usaha (PT, CV, dan sejenisnya) diabaikan saat membandingkan nama perusahaan.
9. Daftar tamu menunggu diperbarui otomatis setiap sekitar 5 detik, dengan toast saat ada tamu baru.
10. Riwayat ditampilkan 20 baris per halaman.
11. Karyawan dinonaktifkan, tidak dihapus.
12. Login memakai JWT buatan sendiri di Express, bukan Supabase Auth, mengikuti pola project Lutfi sebelumnya.
13. Hapus berdasarkan "orang" berarti tamu tertentu (dicocokkan persis dengan nomor telepon) atau orang yang ditemui. Kotak pencarian nama tidak ikut menentukan data yang dihapus.
14. Perusahaan yang belum punya kunjungan boleh dihapus, dan pencarian publik hanya menampilkan perusahaan yang sudah punya kunjungan.
15. Data yang diisi petugas atas nama tamu dicatat nama petugasnya.

## 17. Keputusan tambahan (dijawab Lutfi, 29 Oktober 2026)

**1. Kartu tidak kembali atau hilang.**
- Ada status kelima, **Kartu tidak kembali** (`tidak_kembali`), dengan tombol "Tandai kartu tidak kembali". Tombol ini mencatat waktu dan nama petugas (`card_lost_at`, `card_lost_by`). Nomor kartunya otomatis bebas, sehingga bisa dipakai tamu lain. Status ini final.
- Ada tombol **Hubungi lewat WhatsApp**, yang tampil di tamu berstatus Sedang berkunjung dan Kartu tidak kembali. Tombol ini membuka WhatsApp (`https://wa.me/62…`) ke nomor tamu, dengan pesan formal yang sudah terisi:

> Yth. Bapak/Ibu [Nama],
>
> Terima kasih atas kunjungan Bapak/Ibu ke Panorama Head Office pada [hari, tanggal pukul jam WIB] untuk bertemu dengan [Nama karyawan].
>
> Berdasarkan catatan kami, kartu visitor nomor [nomor] yang Bapak/Ibu gunakan belum dikembalikan. Kami mohon kesediaan Bapak/Ibu untuk mengembalikan kartu tersebut ke meja resepsionis Panorama Head Office pada kesempatan pertama.
>
> Apabila kartu sudah dikembalikan atau terdapat kendala, mohon kabari kami melalui pesan ini.
>
> Atas perhatian dan kerja samanya, kami ucapkan terima kasih.
>
> Hormat kami,
> Resepsionis Panorama Head Office

**2. Form bisa dibuka dari mana saja: diterima.** Form ini bersifat pengajuan, dan persetujuan tetap di tangan petugas. Pengaman yang dipasang:
- Karyawan baru muncul setelah tamu mengetik minimal 2 huruf, dengan maksimal 8 hasil.
- Endpoint publik diberi batas jumlah permintaan.

**3. Lain-lain.**
- Nama kantor yang dipakai di pesan dan judul adalah **Panorama Head Office**.
- Lutfi mengizinkan commit dan push setelah tugas selesai.
- Warna mengikuti logo (oranye `#F0852F` dan merah `#ED1C24`), dengan pilihan **mode terang dan mode gelap**. **Bawaannya mode terang** (permintaan Lutfi), tidak mengikuti setelan HP atau komputer. Tombol ganti mode ada di form tamu, halaman masuk, dan sidebar petugas, dan pilihannya tersimpan di browser.
- Kartu visitor tetap **kartu fisik**. Di layar petugas, nomornya ditampilkan dalam bentuk mirip kartu yang dirancang sendiri sementara (permintaan Lutfi). Bentuknya bisa disesuaikan setelah ada foto kartu asli.

## 18. Perubahan 29 Oktober 2026 (arahan atasan dan Lutfi)

- **Kolom form tamu** diubah sesuai tabel atasan, lihat bagian 5. Alamat dihapus, sedangkan nomor HP, perusahaan atau asal, dan tujuan kunjungan wajib diisi.
- **Departemen karyawan wajib diisi** saat menambah atau mengubah karyawan, karena tamu memilih "nama karyawan dan departemen/bagian".
- **Pagination** dipasang di semua daftar:
  - Menunggu persetujuan dan sedang berkunjung: 10 per halaman.
  - Riwayat, karyawan, perusahaan, dan akun petugas: 20 per halaman.
- **Daftar menunggu persetujuan bisa dicari** berdasarkan nama tamu.
- Notifikasi "Tamu baru" muncul di semua halaman petugas, tidak hanya di beranda.
- Hapus sesuai filter juga melewati tamu berstatus **menunggu**, selain yang sedang berkunjung, karena keduanya masih dalam proses.

## 19. Karyawan diketik bebas (keputusan Lutfi, 29 Oktober 2026)

- Di form tamu, "Bertemu dengan" sekarang berupa **dua kolom ketik bebas yang wajib**: **Nama karyawan yang ingin ditemui** dan **Departemen atau bagian**. Keduanya disimpan sebagai teks di kunjungan (`employee_name`, `employee_department`, migrasi `0003_karyawan_ketik_bebas.sql`).
- **Menu Karyawan disembunyikan**, tidak dihapus. Halamannya dan datanya tetap ada, dan bisa dimunculkan lagi dengan menghapus tanda `hidden` di `frontend/src/layouts/DashboardLayout.jsx`.
- Pencarian karyawan publik (`GET /api/public/employees`) dicabut, karena form tidak memakainya lagi. Dengan begitu daftar karyawan tidak terbuka untuk umum.
- Filter "Orang yang ditemui" di Riwayat menjadi kotak ketik yang mencari nama karyawan yang **mengandung** kata tersebut. Hapus sesuai filter memakai aturan yang sama, dan jumlah datanya selalu ditampilkan dulu sebelum dihapus.

## 20. Tombol kirim dan poster QR (permintaan Lutfi, 29 Oktober 2026)

- **Tombol "Kirim data kunjungan" nonaktif** selama masih ada kolom wajib yang kosong, nomor HP belum benar, atau persetujuan belum dicentang. Di bawah tombol tertulis apa saja yang belum diisi. Nomor HP yang salah langsung ditandai saat tamu pindah kolom.
- **Poster QR** (A4) untuk meja resepsionis tersedia dalam dua versi: `docs/poster/Poster-QR-Tamu-Panorama.pdf` dan `.png` (2382 × 3369 piksel). QR mengarah ke `https://visit-panorama.vercel.app/`.
  - Desain poster ada di `frontend/scripts/poster-qr/poster.html`.
  - Untuk membuat ulang (misalnya kalau domain berubah), jalankan dari folder `frontend/`: `npm run poster-qr`, atau `npm run poster-qr -- https://alamat-baru/`.
