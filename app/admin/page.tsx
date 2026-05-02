import Link from "next/link";
import { PlusCircle, Home, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import type { Kamar, Kosan } from "@/types";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ data: kosanData }, { data: kamarData }] = await Promise.all([
    supabase.from("kosan").select("*").order("created_at"),
    supabase.from("kamar").select("*").order("created_at"),
  ]);

  const kosanList = (kosanData ?? []) as Kosan[];
  const rooms = (kamarData ?? []) as Kamar[];
  const kosong = rooms.filter((k) => k.status === "kosong").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400">Kos Bu Ida — {kosanList.length} lokasi</p>
        </div>
        <Link href="/admin/kamar/tambah"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e1b4b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17144a] transition-colors">
          <PlusCircle className="h-4 w-4" /> Tambah Kamar
        </Link>
      </div>

      {/* Stats global */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Kamar", value: rooms.length, color: "bg-indigo-50 text-[#1e1b4b]" },
          { label: "Tersedia", value: kosong, color: "bg-green-50 text-green-700" },
          { label: "Terisi", value: rooms.length - kosong, color: "bg-red-50 text-red-600" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per kosan */}
      <div className="space-y-4">
        {kosanList.map((kosan) => {
          const kamarKosan = rooms.filter((r) => r.kosan_id === kosan.id);
          const kosongKosan = kamarKosan.filter((r) => r.status === "kosong").length;
          return (
            <div key={kosan.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{kosan.nama}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="h-3 w-3" />{kosan.alamat}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-600 font-medium">{kosongKosan} kosong</span>
                  <span className="text-xs text-gray-400">{kamarKosan.length} kamar</span>
                </div>
              </div>
              {kamarKosan.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  Belum ada kamar.{" "}
                  <Link href="/admin/kamar/tambah" className="text-[#1e1b4b] underline">Tambah sekarang</Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {kamarKosan.map((kamar) => (
                    <li key={kamar.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{kamar.nama}</p>
                        <p className="text-xs text-gray-400">{kamar.luas ?? ""}{kamar.lantai ? ` · Lantai ${kamar.lantai}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={kamar.status} />
                        <Link href={`/admin/kamar/${kamar.id}`}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-indigo-100 hover:text-[#1e1b4b] transition-colors">
                          Edit
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
