-- Arahan atasan (29 Oktober 2026): alamat tidak boleh diminta karena termasuk
-- data pribadi, jadi kolomnya dihapus beserta isinya. Nomor HP tetap wajib.
alter table visits drop column address;
