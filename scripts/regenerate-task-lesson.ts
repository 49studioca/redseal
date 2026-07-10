/**
 * Regenerate a single per-task lesson (fixes thin / untyped content_blocks).
 * Usage: npx tsx scripts/regenerate-task-lesson.ts --trade=442A --block=E --task=E-26
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

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    tradeCode: args.find((a) => a.startsWith("--trade="))?.split("=")[1]?.toUpperCase(),
    blockCode: args.find((a) => a.startsWith("--block="))?.split("=")[1]?.toUpperCase(),
    taskCode: args.find((a) => a.startsWith("--task="))?.split("=")[1]?.toUpperCase(),
    province: args.find((a) => a.startsWith("--province="))?.split("=")[1]?.toUpperCase(),
  };
}

async function main() {
  const { tradeCode, blockCode, taskCode, province } = parseArgs();
  if (!tradeCode || !blockCode || !taskCode) {
    console.error("Usage: --trade=442A --block=E --task=E-26 [--province=ON]");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("Set OPENROUTER_API_KEY");
    process.exit(1);
  }

  const {
    TRADES,
    ALL_BLOCKS,
    DEFAULT_CODE_VERSIONS,
    TRADE_GENERATION_PROFILES,
    REFERENCE_CHUNKS,
    getChapterTasksForBlock,
  } = await import("../src/data/seed");
  const { generateTaskLesson } = await import("../src/lib/ai/generate");
  const {
    resolveTradeId,
    resolveBlockId,
    upsertApprovedLesson,
  } = await import("../src/lib/content/persist-generated");
  const { taskLessonSortOrder } = await import("../src/lib/content/lesson-structure");
  const { replaceLessonFlashcards } = await import("../src/lib/content/persist-generated");
  const { generateFlashcardsFromLesson } = await import("../src/lib/ai/generate");

  const trade = TRADES.find((t) => t.code === tradeCode);
  if (!trade) {
    console.error(`Unknown trade: ${tradeCode}`);
    process.exit(1);
  }
  const block = ALL_BLOCKS.find(
    (b) => b.trade_id === trade.id && b.code === blockCode,
  );
  if (!block) {
    console.error(`Unknown block: ${blockCode} for ${tradeCode}`);
    process.exit(1);
  }

  const chapterTasks = getChapterTasksForBlock(block.id);
  const task = chapterTasks.find((t) => t.code === taskCode);
  if (!task) {
    console.error(
      `Unknown task ${taskCode}. Available: ${chapterTasks.map((t) => t.code).join(", ")}`,
    );
    process.exit(1);
  }

  const taskIndex = chapterTasks.findIndex((t) => t.code === taskCode);
  const codeVersion = DEFAULT_CODE_VERSIONS[trade.id];
  const chunks = REFERENCE_CHUNKS.filter(
    (c) => !codeVersion || c.code_version === codeVersion,
  );
  const profile =
    TRADE_GENERATION_PROFILES[
      trade.id as keyof typeof TRADE_GENERATION_PROFILES
    ];

  console.log(`Regenerating ${trade.code} ${task.code}: ${task.name}...`);

  const lesson = await generateTaskLesson({
    tradeName: trade.name,
    tradeCode: trade.code,
    blockCode: block.code,
    blockName: block.name,
    task,
    retrievedChunks: chunks,
    codeVersion,
    province,
    tradeProfile: profile,
  });

  // Ensure every block has a string content + type (DB previously had typeless blobs).
  const typedBlocks = (lesson.content_blocks ?? [])
    .map((block) => {
      if (!block || typeof block !== "object") return null;
      const type =
        typeof (block as { type?: unknown }).type === "string"
          ? (block as { type: string }).type
          : "text";
      const content = (block as { content?: unknown }).content;
      if (typeof content !== "string") {
        // Coerce object payloads into string content when possible
        if (content && typeof content === "object") {
          return {
            type: type === "math" ? "math" : type,
            content:
              type === "math" &&
              typeof (content as { equation?: string }).equation === "string"
                ? (content as { equation: string }).equation
                : JSON.stringify(content),
            meta: (block as { meta?: Record<string, unknown> }).meta,
          };
        }
        return null;
      }
      return {
        type,
        content,
        meta: (block as { meta?: Record<string, unknown> }).meta,
      };
    })
    .filter(Boolean);

  if (typedBlocks.length < 8) {
    console.warn(
      `Warning: only ${typedBlocks.length} blocks generated (expected 8–12). Persisting anyway.`,
    );
  }

  const supabase = createClient(url, key);
  const tradeId = await resolveTradeId(supabase, trade.code);
  const blockId = await resolveBlockId(supabase, tradeId, block.code);

  const saved = await upsertApprovedLesson(supabase, {
    tradeId,
    blockId,
    blockCode: block.code,
    tradeCode: trade.code,
    sortOrder: taskLessonSortOrder(block.sort_order, taskIndex),
    codeVersion,
    province,
    taskCode: task.code,
    lesson: {
      ...lesson,
      content_blocks: typedBlocks as typeof lesson.content_blocks,
    },
  });

  // Persist chapter_task_code if column exists (upsert may omit it).
  await supabase
    .from("lessons")
    .update({ chapter_task_code: task.code })
    .eq("id", saved.id);

  const taskText = typedBlocks.map((b) => (b as { content: string }).content).join("\n");
  const cards = await generateFlashcardsFromLesson(
    `${task.code}: ${lesson.title}`,
    taskText,
  );
  const flashcardIds = await replaceLessonFlashcards(supabase, {
    tradeId,
    lessonId: saved.id as string,
    codeVersion,
    province,
    cards,
    reviewStatus: "approved",
  });

  const textLen = typedBlocks
    .filter((b) =>
      ["text", "heading", "callout"].includes((b as { type: string }).type),
    )
    .map((b) => (b as { content: string }).content)
    .join("").length;

  console.log("\nSaved:", {
    id: saved.id,
    slug: saved.slug,
    title: lesson.title,
    blocks: typedBlocks.length,
    textChars: textLen,
    types: typedBlocks.map((b) => (b as { type: string }).type),
    flashcards: flashcardIds.length,
  });

  for (const [i, b] of typedBlocks.entries()) {
    const preview = String((b as { content: string }).content)
      .slice(0, 120)
      .replace(/\s+/g, " ");
    console.log(`  [${i}] ${(b as { type: string }).type}: ${preview}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
