import type { RsosBlock, RsosChapterTask, Question, Lesson, Flashcard, ProvincialGuide, TradeDetailContent } from "@/types";
import { ALL_TRADES } from "./all-trades";
import {
  ALL_RSOS_BLOCKS,
  ALL_CHAPTER_TASKS,
  RSOS_EXAM_DATA,
  UNMAPPED_TRADE_RSOS,
  type TradeRsosExamData,
} from "./rsos-exam-data";

export const TRADES = ALL_TRADES;

/** All RSOS exam blocks — official breakdowns from red-seal.ca + placeholders for unlisted trades. */
export const ALL_BLOCKS: RsosBlock[] = [
  ...ALL_RSOS_BLOCKS,
  ...UNMAPPED_TRADE_RSOS.flatMap((d) => d.blocks),
];

/** RSOS tasks within each exam chapter (block), from official Red Seal exam breakdowns. */
export const CHAPTER_TASKS: Record<string, RsosChapterTask[]> = ALL_CHAPTER_TASKS;

export function getRsosExamData(tradeId: string): TradeRsosExamData | undefined {
  return RSOS_EXAM_DATA[tradeId] ?? UNMAPPED_TRADE_RSOS.find((d) => d.tradeId === tradeId);
}

export function getExamQuestionCountForTrade(tradeId: string, fallback = 120): number {
  return getRsosExamData(tradeId)?.totalQuestions ?? fallback;
}

export const DEFAULT_CODE_VERSIONS: Record<string, string> = {
  "trade-309a": "CEC-2024",
  "trade-447a": "NPC-2020",
  "trade-276a": "W59-2018",
  "trade-442a": "CEC-2024",
};


/** Lessons, questions, flashcards: AI-generated via npm run db:generate-content */
export const ALL_QUESTIONS: Question[] = [];
export const SAMPLE_LESSONS: Lesson[] = [];
export const SAMPLE_FLASHCARDS: Flashcard[] = [];

/** Sample CEC excerpts for RAG + open-book viewer (expand via ingestion pipeline). */
export const REFERENCE_DOC_CEC_ID = "a0000000-0000-4000-8000-00000000cec0";

export const REFERENCE_DOCS = [
  {
    id: REFERENCE_DOC_CEC_ID,
    title: "Canadian Electrical Code (CEC)",
    doc_type: "CEC",
    code_version: "CEC-2024",
    storage_path: "cec-2024.pdf",
  },
];

export const REFERENCE_CHUNKS = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    doc_id: REFERENCE_DOC_CEC_ID,
    rule_number: "8-102(1)(a)",
    section_title: "Voltage Drop — Branch Circuits",
    content: "The voltage drop in branch circuits shall not exceed 3% of the system voltage at the farthest outlet of power, heating, or lighting loads.",
    page_number: 142,
    code_version: "CEC-2024",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    doc_id: REFERENCE_DOC_CEC_ID,
    rule_number: "26-724",
    section_title: "Arc-Fault Circuit Interrupters",
    content: "Branch circuits in dwelling units supplying receptacles in bedrooms, living rooms, dining rooms, and other specified areas shall be protected by an arc-fault circuit interrupter.",
    page_number: 312,
    code_version: "CEC-2024",
  },
];

export const PROVINCIAL_GUIDES: ProvincialGuide[] = [
  {
    id: "pg-309a-on",
    trade_id: "trade-309a",
    province_code: "ON",
    province_name: "Ontario",
    slug: "ontario",
    title: "How to Challenge the 309A Exam in Ontario",
    content: {
      sections: [
        { heading: "Apprenticeship Requirements", body: "Ontario requires 9,000 hours of on-the-job training plus 3 levels of in-school training through the Ministry of Labour, Immigration, Training and Skills Development." },
        { heading: "Exam Eligibility", body: "You may challenge the Certificate of Qualification exam after completing your apprenticeship or through the Trade Equivalency Assessment if you have significant experience." },
        { heading: "Code Adoption", body: "Ontario adopts the CEC with Ontario-specific amendments (OESC). The Red Seal exam uses the national standard." },
      ],
    },
    apprenticeship_hours: 9000,
    prerequisites: "Registered apprenticeship or TEA approval",
    code_adoption: "OESC (Ontario Electrical Safety Code) based on CEC",
    exam_info: "100 questions, 4 hours, 70% to pass, open-book (CEC permitted)",
    meta_description: "Complete guide to challenging the Construction Electrician 309A Red Seal exam in Ontario — hours, prerequisites, and code info.",
  },
  {
    id: "pg-309a-bc",
    trade_id: "trade-309a",
    province_code: "BC",
    province_name: "British Columbia",
    slug: "british-columbia",
    title: "How to Challenge the 309A Exam in BC",
    content: {
      sections: [
        { heading: "Apprenticeship Requirements", body: "BC requires approximately 6,000 workplace hours and 4 levels of technical training through SkilledTradesBC." },
        { heading: "Exam Eligibility", body: "Complete your apprenticeship program or apply for challenge through SkilledTradesBC with documented experience." },
        { heading: "Code Adoption", body: "BC adopts the CEC with BC-specific amendments. Red Seal exam uses national CEC standard." },
      ],
    },
    apprenticeship_hours: 6000,
    prerequisites: "SkilledTradesBC registration",
    code_adoption: "BC Electrical Code (based on CEC)",
    exam_info: "100 questions, 4 hours, 70% to pass, open-book",
    meta_description: "Guide to the 309A Red Seal exam in British Columbia — apprenticeship hours, challenge process, and provincial code info.",
  },
];

export const TRADE_GENERATION_PROFILES = {
  "trade-309a": {
    glossary: { conductor: "A wire or cable that carries electrical current", OCPD: "Overcurrent protective device" },
    code_standards: ["CEC-2024", "WHMIS-2015"],
    calculation_templates: ["voltage_drop", "conductor_ampacity", "box_fill"],
    distractor_patterns: ["confused feeder vs branch limits", "GFCI vs AFCI", "copper vs aluminum ampacity"],
  },
  "trade-447a": {
    glossary: { DWV: "Drainage, Waste, and Vent", fixture_unit: "Standardized measure of drainage load" },
    code_standards: ["NPC-2020", "WHMIS-2015"],
    calculation_templates: ["pipe_sizing", "vent_sizing", "slope_calculation"],
    distractor_patterns: ["wrong pipe slope for diameter", "confused vent and drainage sizing"],
  },
  "trade-276a": {
    glossary: { SMAW: "Shielded Metal Arc Welding", OCV: "Open-circuit voltage" },
    code_standards: ["CSA-W59", "WHMIS-2015"],
    calculation_templates: ["heat_input", "preheat_temperature"],
    distractor_patterns: ["confused arc voltage with OCV", "wrong electrode for base metal"],
  },
  "trade-442a": {
    glossary: {
      VFD: "Variable frequency drive — controls motor speed by varying frequency and voltage",
      PLC: "Programmable logic controller — industrial computer for automated control",
      MCC: "Motor control centre",
      OCPD: "Overcurrent protective device",
      "4-20mA": "Standard analog signal range for process instruments",
      RTD: "Resistance temperature detector",
      CT: "Current transformer",
      DCS: "Distributed control system",
      HMI: "Human machine interface",
    },
    code_standards: ["CEC-2024", "WHMIS-2015"],
    calculation_templates: ["voltage_drop", "conductor_ampacity", "transformer_sizing", "power_factor", "motor_current", "open_delta_capacity", "transmitter_scaling"],
    distractor_patterns: ["confused line vs phase voltage in three-phase", "AC vs DC motor maintenance procedure", "analog vs digital VOM test procedure", "delta vs wye transformer connections"],
  },
  "trade-carpenter": {
    glossary: {
      RSOS: "Red Seal Occupational Standard",
      OBC: "Ontario Building Code",
      NBC: "National Building Code of Canada",
      formwork: "Temporary moulds that hold concrete until it cures",
      ledger: "Horizontal member that supports joists, often attached to a building",
      on_centre: "Spacing measured from the centre of one member to the centre of the next",
      plumb: "Perfectly vertical",
      square: "At a true 90° angle",
    },
    code_standards: ["NBC", "WHMIS-2015"],
    calculation_templates: ["rise_run_stairs", "rafter_length", "stud_layout_oc", "concrete_volume", "board_feet"],
    distractor_patterns: ["confused on-centre vs clear spacing", "wrong stair rise/run combination", "formwork bracing vs form ties"],
  },
};

export const TRADE_DETAIL_OVERRIDES: Record<string, TradeDetailContent> = {
  "trade-447a": {
    trade_scope:
      "Plumbers plan, install, test and service plumbing fixtures and systems such as water, hydronic, drain, waste and vent (DWV), low pressure steam, residential fire, chemical and irrigation. They also install specialized systems such as medical gas, process piping, compressed air, water conditioners, fuel piping, sewage and water treatment, and storage and flow equipment.",
    red_seal_summary:
      "A Red Seal endorsement is a seal on your provincial or territorial trade certificate. It shows you have the knowledge and skills to practice your trade across Canada — earned by passing the interprovincial Red Seal exam.",
    noc_code: "72300",
    designation_year: 1958,
    designated_provinces: [
      "AB",
      "BC",
      "MB",
      "NB",
      "NL",
      "NS",
      "NT",
      "NU",
      "ON",
      "PE",
      "QC",
      "SK",
      "YT",
    ],
    alternate_title: "Pipe Fitter (Plumber) in Quebec",
    question_type_breakdown: [
      { type: "recall", label: "Knowledge and recall", range: "15–25%" },
      { type: "application", label: "Procedural and application", range: "60–70%" },
      { type: "critical", label: "Critical thinking", range: "10–20%" },
    ],
    exam_notes: [
      "Closed-book — mathematical formulas and acronyms are provided at the exam sitting",
      "Questions align with the Red Seal Occupational Standard (RSOS) for Plumber",
      "Not common core topics (e.g. low-pressure steam, potable water fire protection) are excluded from the national exam",
    ],
    official_links: [
      {
        label: "Red Seal Occupational Standard",
        href: "https://red-seal.ca/eng/trades/plumbers/overview.shtml",
        description: "Complete description of trade activities — the basis for exam questions",
      },
      {
        label: "Exam information & self-assessment",
        href: "https://red-seal.ca/eng/trades/plumbers/exam-information.shtml",
        description: "Question breakdown, types, formulas, and acronyms used on the exam",
      },
      {
        label: "Official sample questions",
        href: "https://red-seal.ca/eng/questions.shtml?tid=181",
        description: "Practice questions published by the Red Seal Program",
      },
      {
        label: "How to register",
        href: "https://red-seal.ca/eng/exam-registration.shtml",
        description: "Steps to register for your Red Seal examination",
      },
    ],
  },
  "trade-309a": {
    trade_scope:
      "Construction electricians plan, assemble, install, test, troubleshoot and repair electrical wiring, fixtures, control devices and related equipment in buildings and other structures.",
    red_seal_summary:
      "A Red Seal endorsement is a seal on your provincial or territorial trade certificate. It shows you have the knowledge and skills to practice your trade across Canada — earned by passing the interprovincial Red Seal exam.",
    question_type_breakdown: [
      { type: "recall", label: "Knowledge and recall", range: "15–25%" },
      { type: "application", label: "Procedural and application", range: "60–70%" },
      { type: "critical", label: "Critical thinking", range: "10–20%" },
    ],
    exam_notes: [
      "Open-book — Canadian Electrical Code (CEC) reference permitted",
      "Questions align with the Red Seal Occupational Standard (RSOS) for Construction Electrician",
    ],
    official_links: [
      {
        label: "Red Seal Occupational Standard",
        href: "https://red-seal.ca/eng/trades/constelectric/overview.shtml",
        description: "Complete description of trade activities — the basis for exam questions",
      },
      {
        label: "Exam information",
        href: "https://red-seal.ca/eng/trades/constelectric/exam-information.shtml",
        description: "Question breakdown and exam preparation resources",
      },
      {
        label: "How to register",
        href: "https://red-seal.ca/eng/exam-registration.shtml",
        description: "Steps to register for your Red Seal examination",
      },
    ],
  },
  "trade-442a": {
    trade_scope:
      "Industrial electricians install, maintain, test, troubleshoot and repair industrial electrical equipment and associated electrical and electronic controls. They work in plants, mills, mines, and processing facilities on power distribution, motors and drives, process control, and communication systems.",
    red_seal_summary:
      "A Red Seal endorsement is a seal on your provincial or territorial trade certificate. It shows you have the knowledge and skills to practice your trade across Canada — earned by passing the interprovincial Red Seal exam.",
    question_type_breakdown: [
      { type: "recall", label: "Knowledge and recall", range: "10–20%" },
      { type: "application", label: "Procedural and application", range: "35–45%" },
      { type: "critical", label: "Critical thinking", range: "40–50%" },
    ],
    exam_notes: [
      "Closed-book — mathematical formulas and acronyms are provided at the exam sitting",
      "100 questions, 4 hours, 70% to pass",
      "Questions align with the Red Seal Occupational Standard (RSOS) for Industrial Electrician",
      "Heavier critical-thinking weight than most trades — expect calculations and troubleshooting scenarios",
    ],
    official_links: [
      {
        label: "Red Seal Occupational Standard",
        href: "https://red-seal.ca/eng/trades/industrialelectric/overview.shtml",
        description: "Complete description of trade activities — the basis for exam questions",
      },
      {
        label: "RSOS full standard (PDF)",
        href: "https://red-seal.ca/_conf/assets/custom/docms/industrialelectric/rsos-eng.pdf",
        description: "Full RSOS with tasks, sub-tasks, and supporting knowledge requirements",
      },
      {
        label: "Exam information & self-assessment",
        href: "https://red-seal.ca/eng/trades/industrialelectric/exam-information.shtml",
        description: "Question breakdown, types, formulas, and acronyms used on the exam",
      },
      {
        label: "How to register",
        href: "https://red-seal.ca/eng/exam-registration.shtml",
        description: "Steps to register for your Red Seal examination",
      },
    ],
  },
  "trade-276a": {
    trade_scope:
      "Welders permanently join or sever metals, make parts used in metal construction, and repair parts and equipment using welding equipment. They work with ferrous and non-ferrous metals on pipes, vessels, plates, and structural components.",
    red_seal_summary:
      "A Red Seal endorsement is a seal on your provincial or territorial trade certificate. It shows you have the knowledge and skills to practice your trade across Canada — earned by passing the interprovincial Red Seal exam.",
    question_type_breakdown: [
      { type: "recall", label: "Knowledge and recall", range: "15–25%" },
      { type: "application", label: "Procedural and application", range: "60–70%" },
      { type: "critical", label: "Critical thinking", range: "10–20%" },
    ],
    exam_notes: [
      "Closed-book exam based on the Red Seal Occupational Standard (RSOS) for Welder",
    ],
    official_links: [
      {
        label: "Red Seal Occupational Standard",
        href: "https://red-seal.ca/eng/trades/weld/overview.shtml",
        description: "Complete description of trade activities — the basis for exam questions",
      },
      {
        label: "Exam information",
        href: "https://red-seal.ca/eng/trades/weld/exam-information.shtml",
        description: "Question breakdown and exam preparation resources",
      },
      {
        label: "How to register",
        href: "https://red-seal.ca/eng/exam-registration.shtml",
        description: "Steps to register for your Red Seal examination",
      },
    ],
  },
};

const RED_SEAL_SUMMARY =
  "A Red Seal endorsement is a seal on your provincial or territorial trade certificate. It shows you have the knowledge and skills to practice your trade across Canada — earned by passing the interprovincial Red Seal exam.";

function buildTradeDetailContent(tradeId: string): TradeDetailContent | undefined {
  const trade = TRADES.find((t) => t.id === tradeId);
  if (!trade) return undefined;

  const override = TRADE_DETAIL_OVERRIDES[tradeId];
  const rsos = getRsosExamData(tradeId);
  const overviewUrl = rsos?.examUrl
    ? rsos.examUrl.replace("/exam-information.shtml", "/overview.shtml")
    : undefined;

  const base: TradeDetailContent = {
    trade_scope: trade.description ?? trade.name,
    red_seal_summary: RED_SEAL_SUMMARY,
    exam_notes: rsos?.examUrl
      ? [
          `${rsos.totalQuestions} questions, 4 hours, 70% to pass`,
          "Questions align with the Red Seal Occupational Standard (RSOS)",
        ]
      : ["RSOS exam breakdown pending — trade not listed on red-seal.ca"],
    official_links: [
      ...(overviewUrl
        ? [
            {
              label: "Red Seal Occupational Standard",
              href: overviewUrl,
              description: "Complete description of trade activities — the basis for exam questions",
            },
          ]
        : []),
      ...(rsos?.examUrl
        ? [
            {
              label: "Exam information & self-assessment",
              href: rsos.examUrl,
              description: "Question breakdown, types, formulas, and acronyms used on the exam",
            },
          ]
        : []),
      {
        label: "How to register",
        href: "https://red-seal.ca/eng/exam-registration.shtml",
        description: "Steps to register for your Red Seal examination",
      },
    ],
  };

  if (!override) return base;
  return {
    ...base,
    ...override,
    official_links: override.official_links?.length ? override.official_links : base.official_links,
    exam_notes: override.exam_notes?.length ? override.exam_notes : base.exam_notes,
  };
}

export const TRADE_DETAIL_CONTENT: Record<string, TradeDetailContent> = Object.fromEntries(
  TRADES.map((t) => [t.id, buildTradeDetailContent(t.id)]).filter(([, v]) => v !== undefined),
) as Record<string, TradeDetailContent>;

export function getTradeDetailContent(tradeId: string): TradeDetailContent | undefined {
  return TRADE_DETAIL_CONTENT[tradeId] ?? buildTradeDetailContent(tradeId);
}

export function getTradeBySlug(slug: string) {
  return TRADES.find((t) => t.slug === slug);
}

export function getTradeById(id: string) {
  return TRADES.find((t) => t.id === id);
}

export function getBlocksForTrade(tradeId: string) {
  return ALL_BLOCKS.filter((b) => b.trade_id === tradeId);
}

export function getBlockById(blockId: string) {
  return ALL_BLOCKS.find((b) => b.id === blockId);
}

export function getChapterTasksForBlock(blockId: string): RsosChapterTask[] {
  const tasks = CHAPTER_TASKS[blockId];
  if (tasks?.length) return tasks;
  const block = getBlockById(blockId);
  if (!block) return [];
  return [
    {
      code: block.code,
      name: block.name,
      exam_question_count: block.exam_question_count,
    },
  ];
}

/** Resolve RSOS tasks when the block comes from Supabase (UUID id). */
export function getChapterTasksForBlockRef(
  tradeCode: string,
  blockCode: string,
): RsosChapterTask[] {
  const seedTrade = TRADES.find(
    (trade) => trade.code.toUpperCase() === tradeCode.toUpperCase(),
  );
  if (!seedTrade) return [];
  const seedBlock = ALL_BLOCKS.find(
    (block) =>
      block.trade_id === seedTrade.id &&
      block.code.toUpperCase() === blockCode.toUpperCase(),
  );
  if (!seedBlock) return [];
  return getChapterTasksForBlock(seedBlock.id);
}

export function getDefaultCodeVersion(tradeId: string) {
  return DEFAULT_CODE_VERSIONS[tradeId] ?? "current";
}

export function getQuestionsForTrade(tradeId: string, filters?: { blockId?: string; type?: string }) {
  return ALL_QUESTIONS.filter((q) => {
    if (q.trade_id !== tradeId) return false;
    if (filters?.blockId && q.block_id !== filters.blockId) return false;
    if (filters?.type && q.question_type !== filters.type) return false;
    return q.review_status === "approved";
  });
}

export function getLessonsForTrade(tradeId: string) {
  return SAMPLE_LESSONS.filter((l) => l.trade_id === tradeId && l.review_status === "approved")
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getLessonsForBlock(blockId: string) {
  return SAMPLE_LESSONS.filter((l) => l.block_id === blockId && l.review_status === "approved");
}

export function getFlashcardsForTrade(tradeId: string) {
  return SAMPLE_FLASHCARDS.filter((f) => f.trade_id === tradeId);
}
