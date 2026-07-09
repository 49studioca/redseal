import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";

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

export async function assertAdminApi() {
  if (!usesSupabaseData()) {
    return { ok: true as const, userId: "demo-admin", supabase: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, userId: user.id, supabase };
}
