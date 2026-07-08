import { PROVINCIAL_GUIDES } from "@/data/seed";
import {
  formatProvincePromptContext,
  getProvinceByCode,
  getTradeCodeAdoption,
  normalizeProvinceCode,
  type ProvinceCode,
} from "@/lib/provinces";
import type { ContentBlock, Lesson, Question } from "@/types";

export type ProvincialStudyContext = {
  provinceCode: ProvinceCode;
  provinceName: string;
  codeAdoption: string;
  localCodeName: string;
  nationalCode: string;
  examInfo?: string;
  guideSlug?: string;
};

export function getProvincialStudyContext(
  tradeId: string,
  tradeCode: string,
  provinceCode?: string | null,
): ProvincialStudyContext {
  const code = normalizeProvinceCode(provinceCode);
  const province = getProvinceByCode(code);
  const adoption = getTradeCodeAdoption(tradeCode, code);
  const guide = PROVINCIAL_GUIDES.find(
    (g) => g.trade_id === tradeId && g.province_code === code,
  );

  return {
    provinceCode: code,
    provinceName: province.name,
    codeAdoption: guide?.code_adoption ?? adoption.codeAdoption,
    localCodeName: adoption.localCodeName,
    nationalCode: adoption.nationalCode,
    examInfo: guide?.exam_info,
    guideSlug: guide?.slug ?? province.slug,
  };
}

export function formatProvincePromptForTrade(
  provinceCode: string | undefined,
  tradeCode: string,
): string {
  if (!provinceCode) return "";
  return formatProvincePromptContext(normalizeProvinceCode(provinceCode), tradeCode);
}

export function resolveLessonsForProvince(
  lessons: Lesson[],
  province?: string | null,
): Lesson[] {
  const code = province ? normalizeProvinceCode(province) : null;
  const byBlock = new Map<string, Lesson[]>();

  for (const lesson of lessons) {
    const key = lesson.block_id ?? lesson.slug;
    const list = byBlock.get(key) ?? [];
    list.push(lesson);
    byBlock.set(key, list);
  }

  const resolved: Lesson[] = [];
  for (const blockLessons of byBlock.values()) {
    if (!code) {
      const national = blockLessons.filter((lesson) => !lesson.province);
      resolved.push(...(national.length > 0 ? national : blockLessons));
      continue;
    }

    const provincial = blockLessons.filter((lesson) => lesson.province === code);
    const national = blockLessons.filter((lesson) => !lesson.province);
    resolved.push(...(provincial.length > 0 ? provincial : national));
  }

  return resolved.sort((a, b) => a.sort_order - b.sort_order);
}

export function resolveQuestionsForProvince(
  questions: Question[],
  province?: string | null,
): Question[] {
  const code = province ? normalizeProvinceCode(province) : null;
  const byBlock = new Map<string, Question[]>();
  const withoutBlock: Question[] = [];

  for (const question of questions) {
    if (!question.block_id) {
      withoutBlock.push(question);
      continue;
    }
    const list = byBlock.get(question.block_id) ?? [];
    list.push(question);
    byBlock.set(question.block_id, list);
  }

  const resolved: Question[] = [...withoutBlock];
  for (const blockQuestions of byBlock.values()) {
    if (!code) {
      const national = blockQuestions.filter((question) => !question.province);
      resolved.push(...(national.length > 0 ? national : blockQuestions));
      continue;
    }

    const provincial = blockQuestions.filter(
      (question) => question.province === code,
    );
    const national = blockQuestions.filter((question) => !question.province);
    resolved.push(...(provincial.length > 0 ? provincial : national));
  }

  return resolved;
}

export function enrichLessonBlocksForProvince(
  blocks: ContentBlock[],
  tradeId: string,
  tradeCode: string,
  provinceCode?: string | null,
): ContentBlock[] {
  if (!provinceCode) return blocks;
  if (blocks.some((block) => block.meta?.province_note === true)) return blocks;

  const ctx = getProvincialStudyContext(tradeId, tradeCode, provinceCode);
  const intro: ContentBlock = {
    type: "callout",
    content: `${ctx.provinceName} (${ctx.provinceCode}): ${ctx.codeAdoption} Red Seal exam answers follow the national ${ctx.nationalCode} standard — provincial differences below apply to jobsite work in your province.`,
    meta: { variant: "tip", province_note: true },
  };

  return [intro, ...blocks];
}

export function enrichQuestionForProvince(
  question: Question,
  tradeId: string,
  tradeCode: string,
  provinceCode?: string | null,
): Question {
  if (!provinceCode || question.province) return question;

  const ctx = getProvincialStudyContext(tradeId, tradeCode, provinceCode);
  const note = ` (${ctx.provinceName} jobsites may follow ${ctx.localCodeName}; Red Seal exam uses ${ctx.nationalCode}.)`;

  return {
    ...question,
    explanation: question.explanation.includes(ctx.provinceName)
      ? question.explanation
      : `${question.explanation}${note}`,
  };
}

export function enrichQuestionsForProvince(
  questions: Question[],
  tradeId: string,
  tradeCode: string,
  provinceCode?: string | null,
): Question[] {
  return questions.map((question) =>
    enrichQuestionForProvince(question, tradeId, tradeCode, provinceCode),
  );
}
