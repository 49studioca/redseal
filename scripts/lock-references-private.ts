/**
 * Force the references bucket to private (no public URL for the full CEC PDF).
 * Usage: npx tsx scripts/lock-references-private.ts
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

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  // Only flip public — avoid fileSizeLimit changes that fail on large objects.
  const { error } = await supabase.storage.updateBucket("references", {
    public: false,
  });
  if (error) throw error;

  const { data: buckets } = await supabase.storage.listBuckets();
  const ref = buckets?.find((b) => b.name === "references");
  console.log("references.public =", ref?.public);

  // Drop public-read policy via PostgREST isn't available; print SQL for dashboard.
  console.log(`
Also run this in Supabase SQL Editor if the public URL still works:

  update storage.buckets set public = false where id = 'references';
  drop policy if exists "references_public_read" on storage.objects;
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
