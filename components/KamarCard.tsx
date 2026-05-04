import Link from 'next/link'
import Image from 'next/image'
import { StatusBadge } from './StatusBadge'
import { RoomPlaceholder } from './RoomPlaceholder'
import type { KamarWithHarga } from '@/types'

interface KamarCardProps {
  kamar: KamarWithHarga
  slug: string
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=='

function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function KamarCard({ kamar, slug }: KamarCardProps) {
  const fotoUtama = kamar.foto_urls?.[0] ?? null
  const hargaTerendah = kamar.harga?.length
    ? [...kamar.harga].sort((a, b) => a.harga - b.harga)[0]
    : null

  const fasilitasPreview = kamar.fasilitas?.slice(0, 3) ?? []
  const fasilitasSisa = (kamar.fasilitas?.length ?? 0) - fasilitasPreview.length

  const kamarUrl = `/kos/${slug}/kamar/${kamar.id}`

  return (
    <Link
      href={kamarUrl}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      {/* Foto */}
      <div className="relative aspect-video w-full bg-gray-50">
        {fotoUtama ? (
          <Image
            src={fotoUtama}
            alt={`Foto ${kamar.nama}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <RoomPlaceholder />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={kamar.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-semibold text-gray-900 group-hover:text-[#1e1b4b] transition-colors">
          {kamar.nama}
        </p>

        {/* Fasilitas preview */}
        {fasilitasPreview.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {fasilitasPreview.map((f) => (
              <span
                key={f}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                {f}
              </span>
            ))}
            {fasilitasSisa > 0 && (
              <span className="px-1 py-0.5 text-xs text-gray-400">
                +{fasilitasSisa}
              </span>
            )}
          </div>
        )}

        {/* Harga */}
        {hargaTerendah && (
          <p className="mt-3 text-sm text-gray-500">
            Mulai dari{' '}
            <span className="font-semibold text-[#1e1b4b]">
              {formatRupiah(hargaTerendah.harga)}
            </span>
            <span className="text-gray-400">/{hargaTerendah.durasi.toLowerCase()}</span>
          </p>
        )}
      </div>
    </Link>
  )
}