import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

/**
 * Read the authenticated user in Server Components and route handlers.
 * Prefer getSession() after proxy refresh; fall back to getUser() when the
 * cookie session is missing (e.g. chunked auth cookies mid-refresh).
 */
export async function getServerSessionUser(): Promise<User | null> {
  if (!usesSupabaseData()) return null;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) return session.user;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}
