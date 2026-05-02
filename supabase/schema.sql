-- =============================================================
-- SCHEMA  –  Aplikasi Informasi Kamar Kos
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- Tabel utama kamar
create table if not exists kamar (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,                          -- e.g. "Kamar A1"
  deskripsi   text,
  status      text not null default 'kosong'          -- 'kosong' | 'terisi'
              check (status in ('kosong','terisi')),
  luas        text,                                   -- e.g. "3x4 m²"
  lantai      int,
  fasilitas   text[],                                 -- ["AC","WiFi","Kamar mandi dalam"]
  foto_urls   text[],                                 -- array URL dari Supabase Storage
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Tabel harga per kamar (satu kamar bisa punya banyak opsi durasi)
create table if not exists harga (
  id         uuid primary key default gen_random_uuid(),
  kamar_id   uuid not null references kamar(id) on delete cascade,
  durasi     text not null,    -- e.g. "Harian", "Mingguan", "Bulanan", "Tahunan"
  harga      bigint not null,  -- dalam rupiah
  keterangan text,
  urutan     int default 0     -- untuk urutan tampil
);

-- Auto-update updated_at on kamar
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kamar_updated_at on kamar;
create trigger kamar_updated_at
  before update on kamar
  for each row execute function update_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table kamar  enable row level security;
alter table harga  enable row level security;

-- Siapapun boleh READ (halaman publik)
create policy "kamar: public read"
  on kamar for select using (true);

create policy "harga: public read"
  on harga for select using (true);

-- Hanya user yang login (ibu kos) boleh INSERT / UPDATE / DELETE
create policy "kamar: admin write"
  on kamar for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "harga: admin write"
  on harga for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================
-- STORAGE BUCKET  (jalankan setelah tabel dibuat)
-- =============================================================

-- Buat bucket "foto-kamar" via Dashboard atau jalankan ini:
insert into storage.buckets (id, name, public)
values ('foto-kamar', 'foto-kamar', true)
on conflict do nothing;

-- Policy storage: siapapun bisa baca
create policy "storage: public read"
  on storage.objects for select
  using (bucket_id = 'foto-kamar');

-- Hanya authenticated yang bisa upload/delete
create policy "storage: admin write"
  on storage.objects for insert
  with check (bucket_id = 'foto-kamar' and auth.role() = 'authenticated');

create policy "storage: admin delete"
  on storage.objects for delete
  using (bucket_id = 'foto-kamar' and auth.role() = 'authenticated');

-- =============================================================
-- SEED DATA  –  contoh data awal (opsional, bisa dihapus)
-- =============================================================

insert into kamar (nama, deskripsi, status, luas, lantai, fasilitas) values
(
  'Kamar A1',
  'Kamar nyaman di lantai 1 dengan pencahayaan alami yang baik.',
  'kosong', '3x4 m²', 1,
  array['WiFi', 'Kipas Angin', 'Kamar Mandi Luar', 'Meja Belajar', 'Lemari']
),
(
  'Kamar B1',
  'Kamar luas di lantai 1 dilengkapi AC dan kamar mandi dalam.',
  'terisi', '4x4 m²', 1,
  array['WiFi', 'AC', 'Kamar Mandi Dalam', 'Meja Belajar', 'Lemari', 'Tempat Tidur 2x']
),
(
  'Kamar B2',
  'Kamar premium lantai 2 dengan pemandangan taman.',
  'kosong', '4x5 m²', 2,
  array['WiFi', 'AC', 'Kamar Mandi Dalam', 'Kulkas Mini', 'Meja Belajar', 'Lemari']
);

-- Seed harga (ambil id kamar dari query select dulu jika perlu)
-- Contoh insert harga untuk Kamar A1:
with k as (select id from kamar where nama = 'Kamar A1')
insert into harga (kamar_id, durasi, harga, urutan) values
((select id from k), 'Harian',   75000, 1),
((select id from k), 'Mingguan', 400000, 2),
((select id from k), 'Bulanan',  1200000, 3),
((select id from k), 'Tahunan',  12000000, 4);

with k as (select id from kamar where nama = 'Kamar B1')
insert into harga (kamar_id, durasi, harga, urutan) values
((select id from k), 'Bulanan',  1800000, 1),
((select id from k), 'Tahunan',  18000000, 2);

with k as (select id from kamar where nama = 'Kamar B2')
insert into harga (kamar_id, durasi, harga, urutan) values
((select id from k), 'Harian',   120000, 1),
((select id from k), 'Bulanan',  2200000, 2),
((select id from k), 'Tahunan',  22000000, 3);
