import type { RsosBlock } from "@/types";
import type { Question } from "@/types";

export interface MockExamBlueprint {
  questionCount: number;
  timeMinutes: number;
  blockDistribution: Record<string, number>;
  typeDistribution: { recall: number; application: number; critical: number };
}

export function buildBlueprint(blocks: RsosBlock[], totalQuestions: number): MockExamBlueprint {
  // Official exam weights per RSOS block — independent of practice bank size.
  const blockDistribution: Record<string, number> = {};
  let assigned = 0;

  blocks.forEach((block, index) => {
    if (index === blocks.length - 1) {
      blockDistribution[block.id] = totalQuestions - assigned;
    } else {
      const count = block.exam_question_count;
      blockDistribution[block.id] = count;
      assigned += count;
    }
  });

  return {
    questionCount: totalQuestions,
    timeMinutes: 240,
    blockDistribution,
    typeDistribution: { recall: 0.2, application: 0.65, critical: 0.15 },
  };
}

export function sampleQuestionsForMockExam(
  allQuestions: Question[],
  blueprint: MockExamBlueprint,
  blocks: RsosBlock[]
): Question[] {
  const selected: Question[] = [];
  const usedIds = new Set<string>();

  for (const block of blocks) {
    const needed = blueprint.blockDistribution[block.id] ?? 0;
    const blockQuestions = allQuestions.filter((q) => q.block_id === block.id);
    const shuffled = [...blockQuestions].sort(() => Math.random() - 0.5);

    let picked = 0;
    for (const q of shuffled) {
      if (picked >= needed) break;
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
        picked++;
      }
    }

    // Fill gaps from any remaining questions for this trade
    while (picked < needed) {
      const fallback = allQuestions.find((q) => !usedIds.has(q.id));
      if (!fallback) break;
      selected.push(fallback);
      usedIds.add(fallback.id);
      picked++;
    }
  }

  return selected.sort(() => Math.random() - 0.5);
}

export function calculateExamScore(
  questions: Question[],
  answers: Record<string, string>
): { score: number; passed: boolean; blockScores: Record<string, { correct: number; total: number }> } {
  let correct = 0;
  const blockScores: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const blockId = q.block_id ?? "unknown";
    if (!blockScores[blockId]) blockScores[blockId] = { correct: 0, total: 0 };
    blockScores[blockId].total++;
    if (answer === q.correct_option) {
      correct++;
      blockScores[blockId].correct++;
    }
  }

  const score = questions.length ? (correct / questions.length) * 100 : 0;
  return { score, passed: score >= 70, blockScores };
}

export function calculateReadinessScore(blockScores: Record<string, number>): number {
  const values = Object.values(blockScores);
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
