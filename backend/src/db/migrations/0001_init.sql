-- Struktur awal aplikasi pendataan tamu (docs/PLANNING.md §9 dan §17).
--
-- Semua tabel diberi RLS tanpa policy: REST API bawaan Supabase (kunci anon)
-- jadi tidak bisa membaca apa pun, sedangkan backend memakai peran
-- `postgres` yang melewati RLS.

create extension if not exists pg_trgm with schema extensions;

create table officers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_name_trgm on employees using gin (lower(name) extensions.gin_trgm_ops);

-- normalized_name = nama pembanding (huruf kecil, tanpa tanda baca, tanpa
-- PT/CV/Tbk, spasi tunggal). Indeks unik inilah yang menjamin nama
-- perusahaan tidak pernah dobel.
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique check (normalized_name <> ''),
  created_at timestamptz not null default now()
);

create index companies_normalized_trgm on companies using gin (normalized_name extensions.gin_trgm_ops);

create table visits (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null,
  phone text not null,
  company_id uuid references companies (id) on delete set null,
  address text not null,
  employee_id uuid not null references employees (id),
  purpose text check (purpose is null or char_length(purpose) <= 1000),
  consent_at timestamptz not null,
  status text not null default 'menunggu'
    check (status in ('menunggu', 'berkunjung', 'selesai', 'ditolak', 'tidak_kembali')),
  card_number integer check (card_number is null or card_number > 0),
  submitted_at timestamptz not null default now(),
  filled_by uuid references officers (id) on delete set null,
  approved_at timestamptz,
  approved_by uuid references officers (id) on delete set null,
  returned_at timestamptz,
  returned_by uuid references officers (id) on delete set null,
  rejected_at timestamptz,
  rejected_by uuid references officers (id) on delete set null,
  card_lost_at timestamptz,
  card_lost_by uuid references officers (id) on delete set null
);

-- Satu nomor kartu hanya boleh dipegang satu tamu yang sedang berkunjung.
create unique index visits_active_card on visits (card_number) where status = 'berkunjung';
create index visits_status on visits (status);
create index visits_submitted_at on visits (submitted_at desc);
create index visits_phone on visits (phone);
create index visits_company on visits (company_id);
create index visits_employee on visits (employee_id);

alter table officers enable row level security;
alter table employees enable row level security;
alter table companies enable row level security;
alter table visits enable row level security;
