import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Kosan, KamarWithHarga } from "@/types";

/**
 * Fetch semua kosan — cache 1 jam, invalidate via tag "kosan"
 * Dipanggil di: app/page.tsx, app/admin/page.tsx
 */
export const getKosanList = unstable_cache(
  async (): Promise<Kosan[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kosan")
      .select("*")
      .order("created_at");

    if (error) throw new Error(`getKosanList failed: ${error.message}`);
    return (data ?? []) as Kosan[];
  },
  ["kosan-list"],
  {
    revalidate: 3600,
    tags: ["kosan"],
  }
);

/**
 * Fetch kamar + harga per slug kosan — cache 30 menit, invalidate via tag "kamar"
 * Join dalam SATU query → tidak ada N+1
 * Dipanggil di: app/kos/[slug]/page.tsx
 */
export const getKamarBySlug = unstable_cache(
  async (slug: string): Promise<{ kosan: Kosan; rooms: KamarWithHarga[] }> => {
    const supabase = await createClient();

    const { data: kosanData, error: kosanError } = await supabase
      .from("kosan")
      .select("*")
      .eq("slug", slug)
      .single();

    if (kosanError || !kosanData) {
      throw new Error(`Kosan tidak ditemukan: ${slug}`);
    }

    const { data: kamarData, error: kamarError } = await supabase
      .from("kamar")
      .select("*, harga(*)")
      .eq("kosan_id", kosanData.id)
      .order("urutan", { ascending: true })
      .order("urutan", { referencedTable: "harga", ascending: true });

    if (kamarError) throw new Error(`getKamarBySlug failed: ${kamarError.message}`);

    return {
      kosan: kosanData as Kosan,
      rooms: (kamarData ?? []) as KamarWithHarga[],
    };
  },
  ["kamar-by-slug"],
  {
    revalidate: 1800,
    tags: ["kamar"],
  }
);

/**
 * Fetch semua kamar (tanpa harga) untuk admin dashboard — tidak di-cache
 * Admin butuh data fresh setiap kali buka dashboard
 */
export async function getKamarAdmin(): Promise<
  import("@/types").Kamar[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kamar")
    .select("*")
    .order("urutan", { ascending: true });

  if (error) throw new Error(`getKamarAdmin failed: ${error.message}`);
  return (data ?? []) as import("@/types").Kamar[];
}