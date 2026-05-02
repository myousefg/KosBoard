#!/bin/bash
# =============================================================
# setup.sh — Jalankan SEKALI saat pertama kali clone repo
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "======================================"
echo "   KosBoard — First Time Setup"
echo "======================================"
echo ""

# 1. Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js tidak ditemukan. Install dulu dari https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"

# 2. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Dependencies installed${NC}"

# 3. Copy .env jika belum ada
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  echo ""
  echo -e "${YELLOW}⚠️  File .env.local dibuat dari template.${NC}"
  echo -e "${YELLOW}   Buka dan isi nilai berikut sebelum menjalankan app:${NC}"
  echo ""
  echo "   NEXT_PUBLIC_SUPABASE_URL       → dari Supabase Dashboard > Settings > API"
  echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY  → dari Supabase Dashboard > Settings > API"
  echo "   NEXT_PUBLIC_KOS_NAME           → nama kos (e.g. Kos Bu Sari)"
  echo "   NEXT_PUBLIC_KOS_ADDRESS        → alamat kos"
  echo "   NEXT_PUBLIC_WHATSAPP_NUMBER    → nomor WA tanpa + (e.g. 6281234567890)"
  echo ""
  echo -e "${YELLOW}   Setelah isi .env.local, jalankan: bash scripts/dev.sh${NC}"
else
  echo -e "${GREEN}✅ .env.local sudah ada${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ Setup selesai!${NC}"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Isi .env.local dengan kredensial Supabase"
echo "  2. Jalankan SQL schema di Supabase SQL Editor"
echo "     → salin isi file: supabase/schema.sql"
echo "  3. Buat akun admin di Supabase:"
echo "     → Authentication > Users > Add User"
echo "  4. Jalankan app: bash scripts/dev.sh"
echo "======================================"
echo ""
