import { createClient } from "@/lib/supabase/server";
import { KosanFormClient } from "@/components/KosanFormClient";
import type { Kosan } from "@/types";

export default async function AdminKosanPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("kosan")
    .select("*")
    .order("created_at");

  const kosanList = (data ?? []) as Kosan[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Foto Kosan</h1>
        <p className="text-sm text-gray-400">
          Kelola foto cover dan deskripsi tiap lokasi kos
        </p>
      </div>

      <KosanFormClient kosanList={kosanList} />
    </div>
  );
}