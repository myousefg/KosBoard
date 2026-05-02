-- =============================================================
-- SCHEMA v2  –  Multi-Kos Support
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- Tabel kosan (Bu Ida punya beberapa kos)
create table if not exists kosan (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  slug       text not null unique,
  alamat     text not null,
  whatsapp   text not null,
  created_at timestamptz default now()
);

-- Tabel kamar
create table if not exists kamar (
  id          uuid primary key default gen_random_uuid(),
  kosan_id    uuid not null references kosan(id) on delete cascade,
  nama        text not null,
  deskripsi   text,
  status      text not null default 'kosong'
              check (status in ('kosong','terisi')),
  luas        text,
  lantai      int,
  fasilitas   text[],
  foto_urls   text[],
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Tabel harga
create table if not exists harga (
  id         uuid primary key default gen_random_uuid(),
  kamar_id   uuid not null references kamar(id) on delete cascade,
  durasi     text not null,
  harga      bigint not null,
  keterangan text,
  urutan     int default 0
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists kamar_updated_at on kamar;
create trigger kamar_updated_at
  before update on kamar
  for each row execute function update_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table kosan  enable row level security;
alter table kamar  enable row level security;
alter table harga  enable row level security;

create policy "kosan: public read"  on kosan for select using (true);
create policy "kamar: public read"  on kamar for select using (true);
create policy "harga: public read"  on harga for select using (true);

create policy "kosan: admin write"  on kosan for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "kamar: admin write"  on kamar for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "harga: admin write"  on harga for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('foto-kamar', 'foto-kamar', true) on conflict do nothing;

create policy "storage: public read" on storage.objects for select
  using (bucket_id = 'foto-kamar');
create policy "storage: admin write" on storage.objects for insert
  with check (bucket_id = 'foto-kamar' and auth.role() = 'authenticated');
create policy "storage: admin delete" on storage.objects for delete
  using (bucket_id = 'foto-kamar' and auth.role() = 'authenticated');

-- =============================================================
-- SEED DATA  –  3 kos Bu Ida
-- =============================================================

insert into kosan (nama, slug, alamat, whatsapp) values
('Kos Bu Ida - Blok I', 'blok-i', 'Perumahan Permata Buah Batu Blok I No. 18, Bandung', '6285317270088'),
('Kos Bu Ida - Blok H', 'blok-h', 'Perumahan Permata Buah Batu Blok H No. 7, Bandung', '6285317270088'),
('Kos Bu Ida - Blok C', 'blok-c', 'Perumahan Permata Buah Batu Blok C No. 143, Bandung', '6285317270088')
on conflict (slug) do nothing;
