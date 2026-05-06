import Link from "next/link";
import Image from "next/image";
import { MapPin, Home, ChevronRight } from "lucide-react";
import { getKosanList } from "@/lib/data/kosan";
import { createClient } from "@/lib/supabase/server";
import type { Kamar } from "@/types";

export default async function HomePage() {
  const kosanList = await getKosanList();
  const supabase = await createClient();
  const { data: kamarData } = await supabase
    .from("kamar")
    .select("id, kosan_id, status");

  const allKamar = (kamarData ?? []) as Pick<Kamar, "id" | "kosan_id" | "status">[];

  function countKosong(kosanId: string) {
    return allKamar.filter(
      (k) => k.kosan_id === kosanId && k.status === "kosong"
    ).length;
  }
  function countTotal(kosanId: string) {
    return allKamar.filter((k) => k.kosan_id === kosanId).length;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <header className="bg-[#1e1b4b] text-white">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">KosanBoard</span>
          </div>
          <p className="text-sm text-indigo-200">
            Pilih lokasi kos yang ingin kamu lihat
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-4">
          {kosanList.map((kosan) => {
            const kosong = countKosong(kosan.id);
            const total = countTotal(kosan.id);
            const adaFoto = !!kosan.foto_cover;

            return (
              <Link
                key={kosan.id}
                href={`/kos/${kosan.slug}`}
                className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-[#1e1b4b]"
              >
                {/* Foto cover */}
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50">
                  {adaFoto ? (
                    <Image
                      src={kosan.foto_cover!}
                      alt={kosan.nama}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <Home className="h-12 w-12 text-indigo-300" />
                        <span className="text-xs text-indigo-300">Belum ada foto</span>
                      </div>
                    </div>
                  )}

                  {/* Badge ketersediaan */}
                  <div className="absolute bottom-3 left-3">
                    {kosong > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        {kosong} kamar tersedia
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800/70 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur-sm">
                        Penuh
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 transition-colors group-hover:text-[#1e1b4b]">
                      {kosan.nama}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{kosan.alamat}</span>
                    </p>
                    {kosan.deskripsi && (
                      <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                        {kosan.deskripsi}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">{total} kamar</span>
                    <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-[#1e1b4b]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}