import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuestionBlueprints,
  validateGeneratedFlashcards,
  validateGeneratedLesson,
  validateGeneratedQuestion,
} from "@/lib/ai/generation-quality";
import type { ReferenceChunk } from "@/types";

const references: ReferenceChunk[] = [
  {
    id: "chunk-1",
    doc_id: "doc-1",
    rule_number: "8-102",
    section_title: "Voltage drop",
    content: "Rule 8-102 sets requirements used when assessing voltage drop.",
    code_version: "CEC-2024",
  },
];

test("question blueprints mix retrieval, application, and transfer", () => {
  const blueprints = buildQuestionBlueprints(7);
  assert.equal(blueprints.length, 7);
  assert.deepEqual(
    new Set(blueprints.map((blueprint) => blueprint.questionType)),
    new Set(["recall", "application", "critical"]),
  );
  assert.equal(blueprints.at(-1)?.difficulty, 5);
});

test("question validation grounds citations in retrieved material", () => {
  const question = validateGeneratedQuestion(
    {
      stem: "A branch circuit has excessive voltage drop. Which check should the electrician perform first?",
      options: [
        { key: "A", text: "Measure the conductor run", distractor_rationale: "Correct option." },
        { key: "B", text: "Replace the panel", distractor_rationale: "Skips diagnosis and assumes the supply equipment failed." },
        { key: "C", text: "Increase breaker size", distractor_rationale: "Confuses overcurrent protection with voltage-drop correction." },
        { key: "D", text: "Remove grounding", distractor_rationale: "Confuses the bonding path with circuit conductor sizing." },
      ],
      correct_option: "A",
      explanation: "Measure the run and load before applying the voltage-drop calculation.",
      code_citations: [{ rule_number: "8-102(1)(a)", excerpt: "invented" }],
      requires_reference: true,
    },
    references,
  );

  assert.equal(question.code_citations[0]?.doc_id, "doc-1");
  assert.equal(question.code_citations[0]?.excerpt, references[0].content);
});

test("question validation normalizes object-shaped options", () => {
  const question = validateGeneratedQuestion(
    {
      stem: "A panel shows intermittent faults under load. What should the electrician check first?",
      options: {
        A: "Load current and voltage at the affected circuit",
        b: { text: "Replace the main breaker immediately", rationale: "Skips diagnosis and assumes the supply equipment failed." },
        C: "Paint the enclosure",
        D: "Remove the grounding conductor",
      },
      correct_option: "a",
      explanation: "Measure the circuit under load before changing equipment so the fault can be confirmed.",
      code_citations: [],
      requires_reference: false,
    },
    references,
  );

  assert.equal(question.options.length, 4);
  assert.equal(question.correct_option, "A");
  assert.equal(question.options[1]?.key, "B");
  assert.ok((question.options[1]?.distractor_rationale?.length ?? 0) >= 12);
});

test("question validation drops invented citations", () => {
  const question = validateGeneratedQuestion(
    {
      stem: "A worker is preparing equipment for service. What must be confirmed before work starts?",
      options: [
        { key: "A", text: "Energy isolation", distractor_rationale: "Correct option." },
        { key: "B", text: "Paint colour", distractor_rationale: "Focuses on appearance instead of hazardous energy." },
        { key: "C", text: "Delivery date", distractor_rationale: "Confuses scheduling with the pre-work safety check." },
        { key: "D", text: "Invoice number", distractor_rationale: "Uses administrative data instead of equipment status." },
      ],
      correct_option: "A",
      explanation: "The worker must verify isolation before beginning the service procedure.",
      code_citations: [{ rule_number: "2-024" }, { rule_number: "8-102" }],
      requires_reference: true,
    },
    references,
  );

  assert.deepEqual(
    question.code_citations.map((citation) => citation.rule_number),
    ["8-102"],
  );
  assert.equal(question.requires_reference, true);
});

test("question validation clears reference requirement when all citations are ungrounded", () => {
  const question = validateGeneratedQuestion(
    {
      stem: "A worker is preparing equipment for service. What must be confirmed before work starts?",
      options: [
        { key: "A", text: "Energy isolation", distractor_rationale: "Correct option." },
        { key: "B", text: "Paint colour", distractor_rationale: "Focuses on appearance instead of hazardous energy." },
        { key: "C", text: "Delivery date", distractor_rationale: "Confuses scheduling with the pre-work safety check." },
        { key: "D", text: "Invoice number", distractor_rationale: "Uses administrative data instead of equipment status." },
      ],
      correct_option: "A",
      explanation: "The worker must verify isolation before beginning the service procedure.",
      code_citations: [{ rule_number: "2-024" }],
      requires_reference: true,
    },
    references,
  );

  assert.deepEqual(question.code_citations, []);
  assert.equal(question.requires_reference, false);
});

test("lesson validation removes media that was not curated", () => {
  const lesson = validateGeneratedLesson(
    {
      title: "Safe fault diagnosis",
      summary: "Diagnose a fault using a safe, repeatable test sequence.",
      estimated_minutes: 24,
      content_blocks: [
        { type: "heading", content: "Retrieve what you know" },
        { type: "text", content: "Begin by identifying the system state and known symptoms." },
        { type: "check_question", content: "What is the first decision?", meta: { answer: "Confirm a safe test state." } },
        { type: "heading", content: "Model and procedure" },
        { type: "callout", content: "Verify isolation before changing connections.", meta: { variant: "warning" } },
        { type: "text", content: "Follow the documented sequence and record each observation." },
        {
          type: "check_question",
          content: "Apply the procedure to a similar setup.",
          meta: { answer: "Repeat the same isolation checks before testing." },
        },
        { type: "video", content: "invented-video" },
        { type: "heading", content: "Transfer to a new fault" },
        { type: "callout", content: "Change one variable at a time.", meta: { variant: "tip" } },
        { type: "check_question", content: "Which test comes next?", meta: { answer: "Select the test that separates the remaining causes." } },
      ],
    },
    { minimumBlocks: 10 },
  );

  assert.equal(lesson.content_blocks.some((block) => block.type === "video"), false);
  assert.equal(lesson.content_blocks.length, 10);
});

test("lesson validation coerces invented example block types to text", () => {
  const lesson = validateGeneratedLesson(
    {
      title: "Guided voltage-drop practice",
      summary: "Complete a partially worked voltage-drop check on a branch circuit.",
      estimated_minutes: 20,
      content_blocks: [
        { type: "heading", content: "Retrieve what you know" },
        { type: "text", content: "Voltage drop depends on length, current, and conductor resistance." },
        { type: "check_question", content: "Which variables are required?", meta: { answer: "Length, current, and resistance." } },
        { type: "heading", content: "Worked and guided practice" },
        {
          type: "guided_example",
          content: "A 30 m run carries 16 A on 12 AWG copper. Complete the missing resistance step, then decide whether the drop is acceptable.",
        },
        { type: "callout", content: "Prove the meter on a known live source first.", meta: { variant: "warning" } },
        { type: "check_question", content: "What step was withheld?", meta: { answer: "Looking up or calculating conductor resistance." } },
        { type: "heading", content: "Transfer to the jobsite" },
        { type: "callout", content: "Recheck assumptions when ambient temperature changes.", meta: { variant: "tip" } },
        { type: "text", content: "Apply the same incomplete setup to aluminum feeders and explain the next measurement." },
        { type: "check_question", content: "What changes for aluminum?", meta: { answer: "Use the aluminum resistance or K factor before judging drop." } },
      ],
    },
    { minimumBlocks: 10 },
  );

  assert.equal(
    lesson.content_blocks.some((block) => block.type === "guided_example"),
    false,
  );
  assert.ok(
    lesson.content_blocks.some(
      (block) =>
        block.type === "text" &&
        block.content.includes("Complete the missing resistance step"),
    ),
  );
});

test("lesson validation inserts missing check questions", () => {
  const lesson = validateGeneratedLesson(
    {
      title: "Branch-circuit checks",
      summary: "Decide the next safe measurement when diagnosing a loaded circuit.",
      estimated_minutes: 18,
      content_blocks: [
        { type: "heading", content: "Retrieve what you know" },
        { type: "text", content: "Start from symptoms, then choose the least invasive confirming measurement." },
        { type: "text", content: "What measurement should you take first?" },
        { type: "heading", content: "Build the mental model" },
        { type: "callout", content: "Prove the meter before trusting a dead reading.", meta: { variant: "warning" } },
        { type: "text", content: "Record voltage, load current, and conductor size before judging voltage drop." },
        { type: "callout", content: "Change one variable at a time while troubleshooting.", meta: { variant: "tip" } },
        { type: "heading", content: "Transfer to the jobsite" },
        { type: "text", content: "Transfer the same sequence when the feeder material changes from copper to aluminum." },
        { type: "text", content: "Keep notes so the next shift can continue the diagnosis without repeating unsafe steps." },
      ],
    },
    { minimumBlocks: 10 },
  );

  const checks = lesson.content_blocks.filter(
    (block) => block.type === "check_question",
  );
  assert.ok(checks.length >= 3);
  assert.ok(
    checks.every(
      (block) =>
        typeof block.meta?.answer === "string" &&
        String(block.meta.answer).length > 0,
    ),
  );
  assert.ok(
    checks.some((block) =>
      String(block.content).includes("What measurement should you take first?"),
    ),
  );
});

test("lesson validation inserts missing practical callouts", () => {
  const lesson = validateGeneratedLesson(
    {
      title: "Jobsite isolation checks",
      summary: "Prove equipment is safe to service before removing covers.",
      estimated_minutes: 16,
      content_blocks: [
        { type: "heading", content: "Retrieve what you know" },
        { type: "text", content: "Identify every energy source that can feed the equipment under test." },
        { type: "check_question", content: "What must be verified first?", meta: { answer: "Zero energy state." } },
        { type: "heading", content: "Build the mental model" },
        { type: "text", content: "Apply locks in the documented order and keep the key under personal control." },
        { type: "text", content: "Warning: never rely on a coworker saying the circuit is already dead." },
        { type: "check_question", content: "Which test confirms isolation?", meta: { answer: "Live-dead-live voltage test." } },
        { type: "heading", content: "Transfer to the jobsite" },
        { type: "text", content: "Repeat the same sequence when a generator backup can re-energize the panel." },
        {
          type: "check_question",
          content: "What changes with a second energy source?",
          meta: { answer: "Isolate and prove dead on every source before work." },
        },
      ],
    },
    { minimumBlocks: 10 },
  );

  assert.ok(
    lesson.content_blocks.filter((block) => block.type === "callout").length >= 2,
  );
  assert.ok(
    lesson.content_blocks.some(
      (block) =>
        block.type === "callout" &&
        String(block.content).includes("never rely on a coworker"),
    ),
  );
});

test("lesson validation inserts missing section headings", () => {
  const lesson = validateGeneratedLesson(
    {
      title: "Lockout sequence",
      summary: "Isolate hazardous energy before service work begins.",
      estimated_minutes: 18,
      content_blocks: [
        { type: "text", content: "Start by identifying every energy source that can feed the equipment." },
        { type: "check_question", content: "What must be verified first?", meta: { answer: "Zero energy state." } },
        { type: "text", content: "Apply locks and tags in the documented order before removing covers." },
        { type: "callout", content: "Never share a personal lock with another worker.", meta: { variant: "warning" } },
        { type: "text", content: "Prove isolation with a live-dead-live test on the circuit being serviced." },
        { type: "check_question", content: "Which test confirms isolation?", meta: { answer: "Live-dead-live voltage test." } },
        { type: "callout", content: "Keep spare locks staged for multi-source equipment.", meta: { variant: "tip" } },
        { type: "text", content: "Transfer the same sequence to a panel with backup generators present." },
        { type: "text", content: "Document who holds which lock before release is authorized." },
        {
          type: "check_question",
          content: "What changes when a second energy source is present?",
          meta: { answer: "Isolate and prove dead on every source before work." },
        },
      ],
    },
    { minimumBlocks: 10 },
  );

  assert.ok(
    lesson.content_blocks.filter((block) => block.type === "heading").length >= 3,
  );
  assert.equal(lesson.content_blocks[0]?.type, "heading");
});

test("flashcard validation drops incomplete or null fronts and backs", () => {
  const cards = validateGeneratedFlashcards([
    { front: "What is lockout?", back: "Isolate energy before service." },
    { front: null, back: "Missing front should be dropped." },
    { front: "Missing back should be dropped.", back: undefined },
    { front: "short", back: "also short" },
    { front: "What is lockout?", back: "Duplicate front should be dropped." },
  ]);

  assert.deepEqual(cards, [
    { front: "What is lockout?", back: "Isolate energy before service." },
  ]);
});
