import Link from "next/link";
import { PlusCircle, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Kamar, Kosan } from "@/types";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { ExportCSVButton } from "@/components/ExportCSVButton";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ data: kosanData }, { data: kamarData }] = await Promise.all([
    supabase.from("kosan").select("*").order("created_at"),
    supabase.from("kamar").select("*").order("urutan", { ascending: true }),
  ]);

  const kosanList = (kosanData ?? []) as Kosan[];
  const rooms = (kamarData ?? []) as Kamar[];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400">
            Kos Bu Ida — {kosanList.length} lokasi
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ExportCSVButton kosanList={kosanList} rooms={rooms} />
          <Link
            href="/admin/kosan"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-[#1e1b4b]"
          >
            <ImageIcon className="h-4 w-4" />
            Foto Kosan
          </Link>
          <Link
            href="/admin/kamar/tambah"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e1b4b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#17144a]"
          >
            <PlusCircle className="h-4 w-4" /> Tambah Kamar
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Kamar",
            value: rooms.length,
            color: "bg-indigo-50 text-[#1e1b4b]",
          },
          {
            label: "Tersedia",
            value: rooms.filter((k) => k.status === "kosong").length,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Terisi",
            value: rooms.filter((k) => k.status === "terisi").length,
            color: "bg-red-50 text-red-600",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <AdminDashboardClient kosanList={kosanList} rooms={rooms} />
    </div>
  );
}