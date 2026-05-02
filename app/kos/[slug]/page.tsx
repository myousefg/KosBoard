import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KamarCard } from "@/components/KamarCard";
import type { Kosan, KamarWithHarga } from "@/types";

export const revalidate = 60;

export default async function KosanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: kosan } = await supabase.from("kosan").select("*").eq("slug", slug).single();
  if (!kosan) notFound();

  const { data: kamarList } = await supabase
    .from("kamar").select("*, harga(*)")
    .eq("kosan_id", kosan.id).order("created_at");

  const rooms = (kamarList ?? []) as KamarWithHarga[];
  const k = kosan as Kosan;
  const kosong = rooms.filter((r) => r.status === "kosong").length;

  const mapsQuery = encodeURIComponent(k.alamat);
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=17`;
  const mapsOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
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

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Google Maps */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="h-52 w-full">
            <iframe
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm text-gray-500 line-clamp-1">
              <MapPin className="h-4 w-4 flex-shrink-0 text-[#1e1b4b]" />
              {k.alamat}
            </p>
            <a
              href={mapsOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-[#1e1b4b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#17144a] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Maps
            </a>
          </div>
        </div>

        {/* Filter */}
        <KamarFilter rooms={rooms} slug={slug} />
      </main>
    </div>
  );
}

// Client component for filter
import { KamarFilterClient } from "@/components/KamarFilterClient";

function KamarFilter({ rooms, slug }: { rooms: KamarWithHarga[]; slug: string }) {
  return <KamarFilterClient rooms={rooms} slug={slug} />;
}