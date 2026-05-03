# 🏠 KosBoard — Informasi Kamar Kos Digital

Aplikasi web untuk membantu pemilik kos menampilkan informasi kamar secara digital. Dibangun sebagai proyek **TPLM (Teknologi Perangkat Lunak untuk Masyarakat)** Universitas Telkom.

**Stack:** Next.js 15 (App Router) · Supabase · Tailwind CSS · TypeScript  
**Demo:** [kosanboard.vercel.app](https://kosanboard.vercel.app)

---

## ✨ Fitur

### Publik

- **Pilih lokasi kos** — 3 lokasi Kos Bu Ida di Permata Buah Batu, Bandung
- **Daftar kamar** — filter Tersedia/Terisi, Google Maps embed per lokasi
- **Detail kamar** — carousel foto, fasilitas, harga multi-durasi
- **Share kamar** — Web Share API + fallback copy link
- **OG Image dinamis** — preview link WhatsApp/sosmed per kamar
- **Tombol WhatsApp** — pesan otomatis berisi nama kamar & lokasi
- **PWA** — bisa di-install di HP seperti app native

### Admin (Ibu Kos)

- **Login** email/password via Supabase Auth
- **Dashboard** accordion per lokasi + statistik kamar
- **Quick toggle** status kosong/terisi langsung dari dashboard
- **Tanggal keluar** — set kapan kamar tersedia, auto-kosongkan via pg_cron
- **Searchbar** — cari kamar by nama across semua lokasi
- **Drag-and-drop** — atur urutan tampil kamar per lokasi
- **Form kamar** — upload foto, checklist fasilitas, manajemen harga

---

## 🚀 Setup & Deploy

> **KosBoard di-deploy ke Vercel** — tidak perlu run lokal untuk production.  
> Setiap `git push` ke GitHub otomatis trigger deploy di Vercel.

### 1. Clone & Konfigurasi Environment

```bash
git clone https://github.com/myousefg/KosBoard.git
cd KosBoard
```

Tambahkan environment variables berikut di **Vercel Dashboard → Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_KOS_NAME="Kos Bu Ida"
NEXT_PUBLIC_KOS_ADDRESS="Perumahan Permata Buah Batu, Bandung"
NEXT_PUBLIC_WHATSAPP_NUMBER="6285317270088"
NEXT_PUBLIC_SITE_URL="https://kosanboard.vercel.app"
```

### 2. Setup Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Di **SQL Editor** → jalankan migration secara berurutan:
   ```
   supabase/01_schema.sql          # Tabel utama
   supabase/02_urutan.sql          # Kolom urutan kamar (drag-and-drop)
   supabase/03_tanggal_keluar.sql  # Kolom tanggal keluar + pg_cron
   ```
3. **Authentication → Users → Add User** → email & password ibu kos

### 3. Generate PWA Icons (sekali saja)

```bash
npm install
npm install sharp --save-dev
node generate-icons.cjs
npm uninstall sharp
git add public/icons
git commit -m "chore: add PWA icons"
git push
```

### 4. Deploy

Push ke GitHub → Vercel otomatis build & deploy. Selesai.

---

## 📜 Scripts

Script tersedia di folder `scripts/` — dijalankan via `bash scripts/<nama>.sh`.

| Script     | Kapan dipakai                                                                           |
| ---------- | --------------------------------------------------------------------------------------- |
| `setup.sh` | **Pertama kali** clone repo — install dependencies & buat `.env.local`                  |
| `dev.sh`   | Jalankan **development server** di `localhost:3000` (opsional, untuk development lokal) |
| `build.sh` | **Cek build** sebelum push — pastikan tidak ada error TypeScript/compile                |
| `clean.sh` | **Sebelum zip/share** — hapus `node_modules`, `.next`, dll (300+ MB)                    |

### Cara pakai

```bash
# Pertama kali clone (jika ingin run lokal)
bash scripts/setup.sh

# Development lokal (opsional — production pakai Vercel)
bash scripts/dev.sh

# Cek tidak ada error sebelum push
bash scripts/build.sh

# Bersihkan sebelum zip & share ke teman/dosen
bash scripts/clean.sh
```

> **Catatan:** `dev.sh` dan `build.sh` hanya diperlukan jika ingin run lokal.  
> Untuk production, cukup `git push` — Vercel handle sisanya.

---

## 📁 Struktur Folder

```
KosBoard/
├── app/
│   ├── page.tsx                        # Halaman utama (pilih lokasi)
│   ├── manifest.json                   # PWA manifest
│   ├── kos/[slug]/
│   │   ├── page.tsx                    # Daftar kamar + Maps + filter
│   │   └── kamar/[id]/
│   │       ├── page.tsx                # Detail kamar + carousel
│   │       └── opengraph-image.tsx     # OG image dinamis per kamar
│   ├── admin/
│   │   ├── layout.tsx                  # Layout admin (sidebar + topbar)
│   │   ├── page.tsx                    # Dashboard utama
│   │   ├── login/page.tsx              # Login ibu kos
│   │   └── kamar/
│   │       ├── tambah/page.tsx         # Tambah kamar baru
│   │       └── [id]/page.tsx           # Edit / hapus kamar
│   └── api/auth/signout/route.ts       # Logout endpoint
├── components/
│   ├── AdminDashboardClient.tsx        # Dashboard interaktif (accordion, toggle, DnD)
│   ├── KamarCard.tsx                   # Card kamar publik
│   ├── KamarFilterClient.tsx           # Filter tersedia/terisi
│   ├── KamarForm.tsx                   # Form tambah/edit kamar
│   ├── PhotoCarousel.tsx               # Carousel foto kamar
│   ├── RoomPlaceholder.tsx             # Ilustrasi SVG placeholder foto
│   ├── ShareButton.tsx                 # Share button
│   ├── StatusBadge.tsx                 # Badge Kosong/Terisi
│   └── WhatsAppButton.tsx              # Tombol WA dengan pesan otomatis
├── lib/supabase/
│   ├── client.ts                       # Supabase browser client
│   └── server.ts                       # Supabase server client
├── public/icons/                       # PWA icons (generated)
├── types/index.ts                      # TypeScript types
└── middleware.ts                       # Auth guard /admin
```

---

## 🔗 URL

| Path                     | Keterangan              |
| ------------------------ | ----------------------- |
| `/`                      | Pilih lokasi kos        |
| `/kos/[slug]`            | Daftar kamar per lokasi |
| `/kos/[slug]/kamar/[id]` | Detail kamar            |
| `/admin/login`           | Login ibu kos           |
| `/admin`                 | Dashboard admin         |
| `/admin/kamar/tambah`    | Tambah kamar baru       |
| `/admin/kamar/[id]`      | Edit / hapus kamar      |

---

## 🗄️ Database (Supabase)

| Tabel   | Kolom utama                                                              |
| ------- | ------------------------------------------------------------------------ |
| `kosan` | id, nama, slug, alamat, whatsapp                                         |
| `kamar` | id, kosan_id, nama, status, fasilitas, foto_urls, urutan, tanggal_keluar |
| `harga` | id, kamar_id, durasi, harga, urutan                                      |

Storage bucket: `foto-kamar` (public)

---

## 👤 Mitra

**Ida Hindayani** — 3 lokasi kos di Perumahan Permata Buah Batu, Bandung  
WA: [+62 853-1727-0088](https://wa.me/6285317270088)
