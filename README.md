# 🏠 KosBoard — Informasi Kamar Kos Digital

Aplikasi web untuk membantu pemilik kos menampilkan informasi kamar secara digital. Dibangun sebagai proyek **TPLM (Teknologi Perangkat Lunak untuk Masyarakat)** Universitas Telkom.

**Stack:** Next.js 15 (App Router) · Supabase · Tailwind CSS · TypeScript  
**Demo:** [kosanboard.vercel.app](https://kosanboard.vercel.app)  
**GitHub:** [github.com/myousefg/KosBoard](https://github.com/myousefg/KosBoard)

---

## ✨ Fitur

### Publik

- **Halaman utama** — pilih lokasi kos dengan foto cover & badge kamar tersedia
- **Daftar kamar** — filter Tersedia/Terisi, Google Maps embed per lokasi
- **Detail kamar** — carousel foto, fasilitas, harga multi-durasi
- **Share kamar** — Web Share API + fallback copy link
- **OG Image dinamis** — preview link WhatsApp/sosmed per kamar & per lokasi
- **Tombol WhatsApp** — pesan otomatis berisi nama kamar & lokasi
- **`/wa`** — link pendek redirect ke WA Bu Ida (untuk bio Instagram/Linktree)
- **PWA** — bisa di-install di HP seperti app native (Add to Home Screen)

### Admin (Ibu Kos)

- **Login** email/password via Supabase Auth
- **Dashboard** accordion per lokasi + statistik kamar
- **Quick toggle** status kosong/terisi langsung dari dashboard
- **Tanggal keluar** — set kapan kamar tersedia, auto-kosongkan via pg_cron tiap malam
- **Searchbar** — cari kamar by nama across semua lokasi
- **Drag-and-drop** — atur urutan tampil kamar per lokasi
- **Foto cover kosan** — upload & ganti foto cover tiap lokasi dari admin
- **Export CSV** — download daftar semua kamar + status seketika
- **Form kamar** — upload foto, checklist fasilitas, manajemen harga
- **Tombol Lihat** — buka halaman publik kamar langsung dari dashboard

---

## 🚀 Setup & Deploy

> **KosBoard di-deploy ke Vercel** — tidak perlu run lokal untuk production.  
> Setiap `git push` ke GitHub otomatis trigger deploy di Vercel.

### 1. Clone repo

```bash
git clone https://github.com/myousefg/KosBoard.git
cd KosBoard
```

### 2. Setup Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Di **SQL Editor** → jalankan `supabase/schema_full_v3.sql` (satu file, mencakup semua)
3. **Authentication → Users → Add User** → masukkan email & password Bu Ida

### 3. Environment Variables

Tambahkan di **Vercel Dashboard → Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_KOS_NAME="Kos Bu Ida"
NEXT_PUBLIC_KOS_ADDRESS="Perumahan Permata Buah Batu, Bandung"
NEXT_PUBLIC_WHATSAPP_NUMBER="6285317270088"
NEXT_PUBLIC_SITE_URL="https://kosanboard.vercel.app"
```

### 4. Generate PWA Icons (sekali saja)

```bash
npm install
npm install sharp --save-dev
node generate-icons.cjs
npm uninstall sharp
git add public/icons
git commit -m "chore: add PWA icons"
git push
```

### 5. Deploy

Push ke GitHub → Vercel otomatis build & deploy. Selesai.

---

## 📜 Scripts

| Script             | Kapan dipakai                                                    |
| ------------------ | ---------------------------------------------------------------- |
| `scripts/setup.sh` | Pertama kali clone — install dependencies & buat `.env.local`    |
| `scripts/dev.sh`   | Jalankan development server `localhost:3000` (opsional)          |
| `scripts/build.sh` | Cek build sebelum push — pastikan tidak ada TypeScript error     |
| `scripts/clean.sh` | Sebelum zip/share — hapus `node_modules`, `.next`, dll (300+ MB) |

```bash
# Windows
powershell -ExecutionPolicy Bypass -File scripts/clean.ps1

# Mac / Linux
bash scripts/clean.sh
```

---

## 📁 Struktur Folder

```
KosBoard/
├── app/
│   ├── page.tsx                        # Halaman utama (pilih lokasi + foto cover)
│   ├── manifest.json                   # PWA manifest
│   ├── wa/page.tsx                     # Redirect ke WA Bu Ida
│   ├── kos/[slug]/
│   │   ├── page.tsx                    # Daftar kamar + Maps + filter + meta tags
│   │   └── kamar/[id]/
│   │       ├── page.tsx                # Detail kamar + carousel + tanggal tersedia
│   │       └── opengraph-image.tsx     # OG image dinamis per kamar
│   ├── admin/
│   │   ├── layout.tsx                  # Layout admin (sidebar desktop + topbar mobile)
│   │   ├── page.tsx                    # Dashboard (accordion, toggle, DnD, export CSV)
│   │   ├── login/page.tsx              # Login Bu Ida
│   │   ├── kosan/page.tsx              # Kelola foto cover & deskripsi kosan
│   │   └── kamar/
│   │       ├── tambah/page.tsx         # Tambah kamar baru
│   │       └── [id]/page.tsx           # Edit / hapus kamar
│   └── api/auth/signout/route.ts       # Logout endpoint
├── components/
│   ├── AdminDashboardClient.tsx        # Dashboard interaktif (accordion, toggle, DnD, search)
│   ├── ExportCSVButton.tsx             # Tombol export CSV
│   ├── KamarCard.tsx                   # Card kamar publik + share button
│   ├── KamarFilterClient.tsx           # Filter tersedia/terisi
│   ├── KamarForm.tsx                   # Form tambah/edit kamar
│   ├── KosanFormClient.tsx             # Form upload foto cover & deskripsi kosan
│   ├── PhotoCarousel.tsx               # Carousel foto kamar
│   ├── RoomPlaceholder.tsx             # Ilustrasi SVG isometrik placeholder foto
│   ├── ShareButton.tsx                 # Share button (Web Share API)
│   ├── StatusBadge.tsx                 # Badge Kosong/Terisi
│   └── WhatsAppButton.tsx              # Tombol WA dengan pesan otomatis
├── lib/supabase/
│   ├── client.ts                       # Supabase browser client
│   └── server.ts                       # Supabase server client
├── public/icons/                       # PWA icons (generated via generate-icons.cjs)
├── scripts/
│   ├── setup.sh                        # Install deps + buat .env.local
│   ├── dev.sh                          # Jalankan dev server
│   ├── build.sh                        # Cek build
│   ├── clean.sh                        # Bersihkan folder besar (Mac/Linux)
│   └── clean.ps1                       # Bersihkan folder besar (Windows)
├── supabase/
│   └── schema_full_v3.sql              # Full schema — jalankan sekali dari awal
├── types/index.ts                      # TypeScript types
├── generate-icons.cjs                  # Script generate PWA icons (hapus setelah dipakai)
└── middleware.ts                       # Auth guard /admin
```

---

## 🔗 URL

| Path                     | Keterangan                                  |
| ------------------------ | ------------------------------------------- |
| `/`                      | Halaman utama — pilih lokasi kos            |
| `/wa`                    | Redirect ke WA Bu Ida (untuk bio Instagram) |
| `/kos/[slug]`            | Daftar kamar per lokasi                     |
| `/kos/[slug]/kamar/[id]` | Detail kamar                                |
| `/admin/login`           | Login Bu Ida                                |
| `/admin`                 | Dashboard admin                             |
| `/admin/kosan`           | Kelola foto cover & deskripsi kosan         |
| `/admin/kamar/tambah`    | Tambah kamar baru                           |
| `/admin/kamar/[id]`      | Edit / hapus kamar                          |

---

## 🗄️ Database (Supabase)

| Tabel   | Kolom utama                                                              |
| ------- | ------------------------------------------------------------------------ |
| `kosan` | id, nama, slug, alamat, whatsapp, foto_cover, deskripsi                  |
| `kamar` | id, kosan_id, nama, status, fasilitas, foto_urls, urutan, tanggal_keluar |
| `harga` | id, kamar_id, durasi, harga, urutan                                      |

Storage buckets: `foto-kamar` · `foto-kosan` (keduanya public)

---

## 👤 Mitra

**Ida Hindayani** — 3 lokasi kos di Perumahan Permata Buah Batu, Bandung  
WA: [+62 853-1727-0088](https://wa.me/6285317270088)
