/**
 * AI content generation — lessons, questions, and flashcards per RSOS block.
 * Usage: npm run db:generate-content
 * Options: --trade=447A --block=A --lessons-only --questions-only
 *          --questions=25 --append-questions --province=ON
 * Per-task lesson blocks (e.g. 442A, 403A) generate one lesson per RSOS exam task.
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
    // .env optional
  }
}

loadEnvFile();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function parseArgs() {
  const args = process.argv.slice(2);
  const trade = args.find((a) => a.startsWith("--trade="))?.split("=")[1];
  const block = args.find((a) => a.startsWith("--block="))?.split("=")[1];
  const questionsArg = args.find((a) => a.startsWith("--questions="))?.split("=")[1];
  const provinceArg = args.find((a) => a.startsWith("--province="))?.split("=")[1];
  return {
    tradeCode: trade?.toUpperCase(),
    blockCode: block?.toUpperCase(),
    lessonsOnly: args.includes("--lessons-only"),
    questionsOnly: args.includes("--questions-only"),
    questionCount: questionsArg ? Number.parseInt(questionsArg, 10) : undefined,
    appendQuestions: args.includes("--append-questions"),
    province: provinceArg?.toUpperCase(),
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const {
    TRADES,
    ALL_BLOCKS,
    DEFAULT_CODE_VERSIONS,
    TRADE_GENERATION_PROFILES,
    REFERENCE_CHUNKS,
    getChapterTasksForBlock,
  } = await import("../src/data/seed");
  const { generateAndPersistBlockContent } = await import(
    "../src/lib/content/generate-block-content"
  );
  const { computePracticeQuestionCount } = await import(
    "../src/lib/content/practice-questions"
  );

  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("Set OPENROUTER_API_KEY for AI content generation");
    process.exit(1);
  }

  const {
    tradeCode,
    blockCode,
    lessonsOnly,
    questionsOnly,
    questionCount,
    appendQuestions,
    province,
  } = parseArgs();
  const supabase = createClient(url, key);

  let blocks = ALL_BLOCKS;
  if (tradeCode) {
    const trade = TRADES.find((t) => t.code === tradeCode);
    if (!trade) {
      console.error(`Unknown trade: ${tradeCode}`);
      process.exit(1);
    }
    blocks = blocks.filter((b) => b.trade_id === trade.id);
  }
  if (blockCode) {
    blocks = blocks.filter((b) => b.code === blockCode);
  }

  console.log(`Generating content for ${blocks.length} block(s)...`);
  if (province) console.log(`Province context: ${province}`);
  console.log("(Requires npm run db:seed beforehand)\n");

  for (const block of blocks) {
    const trade = TRADES.find((t) => t.id === block.trade_id)!;
    const codeVersion = DEFAULT_CODE_VERSIONS[trade.id];
    const chunks = REFERENCE_CHUNKS.filter(
      (c) => !codeVersion || c.code_version === codeVersion,
    );
    const profile =
      TRADE_GENERATION_PROFILES[
        trade.id as keyof typeof TRADE_GENERATION_PROFILES
      ];

    const chapterTasks = getChapterTasksForBlock(block.id);
    const practiceTarget =
      questionCount ??
      computePracticeQuestionCount(chapterTasks, block.exam_question_count);

    console.log(`\n▶ ${trade.code} Block ${block.code}: ${block.name}`);
    if (!lessonsOnly) {
      console.log(
        `  practice bank: ${practiceTarget} questions (exam uses ${block.exam_question_count})`,
      );
    }

    try {
      const result = await generateAndPersistBlockContent({
        supabase,
        trade,
        block,
        chapterTasks,
        codeVersion,
        province,
        tradeProfile: profile,
        retrievedChunks: chunks,
        options: {
          skipLesson: questionsOnly,
          skipQuestions: lessonsOnly,
          skipFlashcards: lessonsOnly || questionsOnly,
          questionCount: practiceTarget,
          appendQuestions,
        },
      });
      console.log(
        `  ✓ lesson=${result.lessonId ?? "skipped"} questions=${result.questionIds.length} flashcards=${result.flashcardIds.length}`,
      );
    } catch (err) {
      console.error(`  ✗ failed:`, err instanceof Error ? err.message : err);
    }

    await sleep(1500);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
