import Link from 'next/link'
import Image from 'next/image'
import StatusBadge from './StatusBadge'
import RoomPlaceholder from './RoomPlaceholder'
import ShareButton from './ShareButton'
import type { Tables } from '@/types'

type Harga = Tables<'harga'>
type Kamar = Tables<'kamar'> & {
  kosan: Pick<Tables<'kosan'>, 'nama' | 'slug' | 'whatsapp'>
  harga: Harga[]
}

interface KamarCardProps {
  kamar: Kamar
  priority?: boolean
}

// Blur placeholder untuk gambar sebelum loaded
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=='

function formatHarga(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka)
}

function getHargaTerendah(hargaList: Harga[]): Harga | null {
  if (!hargaList || hargaList.length === 0) return null
  return hargaList.reduce((min, h) => (h.harga < min.harga ? h : min))
}

export default function KamarCard({ kamar, priority = false }: KamarCardProps) {
  const hargaTerendah = getHargaTerendah(kamar.harga)
  const fotoUtama = kamar.foto_urls?.[0] ?? null

  const waUrl = `https://wa.me/${kamar.kosan.whatsapp}?text=${encodeURIComponent(
    `Halo Bu Ida, saya tertarik dengan ${kamar.nama} di ${kamar.kosan.nama}. Apakah masih tersedia? Terima kasih 🙏`
  )}`

  const kamarUrl = `/kos/${kamar.kosan.slug}/kamar/${kamar.id}`

  const fasilitasPreview = kamar.fasilitas?.slice(0, 3) ?? []
  const fasilitasSisa = (kamar.fasilitas?.length ?? 0) - fasilitasPreview.length

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Foto */}
      <Link href={kamarUrl} className="block relative aspect-video w-full bg-gray-50">
        {fotoUtama ? (
          <Image
            src={fotoUtama}
            alt={`Foto ${kamar.nama}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <RoomPlaceholder />
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={kamar.status} />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={kamarUrl}>
            <h3 className="font-semibold text-gray-900 hover:text-green-700 transition-colors">
              {kamar.nama}
            </h3>
          </Link>
          <ShareButton
            url={`${process.env.NEXT_PUBLIC_SITE_URL}${kamarUrl}`}
            title={`${kamar.nama} — ${kamar.kosan.nama}`}
          />
        </div>

        {/* Fasilitas preview */}
        {fasilitasPreview.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {fasilitasPreview.map((f) => (
              <span
                key={f}
                className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100"
              >
                {f}
              </span>
            ))}
            {fasilitasSisa > 0 && (
              <span className="text-xs text-gray-400 px-1 py-0.5">
                +{fasilitasSisa}
              </span>
            )}
          </div>
        )}

        {/* Harga + CTA */}
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-end justify-between gap-2">
          <div>
            {hargaTerendah ? (
              <>
                <p className="text-xs text-gray-400">Mulai dari</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatHarga(hargaTerendah.harga)}
                  <span className="font-normal text-gray-400">
                    /{hargaTerendah.durasi}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Harga: hubungi kami</p>
            )}
          </div>

          {kamar.status === 'kosong' && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Tanya WA
            </a>
          )}
        </div>
      </div>
    </div>
  )
}