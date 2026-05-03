# =============================================================
# scripts/clean.ps1 — Bersihkan folder besar sebelum di-zip/share
# Menghapus: node_modules, .next, .vercel, dan file temp lainnya
# =============================================================
#
# CARA PAKAI (dari root project):
#   powershell -ExecutionPolicy Bypass -File scripts/clean.ps1
#
# =============================================================

$targets = @("node_modules", ".next", ".vercel", "out", ".turbo")
$files   = @("*.tsbuildinfo", "generate-icons.mjs", "generate-icons.cjs")

Write-Host ""
Write-Host "======================================"
Write-Host "   KosBoard -- Clean for Sharing"
Write-Host "======================================"
Write-Host ""

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$sizeBefore = "{0:N0} MB" -f ((Get-ChildItem -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB)
Write-Host "Ukuran sekarang : $sizeBefore"
Write-Host ""
Write-Host "Menghapus:"

foreach ($t in $targets) {
  if (Test-Path $t) {
    $size = "{0:N0} MB" -f ((Get-ChildItem $t -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB)
    Remove-Item $t -Recurse -Force
    Write-Host "  x $t ($size)"
  }
}

foreach ($f in $files) {
  Get-ChildItem -Path . -Filter $f -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  x $($_.Name)"
    Remove-Item $_.FullName -Force
  }
}

$sizeAfter = "{0:N0} MB" -f ((Get-ChildItem -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB)

Write-Host ""
Write-Host "======================================"
Write-Host "Selesai!"
Write-Host ""
Write-Host "  Sebelum : $sizeBefore"
Write-Host "  Sesudah : $sizeAfter"
Write-Host ""
Write-Host "Sekarang bisa di-zip dan di-share."
Write-Host "======================================"
Write-Host ""