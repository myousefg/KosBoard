import Link from "next/link";
import { PlusCircle, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import type { Kamar } from "@/types";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data } = await supabase.from("kamar").select("*").order("created_at");
  const rooms = (data ?? []) as Kamar[];

  const kosong = rooms.filter((k) => k.status === "kosong").length;
  const terisi = rooms.filter((k) => k.status === "terisi").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400">Ringkasan kamar kos</p>
        </div>
        <Link
          href="/admin/kamar/tambah"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> Tambah Kamar
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Kamar", value: rooms.length, color: "bg-blue-50 text-blue-700" },
          { label: "Tersedia", value: kosong, color: "bg-green-50 text-green-700" },
          { label: "Terisi", value: terisi, color: "bg-red-50 text-red-600" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Room list */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-700">Semua Kamar</h2>
          <Link href="/admin/kamar" className="text-xs text-brand-600 hover:underline">
            Kelola semua →
          </Link>
        </div>
        {rooms.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Home className="mx-auto mb-2 h-10 w-10 text-gray-200" />
            <p className="text-sm">Belum ada kamar. Tambah kamar pertama!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rooms.map((kamar) => (
              <li key={kamar.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-gray-900">{kamar.nama}</p>
                  <p className="text-xs text-gray-400">
                    {kamar.lantai ? `Lantai ${kamar.lantai}` : ""}
                    {kamar.luas ? ` · ${kamar.luas}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={kamar.status} />
                  <Link
                    href={`/admin/kamar/${kamar.id}`}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-brand-100 hover:text-brand-700 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
