import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { getKamarBySlug } from "@/lib/data/kosan";
import { KamarFilterClient } from "@/components/KamarFilterClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kosanboard.vercel.app";

// ─── Helpers Maps ─────────────────────────────────────────────────────────────

function getMapsUrls(alamat: string, lat: number | null, lng: number | null) {
  if (lat && lng) {
    // Pakai koordinat presisi kalau tersedia
    const coord = `${lat},${lng}`;
    return {
      embedUrl: `https://maps.google.com/maps?q=${coord}&output=embed&z=18`,
      openUrl: `https://www.google.com/maps/search/?api=1&query=${coord}`,
    };
  }
  // Fallback ke alamat teks
  const q = encodeURIComponent(alamat);
  return {
    embedUrl: `https://maps.google.com/maps?q=${q}&output=embed&z=17`,
    openUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let result: Awaited<ReturnType<typeof getKamarBySlug>> | null = null;
  try {
    result = await getKamarBySlug(slug);
  } catch {
    return { title: "Lokasi tidak ditemukan" };
  }

  const { kosan, rooms } = result;
  const total = rooms.length;
  const kosong = rooms.filter((k) => k.status === "kosong").length;

  const title = kosan.nama;
  const description =
    kosan.deskripsi ??
    `${kosong} dari ${total} kamar tersedia di ${kosan.nama}, ${kosan.alamat}.`;
  const pageUrl = `${SITE_URL}/kos/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "KosanBoard",
      type: "website",
      locale: "id_ID",
      ...(kosan.foto_cover
        ? { images: [{ url: kosan.foto_cover, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: {
      card: kosan.foto_cover ? "summary_large_image" : "summary",
      title,
      description,
    },
    alternates: { canonical: pageUrl },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function KosanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let result: Awaited<ReturnType<typeof getKamarBySlug>>;
  try {
    result = await getKamarBySlug(slug);
  } catch {
    notFound();
  }

  const { kosan: k, rooms } = result;
  const kosong = rooms.filter((r) => r.status === "kosong").length;

  const { embedUrl, openUrl } = getMapsUrls(k.alamat, k.latitude, k.longitude);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="bg-[#1e1b4b] text-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-white transition-colors"
          >
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
              <div
                key={s.label}
                className="rounded-xl bg-white/10 px-4 py-2 text-center"
              >
                <p className="text-xl font-bold">{s.val}</p>
                <p className="text-xs text-indigo-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {/* Google Maps — embed presisi pakai koordinat */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="h-52 w-full">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="line-clamp-1 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4 flex-shrink-0 text-[#1e1b4b]" />
              {k.alamat}
            </p>
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-[#1e1b4b] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#17144a]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Maps
            </a>
          </div>
        </div>

        <KamarFilterClient rooms={rooms} slug={slug} />
      </main>
    </div>
  );
}