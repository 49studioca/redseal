/**
 * Backfill meta.answer on check_question blocks that were saved without answers.
 * Usage: npm run db:backfill-check-answers
 * Options: --trade=442A --dry-run
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import {
  hasCheckAnswer,
  lessonBlocksMissingCheckAnswers,
} from "@/lib/content/check-question-meta";
import type { GeneratedLesson } from "@/lib/ai/generate";
import type { ContentBlock } from "@/types";

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
    /* ignore */
  }
}

loadEnvFile();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function parseArgs() {
  const args = process.argv.slice(2);
  const trade = args.find((a) => a.startsWith("--trade="))?.split("=")[1];
  return {
    tradeCode: trade?.toUpperCase(),
    dryRun: args.includes("--dry-run"),
  };
}

async function main() {
  const { tradeCode, dryRun } = parseArgs();
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("Set OPENROUTER_API_KEY to generate check question answers");
    process.exit(1);
  }

  const { fillMissingCheckQuestionAnswers } = await import("@/lib/ai/generate");
  const { TRADES } = await import("../src/data/seed");
  const sb = createClient(url, key);

  let tradeFilter: { id: string; code: string; name: string } | undefined;
  if (tradeCode) {
    const tradeMeta = TRADES.find((t) => t.code === tradeCode);
    if (!tradeMeta) {
      console.error(`Unknown trade: ${tradeCode}`);
      process.exit(1);
    }
    const { data: tradeRow, error: tradeError } = await sb
      .from("trades")
      .select("id, code, name")
      .eq("code", tradeCode)
      .single();
    if (tradeError || !tradeRow) {
      console.error(`Trade not found in database: ${tradeCode}`);
      process.exit(1);
    }
    tradeFilter = {
      id: tradeRow.id as string,
      code: tradeRow.code as string,
      name: (tradeRow.name as string) ?? tradeMeta.name,
    };
  }

  let query = sb
    .from("lessons")
    .select("id, slug, title, summary, content_blocks, trade_id")
    .eq("review_status", "approved");

  if (tradeFilter) {
    query = query.eq("trade_id", tradeFilter.id);
  }

  const { data: lessons, error } = await query;
  if (error) throw error;

  const { data: trades } = await sb.from("trades").select("id, code, name");
  const tradeById = new Map(
    (trades ?? []).map((t) => [
      t.id as string,
      {
        id: t.id as string,
        code: t.code as string,
        name: t.name as string,
      },
    ]),
  );

  let updated = 0;
  let filled = 0;

  for (const row of lessons ?? []) {
    const blocks = (row.content_blocks as ContentBlock[]) ?? [];
    const missing = lessonBlocksMissingCheckAnswers(blocks);
    if (missing.length === 0) continue;

    const trade =
      tradeFilter ?? tradeById.get(row.trade_id as string);
    if (!trade) continue;

    console.log(
      `Filling ${missing.length} answer(s) for ${row.slug} (${row.title})`,
    );

    const lesson: GeneratedLesson = {
      title: row.title as string,
      summary: (row.summary as string) ?? "",
      estimated_minutes: 15,
      content_blocks: blocks,
    };

    const patched = await fillMissingCheckQuestionAnswers(lesson, {
      tradeName: trade.name,
      tradeCode: trade.code,
      codeVersion: "CEC-2024",
    });

    const stillMissing = patched.content_blocks.filter(
      (block) => block.type === "check_question" && !hasCheckAnswer(block.meta),
    ).length;
    filled += missing.length - stillMissing;

    if (dryRun) {
      for (const block of patched.content_blocks) {
        if (block.type === "check_question" && hasCheckAnswer(block.meta)) {
          console.log("  Q:", block.content.slice(0, 60));
          console.log("  A:", String(block.meta?.answer).slice(0, 100));
        }
      }
      continue;
    }

    const { error: updateError } = await sb
      .from("lessons")
      .update({ content_blocks: patched.content_blocks })
      .eq("id", row.id);
    if (updateError) throw updateError;
    updated++;

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  console.log(
    dryRun
      ? `Dry run complete — would fill ~${filled} check answers`
      : `Updated ${updated} lessons with ${filled} check answers`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
