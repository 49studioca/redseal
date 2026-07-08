import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: npx tsx scripts/set-admin.ts <user-id>");
  process.exit(1);
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authUser, error: authErr } =
    await supabase.auth.admin.getUserById(userId);
  if (authErr) {
    console.error("Auth user error:", authErr.message);
    process.exit(1);
  }
  if (!authUser.user) {
    console.error("User not found in auth.users");
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: authUser.user.email,
        full_name:
          authUser.user.user_metadata?.full_name ??
          authUser.user.user_metadata?.name ??
          null,
        is_admin: true,
      },
      { onConflict: "id" }
    )
    .select("id, email, full_name, is_admin")
    .single();

  if (error) {
    console.error("Profile update error:", error.message);
    process.exit(1);
  }

  console.log("Admin granted:", data);
}

main();
