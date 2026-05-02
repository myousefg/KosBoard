#!/bin/bash
# =============================================================
# build.sh — Build production (untuk cek sebelum deploy)
# =============================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "======================================"
echo "   KosBoard — Production Build"
echo "======================================"
echo ""

if [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ .env.local tidak ditemukan. Jalankan setup dulu.${NC}"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install --legacy-peer-deps
fi

echo "🔨 Building..."
npm run build

echo ""
echo -e "${GREEN}✅ Build berhasil! Siap deploy ke Vercel.${NC}"
echo ""
echo "Untuk preview production secara lokal:"
echo "  npm run start"
echo "  → http://localhost:3000"
echo "======================================"
echo ""
