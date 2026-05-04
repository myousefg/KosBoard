"use client";
import { Download } from "lucide-react";
import type { Kamar, Kosan } from "@/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function escapeCSV(val: string | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ExportCSVButton({
  kosanList,
  rooms,
}: {
  kosanList: Kosan[];
  rooms: Kamar[];
}) {
  function handleExport() {
    const kosanMap = Object.fromEntries(kosanList.map((k) => [k.id, k]));

    const rows = [
      // Header
      ["Lokasi", "Nama Kamar", "Lantai", "Status", "Fasilitas"].join(","),
      // Data
      ...rooms.map((r) => {
        const kosan = kosanMap[r.kosan_id];
        return [
          escapeCSV(kosan?.nama),
          escapeCSV(r.nama),
          escapeCSV(r.lantai?.toString()),
          escapeCSV(r.status === "kosong" ? "Tersedia" : "Terisi"),
          escapeCSV((r.fasilitas ?? []).join(", ")),
        ].join(",");
      }),
    ];

    const csvContent = "\uFEFF" + rows.join("\n"); // BOM untuk Excel
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const tanggal = new Date()
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    const a = document.createElement("a");
    a.href = url;
    a.download = `KosBoard-${tanggal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-[#1e1b4b]"
      title="Export daftar kamar ke CSV"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}