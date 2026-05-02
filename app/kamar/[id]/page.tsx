import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Maximize2, MapPin, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { KamarWithHarga } from "@/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function KamarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("kamar")
    .select("*, harga(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const kamar = data as KamarWithHarga;

  const hargaSorted = [...(kamar.harga ?? [])].sort((a, b) => a.urutan - b.urutan);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Back */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar kamar
        </Link>

        {/* Gallery */}
        {kamar.foto_urls && kamar.foto_urls.length > 0 ? (
          <div className="mb-6 grid gap-2">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={kamar.foto_urls[0]}
                alt={`${kamar.nama} - foto utama`}
                fill
                className="object-cover"
                priority
              />
            </div>
            {kamar.foto_urls.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {kamar.foto_urls.slice(1, 4).map((url, i) => (
                  <div key={i} className="relative h-24 overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={url}
                      alt={`${kamar.nama} - foto ${i + 2}`}
                      fill
                      className="object-cover"
                    />
                    {i === 2 && kamar.foto_urls!.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-sm rounded-xl">
                        +{kamar.foto_urls!.length - 4} foto
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 flex h-56 items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
            <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
            </svg>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{kamar.nama}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {kamar.luas && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5" /> {kamar.luas}
                </span>
              )}
              {kamar.lantai && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Lantai {kamar.lantai}
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={kamar.status} />
        </div>

        {/* Deskripsi */}
        {kamar.deskripsi && (
          <p className="mb-6 text-gray-600 leading-relaxed">{kamar.deskripsi}</p>
        )}

        {/* Fasilitas */}
        {kamar.fasilitas && kamar.fasilitas.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-3 font-semibold text-gray-900">Fasilitas</h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {kamar.fasilitas.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Harga */}
        {hargaSorted.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-3 font-semibold text-gray-900">Harga Sewa</h2>
            <div className="divide-y divide-gray-100">
              {hargaSorted.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-600">{h.durasi}</span>
                  <div className="text-right">
                    <span className="font-semibold text-brand-600">
                      {formatRupiah(h.harga)}
                    </span>
                    {h.keterangan && (
                      <p className="text-xs text-gray-400">{h.keterangan}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="sticky bottom-4">
          <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-200">
            <p className="mb-3 text-sm text-gray-500">
              {kamar.status === "kosong"
                ? "Kamar ini tersedia. Hubungi kami untuk reservasi."
                : "Kamar ini sedang terisi. Hubungi kami untuk info kamar lain."}
            </p>
            <WhatsAppButton kamarNama={kamar.nama} className="w-full" />
          </div>
        </div>
      </main>
    </>
  );
}
