#!/bin/bash
# =============================================================
# dev.sh — Jalankan development server (localhost:3000)
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "======================================"
echo "   KosBoard — Development Server"
echo "======================================"
echo ""

# Cek .env.local
if [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ File .env.local tidak ditemukan.${NC}"
  echo "   Jalankan setup dulu: bash scripts/setup.sh"
  exit 1
fi

# Cek apakah env sudah diisi
if grep -q "xxxxxxxxxxxxxxxxxxxx" .env.local; then
  echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL di .env.local belum diisi.${NC}"
  echo "   Buka .env.local dan isi dengan kredensial Supabase kamu."
  echo ""
fi

# Cek node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 node_modules tidak ditemukan, installing..."
  npm install --legacy-peer-deps
fi

echo -e "${GREEN}🚀 Menjalankan development server...${NC}"
echo ""
echo "   Halaman publik  → http://localhost:3000"
echo "   Panel admin     → http://localhost:3000/admin"
echo "   Login admin     → http://localhost:3000/admin/login"
echo ""
echo "   Tekan Ctrl+C untuk berhenti."
echo "======================================"
echo ""

npm run dev
