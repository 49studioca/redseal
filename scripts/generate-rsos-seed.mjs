/**
 * Fetches official Red Seal exam breakdowns and writes src/data/rsos-exam-data.ts
 * Usage: node scripts/generate-rsos-seed.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "src/data/rsos-exam-data.ts");

/** Our trade id → red-seal.ca list-page slug (from trades-list.shtml). */
const RED_SEAL_LIST_SLUG = {
  "trade-309a": "const-elect",
  "trade-447a": "plumber",
  "trade-276a": "welder",
  "trade-442a": "indust-elect",
  "trade-powerline-technician": "powerline-tech",
  "trade-instrumentation-control": "instrument-cntl-tech",
  "trade-steamfitter-pipefitter": "steamfitter-pipefitter",
  "trade-sprinkler-fitter": "sprinkler-fitter",
  "trade-gasfitter": "gasfitter-b",
  "trade-carpenter": "carpenter",
  "trade-bricklayer": "bricklayer",
  "trade-concrete-finisher": "concrete-finisher",
  "trade-construction-craft-worker": "const-craft-work",
  "trade-drywall-finisher-plasterer": "drywall-fin-plast",
  "trade-floorcovering-installer": "floorcover-install",
  "trade-glazier": "glazier",
  "trade-insulator-heat-frost": "insulator-heat-frost",
  "trade-ironworker-structural": "ironwork-struct",
  "trade-ironworker-reinforcing": "ironwork-reinforce",
  "trade-painter-decorator": "painter-decorator",
  "trade-roofer": "roofer",
  "trade-sheet-metal-worker": "sheet-metal-work",
  "trade-tilesetter": "tilesetter",
  "trade-cabinetmaker": "cabinetmaker",
  "trade-lather-interior-systems": "lather-int-sys-mech",
  "trade-millwright": "indust-mech-mill",
  "trade-machinist": "machinist",
  "trade-tool-die-maker": "tool-die-maker",
  "trade-metal-fabricator": "metal-fab-fit",
  "trade-refrigeration-ac-mechanic": "refrig-ac-mech",
  "trade-boilermaker": "boilermaker",
  "trade-automotive-service-technician": "auto-serv-tech",
  "trade-heavy-duty-equipment-technician": "heavy-duty-equip-tech",
  "trade-truck-transport-mechanic": "truck-transp-mech",
  "trade-motorcycle-technician": "motorcycle-tech",
  "trade-motor-vehicle-body-repairer": "auto-body-col-tech",
  "trade-automotive-refinishing-technician": "auto-refinish-tech",
  "trade-agricultural-equipment-technician": "agri-equip-tech",
  "trade-recreation-vehicle-technician": "rvst",
  "trade-parts-technician": "parts-tech",
  "trade-cook": "cook",
  "trade-baker": "baker",
  "trade-hairstylist": "hairstylist",
  "trade-heavy-equipment-operator-dozer": "heo-dozer",
  "trade-mobile-crane-operator": "mobile-crane-op",
  "trade-tower-crane-operator": "tower-crane-op",
  "trade-landscape-horticulturist": "landscape-hort",
  "trade-appliance-service-technician": "appliance-serv-tech",
};

function decodeHtml(s) {
  return s
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "RedSealGuide-SeedGenerator/1.0" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function resolveExamUrl(listSlug) {
  const page = await fetchText(`https://red-seal.ca/eng/trades/${listSlug}.shtml`);
  const match = page.match(/href="(\/eng\/trades\/[^"]+\/exam-information\.shtml)"/);
  if (!match) throw new Error(`No exam-information link on ${listSlug}`);
  return `https://red-seal.ca${match[1]}`;
}

function parseExamPage(html) {
  const totalMatch = html.match(/exam has (\d+) questions/i);
  const totalQuestions = totalMatch ? Number(totalMatch[1]) : null;

  const blocks = [];
  const tasksByBlock = {};

  const detailsRegex =
    /<details>[\s\S]*?<summary class="h3">([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let dm;
  while ((dm = detailsRegex.exec(html)) !== null) {
    const summaryText = decodeHtml(dm[1]);
    const blockMatch = summaryText.match(
      /(?:Major Work Activity\s+)?([A-Z])\s*[–-]\s*(.+?)\s*-\s*(\d+)\s*questions?/i,
    );
    if (!blockMatch) continue;

    const code = blockMatch[1].toUpperCase();
    const name = blockMatch[2].trim();
    const count = Number(blockMatch[3]);

    blocks.push({
      code,
      name,
      exam_question_count: count,
      sort_order: blocks.length + 1,
    });
    const blockKey = code.toLowerCase();
    tasksByBlock[blockKey] = [];

    const sectionHtml = dm[2];
    const rowRegex =
      /<div class="col-md-8">([^<]+)<\/div>\s*<div class="col-md-4">(\d+)\s*questions?<\/div>/gi;
    let rm;
    let taskIndex = 0;
    while ((rm = rowRegex.exec(sectionHtml)) !== null) {
      const rawTask = decodeHtml(rm[1]).replace(/\s*-\s*\d+ questions$/i, "");
      const qCount = Number(rm[2]);
      if (qCount === 0) continue;

      let taskCode;
      let taskName;
      const letterNum =
        rawTask.match(/^Task\s+([A-Z]-\d+)\s+(.+)$/i) ||
        rawTask.match(/^([A-Z]-\d+)\s+(.+)$/);
      const numOnly = rawTask.match(/^Task\s+(\d+)\s*-\s*(.+)$/i);

      if (letterNum) {
        taskCode = letterNum[1];
        taskName = letterNum[2];
      } else if (numOnly) {
        taskCode = `${code}-${numOnly[1]}`;
        taskName = numOnly[2];
      } else {
        taskIndex += 1;
        taskCode = `${code}-${taskIndex}`;
        taskName = rawTask.replace(/^Task\s+/i, "");
      }

      tasksByBlock[blockKey].push({
        code: taskCode,
        name: taskName,
        exam_question_count: qCount,
      });
    }
  }

  const computedTotal = blocks.reduce((s, b) => s + b.exam_question_count, 0);
  for (const block of blocks) {
    block.exam_percentage = computedTotal
      ? Math.round((block.exam_question_count / computedTotal) * 100)
      : undefined;
  }

  return { totalQuestions: totalQuestions ?? computedTotal, blocks, tasksByBlock };
}

function tradeIdToBlockPrefix(tradeId) {
  const code = tradeId.replace(/^trade-/, "");
  return code.replace(/-/g, "").toLowerCase();
}

function parseAllTradesTs() {
  const src = readFileSync(resolve(ROOT, "src/data/all-trades.ts"), "utf8");
  const trades = [];
  const re = /trade\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,/g;
  for (const match of src.matchAll(re)) {
    const code = match[1];
    const slug = match[2];
    const start = match.index ?? 0;
    let depth = 0;
    let end = start;
    for (let i = start; i < src.length; i++) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    const chunk = src.slice(start, end);
    const idMatch = chunk.match(/id:\s*"([^"]+)"/);
    const id = idMatch?.[1] ?? `trade-${slug}`;
    trades.push({ code, slug, id });
  }
  return trades;
}

function esc(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function main() {
  const trades = parseAllTradesTs();
  const results = {};
  const failures = [];

  for (const trade of trades) {
    const listSlug = RED_SEAL_LIST_SLUG[trade.id];
    if (!listSlug) {
      failures.push({ trade, reason: "no red-seal list slug mapping" });
      continue;
    }
    try {
      const examUrl = await resolveExamUrl(listSlug);
      const html = await fetchText(examUrl);
      const parsed = parseExamPage(html);
      results[trade.id] = {
        ...parsed,
        examUrl,
        listSlug,
        tradeCode: trade.code,
      };
      console.log(`OK ${trade.code} ${trade.slug} — ${parsed.blocks.length} blocks, ${parsed.totalQuestions} Qs`);
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      failures.push({ trade, reason: String(err.message ?? err) });
      console.error(`FAIL ${trade.code}: ${err.message ?? err}`);
    }
  }

  const lines = [
    "/** Auto-generated from red-seal.ca exam-information pages. Re-run: node scripts/generate-rsos-seed.mjs */",
    "import type { RsosBlock, RsosChapterTask } from \"@/types\";",
    "",
    "export type TradeRsosExamData = {",
    "  tradeId: string;",
    "  tradeCode: string;",
    "  totalQuestions: number;",
    "  examUrl: string;",
    "  blocks: RsosBlock[];",
    "  chapterTasks: Record<string, RsosChapterTask[]>;",
    "};",
    "",
    "export const RSOS_EXAM_DATA: Record<string, TradeRsosExamData> = {",
  ];

  for (const [tradeId, data] of Object.entries(results)) {
    const prefix = tradeIdToBlockPrefix(tradeId);
    const blocks = data.blocks.map((b, i) => {
      const blockId = `${prefix}-${b.code.toLowerCase()}`;
      return `    { id: "${blockId}", trade_id: "${tradeId}", code: "${b.code}", name: "${esc(b.name)}", sort_order: ${i + 1}, exam_question_count: ${b.exam_question_count}, exam_percentage: ${b.exam_percentage ?? "undefined"} }`;
    });

    const taskEntries = [];
    for (const b of data.blocks) {
      const blockId = `${prefix}-${b.code.toLowerCase()}`;
      const tasks = data.tasksByBlock[b.code.toLowerCase()] ?? [];
      if (tasks.length === 0) continue;
      const taskLines = tasks
        .map(
          (t) =>
            `      { code: "${t.code}", name: "${esc(t.name)}", exam_question_count: ${t.exam_question_count} }`,
        )
        .join(",\n");
      taskEntries.push(`    "${blockId}": [\n${taskLines}\n    ]`);
    }

    lines.push(`  "${tradeId}": {`);
    lines.push(`    tradeId: "${tradeId}",`);
    lines.push(`    tradeCode: "${data.tradeCode}",`);
    lines.push(`    totalQuestions: ${data.totalQuestions},`);
    lines.push(`    examUrl: "${data.examUrl}",`);
    lines.push(`    blocks: [`);
    lines.push(blocks.join(",\n"));
    lines.push(`    ],`);
    lines.push(`    chapterTasks: {`);
    lines.push(taskEntries.join(",\n"));
    lines.push(`    },`);
    lines.push(`  },`);
  }

  lines.push("};");
  lines.push("");
  lines.push("export const ALL_RSOS_BLOCKS: RsosBlock[] = Object.values(RSOS_EXAM_DATA).flatMap((d) => d.blocks);");
  lines.push("");
  lines.push("export const ALL_CHAPTER_TASKS: Record<string, RsosChapterTask[]> = Object.assign(");
  lines.push("  {},");
  lines.push("  ...Object.values(RSOS_EXAM_DATA).map((d) => d.chapterTasks),");
  lines.push(");");
  lines.push("");

  // Trades in our catalog but not on red-seal.ca — placeholder block until RSOS is published
  const UNMAPPED = [
    { id: "trade-electric-motor-systems-technician", code: "426A", name: "Trade competencies" },
    { id: "trade-industrial-instrument-technician", code: "447B", name: "Trade competencies" },
    { id: "trade-elevator-constructor", code: "435A", name: "Trade competencies" },
    { id: "trade-locksmith", code: "436A", name: "Trade competencies" },
    { id: "trade-water-well-driller", code: "461A", name: "Trade competencies" },
    { id: "trade-concrete-pump-operator", code: "463A", name: "Trade competencies" },
    { id: "trade-turbine-technician", code: "464A", name: "Trade competencies" },
    { id: "trade-rig-technician", code: "465A", name: "Trade competencies" },
  ];

  lines.push("/** Placeholder RSOS blocks for catalog trades not listed on red-seal.ca. */");
  lines.push("export const UNMAPPED_TRADE_RSOS: TradeRsosExamData[] = [");
  for (const t of UNMAPPED) {
    const prefix = tradeIdToBlockPrefix(t.id);
    lines.push("  {");
    lines.push(`    tradeId: "${t.id}",`);
    lines.push(`    tradeCode: "${t.code}",`);
    lines.push("    totalQuestions: 120,");
    lines.push('    examUrl: "",');
    lines.push("    blocks: [");
    lines.push(
      `      { id: "${prefix}-a", trade_id: "${t.id}", code: "A", name: "${t.name}", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },`,
    );
    lines.push("    ],");
    lines.push("    chapterTasks: {},");
    lines.push("  },");
  }
  lines.push("];");
  lines.push("");

  writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`\nWrote ${OUT}`);
  console.log(`Success: ${Object.keys(results).length}, Failed/unmapped: ${failures.length}`);
  if (failures.length) {
    console.log("\nUnmapped or failed trades:");
    for (const f of failures) {
      console.log(`  ${f.trade.code} (${f.trade.id}): ${f.reason}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
