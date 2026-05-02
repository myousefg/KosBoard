import Link from "next/link";
import { MapPin, Home, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Kosan } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("kosan").select("*").order("created_at");
  const kosanList = (data ?? []) as Kosan[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e1b4b] text-white">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Kos Bu Ida</span>
          </div>
          <p className="text-sm text-indigo-200">Pilih lokasi kos yang ingin kamu lihat</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-3">
          {kosanList.map((kosan) => (
            <Link
              key={kosan.id}
              href={`/kos/${kosan.slug}`}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:ring-[#1e1b4b] hover:shadow-md transition-all group"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#1e1b4b]">{kosan.nama}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="h-3.5 w-3.5" /> {kosan.alamat}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#1e1b4b] transition-colors" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
