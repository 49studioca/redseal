import OpenAI from "openai";
import type { ReferenceChunk } from "@/types";
import type { QuestionOption } from "@/types";
import { normalizeContentBlocks } from "@/lib/content/normalize-content-blocks";
import { hasCheckAnswer } from "@/lib/content/check-question-meta";
import { formatProvincePromptForTrade } from "@/lib/content/province-content";
import {
  formatBlockMediaForPrompt,
  getBlockMedia,
} from "@/data/block-media";
import { embedText, hasEmbeddingProvider } from "@/lib/ai/embeddings";
import {
  validateGeneratedFlashcards,
  validateGeneratedLesson,
  validateGeneratedQuestion,
} from "@/lib/ai/generation-quality";

export { embedText, hasEmbeddingProvider };

// Chat generation goes through OpenRouter (OpenAI-compatible API).
const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export interface GenerateQuestionInput {
  tradeCode: string;
  tradeName: string;
  subtaskName: string;
  taskCode?: string;
  blockName: string;
  questionType: "recall" | "application" | "critical";
  difficulty: number;
  codeVersion?: string;
  province?: string;
  retrievedChunks: ReferenceChunk[];
  learningFocus?: string;
  previousStems?: string[];
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
  code_citations: {
    rule_number: string;
    section_title?: string;
    excerpt?: string;
    doc_id?: string;
  }[];
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
  const client = openrouter;

  const chunkContext = formatChunksForPrompt(input.retrievedChunks);
  const systemPrompt = `You are an expert Red Seal exam question writer for Canadian trades.
Generate one exam-quality multiple-choice question aligned with the stated RSOS task.
Use Canadian codes and standards only — never US NEC or IPC.
${input.tradeProfile?.system_prompt_suffix ?? ""}

LEARNING DESIGN:
- Require retrieval, application, interpretation, or diagnosis; never merely recognition of an obvious definition.
- Test one assessable decision and include every fact needed to answer it.
- For application and critical-thinking items, use a realistic jobsite situation, observation, drawing description, measurement, or test result.
- Match difficulty through reasoning depth, not obscure trivia or intentionally confusing wording.
- Do not reveal the answer through option length, grammar, absolutes, or repeated wording from the stem.

SOURCE SAFETY:
- Treat supplied reference excerpts as the only authority for specific code, rule, and table claims.
- Never invent a rule number, quotation, source, table value, or code requirement.
- If no excerpt supports a specific code claim, write a general trade-knowledge question and return code_citations: [].

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

  const provinceContext = formatProvincePromptForTrade(
    input.province,
    input.tradeCode,
  );

  const userPrompt = `Trade: ${input.tradeName} (${input.tradeCode})
Block: ${input.blockName}
RSOS task: ${input.taskCode ? `${input.taskCode}: ` : ""}${input.subtaskName}
Question type: ${input.questionType}
Difficulty: ${input.difficulty}/5
Learning focus: ${input.learningFocus ?? "apply the task accurately in realistic conditions"}
Code version: ${input.codeVersion ?? "current"}
${provinceContext ? `\n${provinceContext}\n` : ""}
Reference material (cite these in your explanation):
${chunkContext || "No verified reference excerpts were supplied. Do not cite or assert a specific code value; return code_citations: [] and requires_reference: false."}

Glossary: ${JSON.stringify(input.tradeProfile?.glossary ?? {})}
Common distractor patterns: ${(input.tradeProfile?.distractor_patterns ?? []).join(", ")}`;

  const priorStemContext = (input.previousStems ?? [])
    .slice(-8)
    .map((stem, index) => `${index + 1}. ${stem}`)
    .join("\n");

  const requestOnce = async (retryHint?: string) => {
    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${userPrompt}\n\n${
            priorStemContext
              ? `Questions already generated for this task. Create a materially different scenario and decision:\n${priorStemContext}`
              : "This is the first question for this task."
          }${retryHint ? `\n\n${retryHint}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: retryHint ? 0.35 : 0.45,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");
    return validateGeneratedQuestion(
      JSON.parse(content) as GeneratedQuestion,
      input.retrievedChunks,
      input.previousStems,
    );
  };

  try {
    return await requestOnce();
  } catch (firstError) {
    try {
      return await requestOnce(
        "RETRY: Return exactly four options as an array with keys A, B, C, and D, each with non-empty text. Distractors need distractor_rationale. Do not invent code citations.",
      );
    } catch {
      throw firstError instanceof Error
        ? firstError
        : new Error("Question generation failed validation.");
    }
  }
}


const CHAPTER_LESSON_SYSTEM_PROMPT = `You are an expert Red Seal trade instructor writing lessons for Canadian apprentices preparing for certification.
Use Canadian codes and standards only — never US NEC, IPC, or OSHA-centric guidance unless noting a Canadian equivalent.

Write DEEP TEACHING CONTENT — not an exam study guide or RSOS task checklist.

DO:
- Follow this learning sequence: activate prior knowledge → build a mental model → demonstrate a worked example → guide a partially completed example → present a new jobsite transfer scenario → schedule retrieval checks
- Teach how to DO the work: procedures, calculations, code rules, tooling, safety, troubleshooting
- Cover every RSOS task in the user prompt — each task area must appear as taught content (group related tasks under topic headings; do not skip any)
- Organize by TOPIC (e.g. "Fixture Unit Method", "Lockout / Tagout") — not by RSOS task codes
- Include at least 3 "heading" blocks that open distinct sections (retrieval, model/procedure, transfer). Never put section titles inside "text" blocks.
- Write 10–16 content_blocks with substantive paragraphs (3–5 sentences each)
- Include at least 2 callouts (meta.variant: "tip" or "warning") with practical jobsite advice
- Include at least 1 fully worked example and 1 guided example that withholds one decision or calculation step from the learner; write them as "text"/"math" blocks (never custom types like guided_example)
- Use ONLY these block types: heading, text, math, video, image, callout, check_question
- Include video/image blocks only when exact blocks are supplied in the curated media catalog; never invent or substitute a media URL or YouTube ID
- In math JSON strings, escape every LaTeX backslash twice (e.g. \\\\frac, \\\\text, \\\\) so JSON parsing preserves them
- math "content" must be one LaTeX string only — never a nested JSON object; put example narration in a following "text" block
- Never put \\(...\\) delimiters or English sentences inside math blocks — formula only in math; explanation in the next text block
- For inline variables in text blocks use \\(L\\) only once — never repeat the plain letter after it (wrong: \\(L\\) L, correct: \\(L\\) is)
- For display formulas use a dedicated "math" block with LaTeX — not \\[...\\] inside text blocks
- Include at least 3 "check_question" blocks across the lesson: an early retrieval check, a guided-practice check, and a final transfer check (meta.answer required; meta.steps optional for multi-step calculations)
- check_question meta.answer: use plain English, or LaTeX with \\text{} and \\frac{} then a semicolon and variable definitions (e.g. \\text{Voltage Drop} = \\frac{2LI R}{1000}; L = length in meters)
- Cite specific code rules/tables from the reference material when provided
- Never invent citations. If the retrieved material does not support a precise code claim, label it as general practice and tell the learner to verify the adopted code or manufacturer instructions.
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

const TASK_LESSON_SYSTEM_PROMPT = `You are an expert Red Seal trade instructor writing a focused lesson for ONE RSOS exam task within a larger block.
Use Canadian codes and standards only — never US NEC or OSHA-centric guidance unless noting a Canadian equivalent.

Write DEEP TEACHING CONTENT for this single task — not a checklist and not a thin overview.

DO:
- Follow this learning sequence: retrieval warm-up → mental model → demonstrated procedure → worked example → guided example → troubleshooting transfer → spaced-review prompts
- Teach how to DO this specific work: procedures, calculations, code rules, tooling, safety, troubleshooting, commissioning, and maintenance
- Write 10–14 content_blocks with substantive paragraphs (4–6 sentences each). Prefer depth over brevity.
- Start with a "heading", then alternate teaching "text" with callouts / worked examples
- Include at least 3 "heading" blocks total — retrieval warm-up, procedure/model, and transfer/troubleshooting. Never put section titles inside "text" blocks.
- Include at least 2 callouts (meta.variant: "tip" or "warning") with practical jobsite advice
- Include at least 1 fully worked example and 1 guided example that withholds one decision or calculation step; write them as "text"/"math" blocks (never custom types like guided_example or worked_example)
- Use ONLY these block types: heading, text, math, video, image, callout, check_question
- Include at least 1 "video" block and 1 "image" block when curated media is provided
- Use ONLY the video/image blocks from the curated media catalog — do not substitute other YouTube IDs or image URLs
- EVERY block MUST include both "type" and string "content" — never omit type; never put objects in content
- video content = YouTube ID string; image content = image URL or asset path string; math content = LaTeX string
- In math JSON strings, escape every LaTeX backslash twice (e.g. \\\\frac, \\\\text)
- Include at least 3 "check_question" blocks across the lesson: retrieval, guided practice, and jobsite transfer. Each MUST include meta.answer and meta.steps when showing calculation work.
- check_question meta.answer: concise model answer (plain English or LaTeX with \\text{}); cite CEC rule numbers when relevant
- Use a specific rule number only when it appears in the supplied reference material; never fabricate a citation

DO NOT:
- Cover other RSOS tasks from the same block — stay focused on the one task given
- Open with exam question counts or "this task covers..."
- Use headings like "B-7 — Task name" without teaching content beneath
- Produce fewer than 10 content blocks
- Return blocks that only have "content" with no "type"

Return valid JSON only:
{
  "title": "Descriptive topic title for this task (not 'Task B-7: ...')",
  "summary": "One sentence describing what the learner can do after this lesson",
  "content_blocks": [
    {"type": "heading", "content": "..."},
    {"type": "text", "content": "..."},
    {"type": "callout", "content": "...", "meta": {"variant": "tip"}},
    {"type": "math", "content": "V_d = \\\\frac{2 \\\\times K \\\\times I \\\\times L}{CM}"},
    {"type": "check_question", "content": "What is the maximum allowable voltage drop for branch circuits?", "meta": {"answer": "3% of system voltage (CEC Rule 8-102(1)(a))."}}
  ],
  "estimated_minutes": number
}`;

function normalizeLessonMath(lesson: GeneratedLesson): GeneratedLesson {
  return {
    ...lesson,
    content_blocks: normalizeContentBlocks(
      lesson.content_blocks as import("@/types").ContentBlock[],
    ) as GeneratedLesson["content_blocks"],
  };
}

export async function fillMissingCheckQuestionAnswers(
  lesson: GeneratedLesson,
  context: {
    tradeName: string;
    tradeCode: string;
    codeVersion?: string;
  },
): Promise<GeneratedLesson> {
  const blocks = lesson.content_blocks.map((block) => ({
    ...block,
    meta: block.meta ? { ...block.meta } : undefined,
  }));

  const missing = blocks
    .map((block, index) => ({ block, index }))
    .filter(
      ({ block }) =>
        block.type === "check_question" && !hasCheckAnswer(block.meta),
    );

  if (missing.length === 0 || !openrouter) {
    return { ...lesson, content_blocks: blocks };
  }

  const lessonExcerpt = blocks
    .filter((block) => block.type !== "check_question")
    .map((block) => block.content)
    .join("\n\n")
    .slice(0, 6000);

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You write model answers for Canadian Red Seal lesson check-your-work prompts. Use Canadian Electrical Code (CEC) references when relevant. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Trade: ${context.tradeName} (${context.tradeCode})
Code version: ${context.codeVersion ?? "CEC-2024"}
Lesson: ${lesson.title}
${lesson.summary ? `Summary: ${lesson.summary}` : ""}

Lesson content:
${lessonExcerpt}

Write a concise model answer for each check question (1–3 sentences). For calculations, include the key formula and result in meta.answer; put step-by-step work in meta.steps when helpful.

Return JSON:
{
  "answers": [
    {"answer": "...", "steps": "optional"},
    ...
  ]
}

Questions:
${missing.map(({ block }, i) => `${i + 1}. ${block.content}`).join("\n")}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}") as {
    answers?: Array<{ answer?: string; steps?: string }>;
  };

  for (let i = 0; i < missing.length; i++) {
    const generated = parsed.answers?.[i];
    if (!generated?.answer?.trim()) continue;
    const { index } = missing[i];
    blocks[index].meta = {
      ...blocks[index].meta,
      answer: generated.answer.trim(),
      ...(generated.steps?.trim() ? { steps: generated.steps.trim() } : {}),
    };
  }

  return normalizeLessonMath({ ...lesson, content_blocks: blocks });
}

async function finalizeGeneratedLesson(
  lesson: GeneratedLesson,
  context: {
    tradeName: string;
    tradeCode: string;
    blockCode: string;
    taskCode?: string;
    codeVersion?: string;
  },
): Promise<GeneratedLesson> {
  const withAnswers = await fillMissingCheckQuestionAnswers(
    normalizeLessonMath(lesson),
    context,
  );
  const media = getBlockMedia(
    context.tradeCode,
    context.blockCode,
    context.taskCode,
  );
  return validateGeneratedLesson(withAnswers, {
    minimumBlocks: context.taskCode ? 10 : 12,
    allowedVideoIds: media?.video ? [media.video.youtubeId] : [],
    allowedImageSources: (media?.images ?? []).map((image) => image.src),
  }) as GeneratedLesson;
}

export async function generateChapterLesson(input: {
  tradeName: string;
  tradeCode: string;
  blockCode: string;
  blockName: string;
  blockId?: string;
  chapterTasks: { code: string; name: string; exam_question_count: number }[];
  retrievedChunks: ReferenceChunk[];
  codeVersion?: string;
  province?: string;
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

  const provinceContext = formatProvincePromptForTrade(
    input.province,
    input.tradeCode,
  );

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
${provinceContext ? `\n${provinceContext}\n` : ""}
RSOS tasks for this block (from the official Red Seal Occupational Standard — teach all of them):
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

  return finalizeGeneratedLesson(
    JSON.parse(response.choices[0]?.message?.content ?? "{}") as GeneratedLesson,
    {
      tradeName: input.tradeName,
      tradeCode: input.tradeCode,
      blockCode: input.blockCode,
      codeVersion: input.codeVersion,
    },
  );
}

export async function generateTaskLesson(input: {
  tradeName: string;
  tradeCode: string;
  blockCode: string;
  blockName: string;
  task: { code: string; name: string; exam_question_count: number };
  retrievedChunks: ReferenceChunk[];
  codeVersion?: string;
  province?: string;
  tradeProfile?: {
    glossary?: Record<string, string>;
    code_standards?: string[];
    calculation_templates?: string[];
  };
}): Promise<GeneratedLesson> {
  if (!openrouter) {
    return mockGenerateChapterLesson({
      tradeName: input.tradeName,
      tradeCode: input.tradeCode,
      blockCode: input.blockCode,
      blockName: input.blockName,
      chapterTasks: [input.task],
      codeVersion: input.codeVersion,
    });
  }

  const provinceContext = formatProvincePromptForTrade(
    input.province,
    input.tradeCode,
  );

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: TASK_LESSON_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Trade: ${input.tradeName} (${input.tradeCode})
RSOS block context: ${input.blockName} (Block ${input.blockCode})
RSOS task (teach ONLY this task in depth): ${input.task.code}: ${input.task.name}
Code version: ${input.codeVersion ?? "current"}
${provinceContext ? `\n${provinceContext}\n` : ""}
Reference material (cite rule numbers and tables from here):
${formatChunksForPrompt(input.retrievedChunks) || "No reference chunks — use accurate Canadian trade knowledge for this task."}

Glossary: ${JSON.stringify(input.tradeProfile?.glossary ?? {})}
Code standards: ${(input.tradeProfile?.code_standards ?? []).join(", ")}
Calculation topics to cover if relevant: ${(input.tradeProfile?.calculation_templates ?? []).join(", ") || "none specified"}

Curated media for this block (include when relevant):
${formatBlockMediaForPrompt(input.tradeCode, input.blockCode, input.task.code)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  return finalizeGeneratedLesson(
    JSON.parse(response.choices[0]?.message?.content ?? "{}") as GeneratedLesson,
    {
      tradeName: input.tradeName,
      tradeCode: input.tradeCode,
      blockCode: input.blockCode,
      taskCode: input.task.code,
      codeVersion: input.codeVersion,
    },
  );
}

export async function generateLesson(input: {
  tradeName: string;
  subtaskName: string;
  blockName: string;
  tradeCode?: string;
  province?: string;
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

  const provinceContext = formatProvincePromptForTrade(
    input.province,
    input.tradeCode ?? "",
  );

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
${provinceContext ? `\n${provinceContext}\n` : ""}
Reference material:
${formatChunksForPrompt(input.retrievedChunks) || "No reference chunks — use accurate Canadian trade knowledge."}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  return JSON.parse(response.choices[0]?.message?.content ?? "{}") as GeneratedLesson;
}

export async function generateFlashcardsFromLesson(
  lessonTitle: string,
  lessonContent: string,
): Promise<GeneratedFlashcard[]> {
  if (!openrouter) {
    return [
      { front: `Key concept from ${lessonTitle}?`, back: "See lesson for details." },
    ];
  }

  const response = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: `Create 8–10 high-quality spaced-repetition flashcards from the supplied lesson only.

Cover a deliberate mix of:
- terminology or conditions that require exact retrieval
- a procedure step or correct sequence
- a formula, unit, threshold, or code condition when present
- safety-critical decisions
- troubleshooting from symptom to likely cause or next test
- discrimination between two commonly confused concepts

Each card must test one idea, be answerable without seeing the lesson, and use a concise but explanatory answer. Avoid yes/no questions, vague prompts such as "What is important?", and duplicate facts. Do not introduce facts or citations absent from the lesson.

Return JSON only: { "flashcards": [{ "front": "...", "back": "..." }] }`,
      },
      { role: "user", content: `Lesson: ${lessonTitle}\n${lessonContent}` },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}") as {
    flashcards?: GeneratedFlashcard[];
  };
  return validateGeneratedFlashcards(parsed.flashcards ?? []);
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
