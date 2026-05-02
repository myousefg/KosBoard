"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MapPin, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "./StatusBadge";
import type { Kamar, Kosan } from "@/types";

type Filter = "semua" | "kosong" | "terisi";

export function AdminDashboardClient({ kosanList, rooms: initialRooms }: { kosanList: Kosan[]; rooms: Kamar[] }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [openKosan, setOpenKosan] = useState<string[]>(kosanList.map((k) => k.id));
  const [filter, setFilter] = useState<Filter>("semua");
  const [toggling, setToggling] = useState<string | null>(null);
  const supabase = createClient();

  function toggleAccordion(id: string) {
    setOpenKosan((prev) => prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]);
  }

  async function quickToggle(kamar: Kamar) {
    setToggling(kamar.id);
    const newStatus = kamar.status === "kosong" ? "terisi" : "kosong";
    const { error } = await supabase.from("kamar").update({ status: newStatus }).eq("id", kamar.id);
    if (!error) {
      setRooms((prev) => prev.map((r) => r.id === kamar.id ? { ...r, status: newStatus } : r));
    }
    setToggling(null);
  }

  return (
    <div className="space-y-3">
      {/* Global filter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filter === "semua" ? `${rooms.length} kamar` : `${rooms.filter((r) => r.status === filter).length} kamar ${filter === "kosong" ? "tersedia" : "terisi"}`}
        </p>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {(["semua", "kosong", "terisi"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f ? "bg-[#1e1b4b] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "semua" ? "Semua" : f === "kosong" ? "Tersedia" : "Terisi"}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion per kosan */}
      {kosanList.map((kosan) => {
        const kamarKosan = rooms
          .filter((r) => r.kosan_id === kosan.id)
          .filter((r) => filter === "semua" || r.status === filter);
        const allKamar = rooms.filter((r) => r.kosan_id === kosan.id);
        const kosongCount = allKamar.filter((r) => r.status === "kosong").length;
        const isOpen = openKosan.includes(kosan.id);

        return (
          <div key={kosan.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
            {/* Accordion header */}
            <button
              onClick={() => toggleAccordion(kosan.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{kosan.nama}</p>
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <MapPin className="h-3 w-3" />{kosan.alamat}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <span className="text-xs font-medium text-green-600">{kosongCount} kosong</span>
                  <span className="mx-1.5 text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{allKamar.length} total</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
              </div>
            </button>

            {/* Accordion body */}
            {isOpen && (
              <div className="border-t border-gray-100">
                {kamarKosan.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    {filter !== "semua" ? "Tidak ada kamar dengan filter ini." : "Belum ada kamar."}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {kamarKosan.map((kamar) => (
                      <li key={kamar.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{kamar.nama}</p>
                          <p className="text-xs text-gray-400">
                            {kamar.luas ?? ""}
                            {kamar.lantai ? ` · Lantai ${kamar.lantai}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          {/* Quick toggle */}
                          <button
                            onClick={() => quickToggle(kamar)}
                            disabled={toggling === kamar.id}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                            title={`Ubah ke ${kamar.status === "kosong" ? "terisi" : "kosong"}`}
                          >
                            {kamar.status === "kosong"
                              ? <ToggleRight className="h-5 w-5 text-green-500" />
                              : <ToggleLeft className="h-5 w-5 text-gray-400" />
                            }
                          </button>
                          <StatusBadge status={kamar.status} />
                          <Link
                            href={`/admin/kamar/${kamar.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs text-[#1e1b4b] hover:bg-indigo-100 transition-colors"
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