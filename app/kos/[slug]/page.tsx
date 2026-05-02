import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KamarCard } from "@/components/KamarCard";
import type { Kosan, KamarWithHarga } from "@/types";

export const revalidate = 60;

export default async function KosanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: kosan } = await supabase
    .from("kosan").select("*").eq("slug", slug).single();
  if (!kosan) notFound();

  const { data: kamarList } = await supabase
    .from("kamar").select("*, harga(*)")
    .eq("kosan_id", kosan.id).order("created_at");

  const rooms = (kamarList ?? []) as KamarWithHarga[];
  const k = kosan as Kosan;
  const kosong = rooms.filter((r) => r.status === "kosong").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e1b4b] text-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Semua Lokasi
          </Link>
          <h1 className="text-xl font-bold">{k.nama}</h1>
          <p className="text-sm text-indigo-200">{k.alamat}</p>
          <div className="mt-4 flex gap-3">
            {[
              { label: "Kamar Kosong", val: kosong },
              { label: "Terisi", val: rooms.length - kosong },
              { label: "Total", val: rooms.length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 px-4 py-2 text-center">
                <p className="text-xl font-bold">{s.val}</p>
                <p className="text-xs text-indigo-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {rooms.length === 0 ? (
          <p className="py-16 text-center text-gray-400">Belum ada kamar terdaftar.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((kamar) => (
              <KamarCard key={kamar.id} kamar={kamar} slug={slug} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
