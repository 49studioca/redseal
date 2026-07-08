import type { RsosBlock, RsosChapterTask, Question, Lesson, Flashcard, ProvincialGuide, TradeDetailContent } from "@/types";
import { ALL_TRADES } from "./all-trades";

export const TRADES = ALL_TRADES;

export const BLOCKS_309A: RsosBlock[] = [
  { id: "309a-a", trade_id: "trade-309a", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 14, exam_percentage: 12 },
  { id: "309a-b", trade_id: "trade-309a", code: "B", name: "Installs and maintains lighting and power systems", sort_order: 2, exam_question_count: 28, exam_percentage: 23 },
  { id: "309a-c", trade_id: "trade-309a", code: "C", name: "Installs and maintains distribution and utilization equipment", sort_order: 3, exam_question_count: 32, exam_percentage: 27 },
  { id: "309a-d", trade_id: "trade-309a", code: "D", name: "Installs and maintains motors and control systems", sort_order: 4, exam_question_count: 24, exam_percentage: 20 },
  { id: "309a-e", trade_id: "trade-309a", code: "E", name: "Installs and maintains fire alarm and communication systems", sort_order: 5, exam_question_count: 12, exam_percentage: 10 },
  { id: "309a-f", trade_id: "trade-309a", code: "F", name: "Installs and maintains renewable energy systems", sort_order: 6, exam_question_count: 10, exam_percentage: 8 },
];

export const BLOCKS_447A: RsosBlock[] = [
  { id: "447a-a", trade_id: "trade-447a", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 14, exam_percentage: 11 },
  { id: "447a-b", trade_id: "trade-447a", code: "B", name: "Prepares and assembles tube, tubing and pipe", sort_order: 2, exam_question_count: 13, exam_percentage: 10 },
  { id: "447a-c", trade_id: "trade-447a", code: "C", name: "Installs, tests and services DWV systems", sort_order: 3, exam_question_count: 32, exam_percentage: 26 },
  { id: "447a-d", trade_id: "trade-447a", code: "D", name: "Installs, tests and services water distribution", sort_order: 4, exam_question_count: 24, exam_percentage: 19 },
  { id: "447a-e", trade_id: "trade-447a", code: "E", name: "Installs fixtures, appliances and treatment systems", sort_order: 5, exam_question_count: 17, exam_percentage: 14 },
  { id: "447a-f", trade_id: "trade-447a", code: "F", name: "Installs low-pressure steam and hydronic systems", sort_order: 6, exam_question_count: 16, exam_percentage: 13 },
  { id: "447a-g", trade_id: "trade-447a", code: "G", name: "Installs specialized systems", sort_order: 7, exam_question_count: 9, exam_percentage: 7 },
];

export const BLOCKS_276A: RsosBlock[] = [
  { id: "276a-a", trade_id: "trade-276a", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 15, exam_percentage: 13 },
  { id: "276a-b", trade_id: "trade-276a", code: "B", name: "Prepares materials and equipment for welding", sort_order: 2, exam_question_count: 18, exam_percentage: 15 },
  { id: "276a-c", trade_id: "trade-276a", code: "C", name: "Performs welding using SMAW/GMAW/FCAW/GTAW", sort_order: 3, exam_question_count: 36, exam_percentage: 30 },
  { id: "276a-d", trade_id: "trade-276a", code: "D", name: "Performs cutting and gouging operations", sort_order: 4, exam_question_count: 15, exam_percentage: 13 },
  { id: "276a-e", trade_id: "trade-276a", code: "E", name: "Inspects and tests welds", sort_order: 5, exam_question_count: 21, exam_percentage: 17 },
  { id: "276a-f", trade_id: "trade-276a", code: "F", name: "Performs specialized welding applications", sort_order: 6, exam_question_count: 15, exam_percentage: 12 },
];

export const ALL_BLOCKS: RsosBlock[] = [...BLOCKS_309A, ...BLOCKS_447A, ...BLOCKS_276A];

/** RSOS tasks within each exam chapter (block), from official Red Seal exam breakdowns. */
export const CHAPTER_TASKS: Record<string, RsosChapterTask[]> = {
  "447a-a": [
    { code: "A-1", name: "Performs safety-related functions", exam_question_count: 3 },
    { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 3 },
    { code: "A-3", name: "Organizes work", exam_question_count: 3 },
    { code: "A-4", name: "Performs routine trade activities", exam_question_count: 5 },
  ],
  "447a-b": [
    { code: "B-6", name: "Prepares tube, tubing and pipe", exam_question_count: 6 },
    { code: "B-7", name: "Joins tube, tubing and pipe", exam_question_count: 7 },
  ],
  "447a-c": [
    { code: "C-8", name: "Installs, tests and services sewers", exam_question_count: 7 },
    { code: "C-9", name: "Installs, tests and services sewage treatment systems", exam_question_count: 5 },
    { code: "C-10", name: "Installs, tests and services interior DWV systems", exam_question_count: 20 },
  ],
  "447a-d": [
    { code: "D-11", name: "Installs, tests and services water service", exam_question_count: 6 },
    { code: "D-12", name: "Installs, tests and services potable water distribution systems", exam_question_count: 12 },
    { code: "D-13", name: "Installs, tests and services private water pressure systems", exam_question_count: 6 },
  ],
  "447a-e": [
    { code: "E-14", name: "Installs, tests and services plumbing fixtures and appliances", exam_question_count: 11 },
    { code: "E-15", name: "Installs, tests and services water treatment systems", exam_question_count: 6 },
  ],
  "447a-f": [
    { code: "F-17", name: "Installs, tests and services piping and components for hydronic systems", exam_question_count: 9 },
    { code: "F-18", name: "Installs, tests and services hydronic heating and cooling equipment", exam_question_count: 7 },
  ],
  "447a-g": [
    { code: "G-19", name: "Installs, tests and services process piping systems", exam_question_count: 5 },
    { code: "G-21", name: "Installs, tests and services other specialized systems", exam_question_count: 4 },
  ],
  "309a-a": [
    { code: "A-1", name: "Performs safety-related functions", exam_question_count: 4 },
    { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 3 },
    { code: "A-3", name: "Organizes work", exam_question_count: 3 },
    { code: "A-4", name: "Performs routine trade activities", exam_question_count: 4 },
  ],
  "309a-b": [
    { code: "B-5", name: "Installs and maintains branch circuits", exam_question_count: 14 },
    { code: "B-6", name: "Installs and maintains lighting systems", exam_question_count: 14 },
  ],
  "309a-c": [
    { code: "C-7", name: "Installs and maintains distribution equipment", exam_question_count: 16 },
    { code: "C-8", name: "Installs and maintains utilization equipment", exam_question_count: 16 },
  ],
  "309a-d": [
    { code: "D-9", name: "Installs and maintains motors", exam_question_count: 12 },
    { code: "D-10", name: "Installs and maintains control systems", exam_question_count: 12 },
  ],
  "309a-e": [
    { code: "E-11", name: "Installs and maintains fire alarm systems", exam_question_count: 6 },
    { code: "E-12", name: "Installs and maintains communication systems", exam_question_count: 6 },
  ],
  "309a-f": [
    { code: "F-13", name: "Installs and maintains renewable energy systems", exam_question_count: 10 },
  ],
  "276a-a": [
    { code: "A-1", name: "Performs safety-related functions", exam_question_count: 4 },
    { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 4 },
    { code: "A-3", name: "Organizes work", exam_question_count: 4 },
    { code: "A-4", name: "Performs routine trade activities", exam_question_count: 3 },
  ],
  "276a-b": [
    { code: "B-5", name: "Prepares base metals for welding", exam_question_count: 9 },
    { code: "B-6", name: "Sets up welding equipment", exam_question_count: 9 },
  ],
  "276a-c": [
    { code: "C-7", name: "Performs SMAW welding", exam_question_count: 9 },
    { code: "C-8", name: "Performs GMAW/FCAW welding", exam_question_count: 9 },
    { code: "C-9", name: "Performs GTAW welding", exam_question_count: 9 },
    { code: "C-10", name: "Performs welding on pipe and plate", exam_question_count: 9 },
  ],
  "276a-d": [
    { code: "D-11", name: "Performs thermal cutting", exam_question_count: 8 },
    { code: "D-12", name: "Performs gouging operations", exam_question_count: 7 },
  ],
  "276a-e": [
    { code: "E-13", name: "Performs visual weld inspection", exam_question_count: 11 },
    { code: "E-14", name: "Performs non-destructive testing", exam_question_count: 10 },
  ],
  "276a-f": [
    { code: "F-15", name: "Performs specialized welding applications", exam_question_count: 15 },
  ],
};

export const DEFAULT_CODE_VERSIONS: Record<string, string> = {
  "trade-309a": "CEC-2024",
  "trade-447a": "NPC-2020",
  "trade-276a": "W59-2018",
};


/** Lessons, questions, flashcards: AI-generated via npm run db:generate-content */
export const ALL_QUESTIONS: Question[] = [];
export const SAMPLE_LESSONS: Lesson[] = [];
export const SAMPLE_FLASHCARDS: Flashcard[] = [];

export const REFERENCE_CHUNKS = [
  {
    id: "ref-1",
    doc_id: "doc-cec",
    rule_number: "8-102(1)(a)",
    section_title: "Voltage Drop — Branch Circuits",
    content: "The voltage drop in branch circuits shall not exceed 3% of the system voltage at the farthest outlet of power, heating, or lighting loads.",
    page_number: 142,
    code_version: "CEC-2024",
  },
  {
    id: "ref-2",
    doc_id: "doc-cec",
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
    exam_info: "120 questions, 4 hours, 70% to pass, open-book (CEC permitted)",
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
    exam_info: "120 questions, 4 hours, 70% to pass, open-book",
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
};

export const TRADE_DETAIL_CONTENT: Record<string, TradeDetailContent> = {
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
        href: "https://red-seal.ca/eng/trades/construction-electrician/overview.shtml",
        description: "Complete description of trade activities — the basis for exam questions",
      },
      {
        label: "Exam information",
        href: "https://red-seal.ca/eng/trades/construction-electrician/exam-information.shtml",
        description: "Question breakdown and exam preparation resources",
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
        href: "https://red-seal.ca/eng/trades/welder/overview.shtml",
        description: "Complete description of trade activities — the basis for exam questions",
      },
      {
        label: "Exam information",
        href: "https://red-seal.ca/eng/trades/welder/exam-information.shtml",
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

export function getTradeDetailContent(tradeId: string): TradeDetailContent | undefined {
  return TRADE_DETAIL_CONTENT[tradeId];
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
