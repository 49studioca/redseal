import OpenAI from "openai";
import type { ReferenceChunk } from "@/types";
import type { QuestionOption } from "@/types";
import { normalizeContentBlocks } from "@/lib/content/normalize-content-blocks";
import { formatBlockMediaForPrompt } from "@/data/block-media";

// Chat generation goes through OpenRouter (OpenAI-compatible API).
const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

// OpenRouter has no embeddings endpoint, so embeddings still use OpenAI directly.
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface GenerateQuestionInput {
  tradeCode: string;
  tradeName: string;
  subtaskName: string;
  blockName: string;
  questionType: "recall" | "application" | "critical";
  difficulty: number;
  codeVersion?: string;
  retrievedChunks: ReferenceChunk[];
  tradeProfile?: {
    glossary?: Record<string, string>;
    code_standards?: string[];
    distractor_patterns?: string[];
    system_prompt_suffix?: string;
  };
}

export interface GeneratedQuestion {
  stem: string;
  options: QuestionOption[];
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  code_citations: { rule_number: string; section_title?: string; excerpt?: string }[];
  requires_reference: boolean;
}

export interface GeneratedLesson {
  title: string;
  summary: string;
  content_blocks: { type: string; content: string; meta?: Record<string, unknown> }[];
  estimated_minutes: number;
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

function formatChunksForPrompt(chunks: ReferenceChunk[]) {
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] Rule ${c.rule_number ?? "N/A"} — ${c.section_title ?? ""}\n${c.content}`
    )
    .join("\n\n");
}

export async function generateQuestion(
  input: GenerateQuestionInput
): Promise<GeneratedQuestion> {
  if (!openrouter) {
    return mockGenerateQuestion(input);
  }

  const chunkContext = formatChunksForPrompt(input.retrievedChunks);
  const systemPrompt = `You are an expert Red Seal exam question writer for Canadian trades.
Generate exam-quality multiple choice questions aligned with RSOS standards.
Use Canadian codes and standards only — never US NEC or IPC.
${input.tradeProfile?.system_prompt_suffix ?? ""}

CRITICAL: For each wrong option (distractor), you MUST provide distractor_rationale explaining the specific student mistake that would lead someone to pick it (e.g., "Student forgot to convert mm to m").
Distractors must be plausible and diagnose common errors — never random wrong numbers.

Return valid JSON only with this shape:
{
  "stem": "...",
  "options": [{"key":"A","text":"...","distractor_rationale":"..."}, ...],
  "correct_option": "B",
  "explanation": "... with code citations",
  "code_citations": [{"rule_number":"...","section_title":"...","excerpt":"..."}],
  "requires_reference": true/false
}`;

  const userPrompt = `Trade: ${input.tradeName} (${input.tradeCode})
Block: ${input.blockName}
Subtask: ${input.subtaskName}
Question type: ${input.questionType}
Difficulty: ${input.difficulty}/5
Code version: ${input.codeVersion ?? "current"}

Reference material (cite these in your explanation):
${chunkContext || "No reference chunks — use general trade knowledge but note if reference would be needed."}

Glossary: ${JSON.stringify(input.tradeProfile?.glossary ?? {})}
Common distractor patterns: ${(input.tradeProfile?.distractor_patterns ?? []).join(", ")}`;

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");
  return JSON.parse(content) as GeneratedQuestion;
}


const CHAPTER_LESSON_SYSTEM_PROMPT = `You are an expert Red Seal trade instructor writing lessons for Canadian apprentices preparing for certification.
Use Canadian codes and standards only — never US NEC, IPC, or OSHA-centric guidance unless noting a Canadian equivalent.

Write DEEP TEACHING CONTENT — not an exam study guide or RSOS task checklist.

DO:
- Teach how to DO the work: procedures, calculations, code rules, tooling, safety, troubleshooting
- Organize by TOPIC (e.g. "Fixture Unit Method", "Lockout / Tagout") — not by RSOS task codes
- Write 10–16 content_blocks with substantive paragraphs (3–5 sentences each)
- Include at least 2 callouts (meta.variant: "tip" or "warning") with practical jobsite advice
- Include at least 1 worked example; use "math" blocks with LaTeX for formulas
- Include at least 1 "video" block (YouTube ID in content, title in meta) and 1 "image" block (image URL in content, alt/caption in meta) — use entries from the curated media catalog when provided
- In math JSON strings, escape every LaTeX backslash twice (e.g. \\\\frac, \\\\text, \\\\) so JSON parsing preserves them
- math "content" must be one LaTeX string only — never a nested JSON object; put example narration in a following "text" block
- End with 1–2 "check_question" blocks that test applied understanding (meta.answer required; meta.steps optional for multi-step calcs)
- Cite specific code rules/tables from the reference material when provided
- Use trade-accurate units (metric primary, imperial in parentheses where common on jobsites)

DO NOT:
- Open with "This block covers N RSOS tasks" or exam question counts
- Use headings like "A-1 — Task name" or list tasks without teaching the underlying skill
- Write vague filler ("Key concepts and exam focus areas for...")
- Mention exam percentages, question counts, or "review before practice questions"
- Produce fewer than 8 content blocks

Return valid JSON only:
{
  "title": "Descriptive topic title (not 'Chapter A: ...' or 'Block A: ...')",
  "summary": "One sentence describing what the learner will be able to do after this lesson",
  "content_blocks": [
    {"type": "heading", "content": "..."},
    {"type": "text", "content": "..."},
    {"type": "math", "content": "\\\\text{slope} = \\\\frac{\\\\text{rise}}{\\\\text{run}}"},
    {"type": "video", "content": "RWn-dp9gBvA", "meta": {"title": "How to identify PVC pipes"}},
    {"type": "image", "content": "https://example.com/photo.jpg", "meta": {"alt": "Description", "caption": "Caption"}},
    {"type": "callout", "content": "...", "meta": {"variant": "tip"|"warning"}},
    {"type": "check_question", "content": "Prompt", "meta": {"answer": "...", "steps": "optional multi-line solution"}}
  ],
  "estimated_minutes": number
}`;

export async function generateChapterLesson(input: {
  tradeName: string;
  tradeCode: string;
  blockCode: string;
  blockName: string;
  blockId?: string;
  chapterTasks: { code: string; name: string; exam_question_count: number }[];
  retrievedChunks: ReferenceChunk[];
  codeVersion?: string;
  tradeProfile?: {
    glossary?: Record<string, string>;
    code_standards?: string[];
    calculation_templates?: string[];
  };
}): Promise<GeneratedLesson> {
  const taskScope = input.chapterTasks
    .map((t) => `${t.code}: ${t.name}`)
    .join("; ");

  if (!openrouter) {
    return mockGenerateChapterLesson(input);
  }

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: CHAPTER_LESSON_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Trade: ${input.tradeName} (${input.tradeCode})
RSOS block scope: ${input.blockName}
Code version: ${input.codeVersion ?? "current"}

Use the RSOS tasks below only to define WHAT topics to teach — do not structure the lesson as a task list:
${taskScope}

Reference material (cite rule numbers and tables from here):
${formatChunksForPrompt(input.retrievedChunks) || "No reference chunks — use accurate Canadian trade knowledge for this block."}

Glossary: ${JSON.stringify(input.tradeProfile?.glossary ?? {})}
Code standards: ${(input.tradeProfile?.code_standards ?? []).join(", ")}
Calculation topics to cover if relevant: ${(input.tradeProfile?.calculation_templates ?? []).join(", ") || "none specified"}

Curated media for this block (include these video/image blocks in content_blocks):
${formatBlockMediaForPrompt(input.tradeCode, input.blockCode)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  return normalizeLessonMath(
    JSON.parse(response.choices[0]?.message?.content ?? "{}") as GeneratedLesson,
  );
}

function normalizeLessonMath(lesson: GeneratedLesson): GeneratedLesson {
  return {
    ...lesson,
    content_blocks: normalizeContentBlocks(
      lesson.content_blocks as import("@/types").ContentBlock[],
    ) as GeneratedLesson["content_blocks"],
  };
}

export async function generateLesson(input: {
  tradeName: string;
  subtaskName: string;
  blockName: string;
  retrievedChunks: ReferenceChunk[];
  codeVersion?: string;
}): Promise<GeneratedLesson> {
  if (!openrouter) {
    return {
      title: `${input.subtaskName} Fundamentals`,
      summary: `Core concepts for ${input.subtaskName} in ${input.tradeName}.`,
      content_blocks: [
        { type: "heading", content: "Overview" },
        { type: "text", content: `This lesson covers essential knowledge for ${input.subtaskName}.` },
        { type: "callout", content: "Study this section before attempting practice questions.", meta: { variant: "tip" } },
      ],
      estimated_minutes: 15,
    };
  }

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: CHAPTER_LESSON_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Trade: ${input.tradeName}
RSOS block scope: ${input.blockName}
Subtask focus: ${input.subtaskName}

Reference material:
${formatChunksForPrompt(input.retrievedChunks) || "No reference chunks — use accurate Canadian trade knowledge."}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  return JSON.parse(response.choices[0]?.message?.content ?? "{}") as GeneratedLesson;
}

export async function generateFlashcardsFromLesson(lessonTitle: string, lessonContent: string): Promise<GeneratedFlashcard[]> {
  if (!openrouter) {
    return [
      { front: `Key concept from ${lessonTitle}?`, back: "See lesson for details." },
    ];
  }

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: "Create 5 spaced-repetition flashcards. Return JSON: { flashcards: [{ front, back }] }" },
      { role: "user", content: `Lesson: ${lessonTitle}\n${lessonContent}` },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}");
  return parsed.flashcards ?? [];
}

export interface WordTranslation {
  translation: string;
  definition: string;
  context_explanation: string;
}

export async function translateWord(input: {
  word: string;
  targetLanguage: string;
  targetLanguageLabel: string;
  contextSnippet: string;
  tradeName?: string;
}): Promise<WordTranslation> {
  if (!openrouter) {
    return mockTranslateWord(input);
  }

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: `You help Canadian Red Seal trade apprentices understand difficult English words in lesson content.
${input.targetLanguage === "en"
  ? "Explain the word in clear, simple English suitable for someone learning trade terminology."
  : `Explain words clearly for someone whose first language is ${input.targetLanguageLabel}. Use simple language.`}
Focus on trade-relevant meaning when the word appears in a technical context.

Return valid JSON only:
{
  "translation": "${input.targetLanguage === "en" ? "same word or simpler English equivalent" : `word or phrase in ${input.targetLanguageLabel}`}",
  "definition": "short English definition (1-2 sentences)",
  "context_explanation": "${input.targetLanguage === "en" ? "what this word means in the given sentence context, in simple English (2-3 sentences)" : `what this word means in the given sentence context, in ${input.targetLanguageLabel} (2-3 sentences)`}"
}`,
      },
      {
        role: "user",
        content: `Word: ${input.word}
Trade context: ${input.tradeName ?? "Red Seal trade exam prep"}
Sentence context: ${input.contextSnippet || "No surrounding context provided."}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");
  return JSON.parse(content) as WordTranslation;
}

function mockTranslateWord(input: {
  word: string;
  targetLanguageLabel: string;
}): WordTranslation {
  return {
    translation: `[${input.targetLanguageLabel}] ${input.word}`,
    definition: `A technical term used in Red Seal trade lessons.`,
    context_explanation: `In this context, "${input.word}" refers to a concept covered in your trade training.`,
  };
}

export async function embedText(text: string): Promise<number[]> {
  if (!openai) {
    return Array(1536).fill(0).map((_, i) => Math.sin(i + text.length) * 0.1);
  }
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0]?.embedding ?? [];
}

function mockGenerateChapterLesson(input: {
  tradeName: string;
  tradeCode: string;
  blockCode: string;
  blockName: string;
  blockId?: string;
  chapterTasks: { code: string; name: string; exam_question_count: number }[];
  codeVersion?: string;
}): GeneratedLesson {
  return {
    title: input.blockName,
    summary: `Run npm run db:generate-content with OPENROUTER_API_KEY to generate this lesson.`,
    content_blocks: [
      { type: "heading", content: input.blockName },
      {
        type: "text",
        content: `AI-generated lesson content for ${input.tradeName} Block ${input.blockCode} is not available yet. Configure OPENROUTER_API_KEY and run: npm run db:generate-content -- --trade=${input.tradeCode} --block=${input.blockCode}`,
      },
      {
        type: "callout",
        content: "Lessons are stored in Supabase after generation — not hardcoded in the app.",
        meta: { variant: "tip" },
      },
    ],
    estimated_minutes: 20,
  };
}

function mockGenerateQuestion(input: GenerateQuestionInput): GeneratedQuestion {
  return {
    stem: `[Demo] ${input.questionType} question for ${input.subtaskName} (${input.tradeCode})`,
    options: [
      { key: "A", text: "Option A", distractor_rationale: "Student misread the code section." },
      { key: "B", text: "Correct answer", distractor_rationale: "This is the correct answer per code." },
      { key: "C", text: "Option C", distractor_rationale: "Student applied wrong formula." },
      { key: "D", text: "Option D", distractor_rationale: "Student confused similar rules." },
    ],
    correct_option: "B",
    explanation: `Based on ${input.codeVersion ?? "current code"} requirements for ${input.blockName}.`,
    code_citations: input.retrievedChunks.slice(0, 1).map((c) => ({
      rule_number: c.rule_number ?? "N/A",
      section_title: c.section_title,
      excerpt: c.content.slice(0, 100),
    })),
    requires_reference: input.questionType === "application",
  };
}
