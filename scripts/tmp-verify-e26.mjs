import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  for (const line of readFileSync(resolve(".env"), "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv();

const { prepareLessonBlocks } = await import(
  "../src/lib/content/parse-content-blocks.ts"
);

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const { data } = await sb
  .from("lessons")
  .select("content_blocks")
  .eq("slug", "block-e-e-26-442a")
  .single();

const prepared = prepareLessonBlocks(data.content_blocks, "442A", "E", "E-26");
console.log("prepared blocks:", prepared.length);
console.log(prepared.map((b) => b.type).join(", "));
console.log("first heading:", prepared.find((b) => b.type === "heading")?.content);
console.log("has video:", prepared.some((b) => b.type === "video"));
console.log("has image:", prepared.some((b) => b.type === "image"));
console.log(
  "check qs:",
  prepared.filter((b) => b.type === "check_question").length,
);
