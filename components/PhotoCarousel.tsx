"use client";
import { useState } from "react";
import { KamarCard } from "./KamarCard";
import type { KamarWithHarga } from "@/types";

type Filter = "semua" | "kosong" | "terisi";

export function KamarFilterClient({ rooms, slug }: { rooms: KamarWithHarga[]; slug: string }) {
  const [filter, setFilter] = useState<Filter>("semua");

  const filtered = rooms.filter((r) => {
    if (filter === "semua") return true;
    return r.status === filter;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Daftar Kamar</h2>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {(["semua", "kosong", "terisi"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "bg-[#1e1b4b] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "semua" ? "Semua" : f === "kosong" ? "Tersedia" : "Terisi"}
              <span className={`ml-1 ${filter === f ? "text-indigo-200" : "text-gray-400"}`}>
                ({f === "semua" ? rooms.length : rooms.filter((r) => r.status === f).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-sm">Tidak ada kamar dengan filter ini.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((kamar) => (
            <KamarCard key={kamar.id} kamar={kamar} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}