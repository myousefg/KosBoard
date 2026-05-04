'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Kamar, KamarStatus } from '@/types'

interface ToggleResult {
  id: string
  status: KamarStatus
}

export function useStatusToggle() {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const toggle = useCallback(
    async (kamar: Kamar, tanggalKeluar?: string | null): Promise<ToggleResult> => {
      if (pendingIds.has(kamar.id)) {
        throw new Error('Update masih dalam proses')
      }

      const newStatus: KamarStatus = kamar.status === 'kosong' ? 'terisi' : 'kosong'

      setPendingIds((prev) => new Set([...prev, kamar.id]))

      try {
        const supabase = createClient()

        const { error } = await supabase
          .from('kamar')
          .update({
            status: newStatus,
            tanggal_keluar: newStatus === 'terisi' ? (tanggalKeluar ?? null) : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', kamar.id)

        if (error) throw new Error(`Gagal update status: ${error.message}`)

        return { id: kamar.id, status: newStatus }
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(kamar.id)
          return next
        })
      }
    },
    [pendingIds]
  )

  const isPending = useCallback(
    (kamarId: string) => pendingIds.has(kamarId),
    [pendingIds]
  )

  return { toggle, isPending, pendingCount: pendingIds.size }
}