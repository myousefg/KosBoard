#!/bin/bash
# =============================================================
# scripts/clean.sh — Bersihkan folder besar sebelum di-zip/share
# Menghapus: node_modules, .next, .vercel, dan file temp lainnya
# =============================================================
#
# CARA PAKAI:
#   bash scripts/clean.sh
#
# Setelah zip, penerima jalankan: bash scripts/setup.sh
# =============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "======================================"
echo "   KosBoard — Clean for Sharing"
echo "======================================"
echo ""

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Hitung ukuran sebelum clean
SIZE_BEFORE=$(du -sh . 2>/dev/null | cut -f1)

echo "📁 Project: $PROJECT_ROOT"
echo "📦 Ukuran sekarang: $SIZE_BEFORE"
echo ""

# Daftar folder/file yang akan dihapus
TARGETS=(
  "node_modules"
  ".next"
  ".vercel"
  "out"
  ".turbo"
  "*.tsbuildinfo"
  "generate-icons.mjs"
  "generate-icons.cjs"
)

echo "🗑️  Menghapus:"

for target in "${TARGETS[@]}"; do
  if [ -e "$target" ] || compgen -G "$target" > /dev/null 2>&1; then
    SIZE=$(du -sh $target 2>/dev/null | cut -f1 || echo "?")
    rm -rf $target
    echo -e "   ${RED}✕${NC} $target ($SIZE)"
  fi
done

echo ""

# Hitung ukuran setelah clean
SIZE_AFTER=$(du -sh . 2>/dev/null | cut -f1)

echo "======================================"
echo -e "${GREEN}✅ Clean selesai!${NC}"
echo ""
echo "   Sebelum : $SIZE_BEFORE"
echo "   Sesudah : $SIZE_AFTER"
echo ""
echo "📌 Sekarang bisa di-zip dan di-share."
echo ""
echo "   Penerima perlu jalankan:"
echo "   1. bash scripts/setup.sh"
echo "   2. Isi .env.local"
echo "   3. bash scripts/dev.sh"
echo "======================================"
echo ""