/**
 * Supabase client khusus untuk data fetching (server-side, tanpa cookies).
 * Dipakai di dalam unstable_cache — tidak butuh auth context.
 * JANGAN dipakai untuk operasi yang butuh RLS user-level.
 */
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export function createFetchClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}