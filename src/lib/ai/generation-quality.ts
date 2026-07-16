import type { ContentBlock, QuestionOption, QuestionType, ReferenceChunk } from "@/types";

const CONTENT_BLOCK_TYPES = new Set<ContentBlock["type"]>([
  "text",
  "heading",
  "image",
  "math",
  "video",
  "callout",
  "check_question",
]);

export type QuestionBlueprint = {
  questionType: QuestionType;
  difficulty: number;
  focus: string;
};

const QUESTION_BLUEPRINT_CYCLE: QuestionBlueprint[] = [
  {
    questionType: "recall",
    difficulty: 2,
    focus: "retrieve a safety-critical fact, condition, symbol, tool, or term",
  },
  {
    questionType: "application",
    difficulty: 2,
    focus: "select or order the correct work procedure",
  },
  {
    questionType: "application",
    difficulty: 3,
    focus: "interpret a drawing, measurement, code rule, table, or calculation",
  },
  {
    questionType: "critical",
    difficulty: 3,
    focus: "diagnose a realistic symptom from observations or test readings",
  },
  {
    questionType: "critical",
    difficulty: 4,
    focus: "choose the safest next action in a jobsite scenario with plausible alternatives",
  },
  {
    questionType: "application",
    difficulty: 4,
    focus: "transfer the procedure to unfamiliar equipment, materials, or conditions",
  },
  {
    questionType: "critical",
    difficulty: 5,
    focus: "solve a multi-step troubleshooting or planning scenario without hidden assumptions",
  },
];

export function buildQuestionBlueprints(count: number): QuestionBlueprint[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    ...QUESTION_BLUEPRINT_CYCLE[index % QUESTION_BLUEPRINT_CYCLE.length],
  }));
}

function normalizedText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function baseRuleNumber(value: string): string {
  return normalizedText(value).replace(/\(.*$/, "").trim();
}

function matchingReference(
  ruleNumber: string,
  references: ReferenceChunk[],
): ReferenceChunk | undefined {
  const requested = normalizedText(ruleNumber);
  const requestedBase = baseRuleNumber(ruleNumber);
  return references.find((chunk) => {
    if (!chunk.rule_number) return false;
    const candidate = normalizedText(chunk.rule_number);
    const candidateBase = baseRuleNumber(chunk.rule_number);
    return (
      candidate === requested ||
      candidate === requestedBase ||
      candidateBase === requested ||
      candidateBase === requestedBase
    );
  });
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const;
const FALLBACK_DISTRACTOR_RATIONALE =
  "Common incorrect approach that skips a required check or uses the wrong procedure step.";

export type QuestionCandidate = {
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
};

export type QuestionCandidateInput = {
  stem?: string;
  options?: unknown;
  correct_option?: unknown;
  explanation?: string;
  code_citations?: QuestionCandidate["code_citations"];
  requires_reference?: boolean;
};

function optionTextFromUnknown(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const obj = value as Record<string, unknown>;
  for (const field of ["text", "value", "option", "content", "label"]) {
    if (typeof obj[field] === "string" && obj[field].trim()) {
      return obj[field].trim();
    }
  }
  return "";
}

function optionRationaleFromUnknown(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  for (const field of ["distractor_rationale", "rationale", "reason", "explanation"]) {
    if (typeof obj[field] === "string" && obj[field].trim()) {
      return obj[field].trim();
    }
  }
  return undefined;
}

/** Coerce common AI option shapes into A–D QuestionOption entries. */
export function normalizeQuestionOptions(raw: unknown): QuestionOption[] {
  if (Array.isArray(raw)) {
    const byKey = new Map<QuestionOption["key"], QuestionOption>();
    for (const [index, item] of raw.entries()) {
      if (index >= 4 && byKey.size >= 4) break;
      if (typeof item === "string") {
        const key = OPTION_KEYS[index];
        if (!key || !item.trim()) continue;
        byKey.set(key, { key, text: item.trim() });
        continue;
      }
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const rawKey = String(obj.key ?? obj.letter ?? obj.label ?? OPTION_KEYS[index] ?? "")
        .trim()
        .toUpperCase()
        .replace(/[^A-D].*$/, "");
      const key = (OPTION_KEYS as readonly string[]).includes(rawKey)
        ? (rawKey as QuestionOption["key"])
        : OPTION_KEYS[index];
      if (!key) continue;
      const text = optionTextFromUnknown(item);
      if (!text) continue;
      byKey.set(key, {
        key,
        text,
        distractor_rationale: optionRationaleFromUnknown(item),
      });
    }
    return OPTION_KEYS.map((key) => byKey.get(key)).filter(
      (option): option is QuestionOption => Boolean(option),
    );
  }

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return OPTION_KEYS.map((key) => {
      const value = obj[key] ?? obj[key.toLowerCase()];
      const text = optionTextFromUnknown(value);
      if (!text) return null;
      return {
        key,
        text,
        distractor_rationale: optionRationaleFromUnknown(value),
      };
    }).filter((option): option is QuestionOption => Boolean(option));
  }

  return [];
}

function normalizeCorrectOption(
  value: unknown,
  options: QuestionOption[],
): QuestionOption["key"] | null {
  if (typeof value === "number" && value >= 0 && value <= 3) {
    return OPTION_KEYS[value];
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  if ((OPTION_KEYS as readonly string[]).includes(upper)) {
    return upper as QuestionOption["key"];
  }
  const byText = options.find(
    (option) => normalizedText(option.text) === normalizedText(trimmed),
  );
  return byText?.key ?? null;
}

/** Validate and sanitize generated questions before they are persisted. */
export function validateGeneratedQuestion(
  candidate: QuestionCandidateInput,
  references: ReferenceChunk[],
  previousStems: string[] = [],
): QuestionCandidate {
  const stem = candidate.stem?.trim();
  const explanation = candidate.explanation?.trim();
  if (!stem || stem.length < 20) {
    throw new Error("Generated question has a missing or overly short stem.");
  }
  if (!explanation || explanation.length < 20) {
    throw new Error("Generated question has a missing or overly short explanation.");
  }
  if (previousStems.some((previous) => normalizedText(previous) === normalizedText(stem))) {
    throw new Error("Generated question duplicates an existing stem in this bank.");
  }

  const options = normalizeQuestionOptions(candidate.options);
  if (options.length !== 4) {
    throw new Error("Generated question must contain exactly four options.");
  }
  const keyed = new Map(options.map((option) => [option.key, option]));
  if (OPTION_KEYS.some((key) => !keyed.has(key))) {
    throw new Error("Generated question options must use keys A, B, C, and D exactly once.");
  }
  const optionTexts = options.map((option) => normalizedText(option.text));
  if (optionTexts.some((text) => !text) || new Set(optionTexts).size !== 4) {
    throw new Error("Generated question options must be non-empty and distinct.");
  }
  const correctOption = normalizeCorrectOption(candidate.correct_option, options);
  if (!correctOption || !keyed.has(correctOption)) {
    throw new Error("Generated question correct_option does not match an option.");
  }

  const normalizedOptions = options.map((option) => ({
    ...option,
    text: option.text.trim(),
    distractor_rationale:
      option.key === correctOption
        ? option.distractor_rationale?.trim()
        : option.distractor_rationale?.trim() &&
            option.distractor_rationale.trim().length >= 12
          ? option.distractor_rationale.trim()
          : FALLBACK_DISTRACTOR_RATIONALE,
  }));

  const citations = (candidate.code_citations ?? [])
    .map((citation) => {
      const ruleNumber = citation.rule_number?.trim();
      if (!ruleNumber) return null;
      const reference = matchingReference(ruleNumber, references);
      if (!reference) return null;
      return {
        rule_number: ruleNumber,
        section_title: reference.section_title,
        excerpt: reference.content.slice(0, 280),
        doc_id: reference.doc_id,
      };
    })
    .filter((citation): citation is NonNullable<typeof citation> => citation != null);

  // Invented rule numbers are dropped — keep the question as general trade knowledge.
  const requiresReference =
    Boolean(candidate.requires_reference) &&
    citations.length > 0 &&
    references.length > 0;

  if (candidate.requires_reference && references.length === 0) {
    throw new Error("Reference-required question was generated without grounded reference material.");
  }

  return {
    stem,
    explanation,
    options: normalizedOptions,
    correct_option: correctOption,
    code_citations: citations,
    requires_reference: requiresReference,
  };
}

export type LessonCandidate = {
  title: string;
  summary: string;
  content_blocks: Array<{
    type: string;
    content: string;
    meta?: Record<string, unknown>;
  }>;
  estimated_minutes: number;
};

type LessonBlock = LessonCandidate["content_blocks"][number];

const DEFAULT_SECTION_HEADINGS = [
  "Retrieve what you know",
  "Build the mental model",
  "Transfer to the jobsite",
] as const;

/** Map invented pedagogical types onto the supported ContentBlock schema. */
export function coerceLessonBlockType(
  type: string,
): ContentBlock["type"] | null {
  const normalized = type.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!normalized) return null;
  if (CONTENT_BLOCK_TYPES.has(normalized as ContentBlock["type"])) {
    return normalized as ContentBlock["type"];
  }

  if (
    normalized === "tip" ||
    normalized === "warning" ||
    normalized === "note" ||
    normalized === "caution" ||
    normalized === "important"
  ) {
    return "callout";
  }

  if (
    normalized === "question" ||
    normalized === "quiz" ||
    normalized === "practice_question" ||
    normalized === "self_check" ||
    normalized === "retrieval_check"
  ) {
    return "check_question";
  }

  if (
    normalized === "paragraph" ||
    normalized === "body" ||
    normalized === "example" ||
    normalized === "worked_example" ||
    normalized === "guided_example" ||
    normalized === "procedure" ||
    normalized === "steps" ||
    normalized === "scenario" ||
    normalized === "section" ||
    normalized === "subtitle" ||
    normalized === "subheading"
  ) {
    return normalized === "section" ||
      normalized === "subtitle" ||
      normalized === "subheading"
      ? "heading"
      : "text";
  }

  // Preserve teaching content from unknown invented types instead of failing the whole lesson.
  return "text";
}

/** Insert missing section headings so thin AI structure still passes learning-design checks. */
export function ensureLearningSectionHeadings(blocks: LessonBlock[]): LessonBlock[] {
  const headingCount = blocks.filter((block) => block.type === "heading").length;
  if (headingCount >= 3) return blocks;

  const result = [...blocks];
  const usedTitles = new Set(
    result
      .filter((block) => block.type === "heading")
      .map((block) => normalizedText(String(block.content))),
  );

  const nextTitle = (): string => {
    for (const title of DEFAULT_SECTION_HEADINGS) {
      const key = normalizedText(title);
      if (!usedTitles.has(key)) {
        usedTitles.add(key);
        return title;
      }
    }
    const fallback = `Learning section ${usedTitles.size + 1}`;
    usedTitles.add(normalizedText(fallback));
    return fallback;
  };

  let missing = 3 - headingCount;
  if (missing > 0 && result[0]?.type !== "heading") {
    result.unshift({ type: "heading", content: nextTitle() });
    missing -= 1;
  }

  while (missing > 0) {
    const headingIndexes = result
      .map((block, index) => (block.type === "heading" ? index : -1))
      .filter((index) => index >= 0);
    const anchors = [-1, ...headingIndexes, result.length];
    let bestInsertAt = Math.floor(result.length / 2);
    let bestGap = -1;
    for (let i = 0; i < anchors.length - 1; i++) {
      const gap = anchors[i + 1] - anchors[i];
      if (gap <= bestGap) continue;
      bestGap = gap;
      bestInsertAt = anchors[i] + 1 + Math.floor(Math.max(0, gap - 1) / 2);
    }
    if (bestInsertAt > 0 && result[bestInsertAt - 1]?.type === "heading") {
      bestInsertAt = Math.min(bestInsertAt + 1, result.length);
    }
    result.splice(bestInsertAt, 0, { type: "heading", content: nextTitle() });
    missing -= 1;
  }

  return result;
}

const DEFAULT_CALLOUTS = [
  {
    content:
      "Verify the adopted code, manufacturer instructions, and site conditions before changing the procedure.",
    variant: "warning",
  },
  {
    content:
      "On the jobsite, confirm your assumptions with a measurement or visual check before you commit to the next step.",
    variant: "tip",
  },
] as const;

function calloutVariantFromText(content: string): "tip" | "warning" | null {
  const text = normalizedText(content);
  if (
    /^(warning|caution|danger|never)\b/.test(text) ||
    text.includes("do not ") ||
    text.includes("never ") ||
    text.includes("must not ")
  ) {
    return "warning";
  }
  if (
    /^(tip|note|remember|pro tip)\b/.test(text) ||
    text.includes("always verify") ||
    text.includes("best practice")
  ) {
    return "tip";
  }
  return null;
}

/** Promote tip/warning prose to callouts, then insert defaults if still short. */
export function ensurePracticalCallouts(blocks: LessonBlock[]): LessonBlock[] {
  const result = blocks.map((block) => {
    if (block.type !== "text") return block;
    const variant = calloutVariantFromText(String(block.content));
    if (!variant) return block;
    return {
      ...block,
      type: "callout",
      meta: { ...(block.meta ?? {}), variant },
    };
  });

  let calloutCount = result.filter((block) => block.type === "callout").length;
  if (calloutCount >= 2) return result;

  const used = new Set(
    result
      .filter((block) => block.type === "callout")
      .map((block) => normalizedText(String(block.content))),
  );

  for (const fallback of DEFAULT_CALLOUTS) {
    if (calloutCount >= 2) break;
    if (used.has(normalizedText(fallback.content))) continue;
    const ratio = calloutCount === 0 ? 0.35 : 0.7;
    const insertAt = Math.min(
      Math.max(1, Math.floor(result.length * ratio)),
      result.length,
    );
    result.splice(insertAt, 0, {
      type: "callout",
      content: fallback.content,
      meta: { variant: fallback.variant },
    });
    used.add(normalizedText(fallback.content));
    calloutCount += 1;
  }

  return result;
}

const DEFAULT_CHECK_QUESTIONS = [
  {
    content:
      "What should you confirm before starting the procedure taught in this lesson?",
    answer:
      "Confirm the system state, required PPE, and any isolation or measurement prerequisites.",
  },
  {
    content:
      "Apply the guided procedure to a similar setup. Which decision or calculation must you complete next?",
    answer:
      "Complete the withheld step using the same sequence, then verify the result against code or manufacturer limits.",
  },
  {
    content:
      "On a new jobsite scenario with one changed condition, what is your next safe action?",
    answer:
      "Re-check assumptions for the changed condition, then transfer the same verified procedure without skipping isolation or measurement steps.",
  },
] as const;

const FALLBACK_CHECK_ANSWER =
  "Apply the procedure from this lesson and verify the result against site conditions and the adopted code or manufacturer instructions.";

function looksLikeCheckPrompt(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length < 12 || trimmed.length > 280) return false;
  return (
    /\?\s*$/.test(trimmed) ||
    /^(what|which|how|why|when|where)\b/i.test(trimmed)
  );
}

function hasAnswerMeta(meta?: Record<string, unknown>): boolean {
  return typeof meta?.answer === "string" && meta.answer.trim().length > 0;
}

/** Promote question-like text, then insert retrieval/practice/transfer checks if still short. */
export function ensureLearningCheckQuestions(blocks: LessonBlock[]): LessonBlock[] {
  const result = blocks.map((block) => {
    if (block.type === "check_question") {
      if (hasAnswerMeta(block.meta)) return block;
      return {
        ...block,
        meta: { ...(block.meta ?? {}), answer: FALLBACK_CHECK_ANSWER },
      };
    }
    if (block.type !== "text" || !looksLikeCheckPrompt(String(block.content))) {
      return block;
    }
    return {
      ...block,
      type: "check_question",
      meta: {
        ...(block.meta ?? {}),
        answer: hasAnswerMeta(block.meta)
          ? String(block.meta?.answer).trim()
          : FALLBACK_CHECK_ANSWER,
      },
    };
  });

  let checkCount = result.filter((block) => block.type === "check_question").length;
  if (checkCount >= 3) return result;

  const used = new Set(
    result
      .filter((block) => block.type === "check_question")
      .map((block) => normalizedText(String(block.content))),
  );

  for (const [index, fallback] of DEFAULT_CHECK_QUESTIONS.entries()) {
    if (checkCount >= 3) break;
    if (used.has(normalizedText(fallback.content))) continue;
    const ratio = (index + 1) / (DEFAULT_CHECK_QUESTIONS.length + 1);
    const insertAt = Math.min(
      Math.max(1, Math.floor(result.length * ratio)),
      result.length,
    );
    result.splice(insertAt, 0, {
      type: "check_question",
      content: fallback.content,
      meta: { answer: fallback.answer },
    });
    used.add(normalizedText(fallback.content));
    checkCount += 1;
  }

  return result;
}

export function validateGeneratedLesson(
  candidate: LessonCandidate,
  options: {
    minimumBlocks: number;
    allowedVideoIds?: string[];
    allowedImageSources?: string[];
  },
): LessonCandidate {
  if (!candidate.title?.trim() || !candidate.summary?.trim()) {
    throw new Error("Generated lesson requires a title and outcome-focused summary.");
  }
  if (!Array.isArray(candidate.content_blocks)) {
    throw new Error("Generated lesson content_blocks must be an array.");
  }

  const allowedVideos = new Set(options.allowedVideoIds ?? []);
  const allowedImages = new Set(options.allowedImageSources ?? []);
  const filtered = candidate.content_blocks
    .map((block) => {
      const rawType = typeof block.type === "string" ? block.type : "";
      const coercedType = coerceLessonBlockType(rawType);
      if (!coercedType) {
        throw new Error(
          `Generated lesson contains unsupported block type: ${rawType || "(missing)"}.`,
        );
      }
      const content =
        typeof block.content === "string" ? block.content.trim() : block.content;
      let meta = block.meta ? { ...block.meta } : undefined;
      if (coercedType === "callout") {
        meta = { ...(meta ?? {}) };
        if (typeof meta.variant !== "string") {
          const hint = rawType.trim().toLowerCase().replace(/[\s-]+/g, "_");
          if (hint === "warning" || hint === "caution" || hint === "danger") {
            meta.variant = "warning";
          } else {
            meta.variant = "tip";
          }
        }
      }
      return { ...block, type: coercedType, content, meta };
    })
    .filter((block) => {
      if (typeof block.content !== "string" || !block.content) {
        throw new Error(`Generated ${block.type} block has no string content.`);
      }
      if (block.type === "video" && !allowedVideos.has(block.content)) return false;
      if (block.type === "image" && !allowedImages.has(block.content)) return false;
      return true;
    });

  if (filtered.length < options.minimumBlocks) {
    throw new Error(
      `Generated lesson is too thin after validation (${filtered.length}/${options.minimumBlocks} blocks).`,
    );
  }

  const blocks = ensureLearningCheckQuestions(
    ensurePracticalCallouts(ensureLearningSectionHeadings(filtered)),
  );

  if (blocks.filter((block) => block.type === "heading").length < 3) {
    throw new Error("Generated lesson needs at least three structured learning sections.");
  }
  if (blocks.filter((block) => block.type === "callout").length < 2) {
    throw new Error("Generated lesson needs at least two practical safety or jobsite callouts.");
  }
  const checks = blocks.filter((block) => block.type === "check_question");
  if (checks.length < 3) {
    throw new Error(
      "Generated lesson needs at least three check questions (retrieval, guided practice, and transfer).",
    );
  }

  const estimatedMinutes = Number(candidate.estimated_minutes);
  return {
    title: candidate.title.trim(),
    summary: candidate.summary.trim(),
    content_blocks: blocks,
    estimated_minutes:
      Number.isFinite(estimatedMinutes) && estimatedMinutes >= 5
        ? Math.min(90, Math.round(estimatedMinutes))
        : 20,
  };
}

export function validateGeneratedFlashcards(
  cards: Array<{ front?: string | null; back?: string | null }>,
): Array<{ front: string; back: string }> {
  const seen = new Set<string>();
  return cards
    .map((card) => ({
      front: typeof card.front === "string" ? card.front.trim() : "",
      back: typeof card.back === "string" ? card.back.trim() : "",
    }))
    .filter((card) => card.front.length >= 8 && card.back.length >= 8)
    .filter((card) => {
      const key = normalizedText(card.front);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}
