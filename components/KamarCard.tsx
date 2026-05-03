"use client";
import Image from "next/image";
import Link from "next/link";
import { Maximize2, MapPin, Share2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { RoomPlaceholder } from "./RoomPlaceholder";
import type { KamarWithHarga } from "@/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function KamarCard({
  kamar,
  slug,
}: {
  kamar: KamarWithHarga;
  slug: string;
}) {
  const coverPhoto = kamar.foto_urls?.[0];
  const hargaTerendah = kamar.harga?.sort((a, b) => a.harga - b.harga)[0];

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/kos/${slug}/kamar/${kamar.id}`;
    if (navigator.share) {
      navigator.share({
        title: kamar.nama,
        text: `Cek kamar kos ini: ${kamar.nama}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link kamar sudah disalin!");
    }
  }

  return (
    <Link
      href={`/kos/${slug}/kamar/${kamar.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-200 hover:shadow-md hover:ring-[#1e1b4b]"
    >
      {/* Share button */}
      <button
        onClick={handleShare}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow transition-colors hover:bg-white hover:text-[#1e1b4b]"
        aria-label="Share kamar"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      {/* Cover image / placeholder */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50">
        {coverPhoto ? (
          <Image
            src={coverPhoto}
            alt={kamar.nama}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          /* ── Ilustrasi placeholder ── */
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <RoomPlaceholder size="md" />
            <span className="text-[11px] font-medium tracking-wide text-indigo-300">
              Belum ada foto
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <StatusBadge status={kamar.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-[#1e1b4b]">
          {kamar.nama}
        </h3>
        <div className="mb-2 mt-1 flex items-center gap-3 text-xs text-gray-400">
          {kamar.luas && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3 w-3" />
              {kamar.luas}
            </span>
          )}
          {kamar.lantai && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Lantai {kamar.lantai}
            </span>
          )}
        </div>

        {kamar.fasilitas && kamar.fasilitas.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {kamar.fasilitas.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {f}
              </span>
            ))}
            {kamar.fasilitas.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                +{kamar.fasilitas.length - 3}
              </span>
            )}
          </div>
        )}

        {hargaTerendah && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p className="font-bold text-[#1e1b4b]">
              {formatRupiah(hargaTerendah.harga)}
              <span className="text-xs font-normal text-gray-400">
                /{hargaTerendah.durasi.toLowerCase()}
              </span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}