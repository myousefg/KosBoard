-- =============================================================
-- KosBoard — Full Schema v3
-- Jalankan SEKALI di: Supabase Dashboard → SQL Editor → New Query
-- Mencakup: schema, RLS, storage, seed data, semua migration
-- =============================================================


-- ── 1. EXTENSIONS ────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;


-- ── 2. TABEL UTAMA ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kosan (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  alamat      text        NOT NULL,
  whatsapp    text        NOT NULL,
  foto_cover  text,                        -- URL foto cover halaman utama
  deskripsi   text,                        -- Deskripsi singkat kosan
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kamar (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kosan_id        uuid        NOT NULL REFERENCES kosan(id) ON DELETE CASCADE,
  nama            text        NOT NULL,
  deskripsi       text,
  status          text        NOT NULL DEFAULT 'kosong'
                              CHECK (status IN ('kosong','terisi')),
  luas            text,
  lantai          int,
  fasilitas       text[],
  foto_urls       text[],
  urutan          integer     NOT NULL DEFAULT 9999,  -- urutan tampil drag-and-drop
  tanggal_keluar  date,                               -- kapan kamar kosong kembali
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS harga (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  kamar_id    uuid    NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
  durasi      text    NOT NULL,
  harga       bigint  NOT NULL,
  keterangan  text,
  urutan      int     DEFAULT 0
);


-- ── 3. INDEX ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_kamar_kosan_urutan ON kamar (kosan_id, urutan);


-- ── 4. AUTO updated_at ───────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kamar_updated_at ON kamar;
CREATE TRIGGER kamar_updated_at
  BEFORE UPDATE ON kamar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── 5. AUTO KOSONGKAN KAMAR (pg_cron) ────────────────────────
-- Setiap hari 00:05 WIB, kamar yang tanggal_keluar-nya sudah lewat
-- otomatis diubah statusnya menjadi kosong

CREATE OR REPLACE FUNCTION auto_kosongkan_kamar()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE kamar
  SET
    status         = 'kosong',
    tanggal_keluar = NULL,
    updated_at     = NOW()
  WHERE
    status         = 'terisi'
    AND tanggal_keluar IS NOT NULL
    AND tanggal_keluar <= CURRENT_DATE;
END;
$$;

SELECT cron.unschedule('auto-kosongkan-kamar')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'auto-kosongkan-kamar'
);

SELECT cron.schedule(
  'auto-kosongkan-kamar',
  '5 17 * * *',   -- 00:05 WIB = 17:05 UTC
  'SELECT auto_kosongkan_kamar();'
);


-- ── 6. ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE kosan  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kamar  ENABLE ROW LEVEL SECURITY;
ALTER TABLE harga  ENABLE ROW LEVEL SECURITY;

-- Public: baca semua
CREATE POLICY "kosan: public read" ON kosan FOR SELECT USING (true);
CREATE POLICY "kamar: public read" ON kamar FOR SELECT USING (true);
CREATE POLICY "harga: public read" ON harga FOR SELECT USING (true);

-- Admin (authenticated): tulis semua
CREATE POLICY "kosan: admin write" ON kosan FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "kamar: admin write" ON kamar FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "harga: admin write" ON harga FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ── 7. STORAGE BUCKETS ───────────────────────────────────────

-- Bucket foto kamar
INSERT INTO storage.buckets (id, name, public)
VALUES ('foto-kamar', 'foto-kamar', true)
ON CONFLICT DO NOTHING;

-- Bucket foto cover kosan
INSERT INTO storage.buckets (id, name, public)
VALUES ('foto-kosan', 'foto-kosan', true)
ON CONFLICT DO NOTHING;

-- Policy foto-kamar
CREATE POLICY "foto-kamar: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'foto-kamar');
CREATE POLICY "foto-kamar: admin write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'foto-kamar' AND auth.role() = 'authenticated');
CREATE POLICY "foto-kamar: admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'foto-kamar' AND auth.role() = 'authenticated');
CREATE POLICY "foto-kamar: admin update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'foto-kamar' AND auth.role() = 'authenticated');

-- Policy foto-kosan
CREATE POLICY "foto-kosan: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'foto-kosan');
CREATE POLICY "foto-kosan: admin write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'foto-kosan' AND auth.role() = 'authenticated');
CREATE POLICY "foto-kosan: admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'foto-kosan' AND auth.role() = 'authenticated');
CREATE POLICY "foto-kosan: admin update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'foto-kosan' AND auth.role() = 'authenticated');


-- ── 8. SEED DATA — 3 Lokasi Kos Bu Ida ──────────────────────

INSERT INTO kosan (nama, slug, alamat, whatsapp) VALUES
('Kos Bu Ida - Blok I', 'blok-i', 'Perumahan Permata Buah Batu Blok I No. 18, Bandung',   '6285317270088'),
('Kos Bu Ida - Blok H', 'blok-h', 'Perumahan Permata Buah Batu Blok H No. 7, Bandung',    '6285317270088'),
('Kos Bu Ida - Blok C', 'blok-c', 'Perumahan Permata Buah Batu Blok C No. 143, Bandung',  '6285317270088')
ON CONFLICT (slug) DO NOTHING;


-- ── Blok I — 15 kamar, Rp 17–18 juta/tahun ──────────────────

WITH k AS (SELECT id FROM kosan WHERE slug = 'blok-i')
INSERT INTO kamar (kosan_id, nama, status, urutan, fasilitas) VALUES
((SELECT id FROM k), 'Kamar I-01',  'kosong',  1, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-02',  'kosong',  2, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-03',  'kosong',  3, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-04',  'kosong',  4, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-05',  'kosong',  5, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-06',  'kosong',  6, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-07',  'kosong',  7, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-08',  'kosong',  8, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-09',  'kosong',  9, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-10',  'kosong', 10, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-11',  'kosong', 11, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-12',  'kosong', 12, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-13',  'kosong', 13, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-14',  'kosong', 14, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar I-15',  'kosong', 15, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']);

INSERT INTO harga (kamar_id, durasi, harga, urutan)
SELECT id, 'Tahunan (Standar)',  17000000, 1 FROM kamar WHERE kosan_id = (SELECT id FROM kosan WHERE slug = 'blok-i');
INSERT INTO harga (kamar_id, durasi, harga, urutan)
SELECT id, 'Tahunan (Premium)', 18000000, 2 FROM kamar WHERE kosan_id = (SELECT id FROM kosan WHERE slug = 'blok-i');


-- ── Blok H — 15 kamar, Rp 21 juta/tahun ─────────────────────

WITH k AS (SELECT id FROM kosan WHERE slug = 'blok-h')
INSERT INTO kamar (kosan_id, nama, status, urutan, fasilitas) VALUES
((SELECT id FROM k), 'Kamar H-01',  'kosong',  1, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-02',  'kosong',  2, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-03',  'kosong',  3, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-04',  'kosong',  4, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-05',  'kosong',  5, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-06',  'kosong',  6, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-07',  'kosong',  7, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-08',  'kosong',  8, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-09',  'kosong',  9, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-10',  'kosong', 10, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-11',  'kosong', 11, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-12',  'kosong', 12, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-13',  'kosong', 13, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-14',  'kosong', 14, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar H-15',  'kosong', 15, ARRAY['Kasur dengan Bed Frame','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']);

INSERT INTO harga (kamar_id, durasi, harga, urutan)
SELECT id, 'Tahunan', 21000000, 1 FROM kamar WHERE kosan_id = (SELECT id FROM kosan WHERE slug = 'blok-h');


-- ── Blok C — 15 kamar, Rp 17 juta/tahun ─────────────────────

WITH k AS (SELECT id FROM kosan WHERE slug = 'blok-c')
INSERT INTO kamar (kosan_id, nama, status, urutan, fasilitas) VALUES
((SELECT id FROM k), 'Kamar C-01',  'kosong',  1, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-02',  'kosong',  2, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-03',  'kosong',  3, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-04',  'kosong',  4, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-05',  'kosong',  5, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-06',  'kosong',  6, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-07',  'kosong',  7, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-08',  'kosong',  8, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-09',  'kosong',  9, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-10',  'kosong', 10, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-11',  'kosong', 11, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-12',  'kosong', 12, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-13',  'kosong', 13, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-14',  'kosong', 14, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']),
((SELECT id FROM k), 'Kamar C-15',  'kosong', 15, ARRAY['Kasur','Meja Belajar','Kursi','Lemari','Cermin','AC','Wi-Fi','Kamar Mandi Dalam','Toilet Duduk','Shower','Hanger','Water Heater']);

INSERT INTO harga (kamar_id, durasi, harga, urutan)
SELECT id, 'Tahunan', 17000000, 1 FROM kamar WHERE kosan_id = (SELECT id FROM kosan WHERE slug = 'blok-c');


-- ── 9. VERIFIKASI ────────────────────────────────────────────

SELECT
  k.nama AS kosan,
  COUNT(km.id) AS total_kamar,
  SUM(CASE WHEN km.status = 'kosong' THEN 1 ELSE 0 END) AS kosong
FROM kosan k
LEFT JOIN kamar km ON km.kosan_id = k.id
GROUP BY k.nama
ORDER BY k.nama;