import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KamarForm } from "@/components/KamarForm";
import type { KamarWithHarga } from "@/types";

export default async function EditKamarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("kamar")
    .select("*, harga(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const kamar = data as KamarWithHarga;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/kamar"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Edit {kamar.nama}</h1>
        <p className="text-sm text-gray-400">Perbarui informasi kamar</p>
      </div>
      <KamarForm kamar={kamar} />
    </div>
  );
}
