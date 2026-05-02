"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { KamarWithHarga, Kosan, KamarStatus } from "@/types";

interface HargaInput {
  id?: string;
  durasi: string;
  harga: string;
  keterangan: string;
  urutan: number;
}

interface Props {
  kamar?: KamarWithHarga;
  kosanList: Kosan[];
}

const FASILITAS_PRESET = [
  "WiFi", "AC", "Kipas Angin", "Kamar Mandi Dalam", "Kamar Mandi Luar",
  "Meja Belajar", "Lemari", "Tempat Tidur", "Kulkas Mini", "Dapur Bersama",
  "Parkir Motor", "Parkir Mobil", "Laundry",
];

export function KamarForm({ kamar, kosanList }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [kosanId, setKosanId] = useState(kamar?.kosan_id ?? kosanList[0]?.id ?? "");
  const [nama, setNama] = useState(kamar?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(kamar?.deskripsi ?? "");
  const [status, setStatus] = useState<KamarStatus>(kamar?.status ?? "kosong");
  const [luas, setLuas] = useState(kamar?.luas ?? "");
  const [lantai, setLantai] = useState(kamar?.lantai?.toString() ?? "");
  const [fasilitas, setFasilitas] = useState<string[]>(kamar?.fasilitas ?? []);
  const [fasilitasCustom, setFasilitasCustom] = useState("");
  const [fotoUrls, setFotoUrls] = useState<string[]>(kamar?.foto_urls ?? []);
  const [hargaList, setHargaList] = useState<HargaInput[]>(
    kamar?.harga?.length
      ? kamar.harga.map((h) => ({ id: h.id, durasi: h.durasi, harga: h.harga.toString(), keterangan: h.keterangan ?? "", urutan: h.urutan }))
      : [{ durasi: "Bulanan", harga: "", keterangan: "", urutan: 0 }]
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function toggleFasilitas(f: string) {
    setFasilitas((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  }
  function addCustomFasilitas() {
    const trimmed = fasilitasCustom.trim();
    if (trimmed && !fasilitas.includes(trimmed)) setFasilitas((prev) => [...prev, trimmed]);
    setFasilitasCustom("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `kamar/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("foto-kamar").upload(path, file, { upsert: false });
      if (upErr) { setError(`Gagal upload: ${upErr.message}`); continue; }
      const { data } = supabase.storage.from("foto-kamar").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    setFotoUrls((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function removeFoto(url: string) {
    const path = url.split("/foto-kamar/")[1];
    if (path) await supabase.storage.from("foto-kamar").remove([path]);
    setFotoUrls((prev) => prev.filter((u) => u !== url));
  }

  function addHarga() {
    setHargaList((prev) => [...prev, { durasi: "", harga: "", keterangan: "", urutan: prev.length }]);
  }
  function updateHarga(idx: number, field: keyof HargaInput, value: string) {
    setHargaList((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  }
  function removeHarga(idx: number) {
    setHargaList((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      kosan_id: kosanId,
      nama,
      deskripsi: deskripsi || null,
      status,
      luas: luas || null,
      lantai: lantai ? parseInt(lantai) : null,
      fasilitas: fasilitas.length ? fasilitas : null,
      foto_urls: fotoUrls.length ? fotoUrls : null,
    };

    let kamarId = kamar?.id;

    if (kamar?.id) {
      const { error: uErr } = await supabase.from("kamar").update(payload).eq("id", kamar.id);
      if (uErr) { setError(uErr.message); setSaving(false); return; }
    } else {
      const { data, error: iErr } = await supabase.from("kamar").insert(payload).select().single();
      if (iErr || !data) { setError(iErr?.message ?? "Gagal menyimpan."); setSaving(false); return; }
      kamarId = data.id;
    }

    if (kamarId) {
      await supabase.from("harga").delete().eq("kamar_id", kamarId);
      const hargaPayload = hargaList
        .filter((h) => h.durasi && h.harga)
        .map((h, i) => ({ kamar_id: kamarId!, durasi: h.durasi, harga: parseInt(h.harga.replace(/\D/g, "")), keterangan: h.keterangan || null, urutan: i }));
      if (hargaPayload.length) {
        const { error: hErr } = await supabase.from("harga").insert(hargaPayload);
        if (hErr) { setError(hErr.message); setSaving(false); return; }
      }
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!kamar?.id) return;
    if (!confirm(`Hapus kamar "${kamar.nama}"?`)) return;
    setDeleting(true);
    for (const url of fotoUrls) {
      const path = url.split("/foto-kamar/")[1];
      if (path) await supabase.storage.from("foto-kamar").remove([path]);
    }
    const { error } = await supabase.from("kamar").delete().eq("id", kamar.id);
    if (error) { setError(error.message); setDeleting(false); return; }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Info Dasar */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 font-semibold text-gray-900">Info Dasar</h2>
        <div className="grid gap-4 sm:grid-cols-2">

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi Kos *</label>
            <select
              required
              value={kosanId}
              onChange={(e) => setKosanId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition bg-white"
            >
              {kosanList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Kamar *</label>
            <input required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="e.g. Kamar A1"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Luas</label>
            <input value={luas} onChange={(e) => setLuas(e.target.value)} placeholder="e.g. 3x4 m²"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lantai</label>
            <input type="number" min={1} value={lantai} onChange={(e) => setLantai(e.target.value)} placeholder="e.g. 1"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi singkat kamar..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition resize-none" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <div className="flex gap-3">
              {(["kosong", "terisi"] as KamarStatus[]).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                    status === s
                      ? s === "kosong" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}>
                  {s === "kosong" ? "✅ Kosong / Tersedia" : "🔴 Terisi"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fasilitas */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 font-semibold text-gray-900">Fasilitas</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {FASILITAS_PRESET.map((f) => (
            <button key={f} type="button" onClick={() => toggleFasilitas(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                fasilitas.includes(f) ? "border-[#1e1b4b] bg-indigo-50 text-[#1e1b4b]" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              {fasilitas.includes(f) ? "✓ " : ""}{f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={fasilitasCustom} onChange={(e) => setFasilitasCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomFasilitas(); } }}
            placeholder="Tambah fasilitas lain..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition" />
          <button type="button" onClick={addCustomFasilitas}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 transition">
            Tambah
          </button>
        </div>
      </section>

      {/* Foto */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 font-semibold text-gray-900">Foto Kamar</h2>
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotoUrls.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeFoto(url)}
                className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:flex hover:bg-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#1e1b4b] hover:text-[#1e1b4b] transition disabled:opacity-50">
            <Upload className="h-5 w-5" />
            <span className="text-xs">{uploading ? "Upload..." : "Tambah foto"}</span>
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        <p className="text-xs text-gray-400">Format: JPG, PNG, WebP. Foto pertama akan jadi cover.</p>
      </section>

      {/* Harga */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Harga Sewa</h2>
          <button type="button" onClick={addHarga}
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition">
            <PlusCircle className="h-3.5 w-3.5" /> Tambah opsi
          </button>
        </div>
        <div className="space-y-3">
          {hargaList.map((h, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-3">
                <input value={h.durasi} onChange={(e) => updateHarga(idx, "durasi", e.target.value)} placeholder="Durasi (e.g. Bulanan)"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition" />
                <input value={h.harga} onChange={(e) => updateHarga(idx, "harga", e.target.value)} placeholder="Harga (e.g. 1500000)"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition" />
                <input value={h.keterangan} onChange={(e) => updateHarga(idx, "keterangan", e.target.value)} placeholder="Keterangan (opsional)"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1e1b4b] focus:ring-2 focus:ring-indigo-100 transition" />
              </div>
              <button type="button" onClick={() => removeHarga(idx)}
                className="mt-1 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        {kamar?.id && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 transition">
            <Trash2 className="h-4 w-4" />
            {deleting ? "Menghapus..." : "Hapus Kamar"}
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <button type="button" onClick={() => router.back()}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Batal
          </button>
          <button type="submit" disabled={saving}
            className="rounded-xl bg-[#1e1b4b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#17144a] disabled:opacity-60 transition">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </form>
  );
}
