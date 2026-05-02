import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KamarForm } from "@/components/KamarForm";
import type { Kosan } from "@/types";

export default async function TambahKamarPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("kosan").select("*").order("created_at");
  const kosanList = (data ?? []) as Kosan[];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/kamar" className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1e1b4b] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Tambah Kamar Baru</h1>
        <p className="text-sm text-gray-400">Lengkapi informasi kamar yang akan ditambahkan</p>
      </div>
      <KamarForm kosanList={kosanList} />
    </div>
  );
}
