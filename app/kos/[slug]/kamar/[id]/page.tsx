import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Maximize2, MapPin, CheckCircle2, Calendar } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { ShareButton } from "@/components/ShareButton";
import type { KamarWithHarga, Kosan } from "@/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kosanboard.vercel.app";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggal(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: kosan } = await supabase
    .from("kosan")
    .select("*")
    .eq("slug", slug)
    .single();

  const { data } = await supabase
    .from("kamar")
    .select("*, harga(*)")
    .eq("id", id)
    .maybeSingle();

  const kamar = data as KamarWithHarga | null;
  const k = kosan as Kosan | null;
  if (!kamar || !k) return { title: "Kamar tidak ditemukan" };

  const hargaMin = [...(kamar.harga ?? [])].sort((a, b) => a.harga - b.harga)[0];
  const status = kamar.status === "kosong" ? "Tersedia" : "Terisi";

  const title = `${kamar.nama} — ${k.nama}`;
  const descParts: string[] = [`Status: ${status}`];
  if (kamar.tanggal_keluar)
    descParts.push(`Tersedia mulai ${formatTanggal(kamar.tanggal_keluar)}`);
  if (kamar.luas) descParts.push(`Luas: ${kamar.luas}`);
  if (kamar.lantai) descParts.push(`Lantai ${kamar.lantai}`);
  if (hargaMin)
    descParts.push(
      `Mulai ${formatRupiah(hargaMin.harga)}/${hargaMin.durasi.toLowerCase()}`
    );
  if (kamar.fasilitas?.length)
    descParts.push(`Fasilitas: ${kamar.fasilitas.slice(0, 3).join(", ")}`);

  const description = descParts.join(" · ");
  const pageUrl = `${SITE_URL}/kos/${slug}/kamar/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "KosanBoard — Kos Bu Ida",
      type: "website",
      locale: "id_ID",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: pageUrl },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function KamarDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: kosan } = await supabase
    .from("kosan")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!kosan) notFound();

  const { data } = await supabase
    .from("kamar")
    .select("*, harga(*)")
    .eq("id", id)
    .eq("kosan_id", kosan.id)
    .single();
  if (!data) notFound();

  const kamar = data as KamarWithHarga;
  const k = kosan as Kosan;
  const hargaSorted = [...(kamar.harga ?? [])].sort(
    (a, b) => a.urutan - b.urutan
  );

  const isKosong = kamar.status === "kosong";
  const adaTanggal = !isKosong && !!kamar.tanggal_keluar;

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="bg-[#1e1b4b] px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href={`/kos/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {k.nama}
          </Link>
          <ShareButton kamarNama={kamar.nama} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <PhotoCarousel fotoUrls={kamar.foto_urls ?? []} kamarNama={kamar.nama} />

        {/* Header kamar */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{kamar.nama}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {kamar.luas && (
                  <span className="flex items-center gap-1">
                    <Maximize2 className="h-3.5 w-3.5" />
                    {kamar.luas}
                  </span>
                )}
                {kamar.lantai && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Lantai {kamar.lantai}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={kamar.status} />
          </div>

          {/* Info tanggal tersedia */}
          {adaTanggal && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
              <Calendar className="h-4 w-4 flex-shrink-0 text-amber-500" />
              <p className="text-sm text-amber-800">
                Tersedia mulai{" "}
                <span className="font-semibold">
                  {formatTanggal(kamar.tanggal_keluar!)}
                </span>
              </p>
            </div>
          )}

          {kamar.deskripsi && (
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {kamar.deskripsi}
            </p>
          )}
        </div>

        {/* Fasilitas */}
        {kamar.fasilitas && kamar.fasilitas.length > 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-3 font-semibold text-gray-900">Fasilitas</h2>
            <div className="grid grid-cols-2 gap-y-2">
              {kamar.fasilitas.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                  {f}
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
                <div
                  key={h.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-sm text-gray-600">{h.durasi}</span>
                  <span className="font-semibold text-[#1e1b4b]">
                    {formatRupiah(h.harga)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-200">
          <p className="mb-3 text-sm text-gray-500">
            {isKosong
              ? "Kamar ini tersedia. Hubungi kami untuk reservasi."
              : adaTanggal
              ? `Kamar ini terisi sampai ${formatTanggal(kamar.tanggal_keluar!)}. Hubungi kami untuk reservasi lebih awal.`
              : "Kamar ini sedang terisi. Hubungi kami untuk info kamar lain."}
          </p>
          <WhatsAppButton
            kamarNama={kamar.nama}
            kosanNama={k.nama}
            whatsapp={k.whatsapp}
            className="w-full"
          />
        </div>
      </main>
    </div>
  );
}