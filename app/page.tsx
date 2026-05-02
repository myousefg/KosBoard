import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { KamarCard } from "@/components/KamarCard";
import type { KamarWithHarga } from "@/types";

export const revalidate = 60; // ISR: revalidate every 60s

export default async function HomePage() {
  const supabase = await createClient();

  const { data: kamarList } = await supabase
    .from("kamar")
    .select("*, harga(*)")
    .order("created_at", { ascending: true });

  const rooms = (kamarList ?? []) as KamarWithHarga[];
  const kosong = rooms.filter((k) => k.status === "kosong").length;
  const terisi = rooms.filter((k) => k.status === "terisi").length;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 px-6 py-8 text-white shadow-lg">
          <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
            {process.env.NEXT_PUBLIC_KOS_NAME ?? "Info Kamar Kos"}
          </h1>
          <p className="mb-4 text-brand-100 text-sm">
            {process.env.NEXT_PUBLIC_KOS_ADDRESS}
          </p>
          <div className="flex gap-4">
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
              <p className="text-2xl font-bold">{kosong}</p>
              <p className="text-xs text-brand-100">Kamar Kosong</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
              <p className="text-2xl font-bold">{terisi}</p>
              <p className="text-xs text-brand-100">Kamar Terisi</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
              <p className="text-2xl font-bold">{rooms.length}</p>
              <p className="text-xs text-brand-100">Total Kamar</p>
            </div>
          </div>
        </div>

        {/* Filter hint */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Semua Kamar</h2>
          <span className="text-sm text-gray-400">{rooms.length} kamar</span>
        </div>

        {rooms.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">Belum ada data kamar.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((kamar) => (
              <KamarCard key={kamar.id} kamar={kamar} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
