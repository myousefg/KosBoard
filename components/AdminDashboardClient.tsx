"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "./StatusBadge";
import type { Kamar, Kosan } from "@/types";

type Filter = "semua" | "kosong" | "terisi";

export function AdminDashboardClient({
  kosanList,
  rooms: initialRooms,
}: {
  kosanList: Kosan[];
  rooms: Kamar[];
}) {
  const [rooms, setRooms] = useState(initialRooms);
  const [openKosan, setOpenKosan] = useState<string[]>(
    kosanList.map((k) => k.id)
  );
  const [filter, setFilter] = useState<Filter>("semua");
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  function toggleAccordion(id: string) {
    setOpenKosan((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  }

  async function quickToggle(kamar: Kamar) {
    setToggling(kamar.id);
    const newStatus = kamar.status === "kosong" ? "terisi" : "kosong";
    const { error } = await supabase
      .from("kamar")
      .update({ status: newStatus })
      .eq("id", kamar.id);
    if (!error) {
      setRooms((prev) =>
        prev.map((r) => (r.id === kamar.id ? { ...r, status: newStatus } : r))
      );
    }
    setToggling(null);
  }

  // Rooms setelah filter status + pencarian nama
  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchStatus = filter === "semua" || r.status === filter;
      const matchSearch = q === "" || r.nama.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [rooms, filter, search]);

  // Buka semua accordion yang punya hasil ketika user mengetik
  const activeKosanIds = useMemo(() => {
    if (search.trim() === "") return null; // null = pakai openKosan biasa
    const ids = new Set(filteredRooms.map((r) => r.kosan_id));
    return [...ids];
  }, [filteredRooms, search]);

  const isOpen = (id: string) =>
    activeKosanIds !== null
      ? activeKosanIds.includes(id)
      : openKosan.includes(id);

  const totalFiltered = filteredRooms.length;
  const isSearching = search.trim() !== "";

  return (
    <div className="space-y-3">
      {/* Searchbar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama kamar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-shadow"
        />
        {isSearching && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Global filter + count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isSearching ? (
            <>
              <span className="font-medium text-gray-800">{totalFiltered}</span>
              {" kamar ditemukan"}
            </>
          ) : filter === "semua" ? (
            `${rooms.length} kamar`
          ) : (
            `${totalFiltered} kamar ${filter === "kosong" ? "tersedia" : "terisi"}`
          )}
        </p>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {(["semua", "kosong", "terisi"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? "bg-[#1e1b4b] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "semua" ? "Semua" : f === "kosong" ? "Tersedia" : "Terisi"}
            </button>
          ))}
        </div>
      </div>

      {/* Hasil pencarian kosong */}
      {isSearching && totalFiltered === 0 && (
        <div className="rounded-2xl bg-white py-10 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-400">
            Tidak ada kamar bernama{" "}
            <span className="font-medium text-gray-600">
              &ldquo;{search}&rdquo;
            </span>
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-2 text-xs text-[#1e1b4b] hover:underline"
          >
            Hapus pencarian
          </button>
        </div>
      )}

      {/* Accordion per kosan */}
      {kosanList.map((kosan) => {
        const kamarKosan = filteredRooms.filter(
          (r) => r.kosan_id === kosan.id
        );
        const allKamar = rooms.filter((r) => r.kosan_id === kosan.id);
        const kosongCount = allKamar.filter((r) => r.status === "kosong").length;
        const open = isOpen(kosan.id);

        // Sembunyikan accordion saat search aktif dan tidak ada hasil di kosan ini
        if (isSearching && kamarKosan.length === 0) return null;

        return (
          <div
            key={kosan.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
          >
            {/* Header */}
            <button
              onClick={() => {
                // Saat search aktif, accordion tidak toggle manual
                if (!isSearching) toggleAccordion(kosan.id);
              }}
              className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors ${
                isSearching ? "cursor-default" : "hover:bg-gray-50"
              }`}
            >
              <div>
                <p className="font-semibold text-gray-900">{kosan.nama}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {kosan.alamat}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-3">
                <div className="text-right">
                  {isSearching ? (
                    <span className="text-xs font-medium text-[#1e1b4b]">
                      {kamarKosan.length} hasil
                    </span>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-green-600">
                        {kosongCount} kosong
                      </span>
                      <span className="mx-1.5 text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {allKamar.length} total
                      </span>
                    </>
                  )}
                </div>
                {!isSearching &&
                  (open ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  ))}
              </div>
            </button>

            {/* Body */}
            {open && (
              <div className="border-t border-gray-100">
                {kamarKosan.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    {filter !== "semua"
                      ? "Tidak ada kamar dengan filter ini."
                      : "Belum ada kamar."}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {kamarKosan.map((kamar) => (
                      <li
                        key={kamar.id}
                        className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          {/* Highlight teks pencarian */}
                          <p className="truncate text-sm font-medium text-gray-900">
                            {isSearching
                              ? highlightMatch(kamar.nama, search)
                              : kamar.nama}
                          </p>
                          <p className="text-xs text-gray-400">
                            {kamar.luas ?? ""}
                            {kamar.lantai ? ` · Lantai ${kamar.lantai}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <button
                            onClick={() => quickToggle(kamar)}
                            disabled={toggling === kamar.id}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                            title={`Ubah ke ${kamar.status === "kosong" ? "terisi" : "kosong"}`}
                          >
                            {kamar.status === "kosong" ? (
                              <ToggleRight className="h-5 w-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <StatusBadge status={kamar.status} />
                          <Link
                            href={`/admin/kamar/${kamar.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs text-[#1e1b4b] transition-colors hover:bg-indigo-100"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Helper: highlight teks yang cocok ───────────────────────────────────────
function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-100 px-0.5 text-yellow-800 not-italic">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}