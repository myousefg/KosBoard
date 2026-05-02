import Image from "next/image";
import Link from "next/link";
import { Maximize2, MapPin } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { KamarWithHarga } from "@/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function KamarCard({ kamar, slug }: { kamar: KamarWithHarga; slug: string }) {
  const coverPhoto = kamar.foto_urls?.[0];
  const hargaTerendah = kamar.harga?.sort((a, b) => a.harga - b.harga)[0];

  return (
    <Link
      href={`/kos/${slug}/kamar/${kamar.id}`}
      className="group block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-[#1e1b4b] transition-all duration-200 overflow-hidden"
    >
      <div className="relative h-44 w-full bg-gray-100">
        {coverPhoto ? (
          <Image src={coverPhoto} alt={kamar.nama} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 50vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3"><StatusBadge status={kamar.status} /></div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-[#1e1b4b] transition-colors">{kamar.nama}</h3>
        <div className="mb-2 mt-1 flex items-center gap-3 text-xs text-gray-400">
          {kamar.luas && <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{kamar.luas}</span>}
          {kamar.lantai && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Lantai {kamar.lantai}</span>}
        </div>
        {kamar.fasilitas && kamar.fasilitas.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {kamar.fasilitas.slice(0, 3).map((f) => (
              <span key={f} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{f}</span>
            ))}
            {kamar.fasilitas.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">+{kamar.fasilitas.length - 3}</span>
            )}
          </div>
        )}
        {hargaTerendah && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p className="font-bold text-[#1e1b4b]">
              {formatRupiah(hargaTerendah.harga)}
              <span className="text-xs font-normal text-gray-400">/{hargaTerendah.durasi.toLowerCase()}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
