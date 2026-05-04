'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface PhotoCarouselProps {
  urls: string[]
  namaKamar: string
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=='

export function PhotoCarousel({ urls, namaKamar }: PhotoCarouselProps) {
  const [active, setActive] = useState(0)

  const prev = useCallback(() => {
    setActive((i) => (i === 0 ? urls.length - 1 : i - 1))
  }, [urls.length])

  const next = useCallback(() => {
    setActive((i) => (i === urls.length - 1 ? 0 : i + 1))
  }, [urls.length])

  if (!urls || urls.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {/* Main image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          key={urls[active]}
          src={urls[active]}
          alt={`Foto ${namaKamar} ${active + 1} dari ${urls.length}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority={active === 0}
          loading={active === 0 ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />

        {urls.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Foto sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Foto berikutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {urls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === active ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Counter */}
        {urls.length > 1 && (
          <span className="absolute top-2 right-2 text-xs bg-black/40 text-white px-2 py-0.5 rounded-full">
            {active + 1}/{urls.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip — hanya kalau ≥3 foto */}
      {urls.length >= 3 && (
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {urls.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden snap-start border-2 transition-colors ${
                i === active ? 'border-green-600' : 'border-transparent'
              }`}
              aria-label={`Pilih foto ${i + 1}`}
            >
              <Image
                src={url}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}