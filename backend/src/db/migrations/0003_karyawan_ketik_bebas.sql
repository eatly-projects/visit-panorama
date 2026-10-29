-- Permintaan Lutfi (29 Oktober 2026): tamu mengetik sendiri nama karyawan dan
-- departemen yang ingin ditemui, tidak lagi memilih dari daftar karyawan.
-- Teksnya disimpan langsung di kunjungan. employee_id dibiarkan (boleh kosong)
-- supaya menu Karyawan yang disembunyikan bisa dipakai lagi nanti.
--
-- Sengaja tanpa NOT NULL: backend versi lama yang masih tayang selama deploy
-- belum mengisi kolom ini. Kewajiban isi dijaga oleh validasi backend.

alter table visits add column employee_name text;
alter table visits add column employee_department text;

update visits v
set employee_name = e.name, employee_department = e.department
from employees e
where e.id = v.employee_id and v.employee_name is null;

alter table visits alter column employee_id drop not null;

create index visits_employee_name on visits (lower(employee_name));
