"use client";

import { useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import type { Kamar } from "@/types";

interface ReorderPayload {
  id: string;
  urutan: number;
}

async function batchUpdateUrutan(updates: ReorderPayload[]): Promise<void> {
  const supabase = createClient();

  // Supabase tidak punya native batch update — jalankan paralel
  // Tiap update ringan (hanya 1 kolom), aman diparalelkan
  const results = await Promise.allSettled(
    updates.map(({ id, urutan }) =>
      supabase.from("kamar").update({ urutan }).eq("id", id)
    )
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    throw new Error(`${failed.length} dari ${updates.length} update urutan gagal`);
  }
}

export function useDndOrder(initialRooms: Kamar[]) {
  const [rooms, setRooms] = useState<Kamar[]>(
    [...initialRooms].sort((a, b) => a.urutan - b.urutan)
  );
  const [saving, setSaving] = useState<string | null>(null); // kosan_id yang sedang disimpan

  const reorder = useCallback(
    async (
      activeId: string,
      overId: string,
      kosanList: { id: string }[]
    ) => {
      const draggedRoom = rooms.find((r) => r.id === activeId);
      if (!draggedRoom) return;

      const kosanId = draggedRoom.kosan_id;
      const kamarDalamKosan = rooms.filter((r) => r.kosan_id === kosanId);

      const oldIdx = kamarDalamKosan.findIndex((r) => r.id === activeId);
      const newIdx = kamarDalamKosan.findIndex((r) => r.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

      const reordered = arrayMove(kamarDalamKosan, oldIdx, newIdx).map(
        (r, i) => ({ ...r, urutan: i + 1 })
      );

      // Simpan state lama untuk rollback
      const previousRooms = rooms;

      // Optimistic update — UI langsung berubah
      setRooms((prev) => {
        const others = prev.filter((r) => r.kosan_id !== kosanId);
        return [...others, ...reordered].sort((a, b) => {
          const kosanOrder = kosanList.map((k) => k.id);
          const diff =
            kosanOrder.indexOf(a.kosan_id) - kosanOrder.indexOf(b.kosan_id);
          return diff !== 0 ? diff : a.urutan - b.urutan;
        });
      });

      setSaving(kosanId);

      try {
        await batchUpdateUrutan(
          reordered.map(({ id, urutan }) => ({ id, urutan }))
        );
      } catch (err) {
        // Rollback ke state sebelumnya kalau gagal
        setRooms(previousRooms);
        console.error("[DnD] Gagal simpan urutan, rollback:", err);
        throw err; // biarkan caller handle toast/alert
      } finally {
        setSaving(null);
      }
    },
    [rooms]
  );

  return { rooms, setRooms, saving, reorder };
}