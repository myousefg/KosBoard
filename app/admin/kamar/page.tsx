import Link from "next/link";
import { PlusCircle, Pencil, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import type { Kamar } from "@/types";

export default async function AdminKamarPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("kamar").select("*").order("created_at");
  const rooms = (data ?? []) as Kamar[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Kamar</h1>
          <p className="text-sm text-gray-400">{rooms.length} kamar terdaftar</p>
        </div>
        <Link
          href="/admin/kamar/tambah"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> Tambah Kamar
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        {rooms.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-3 text-sm">Belum ada kamar terdaftar.</p>
            <Link
              href="/admin/kamar/tambah"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <PlusCircle className="h-4 w-4" /> Tambah Sekarang
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-5 py-3">Kamar</th>
                <th className="px-4 py-3">Lantai</th>
                <th className="px-4 py-3">Luas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map((kamar) => (
                <tr key={kamar.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{kamar.nama}</p>
                      {kamar.deskripsi && (
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                          {kamar.deskripsi}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {kamar.lantai ?? "–"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{kamar.luas ?? "–"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={kamar.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/kamar/${kamar.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-3 w-3" /> Lihat
                      </Link>
                      <Link
                        href={`/admin/kamar/${kamar.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-100 px-3 py-1.5 text-xs text-brand-700 hover:bg-brand-200 transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
