# 🏠 Kos App — Informasi Kamar Kos Digital

Aplikasi web untuk membantu pemilik kos menampilkan informasi kamar secara digital. Dibangun dengan **Next.js 15**, **Supabase**, dan **Tailwind CSS**.

---

## ✨ Fitur

- **Halaman Publik** — Calon penghuni bisa lihat status kamar, galeri foto, fasilitas, dan harga sewa
- **Tombol WhatsApp** — Satu klik langsung chat dengan pesan otomatis berisi nama kamar
- **Panel Admin** — Ibu kos bisa login dan update status kamar, foto, dan harga tanpa perlu coding
- **Responsif** — Tampil optimal di HP maupun laptop

---

## 🚀 Setup (Langkah Demi Langkah)

### 1. Clone & Install

```bash
git clone https://github.com/username/kos-app.git
cd kos-app
npm install
```

### 2. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → **New Project**
2. Catat **Project URL** dan **Anon Key** dari Settings → API

### 3. Jalankan SQL Schema

1. Di Supabase Dashboard → **SQL Editor** → **New Query**
2. Copy-paste seluruh isi file `supabase/schema.sql`
3. Klik **Run**

### 4. Buat Akun Admin (Ibu Kos)

1. Supabase Dashboard → **Authentication** → **Users** → **Add User**
2. Masukkan email dan password ibu kos
3. Klik **Create User**

### 5. Konfigurasi Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

NEXT_PUBLIC_KOS_NAME="Kos Bu Sari"
NEXT_PUBLIC_KOS_ADDRESS="Jl. Telekomunikasi No. 1, Sukapura, Bandung"
NEXT_PUBLIC_WHATSAPP_NUMBER="6281234567890"   # tanpa + di depan
```

### 6. Jalankan Lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy ke Vercel (Gratis)

1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Tambahkan environment variables (sama seperti `.env.local`) di Vercel Settings
4. Klik **Deploy** — selesai!

URL yang didapat bisa langsung diberikan ke calon penghuni.

---

## 📁 Struktur Folder

```
kos-app/
├── app/
│   ├── page.tsx                  # Halaman utama (daftar kamar)
│   ├── kamar/[id]/page.tsx       # Detail kamar
│   ├── admin/
│   │   ├── page.tsx              # Dashboard admin
│   │   ├── login/page.tsx        # Login ibu kos
│   │   └── kamar/
│   │       ├── page.tsx          # Daftar kamar (admin)
│   │       ├── tambah/page.tsx   # Tambah kamar baru
│   │       └── [id]/page.tsx     # Edit kamar
│   └── api/auth/signout/         # Logout endpoint
├── components/
│   ├── KamarCard.tsx             # Card kamar di halaman publik
│   ├── KamarForm.tsx             # Form tambah/edit kamar (admin)
│   ├── Navbar.tsx                # Header navigasi publik
│   ├── StatusBadge.tsx           # Badge Kosong/Terisi
│   └── WhatsAppButton.tsx        # Tombol WA
├── lib/supabase/
│   ├── client.ts                 # Supabase client (browser)
│   └── server.ts                 # Supabase client (server)
├── supabase/
│   └── schema.sql                # SQL schema + seed data
├── types/index.ts                # TypeScript types
└── middleware.ts                 # Auth guard untuk /admin
```

---

## 🔗 URL Penting

| Path | Keterangan |
|------|-----------|
| `/` | Halaman publik — daftar semua kamar |
| `/kamar/[id]` | Detail kamar + tombol WA |
| `/admin/login` | Login ibu kos |
| `/admin` | Dashboard admin |
| `/admin/kamar` | Kelola semua kamar |
| `/admin/kamar/tambah` | Tambah kamar baru |
| `/admin/kamar/[id]` | Edit / hapus kamar |
