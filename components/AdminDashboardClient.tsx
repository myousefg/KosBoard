"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  GripVertical,
  Calendar,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "./StatusBadge";
import type { Kamar, Kosan } from "@/types";

type Filter = "semua" | "kosong" | "terisi";

// ─── Format tanggal Indonesia ─────────────────────────────────────────────────

function formatTanggal(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Modal input tanggal keluar ───────────────────────────────────────────────

function TanggalModal({
  kamarNama,
  onConfirm,
  onSkip,
  onCancel,
}: {
  kamarNama: string;
  onConfirm: (tanggal: string) => void;
  onSkip: () => void;
  onCancel: () => void;
}) {
  const [tanggal, setTanggal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleConfirm() {
    if (!tanggal) return;
    onConfirm(tanggal);
  }

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">Kamar terisi</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Kapan <span className="font-medium">{kamarNama}</span> akan kosong?
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date input */}
        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Tanggal keluar penghuni
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="date"
              value={tanggal}
              min={todayStr()}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#1e1b4b]/20"
            />
          </div>
          {tanggal && (
            <p className="mt-1.5 text-xs text-gray-500">
              Kamar otomatis tersedia pada{" "}
              <span className="font-medium text-[#1e1b4b]">
                {formatTanggal(tanggal)}
              </span>
            </p>
          )}
        </div>

        {/* Info */}
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700">
            Boleh dikosongkan — status bisa diubah manual kapan saja.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            Tanpa tanggal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tanggal}
            className="flex-1 rounded-xl bg-[#1e1b4b] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17144a] disabled:opacity-40"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableKamarRow({
  kamar,
  kosanSlug,
  toggling,
  onToggleToTerisi,
  onToggleToKosong,
  isDragDisabled,
}: {
  kamar: Kamar;
  kosanSlug: string;
  toggling: string | null;
  onToggleToTerisi: (k: Kamar) => void;
  onToggleToKosong: (k: Kamar) => void;
  isDragDisabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: kamar.id, disabled: isDragDisabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  function handleToggle() {
    if (kamar.status === "kosong") {
      onToggleToTerisi(kamar);
    } else {
      onToggleToKosong(kamar);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
    >
      {!isDragDisabled && (
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab touch-none rounded p-0.5 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          aria-label="Drag untuk ubah urutan"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{kamar.nama}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {kamar.lantai && (
            <p className="text-xs text-gray-400">Lantai {kamar.lantai}</p>
          )}
          {/* Tanggal keluar — hanya tampil jika terisi & ada tanggal */}
          {kamar.status === "terisi" && kamar.tanggal_keluar && (
            <p className="flex items-center gap-1 text-xs text-amber-600">
              <Calendar className="h-3 w-3" />
              Kosong {formatTanggal(kamar.tanggal_keluar)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={toggling === kamar.id}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          title={`Ubah ke ${kamar.status === "kosong" ? "terisi" : "kosong"}`}
        >
          {kamar.status === "kosong" ? (
            <ToggleRight className="h-5 w-5 text-green-500" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-gray-400" />
          )}
        </button>
        <StatusBadge status={kamar.status} />
        <Link
          href={`/kos/${kosanSlug}/kamar/${kamar.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-200"
          title="Lihat halaman publik"
        >
          <Eye className="h-3 w-3" />
        </Link>
        <Link
          href={`/admin/kamar/${kamar.id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs text-[#1e1b4b] transition-colors hover:bg-indigo-100"
        >
          <Pencil className="h-3 w-3" /> Edit
        </Link>
      </div>
    </li>
  );
}

// ─── Drag overlay ─────────────────────────────────────────────────────────────

function DragOverlayRow({ kamar }: { kamar: Kamar }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-white px-5 py-3 shadow-lg">
      <GripVertical className="h-4 w-4 flex-shrink-0 text-indigo-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{kamar.nama}</p>
      </div>
      <StatusBadge status={kamar.status} />
    </li>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdminDashboardClient({
  kosanList,
  rooms: initialRooms,
}: {
  kosanList: Kosan[];
  rooms: Kamar[];
}) {
  const [rooms, setRooms] = useState(
    [...initialRooms].sort((a, b) => a.urutan - b.urutan)
  );
  const [openKosan, setOpenKosan] = useState<string[]>(
    kosanList.map((k) => k.id)
  );
  const [filter, setFilter] = useState<Filter>("semua");
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Modal state — null = tidak tampil, Kamar = sedang menunggu input tanggal
  const [pendingTerisi, setPendingTerisi] = useState<Kamar | null>(null);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const isDragDisabled = filter !== "semua" || search.trim() !== "";

  function toggleAccordion(id: string) {
    setOpenKosan((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  }

  // Toggle ke TERISI → buka modal dulu
  function handleToggleToTerisi(kamar: Kamar) {
    setPendingTerisi(kamar);
  }

  // Modal: user pilih tanggal atau skip → eksekusi update
  async function confirmTerisi(tanggalKeluar: string | null) {
    if (!pendingTerisi) return;
    const kamar = pendingTerisi;
    setPendingTerisi(null);
    setToggling(kamar.id);

    const { error } = await supabase
      .from("kamar")
      .update({ status: "terisi", tanggal_keluar: tanggalKeluar })
      .eq("id", kamar.id);

    if (!error) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === kamar.id
            ? { ...r, status: "terisi", tanggal_keluar: tanggalKeluar }
            : r
        )
      );
    }
    setToggling(null);
  }

  // Toggle ke KOSONG → langsung, hapus tanggal_keluar
  async function handleToggleToKosong(kamar: Kamar) {
    setToggling(kamar.id);
    const { error } = await supabase
      .from("kamar")
      .update({ status: "kosong", tanggal_keluar: null })
      .eq("id", kamar.id);

    if (!error) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === kamar.id
            ? { ...r, status: "kosong", tanggal_keluar: null }
            : r
        )
      );
    }
    setToggling(null);
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedRoom = rooms.find((r) => r.id === active.id);
    if (!draggedRoom) return;
    const kosanId = draggedRoom.kosan_id;

    const kamarDalamKosan = rooms.filter((r) => r.kosan_id === kosanId);
    const oldIdx = kamarDalamKosan.findIndex((r) => r.id === active.id);
    const newIdx = kamarDalamKosan.findIndex((r) => r.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(kamarDalamKosan, oldIdx, newIdx).map(
      (r, i) => ({ ...r, urutan: i + 1 })
    );

    setRooms((prev) => {
      const others = prev.filter((r) => r.kosan_id !== kosanId);
      return [...others, ...reordered].sort((a, b) => {
        const kosanOrder = kosanList.map((k) => k.id);
        const diff =
          kosanOrder.indexOf(a.kosan_id) - kosanOrder.indexOf(b.kosan_id);
        return diff !== 0 ? diff : a.urutan - b.urutan;
      });
    });

    setSavingOrder(kosanId);
    await Promise.all(
      reordered.map((r) =>
        supabase.from("kamar").update({ urutan: r.urutan }).eq("id", r.id)
      )
    );
    setSavingOrder(null);
  }

  // ── Filtered rooms ─────────────────────────────────────────────────────────

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchStatus = filter === "semua" || r.status === filter;
      const matchSearch = q === "" || r.nama.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [rooms, filter, search]);

  const activeKosanIds = useMemo(() => {
    if (search.trim() === "") return null;
    return [...new Set(filteredRooms.map((r) => r.kosan_id))];
  }, [filteredRooms, search]);

  const isOpen = (id: string) =>
    activeKosanIds !== null
      ? activeKosanIds.includes(id)
      : openKosan.includes(id);

  const isSearching = search.trim() !== "";
  const activeRoom = activeId ? rooms.find((r) => r.id === activeId) : null;

  return (
    <>
      {/* Modal tanggal keluar */}
      {pendingTerisi && (
        <TanggalModal
          kamarNama={pendingTerisi.nama}
          onConfirm={(tgl) => confirmTerisi(tgl)}
          onSkip={() => confirmTerisi(null)}
          onCancel={() => setPendingTerisi(null)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-3">
          {/* Searchbar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama kamar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-shadow"
            />
            {isSearching && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter + count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {isSearching ? (
                <>
                  <span className="font-medium text-gray-800">
                    {filteredRooms.length}
                  </span>{" "}
                  kamar ditemukan
                </>
              ) : filter === "semua" ? (
                `${rooms.length} kamar`
              ) : (
                `${filteredRooms.length} kamar ${filter === "kosong" ? "tersedia" : "terisi"}`
              )}
            </p>
            <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200">
              {(["semua", "kosong", "terisi"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filter === f
                      ? "bg-[#1e1b4b] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "semua" ? "Semua" : f === "kosong" ? "Tersedia" : "Terisi"}
                </button>
              ))}
            </div>
          </div>

          {!isDragDisabled && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <GripVertical className="h-3.5 w-3.5" />
              Seret baris untuk mengatur urutan tampil kamar
            </p>
          )}

          {isSearching && filteredRooms.length === 0 && (
            <div className="rounded-2xl bg-white py-10 text-center shadow-sm ring-1 ring-gray-200">
              <p className="text-sm text-gray-400">
                Tidak ada kamar bernama &ldquo;{search}&rdquo;
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs text-[#1e1b4b] hover:underline"
              >
                Hapus pencarian
              </button>
            </div>
          )}

          {/* Accordion per kosan */}
          {kosanList.map((kosan) => {
            const kamarKosan = filteredRooms.filter(
              (r) => r.kosan_id === kosan.id
            );
            const allKamar = rooms.filter((r) => r.kosan_id === kosan.id);
            const kosongCount = allKamar.filter(
              (r) => r.status === "kosong"
            ).length;
            const open = isOpen(kosan.id);
            const isSaving = savingOrder === kosan.id;

            if (isSearching && kamarKosan.length === 0) return null;

            return (
              <div
                key={kosan.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
              >
                <button
                  onClick={() => {
                    if (!isSearching) toggleAccordion(kosan.id);
                  }}
                  className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors ${
                    isSearching ? "cursor-default" : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{kosan.nama}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {kosan.alamat}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <div className="text-right">
                      {isSaving ? (
                        <span className="text-xs text-indigo-400">
                          Menyimpan urutan…
                        </span>
                      ) : isSearching ? (
                        <span className="text-xs font-medium text-[#1e1b4b]">
                          {kamarKosan.length} hasil
                        </span>
                      ) : (
                        <>
                          <span className="text-xs font-medium text-green-600">
                            {kosongCount} kosong
                          </span>
                          <span className="mx-1.5 text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">
                            {allKamar.length} total
                          </span>
                        </>
                      )}
                    </div>
                    {!isSearching &&
                      (open ? (
                        <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      ))}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-gray-100">
                    {kamarKosan.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400">
                        {filter !== "semua"
                          ? "Tidak ada kamar dengan filter ini."
                          : "Belum ada kamar."}
                      </div>
                    ) : (
                      <SortableContext
                        items={kamarKosan.map((k) => k.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <ul className="divide-y divide-gray-100">
                          {kamarKosan.map((kamar) => (
                            <SortableKamarRow
                              key={kamar.id}
                              kamar={kamar}
                              kosanSlug={kosan.slug}
                              toggling={toggling}
                              onToggleToTerisi={handleToggleToTerisi}
                              onToggleToKosong={handleToggleToKosong}
                              isDragDisabled={isDragDisabled}
                            />
                          ))}
                        </ul>
                      </SortableContext>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeRoom ? <DragOverlayRow kamar={activeRoom} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}