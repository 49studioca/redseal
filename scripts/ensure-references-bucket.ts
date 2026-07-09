/**
 * Ensure the private `references` Storage bucket exists for CEC PDFs.
 * The full PDF must NOT be public — the app serves rule-page excerpts only.
 *
 * Usage: npx tsx scripts/ensure-references-bucket.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  try {
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
  } catch {
    // optional
  }
}

loadEnvFile();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;

  console.log("Existing buckets:", buckets?.map((b) => b.name).join(", ") || "(none)");

  const exists = buckets?.some((b) => b.name === "references");
  const options = {
    public: false,
    fileSizeLimit: 400 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf"],
  };

  if (!exists) {
    const { error } = await supabase.storage.createBucket("references", options);
    if (error) throw error;
    console.log("Created PRIVATE bucket: references");
  } else {
    const { error } = await supabase.storage.updateBucket("references", {
      public: false,
      fileSizeLimit: 400 * 1024 * 1024,
      allowedMimeTypes: ["application/pdf"],
    });
    if (error) console.warn("Could not lock bucket private:", error.message);
    else console.log("Locked bucket private: references");
  }

  // Drop public-read policy if present (SQL via RPC not available; warn user).
  console.log(
    "Confirm in Supabase Dashboard → Storage → references → Public bucket = OFF",
  );

  const { data: bucketsAfter } = await supabase.storage.listBuckets();
  const ref = bucketsAfter?.find((b) => b.name === "references");
  console.log("references bucket public:", ref?.public ?? "unknown");

  const { data: files, error: filesErr } = await supabase.storage
    .from("references")
    .list("", { limit: 20 });
  if (filesErr) throw filesErr;

  console.log(
    "Files at bucket root:",
    files?.map((f) => f.name).join(", ") || "(empty — upload cec-2024.pdf here)",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
