import Image from "next/image";
import Link from "next/link";
import { MapPin, Maximize2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { KamarWithHarga } from "@/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function KamarCard({ kamar }: { kamar: KamarWithHarga }) {
  const coverPhoto = kamar.foto_urls?.[0];
  const hargaTerendah = kamar.harga?.sort((a, b) => a.harga - b.harga)[0];

  return (
    <Link
      href={`/kamar/${kamar.id}`}
      className="group block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-brand-500 transition-all duration-200 overflow-hidden"
    >
      {/* Cover photo */}
      <div className="relative h-48 w-full bg-gray-100">
        {coverPhoto ? (
          <Image
            src={coverPhoto}
            alt={kamar.nama}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 21V12h6v9" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge status={kamar.status} />
        </div>
        {kamar.foto_urls && kamar.foto_urls.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 5h12v10H4V5z M2 7v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
            </svg>
            {kamar.foto_urls.length} foto
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
            {kamar.nama}
          </h3>
        </div>

        {(kamar.luas || kamar.lantai) && (
          <div className="mb-2 flex items-center gap-3 text-xs text-gray-500">
            {kamar.luas && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" /> {kamar.luas}
              </span>
            )}
            {kamar.lantai && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Lantai {kamar.lantai}
              </span>
            )}
          </div>
        )}

        {kamar.deskripsi && (
          <p className="mb-3 text-sm text-gray-500 line-clamp-2">{kamar.deskripsi}</p>
        )}

        {/* Fasilitas chips (max 3) */}
        {kamar.fasilitas && kamar.fasilitas.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {kamar.fasilitas.slice(0, 3).map((f) => (
              <span key={f} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {f}
              </span>
            ))}
            {kamar.fasilitas.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                +{kamar.fasilitas.length - 3} lainnya
              </span>
            )}
          </div>
        )}

        {/* Harga */}
        {hargaTerendah && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p className="font-bold text-brand-600">
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
