"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Check, Loader2, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Kosan } from "@/types";

const BUCKET = "foto-kosan";

export function KosanFormClient({ kosanList }: { kosanList: Kosan[] }) {
  const [kosans, setKosans] = useState(kosanList);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const supabase = createClient();

  async function handleFotoUpload(kosan: Kosan, file: File) {
    setUploading(kosan.id);
    const ext = file.name.split(".").pop();
    const path = `cover-${kosan.slug}.${ext}`;

    // Upload ke storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert("Gagal upload foto: " + uploadError.message);
      setUploading(null);
      return;
    }

    // Ambil public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // Simpan ke tabel kosan
    const { error: updateError } = await supabase
      .from("kosan")
      .update({ foto_cover: publicUrl })
      .eq("id", kosan.id);

    if (!updateError) {
      setKosans((prev) =>
        prev.map((k) =>
          k.id === kosan.id ? { ...k, foto_cover: publicUrl } : k
        )
      );
    }
    setUploading(null);
  }

  async function handleSaveDeskripsi(kosan: Kosan, deskripsi: string) {
    setSaving(kosan.id);
    await supabase.from("kosan").update({ deskripsi }).eq("id", kosan.id);
    setKosans((prev) =>
      prev.map((k) => (k.id === kosan.id ? { ...k, deskripsi } : k))
    );
    setSaving(null);
    setSaved(kosan.id);
    setTimeout(() => setSaved(null), 2000);
  }

  async function handleHapusFoto(kosan: Kosan) {
    if (!confirm("Hapus foto cover?")) return;
    setSaving(kosan.id);

    const ext = kosan.foto_cover?.split(".").pop();
    const path = `cover-${kosan.slug}.${ext}`;
    await supabase.storage.from(BUCKET).remove([path]);
    await supabase.from("kosan").update({ foto_cover: null }).eq("id", kosan.id);

    setKosans((prev) =>
      prev.map((k) => (k.id === kosan.id ? { ...k, foto_cover: null } : k))
    );
    setSaving(null);
  }

  return (
    <div className="space-y-4">
      {kosans.map((kosan) => {
        const isUploading = uploading === kosan.id;
        const isSaving = saving === kosan.id;
        const isSaved = saved === kosan.id;

        return (
          <div
            key={kosan.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
          >
            {/* Header kosan */}
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="font-semibold text-gray-900">{kosan.nama}</p>
              <p className="text-xs text-gray-400">{kosan.alamat}</p>
            </div>

            <div className="p-5 space-y-5">
              {/* Foto cover */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Foto Cover
                </p>
                <div className="flex gap-4">
                  {/* Preview */}
                  <div className="relative h-28 w-44 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {kosan.foto_cover ? (
                      <Image
                        src={kosan.foto_cover}
                        alt={kosan.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="h-6 w-6 animate-spin text-[#1e1b4b]" />
                      </div>
                    )}
                  </div>

                  {/* Aksi */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={(el) => { fileInputRefs.current[kosan.id] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFotoUpload(kosan, file);
                      }}
                    />
                    <button
                      onClick={() => fileInputRefs.current[kosan.id]?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1e1b4b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#17144a] disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      {kosan.foto_cover ? "Ganti Foto" : "Upload Foto"}
                    </button>
                    {kosan.foto_cover && (
                      <button
                        onClick={() => handleHapusFoto(kosan)}
                        disabled={isSaving}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        Hapus Foto
                      </button>
                    )}
                    <p className="text-xs text-gray-400">
                      JPG/PNG, maks 5MB
                      <br />
                      Rasio ideal 16:9
                    </p>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Deskripsi Singkat{" "}
                  <span className="font-normal text-gray-400">(opsional)</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={kosan.deskripsi ?? ""}
                    placeholder="contoh: Cocok untuk mahasiswi, dekat kampus Telkom"
                    maxLength={120}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveDeskripsi(kosan, e.currentTarget.value);
                      }
                    }}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#1e1b4b]/20"
                    id={`desk-${kosan.id}`}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById(
                        `desk-${kosan.id}`
                      ) as HTMLInputElement;
                      handleSaveDeskripsi(kosan, el.value);
                    }}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-[#1e1b4b] transition-colors hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {isSaved ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Simpan"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}