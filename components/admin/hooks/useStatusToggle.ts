'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types'

type Kamar = Tables<'kamar'>
type Status = 'kosong' | 'terisi'

interface ToggleResult {
  id: string
  status: Status
}

export function useStatusToggle() {
  // Set of kamar IDs yang sedang dalam proses update
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const toggle = useCallback(
    async (kamar: Kamar, tanggalKeluar?: string | null): Promise<ToggleResult> => {
      // Guard: jangan proses kalau masih pending
      if (pendingIds.has(kamar.id)) {
        throw new Error('Update masih dalam proses')
      }

      const newStatus: Status = kamar.status === 'kosong' ? 'terisi' : 'kosong'

      setPendingIds((prev) => new Set([...prev, kamar.id]))

      try {
        const supabase = createClient()

        const update: Partial<Pick<Kamar, 'status' | 'tanggal_keluar' | 'updated_at'>> = {
          status: newStatus,
          updated_at: new Date().toISOString(),
          // Kalau jadi terisi, simpan tanggal keluar; kalau jadi kosong, hapus
          tanggal_keluar: newStatus === 'terisi' ? (tanggalKeluar ?? null) : null,
        }

        const { error } = await supabase
          .from('kamar')
          .update(update)
          .eq('id', kamar.id)

        if (error) throw new Error(`Gagal update status: ${error.message}`)

        return { id: kamar.id, status: newStatus }
      } finally {
        // Selalu remove dari pending, baik sukses maupun gagal
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
