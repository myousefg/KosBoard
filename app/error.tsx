'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[KosanBoard] Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
        <svg
          className="w-6 h-6 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          Gagal memuat halaman
        </h2>
        <p className="text-sm text-gray-500">
          Terjadi kesalahan. Coba muat ulang halaman.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-1">ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Muat ulang
      </button>
    </div>
  )
}
