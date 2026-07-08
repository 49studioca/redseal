/**
 * Supabase structural seed — trades, blocks, profiles (no lesson/question content).
 * Usage: npm run db:seed
 * Then:  npm run db:generate-content
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
      const value = trimmed.slice(eq + 1).trim();
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env optional
  }
}

loadEnvFile();

import {
  TRADES,
  ALL_BLOCKS,
  PROVINCIAL_GUIDES,
  TRADE_GENERATION_PROFILES,
  REFERENCE_CHUNKS,
  CHAPTER_TASKS,
  getExamQuestionCountForTrade,
} from "../src/data/seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function seed() {
  if (!url || !key) {
    console.log("Skipping seed — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    return;
  }

  const supabase = createClient(url, key);
  const tradeIdByCode = new Map<string, string>();

  for (const trade of TRADES) {
    const { data, error } = await supabase
      .from("trades")
      .upsert(
        {
          code: trade.code,
          slug: trade.slug,
          name: trade.name,
          short_name: trade.short_name,
          icon: trade.icon,
          exam_question_count: getExamQuestionCountForTrade(trade.id, trade.exam_question_count),
          exam_time_minutes: trade.exam_time_minutes,
          pass_percentage: trade.pass_percentage,
          is_open_book: trade.is_open_book,
          reference_doc_types: trade.reference_doc_types,
          status: trade.status,
          description: trade.description,
        },
        { onConflict: "code" },
      )
      .select("id, code")
      .single();
    if (error) throw error;
    tradeIdByCode.set(trade.code, data.id);
    console.log("Trade:", trade.code, "→", data.id);
  }

  for (const block of ALL_BLOCKS) {
    const trade = TRADES.find((t) => t.id === block.trade_id)!;
    const tradeUuid = tradeIdByCode.get(trade.code);
    if (!tradeUuid) continue;

    const { error } = await supabase.from("rsos_blocks").upsert(
      {
        trade_id: tradeUuid,
        code: block.code,
        name: block.name,
        sort_order: block.sort_order,
        exam_question_count: block.exam_question_count,
        exam_percentage: block.exam_percentage,
      },
      { onConflict: "trade_id,code" },
    );
    if (error) throw error;
  }
  console.log("Blocks:", ALL_BLOCKS.length);

  for (const guide of PROVINCIAL_GUIDES) {
    const trade = TRADES.find((t) => t.id === guide.trade_id)!;
    const tradeUuid = tradeIdByCode.get(trade.code);
    if (!tradeUuid) continue;
    await supabase.from("provincial_guides").upsert({
      id: guide.id,
      trade_id: tradeUuid,
      province_code: guide.province_code,
      province_name: guide.province_name,
      slug: guide.slug,
      title: guide.title,
      content: guide.content,
      apprenticeship_hours: guide.apprenticeship_hours,
      prerequisites: guide.prerequisites,
      code_adoption: guide.code_adoption,
      exam_info: guide.exam_info,
      meta_description: guide.meta_description,
    });
  }

  for (const [tradeId, profile] of Object.entries(TRADE_GENERATION_PROFILES)) {
    const trade = TRADES.find((t) => t.id === tradeId)!;
    const tradeUuid = tradeIdByCode.get(trade.code);
    if (!tradeUuid) continue;
    await supabase.from("trade_generation_profiles").upsert({
      trade_id: tradeUuid,
      glossary: profile.glossary,
      code_standards: profile.code_standards,
      calculation_templates: profile.calculation_templates,
      distractor_patterns: profile.distractor_patterns,
    });
  }

  for (const chunk of REFERENCE_CHUNKS) {
    await supabase.from("reference_chunks").upsert({
      id: chunk.id,
      doc_id: chunk.doc_id,
      rule_number: chunk.rule_number,
      section_title: chunk.section_title,
      content: chunk.content,
      page_number: chunk.page_number,
      code_version: chunk.code_version,
    });
  }

  console.log("Structural seed complete. Run: npm run db:generate-content");
}

seed().catch(console.error);
