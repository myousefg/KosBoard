"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  fotoUrls: string[];
  kamarNama: string;
}

export function PhotoCarousel({ fotoUrls, kamarNama }: Props) {
  const [current, setCurrent] = useState(0);

  if (fotoUrls.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl bg-white ring-1 ring-gray-200 text-gray-200">
        <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
        </svg>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? fotoUrls.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === fotoUrls.length - 1 ? 0 : c + 1));

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      {/* Main image */}
      <div className="relative h-72 w-full bg-gray-100">
        <Image
          src={fotoUrls[current]}
          alt={`${kamarNama} - foto ${current + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority={current === 0}
        />

        {/* Nav arrows */}
        {fotoUrls.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter */}
        {fotoUrls.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
            {current + 1} / {fotoUrls.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {fotoUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {fotoUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                i === current ? "ring-2 ring-[#1e1b4b] ring-offset-1" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={url} alt={`thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}