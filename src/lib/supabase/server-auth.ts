import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

/**
 * Read the authenticated user in Server Components and route handlers.
 * Uses getSession() — middleware/proxy already refreshed the token via getUser().
 * Calling getUser() here can trigger a second refresh and invalidate the session.
 */
export async function getServerSessionUser(): Promise<User | null> {
  if (!usesSupabaseData()) return null;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}
