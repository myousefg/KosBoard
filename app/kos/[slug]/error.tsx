'use client'

import { useEffect } from 'react'

export default function KosanError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[KosanBoard] Kosan page error:', error)
  }, [error])

  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3 text-center px-4">
      <p className="text-sm text-gray-500">Gagal memuat daftar kamar.</p>
      <button
        onClick={reset}
        className="text-sm text-green-600 underline underline-offset-2 hover:text-green-700"
      >
        Coba lagi
      </button>
    </div>
  )
}