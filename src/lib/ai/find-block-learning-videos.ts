/**
 * Discover multiple educational YouTube videos per RSOS block using Jina Search.
 * Uses an AI search plan + strong relevance scoring tuned for Red Seal apprentices.
 */

import OpenAI from "openai";
import {
  hasJinaApiKey,
  searchJinaYoutubeVideos,
  type JinaVideoHit,
} from "@/lib/ai/jina-search";
import { isYoutubeShortVideo } from "@/lib/youtube/shorts";
import type { RsosChapterTask } from "@/types";

export const MIN_BLOCK_VIDEOS = 1;
export const MAX_BLOCK_VIDEOS = 8;
export const DEFAULT_BLOCK_VIDEOS = 3;

export function clampBlockVideoCount(value: unknown): number {
  const n =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : DEFAULT_BLOCK_VIDEOS;
  return Math.min(MAX_BLOCK_VIDEOS, Math.max(MIN_BLOCK_VIDEOS, n));
}

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 30_000,
      maxRetries: 1,
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export type BlockVideoSearchPlan = {
  topicLabel: string;
  searchQuery: string;
  altQueries?: string[];
  learningGoal: string;
};

export type DiscoveredBlockVideo = {
  youtubeId: string;
  title: string;
  description?: string;
  searchQuery: string;
  topicLabel: string;
  relevanceScore: number;
};

const JINA_VIDEO_SEARCH_SYSTEM_PROMPT = (targetCount: number) => `You are a Canadian Red Seal apprenticeship curriculum designer.
Your job is to plan YouTube video searches that help apprentices master ONE RSOS exam block.

Return JSON only:
{
  "searches": [
    {
      "topicLabel": "short label for this subtopic (3-6 words)",
      "searchQuery": "4-9 word YouTube search phrase",
      "altQueries": ["broader synonym query", "hands-on demo query"],
      "learningGoal": "one sentence: what the apprentice should learn from this video"
    }
  ]
}

STRICT RULES for searchQuery and altQueries:
- Target PRACTICAL training: how-to, demo, install, troubleshoot, safety, code application
- Include trade context (electrician, plumber, welder, carpenter, etc.) when it improves results
- Prefer Canadian context: Red Seal, apprenticeship, CEC, CSA, WHMIS, provincial codes when relevant
- Each search must cover a DISTINCT subtopic within the block — no duplicate angles
- Use plain English apprentices search on YouTube — no quotes, no site: operators, no commas
- Avoid entertainment: no music videos, movie clips, gaming, vlogs, product ads, "day in the life"
- Avoid overly generic queries ("electrical basics") — tie to the RSOS task or block skill
- NEVER target YouTube Shorts — prefer full-length tutorials and classroom-style demos (5+ minutes)
- Generate exactly ${targetCount} searches

Quality bar: every video should teach a skill or concept that could appear on the Red Seal exam.`;

function truncate(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function normalizeQueries(primary: string, altQueries: string[] = []): string[] {
  const clean = (value: string) =>
    value
      .replace(/[,"']/g, " ")
      .replace(/\bsite:youtube\.com\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  return [primary, ...altQueries]
    .map(clean)
    .filter((q, i, arr) => q.length >= 3 && arr.indexOf(q) === i)
    .slice(0, 5);
}

function fallbackSearchPlan(input: {
  tradeName: string;
  blockName: string;
  chapterTasks: RsosChapterTask[];
  targetCount: number;
}): BlockVideoSearchPlan[] {
  const tradeShort = input.tradeName.split(" ").slice(-1)[0] ?? input.tradeName;
  const tasks = input.chapterTasks.slice(0, input.targetCount);

  let plans: BlockVideoSearchPlan[];

  if (tasks.length === 0) {
    plans = [
      {
        topicLabel: input.blockName.slice(0, 40),
        searchQuery: `${tradeShort} ${truncate(input.blockName, 50)} training tutorial`,
        altQueries: [`Red Seal ${tradeShort} ${truncate(input.blockName, 40)}`],
        learningGoal: `Understand core skills for ${input.blockName}`,
      },
      {
        topicLabel: "Safety and code",
        searchQuery: `${tradeShort} safety code apprenticeship tutorial`,
        learningGoal: "Apply safety and code requirements on the job",
      },
      {
        topicLabel: "Hands-on demo",
        searchQuery: `${tradeShort} how to demo full tutorial`,
        learningGoal: "Watch practical demonstration of block skills",
      },
    ];
  } else {
    plans = tasks.map((task) => ({
      topicLabel: truncate(task.name, 40),
      searchQuery: `${tradeShort} ${truncate(task.name, 55)} tutorial`,
      altQueries: [
        `Red Seal ${tradeShort} ${truncate(task.name, 45)}`,
        `${tradeShort} ${truncate(task.name, 40)} how to`,
      ],
      learningGoal: `Master RSOS task ${task.code}: ${task.name}`,
    }));
  }

  while (plans.length < input.targetCount) {
    plans.push({
      topicLabel: `${input.blockName.slice(0, 30)} overview`,
      searchQuery: `${tradeShort} ${truncate(input.blockName, 45)} explained`,
      altQueries: [`${tradeShort} apprenticeship training`],
      learningGoal: `Broader coverage of ${input.blockName}`,
    });
  }

  return plans.slice(0, input.targetCount);
}

async function generateBlockVideoSearchPlan(input: {
  tradeCode: string;
  tradeName: string;
  blockCode: string;
  blockName: string;
  chapterTasks: RsosChapterTask[];
  targetCount: number;
}): Promise<BlockVideoSearchPlan[]> {
  if (!openrouter) return fallbackSearchPlan(input);

  const taskList = input.chapterTasks
    .map((t) => `- ${t.code}: ${t.name} (${t.exam_question_count} exam Qs)`)
    .join("\n");

  const userPrompt = `Trade: ${input.tradeName} (${input.tradeCode})
RSOS Block ${input.blockCode}: ${input.blockName}

Exam tasks in this block:
${taskList || "(no task breakdown — plan searches covering the block theme)"}

Plan exactly ${input.targetCount} distinct YouTube searches for full-length training videos (not Shorts).`;

  try {
    const response = await openrouter.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: JINA_VIDEO_SEARCH_SYSTEM_PROMPT(input.targetCount) },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.35,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return fallbackSearchPlan(input);

    const parsed = JSON.parse(content) as {
      searches?: Partial<BlockVideoSearchPlan>[];
    };

    const searches = (parsed.searches ?? [])
      .map((row) => ({
        topicLabel: String(row.topicLabel ?? "").trim(),
        searchQuery: String(row.searchQuery ?? "").trim(),
        altQueries: Array.isArray(row.altQueries)
          ? row.altQueries.map((q) => String(q ?? "").trim()).filter(Boolean)
          : [],
        learningGoal: String(row.learningGoal ?? "").trim(),
      }))
      .filter((row) => row.searchQuery && row.topicLabel)
      .slice(0, input.targetCount);

    return searches.length >= 1 ? searches : fallbackSearchPlan(input);
  } catch {
    return fallbackSearchPlan(input);
  }
}

function scoreBlockVideoHit(
  hit: JinaVideoHit,
  plan: BlockVideoSearchPlan,
  tradeName: string,
  blockName: string,
): number {
  const hay = `${hit.title} ${hit.description ?? ""}`.toLowerCase();
  const tradeTerms = tradeName
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 4);
  const blockTerms = `${blockName} ${plan.topicLabel} ${plan.searchQuery} ${plan.learningGoal}`
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3);

  let score = 0;

  for (const term of tradeTerms) {
    if (hay.includes(term)) score += 2;
  }
  for (const term of blockTerms) {
    if (hay.includes(term)) score += 1;
  }

  if (/\b(tutorial|training|how to|explained|demo|apprentice|red seal|install|wiring|troubleshoot|safety|code|cec|csa)\b/i.test(hay)) {
    score += 4;
  }
  if (/\b(canada|canadian|ontario|alberta|bc)\b/i.test(hay)) score += 2;

  if (/\b(music|official video|trailer|movie|gameplay|asmr|lyrics|podcast|reaction|prank|vlog|unboxing|review)\b/i.test(hay)) {
    score -= 12;
  }
  if (/\b(live stream|shorts|#shorts|youtube shorts)\b/i.test(hay)) {
    score -= 20;
  }
  if (/\b(funny|meme|tiktok)\b/i.test(hay)) score -= 8;

  if (hit.title.length > 120) score -= 2;

  return score;
}

async function pickBestVideoForPlan(
  plan: BlockVideoSearchPlan,
  tradeName: string,
  blockName: string,
  excludeIds: Set<string>,
): Promise<DiscoveredBlockVideo | null> {
  if (!hasJinaApiKey()) {
    throw new Error(
      "JINA_API_KEY is not set. Get a key at https://jina.ai/?sui=apikey",
    );
  }

  const queries = normalizeQueries(plan.searchQuery, plan.altQueries ?? []);
  let best: { hit: JinaVideoHit; score: number; query: string } | null = null;

  for (const query of queries) {
    const hits = await searchJinaYoutubeVideos(query, {
      num: 20,
      excludeShorts: true,
    });
    for (const hit of hits) {
      if (excludeIds.has(hit.youtubeId)) continue;
      if (isYoutubeShortVideo(hit.url, hit.title, hit.description)) continue;
      const score = scoreBlockVideoHit(hit, plan, tradeName, blockName);
      if (score < 0) continue;
      if (!best || score > best.score) {
        best = { hit, score, query };
      }
    }
    if (best && best.score >= 5) break;
  }

  if (!best || best.score < 0) return null;

  return {
    youtubeId: best.hit.youtubeId,
    title: best.hit.title,
    description: best.hit.description,
    searchQuery: best.query,
    topicLabel: plan.topicLabel,
    relevanceScore: best.score,
  };
}

export async function discoverBlockLearningVideos(input: {
  tradeCode: string;
  tradeName: string;
  blockCode: string;
  blockName: string;
  chapterTasks: RsosChapterTask[];
  maxVideos?: number;
}): Promise<DiscoveredBlockVideo[]> {
  const maxVideos = clampBlockVideoCount(input.maxVideos);
  const plan = await generateBlockVideoSearchPlan({
    ...input,
    targetCount: maxVideos,
  });
  const usedIds = new Set<string>();
  const results: DiscoveredBlockVideo[] = [];

  for (const searchPlan of plan) {
    if (results.length >= maxVideos) break;
    const video = await pickBestVideoForPlan(
      searchPlan,
      input.tradeName,
      input.blockName,
      usedIds,
    );
    if (video) {
      usedIds.add(video.youtubeId);
      results.push(video);
    }
  }

  if (results.length === 0) {
    throw new Error(
      `No suitable YouTube videos found for Block ${input.blockCode}. Try again or refine block content.`,
    );
  }

  return results;
}

export { JINA_VIDEO_SEARCH_SYSTEM_PROMPT };
