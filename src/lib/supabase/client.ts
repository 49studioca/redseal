import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL to your project API URL (https://YOUR_PROJECT.supabase.co), not a Postgres connection string."
    );
  }
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
