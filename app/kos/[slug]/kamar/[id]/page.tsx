import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, MapPin, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { ShareButton } from "@/components/ShareButton";
import type { KamarWithHarga, Kosan } from "@/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function KamarDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: kosan } = await supabase.from("kosan").select("*").eq("slug", slug).single();
  if (!kosan) notFound();

  const { data } = await supabase.from("kamar").select("*, harga(*)").eq("id", id).eq("kosan_id", kosan.id).single();
  if (!data) notFound();

  const kamar = data as KamarWithHarga;
  const k = kosan as Kosan;
  const hargaSorted = [...(kamar.harga ?? [])].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="bg-[#1e1b4b] px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href={`/kos/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> {k.nama}
          </Link>
          <ShareButton kamarNama={kamar.nama} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        {/* Photo Carousel */}
        <PhotoCarousel fotoUrls={kamar.foto_urls ?? []} kamarNama={kamar.nama} />

        {/* Header */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{kamar.nama}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {kamar.luas && <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{kamar.luas}</span>}
                {kamar.lantai && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Lantai {kamar.lantai}</span>}
              </div>
            </div>
            <StatusBadge status={kamar.status} />
          </div>
          {kamar.deskripsi && <p className="mt-3 leading-relaxed text-gray-600 text-sm">{kamar.deskripsi}</p>}
        </div>

        {/* Fasilitas */}
        {kamar.fasilitas && kamar.fasilitas.length > 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-3 font-semibold text-gray-900">Fasilitas</h2>
            <div className="grid grid-cols-2 gap-y-2">
              {kamar.fasilitas.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />{f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Harga */}
        {hargaSorted.length > 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-3 font-semibold text-gray-900">Harga Sewa</h2>
            <div className="divide-y divide-gray-100">
              {hargaSorted.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-600">{h.durasi}</span>
                  <span className="font-semibold text-[#1e1b4b]">{formatRupiah(h.harga)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-200">
          <p className="mb-3 text-sm text-gray-500">
            {kamar.status === "kosong"
              ? "Kamar ini tersedia. Hubungi kami untuk reservasi."
              : "Kamar ini sedang terisi. Hubungi kami untuk info kamar lain."}
          </p>
          <WhatsAppButton kamarNama={kamar.nama} kosanNama={k.nama} whatsapp={k.whatsapp} className="w-full" />
        </div>
      </main>
    </div>
  );
}