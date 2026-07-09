import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function requireAdmin() {
  if (!usesSupabaseData()) {
    return { userId: "demo-admin", supabase: null as never };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return { userId: user.id, supabase };
}

export async function assertAdminApi(): Promise<
  | { ok: false; status: number; error: string }
  | { ok: true; userId: string; supabase: SupabaseServerClient | null }
> {
  if (!usesSupabaseData()) {
    return { ok: true, userId: "demo-admin", supabase: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, userId: user.id, supabase };
}
