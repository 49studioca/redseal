/** Auto-generated from red-seal.ca exam-information pages. Re-run: node scripts/generate-rsos-seed.mjs */
import type { RsosBlock, RsosChapterTask } from "@/types";

export type TradeRsosExamData = {
  tradeId: string;
  tradeCode: string;
  totalQuestions: number;
  examUrl: string;
  blocks: RsosBlock[];
  chapterTasks: Record<string, RsosChapterTask[]>;
};

export const RSOS_EXAM_DATA: Record<string, TradeRsosExamData> = {
  "trade-309a": {
    tradeId: "trade-309a",
    tradeCode: "309A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/constelectric/exam-information.shtml",
    blocks: [
    { id: "309a-a", trade_id: "trade-309a", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 11, exam_percentage: 11 },
    { id: "309a-b", trade_id: "trade-309a", code: "B", name: "Installs, services and maintains generating, distribution and service systems", sort_order: 2, exam_question_count: 28, exam_percentage: 28 },
    { id: "309a-c", trade_id: "trade-309a", code: "C", name: "Installs, services and maintains wiring systems", sort_order: 3, exam_question_count: 30, exam_percentage: 30 },
    { id: "309a-d", trade_id: "trade-309a", code: "D", name: "Installs, services and maintains motors and control systems", sort_order: 4, exam_question_count: 21, exam_percentage: 21 },
    { id: "309a-e", trade_id: "trade-309a", code: "E", name: "Installs, services and maintains signalling and communication systems", sort_order: 5, exam_question_count: 10, exam_percentage: 10 }
    ],
    chapterTasks: {
    "309a-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "Uses tools and equipment", exam_question_count: 2 },
      { code: "A-3", name: "Organizes work", exam_question_count: 2 },
      { code: "A-4", name: "Fabricates and installs support components", exam_question_count: 2 },
      { code: "A-5", name: "Commissions and decommissions electrical systems", exam_question_count: 2 },
      { code: "A-6", name: "Uses communication and mentoring techniques", exam_question_count: 1 }
    ],
    "309a-b": [
      { code: "B-7", name: "Installs, services and maintains consumer/supply services and metering equipment", exam_question_count: 4 },
      { code: "B-8", name: "Installs, services and maintains protection devices", exam_question_count: 4 },
      { code: "B-9", name: "Installs, services and maintains power distribution equipment", exam_question_count: 4 },
      { code: "B-10", name: "Installs, services and maintains power conditioning, uninterruptible power supply (UPS) and surge suppression systems", exam_question_count: 2 },
      { code: "B-11", name: "Installs, services and maintains bonding and grounding, and ground fault protection and detection systems", exam_question_count: 4 },
      { code: "B-12", name: "Installs, services and maintains power generation and conversion systems", exam_question_count: 2 },
      { code: "B-13", name: "Installs, services and maintains renewable energy generating and storage systems", exam_question_count: 2 },
      { code: "B-14", name: "Installs, services and maintains high-voltage systems", exam_question_count: 2 },
      { code: "B-15", name: "Installs, services and maintains transformers", exam_question_count: 4 }
    ],
    "309a-c": [
      { code: "C-16", name: "Installs, services and maintains raceways, conductors, cables and enclosures", exam_question_count: 9 },
      { code: "C-17", name: "Installs, services and maintains branch circuitry and devices", exam_question_count: 9 },
      { code: "C-18", name: "Installs, services and maintains heating, ventilating and air-conditioning (HVAC) systems", exam_question_count: 4 },
      { code: "C-19", name: "Installs, services and maintains electric heating systems", exam_question_count: 4 },
      { code: "C-20", name: "Installs, services and maintains exit and emergency lighting systems", exam_question_count: 3 },
      { code: "C-1", name: "C-21. Installs, services and maintains cathodic protection systems", exam_question_count: 1 }
    ],
    "309a-d": [
      { code: "D-22", name: "Installs, services and maintains motor starters and controls", exam_question_count: 8 },
      { code: "D-23", name: "Installs, services and maintains drives", exam_question_count: 4 },
      { code: "D-24", name: "Installs, services and maintains motors", exam_question_count: 6 },
      { code: "D-25", name: "Installs, programs, services and maintains automated control systems", exam_question_count: 3 }
    ],
    "309a-e": [
      { code: "E-26", name: "Installs, services and maintains signaling systems", exam_question_count: 4 },
      { code: "E-27", name: "Installs, services and maintains communication systems", exam_question_count: 3 },
      { code: "E-28", name: "Installs, services and maintains integrated control systems", exam_question_count: 3 }
    ]
    },
  },
  "trade-447a": {
    tradeId: "trade-447a",
    tradeCode: "447A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/plumbers/exam-information.shtml",
    blocks: [
    { id: "447a-a", trade_id: "trade-447a", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 14, exam_percentage: 11 },
    { id: "447a-b", trade_id: "trade-447a", code: "B", name: "Prepares and assembles tube, tubing and pipe", sort_order: 2, exam_question_count: 13, exam_percentage: 10 },
    { id: "447a-c", trade_id: "trade-447a", code: "C", name: "Installs, tests and services sewers, sewage treatment systems and drainage, waste and vent (DWV) systems", sort_order: 3, exam_question_count: 32, exam_percentage: 26 },
    { id: "447a-d", trade_id: "trade-447a", code: "D", name: "Installs, tests and services water service and distribution", sort_order: 4, exam_question_count: 24, exam_percentage: 19 },
    { id: "447a-e", trade_id: "trade-447a", code: "E", name: "Installs, tests and services fixtures, appliances and water treatment systems", sort_order: 5, exam_question_count: 17, exam_percentage: 14 },
    { id: "447a-f", trade_id: "trade-447a", code: "F", name: "Installs, tests and services low-pressure steam and hydronic systems", sort_order: 6, exam_question_count: 16, exam_percentage: 13 },
    { id: "447a-g", trade_id: "trade-447a", code: "G", name: "Installs, tests and services specialized systems", sort_order: 7, exam_question_count: 9, exam_percentage: 7 }
    ],
    chapterTasks: {
    "447a-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 3 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 3 },
      { code: "A-3", name: "Organizes work", exam_question_count: 3 },
      { code: "A-4", name: "Performs routine trade activities", exam_question_count: 5 }
    ],
    "447a-b": [
      { code: "B-6", name: "Prepares tube, tubing and pipe", exam_question_count: 6 },
      { code: "B-7", name: "Joins tube, tubing and pipe", exam_question_count: 7 }
    ],
    "447a-c": [
      { code: "C-8", name: "Installs, tests and services sewers", exam_question_count: 7 },
      { code: "C-9", name: "Installs, tests and services sewage treatment systems", exam_question_count: 5 },
      { code: "C-10", name: "Installs, tests and services interior drainage, waste and vent (DWV) systems", exam_question_count: 20 }
    ],
    "447a-d": [
      { code: "D-11", name: "Installs, tests and services water service", exam_question_count: 6 },
      { code: "D-12", name: "Installs, tests and services potable water distribution systems", exam_question_count: 12 },
      { code: "D-13", name: "Installs, tests and services private water pressure systems", exam_question_count: 6 }
    ],
    "447a-e": [
      { code: "E-14", name: "Installs, tests and services plumbing fixtures and appliances", exam_question_count: 11 },
      { code: "E-15", name: "Installs, tests and services water treatment systems", exam_question_count: 6 }
    ],
    "447a-f": [
      { code: "F-17", name: "Installs, tests and services piping and components for hydronic systems", exam_question_count: 9 },
      { code: "F-18", name: "Installs, tests and services hydronic heating and cooling equipment", exam_question_count: 7 }
    ],
    "447a-g": [
      { code: "G-19", name: "Installs, tests and services process piping systems", exam_question_count: 5 },
      { code: "G-21", name: "Installs, tests and services other specialized systems", exam_question_count: 4 }
    ]
    },
  },
  "trade-276a": {
    tradeId: "trade-276a",
    tradeCode: "276A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/weld/exam-information.shtml",
    blocks: [
    { id: "276a-a", trade_id: "trade-276a", code: "A", name: "Performs Common Occupational Skills", sort_order: 1, exam_question_count: 20, exam_percentage: 16 },
    { id: "276a-b", trade_id: "trade-276a", code: "B", name: "Performs Layout and Fabrication of Components for Welding", sort_order: 2, exam_question_count: 28, exam_percentage: 22 },
    { id: "276a-c", trade_id: "trade-276a", code: "C", name: "Performs Cutting and Gouging", sort_order: 3, exam_question_count: 23, exam_percentage: 18 },
    { id: "276a-d", trade_id: "trade-276a", code: "D", name: "Welding Processes", sort_order: 4, exam_question_count: 54, exam_percentage: 43 }
    ],
    chapterTasks: {
    "276a-a": [
      { code: "A-1", name: "Maintains tools and equipment", exam_question_count: 4 },
      { code: "A-2", name: "Uses access and material handling equipment", exam_question_count: 3 },
      { code: "A-3", name: "Performs safety-related activities", exam_question_count: 4 },
      { code: "A-4", name: "Organizes work", exam_question_count: 3 },
      { code: "A-5", name: "Performs routine trade activities", exam_question_count: 6 }
    ],
    "276a-b": [
      { code: "B-7", name: "Performs layout", exam_question_count: 12 },
      { code: "B-8", name: "Fabricates components", exam_question_count: 16 }
    ],
    "276a-c": [
      { code: "C-9", name: "Uses tools and equipment for non-thermal cutting and grinding", exam_question_count: 6 },
      { code: "C-10", name: "Uses oxy-fuel gas cutting (OFC) process for cutting and gouging", exam_question_count: 7 },
      { code: "C-11", name: "Uses plasma arc cutting (PAC) process for cutting and gouging", exam_question_count: 6 },
      { code: "C-12", name: "Uses air carbon arc cutting (CAC-A) process for cutting and gouging", exam_question_count: 4 }
    ],
    "276a-d": [
      { code: "D-13", name: "Welds using shielded metal arc welding (SMAW) process", exam_question_count: 18 },
      { code: "D-14", name: "Welds using flux cored arc welding (FCAW), metal cored arc welding (MCAW) and gas metal arc welding (GMAW) processes", exam_question_count: 18 },
      { code: "D-15", name: "Welds using gas tungsten arc welding (GTAW) process", exam_question_count: 13 },
      { code: "D-16", name: "Welds using submerged arc welding (SAW) process", exam_question_count: 5 }
    ]
    },
  },
  "trade-442a": {
    tradeId: "trade-442a",
    tradeCode: "442A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/industrialelectric/exam-information.shtml",
    blocks: [
    { id: "442a-a", trade_id: "trade-442a", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 9, exam_percentage: 9 },
    { id: "442a-b", trade_id: "trade-442a", code: "B", name: "Installs and maintains generating, distribution and service systems", sort_order: 2, exam_question_count: 23, exam_percentage: 23 },
    { id: "442a-c", trade_id: "trade-442a", code: "C", name: "Installs and maintains wiring systems", sort_order: 3, exam_question_count: 20, exam_percentage: 20 },
    { id: "442a-d", trade_id: "trade-442a", code: "D", name: "Installs and maintains rotating and non-rotating equipment and control systems", sort_order: 4, exam_question_count: 21, exam_percentage: 21 },
    { id: "442a-e", trade_id: "trade-442a", code: "E", name: "Installs and maintains signalling and communication systems", sort_order: 5, exam_question_count: 10, exam_percentage: 10 },
    { id: "442a-f", trade_id: "trade-442a", code: "F", name: "Installs and maintains process control systems", sort_order: 6, exam_question_count: 17, exam_percentage: 17 }
    ],
    chapterTasks: {
    "442a-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "Uses tools and equipment", exam_question_count: 2 },
      { code: "A-3", name: "Organizes work", exam_question_count: 2 },
      { code: "A-4", name: "Fabricates and installs support components", exam_question_count: 1 },
      { code: "A-5", name: "Commissions and decommissions electrical systems", exam_question_count: 2 }
    ],
    "442a-b": [
      { code: "B-7", name: "Installs and maintains consumer/supply services and metering equipment", exam_question_count: 3 },
      { code: "B-8", name: "Installs and maintains protection devices", exam_question_count: 4 },
      { code: "B-9", name: "Installs and maintains low voltage distribution systems", exam_question_count: 3 },
      { code: "B-10", name: "Installs and maintains power conditioning systems", exam_question_count: 2 },
      { code: "B-11", name: "Installs and maintains bonding, grounding and ground fault detection systems", exam_question_count: 3 },
      { code: "B-12", name: "Installs and maintains power generating systems", exam_question_count: 2 },
      { code: "B-13", name: "Installs and maintains renewable energy generating and storage systems", exam_question_count: 1 },
      { code: "B-14", name: "Installs and maintains high voltage systems", exam_question_count: 2 },
      { code: "B-15", name: "Installs and maintains transformers", exam_question_count: 3 }
    ],
    "442a-c": [
      { code: "C-16", name: "Installs and maintains raceways, cables, conductors and enclosures", exam_question_count: 5 },
      { code: "C-17", name: "Installs and maintains branch circuitry and devices", exam_question_count: 5 },
      { code: "C-18", name: "Installs and maintains heating, ventilation and air-conditioning (HVAC) electrical components", exam_question_count: 3 },
      { code: "C-19", name: "Installs and maintains electric heating systems and controls", exam_question_count: 3 },
      { code: "C-20", name: "Installs and maintains exit and emergency lighting systems", exam_question_count: 2 },
      { code: "C-21", name: "Installs and maintains cathodic protection systems", exam_question_count: 2 }
    ],
    "442a-d": [
      { code: "D-22", name: "Installs and maintains motor starters and control devices", exam_question_count: 7 },
      { code: "D-23", name: "Installs and maintains drives", exam_question_count: 5 },
      { code: "D-24", name: "Installs and maintains non-rotating equipment and associated controls", exam_question_count: 3 },
      { code: "D-25", name: "Installs and maintains motors", exam_question_count: 6 }
    ],
    "442a-e": [
      { code: "E-26", name: "Installs and maintains signalling systems", exam_question_count: 4 },
      { code: "E-27", name: "Installs and maintains communication systems", exam_question_count: 3 },
      { code: "E-28", name: "Installs and maintains building automation systems", exam_question_count: 3 }
    ],
    "442a-f": [
      { code: "F-29", name: "Installs and maintains input/output (I/O) devices", exam_question_count: 8 },
      { code: "F-30", name: "Installs, programs and maintains automated control systems", exam_question_count: 6 },
      { code: "F-31", name: "Installs and maintains pneumatic and hydraulic control systems", exam_question_count: 3 }
    ]
    },
  },
  "trade-powerline-technician": {
    tradeId: "trade-powerline-technician",
    tradeCode: "434A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/powerlinetech/exam-information.shtml",
    blocks: [
    { id: "powerlinetechnician-a", trade_id: "trade-powerline-technician", code: "A", name: "Performs Common Occupational Skills", sort_order: 1, exam_question_count: 32, exam_percentage: 26 },
    { id: "powerlinetechnician-b", trade_id: "trade-powerline-technician", code: "B", name: "Installs Structures", sort_order: 2, exam_question_count: 16, exam_percentage: 13 },
    { id: "powerlinetechnician-c", trade_id: "trade-powerline-technician", code: "C", name: "Installs Conductor Systems", sort_order: 3, exam_question_count: 19, exam_percentage: 15 },
    { id: "powerlinetechnician-d", trade_id: "trade-powerline-technician", code: "D", name: "Installs Auxiliary Equipment", sort_order: 4, exam_question_count: 26, exam_percentage: 21 },
    { id: "powerlinetechnician-e", trade_id: "trade-powerline-technician", code: "E", name: "Performs Operation, Maintenance and Repair", sort_order: 5, exam_question_count: 32, exam_percentage: 26 }
    ],
    chapterTasks: {
    "powerlinetechnician-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 8 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "Organizes work", exam_question_count: 5 },
      { code: "A-4", name: "Accesses work area", exam_question_count: 4 },
      { code: "A-5", name: "Uses live-line methods", exam_question_count: 7 },
      { code: "A-6", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "powerlinetechnician-b": [
      { code: "B-7", name: "Installs pole structures", exam_question_count: 13 },
      { code: "B-8", name: "Installs steel lattice structures", exam_question_count: 3 }
    ],
    "powerlinetechnician-c": [
      { code: "C-9", name: "Installs overhead conductors and cables", exam_question_count: 13 },
      { code: "C-10", name: "Installs underground and underwater cable", exam_question_count: 6 }
    ],
    "powerlinetechnician-d": [
      { code: "D-11", name: "Installs lighting systems", exam_question_count: 3 },
      { code: "D-12", name: "Installs voltage control equipment", exam_question_count: 9 },
      { code: "D-13", name: "Installs protection equipment", exam_question_count: 8 },
      { code: "D-14", name: "Installs metering equipment", exam_question_count: 4 },
      { code: "D-15", name: "Installs communication equipment", exam_question_count: 2 }
    ],
    "powerlinetechnician-e": [
      { code: "E-16", name: "Operates distribution and transmission systems", exam_question_count: 8 },
      { code: "E-17", name: "Maintains distribution and transmission systems", exam_question_count: 9 },
      { code: "E-18", name: "Repairs distribution systems", exam_question_count: 9 },
      { code: "E-19", name: "Repairs transmission systems", exam_question_count: 6 }
    ]
    },
  },
  "trade-instrumentation-control": {
    tradeId: "trade-instrumentation-control",
    tradeCode: "IC-447A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/instrumentcntltech/exam-information.shtml",
    blocks: [
    { id: "instrumentationcontrol-a", trade_id: "trade-instrumentation-control", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 12, exam_percentage: 10 },
    { id: "instrumentationcontrol-b", trade_id: "trade-instrumentation-control", code: "B", name: "Installs and services process measuring and indicating devices", sort_order: 2, exam_question_count: 30, exam_percentage: 24 },
    { id: "instrumentationcontrol-c", trade_id: "trade-instrumentation-control", code: "C", name: "Installs and services safety and security systems and devices", sort_order: 3, exam_question_count: 11, exam_percentage: 9 },
    { id: "instrumentationcontrol-d", trade_id: "trade-instrumentation-control", code: "D", name: "Installs and services hydraulic, pneumatic and electrical systems", sort_order: 4, exam_question_count: 14, exam_percentage: 11 },
    { id: "instrumentationcontrol-e", trade_id: "trade-instrumentation-control", code: "E", name: "Installs, configures and services final control elements", sort_order: 5, exam_question_count: 25, exam_percentage: 20 },
    { id: "instrumentationcontrol-f", trade_id: "trade-instrumentation-control", code: "F", name: "Installs and services communication systems and devices", sort_order: 6, exam_question_count: 12, exam_percentage: 10 },
    { id: "instrumentationcontrol-g", trade_id: "trade-instrumentation-control", code: "G", name: "Installs and services control systems and process control", sort_order: 7, exam_question_count: 21, exam_percentage: 17 }
    ],
    chapterTasks: {
    "instrumentationcontrol-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 3 },
      { code: "A-2", name: "2 Uses tools and equipment", exam_question_count: 4 },
      { code: "A-3", name: "3 Organizes work", exam_question_count: 3 },
      { code: "A-4", name: "4 Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "instrumentationcontrol-b": [
      { code: "B-1", name: "5 Installs and services pressure, temperature, level and flow devices", exam_question_count: 9 },
      { code: "B-2", name: "6 Installs and services signal transducers", exam_question_count: 4 },
      { code: "B-3", name: "7 Installs and services motion, speed, position and vibration devices", exam_question_count: 4 },
      { code: "B-4", name: "8 Installs and services mass, density and consistency devices", exam_question_count: 4 },
      { code: "B-5", name: "9 Installs and services process analyzers", exam_question_count: 5 },
      { code: "B-6", name: "10 Installs and services multiple variable computing devices", exam_question_count: 4 }
    ],
    "instrumentationcontrol-c": [
      { code: "C-1", name: "11 Installs and services safety systems and devices", exam_question_count: 6 },
      { code: "C-2", name: "13 Installs and services safety instrumented systems (SIS)", exam_question_count: 5 }
    ],
    "instrumentationcontrol-d": [
      { code: "D-1", name: "14 Installs and services control devices for hydraulic systems", exam_question_count: 3 },
      { code: "D-2", name: "15 Installs and services pneumatic equipment", exam_question_count: 5 },
      { code: "D-3", name: "16 Installs and services electrical and electronic equipment", exam_question_count: 6 }
    ],
    "instrumentationcontrol-e": [
      { code: "E-1", name: "17 Installs and services valves", exam_question_count: 6 },
      { code: "E-2", name: "18 Installs and services actuators", exam_question_count: 7 },
      { code: "E-3", name: "19 Installs and services positioners", exam_question_count: 8 },
      { code: "E-4", name: "20 Configures and services variable speed drives (VSD)", exam_question_count: 4 }
    ],
    "instrumentationcontrol-f": [
      { code: "F-1", name: "21 Installs and services control network systems", exam_question_count: 5 },
      { code: "F-2", name: "22 Installs and services signal converters", exam_question_count: 4 },
      { code: "F-3", name: "23 Installs and services gateways, bridges and media converters", exam_question_count: 3 }
    ],
    "instrumentationcontrol-g": [
      { code: "G-1", name: "24 Establishes and optimizes process control strategies", exam_question_count: 5 },
      { code: "G-2", name: "25 Installs and services stand-alone controllers (SAC)", exam_question_count: 2 },
      { code: "G-3", name: "26 Installs and services programmable logic controllers (PLC)", exam_question_count: 5 },
      { code: "G-4", name: "27 Installs and services distributed control systems (DCS)", exam_question_count: 4 },
      { code: "G-5", name: "28 Installs and services human machine interface (HMI)", exam_question_count: 3 },
      { code: "G-6", name: "29 Installs and services supervisory control and data acquisition (SCADA) systems", exam_question_count: 2 }
    ]
    },
  },
  "trade-steamfitter-pipefitter": {
    tradeId: "trade-steamfitter-pipefitter",
    tradeCode: "307A",
    totalQuestions: 130,
    examUrl: "https://red-seal.ca/eng/trades/steamfitpipefit/exam-information.shtml",
    blocks: [
    { id: "steamfitterpipefitter-a", trade_id: "trade-steamfitter-pipefitter", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 16, exam_percentage: 12 },
    { id: "steamfitterpipefitter-b", trade_id: "trade-steamfitter-pipefitter", code: "B", name: "Performs layout, fabrication and piping installation", sort_order: 2, exam_question_count: 29, exam_percentage: 22 },
    { id: "steamfitterpipefitter-c", trade_id: "trade-steamfitter-pipefitter", code: "C", name: "Performs rigging, hoisting, lifting and positioning", sort_order: 3, exam_question_count: 15, exam_percentage: 12 },
    { id: "steamfitterpipefitter-d", trade_id: "trade-steamfitter-pipefitter", code: "D", name: "Installs, tests, maintains, troubleshoots and repairs low and high pressure steam and condensate systems", sort_order: 4, exam_question_count: 24, exam_percentage: 18 },
    { id: "steamfitterpipefitter-e", trade_id: "trade-steamfitter-pipefitter", code: "E", name: "Installs, tests, maintains, troubleshoots and repairs heating, cooling and process piping systems", sort_order: 5, exam_question_count: 27, exam_percentage: 21 },
    { id: "steamfitterpipefitter-f", trade_id: "trade-steamfitter-pipefitter", code: "F", name: "Installs, tests, maintains, troubleshoots and repairs renewable energy systems", sort_order: 6, exam_question_count: 8, exam_percentage: 6 },
    { id: "steamfitterpipefitter-g", trade_id: "trade-steamfitter-pipefitter", code: "G", name: "Performs commissioning, start-up and turnover", sort_order: 7, exam_question_count: 11, exam_percentage: 8 }
    ],
    chapterTasks: {
    "steamfitterpipefitter-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "Organizes job", exam_question_count: 4 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "steamfitterpipefitter-b": [
      { code: "B-5", name: "Performs fabrication", exam_question_count: 10 },
      { code: "B-6", name: "Lays out, identifies and installs piping, tubing, fittings and related components", exam_question_count: 12 },
      { code: "B-7", name: "Installs, maintains, troubleshoots, repairs and tests valves", exam_question_count: 4 },
      { code: "B-8", name: "Installs, tests, maintains, troubleshoots and repairs heat tracing systems", exam_question_count: 3 }
    ],
    "steamfitterpipefitter-c": [
      { code: "C-9", name: "Performs common rigging, hoisting, lifting and positioning", exam_question_count: 10 },
      { code: "C-10", name: "Performs complex and critical rigging, hoisting, lifting and positioning", exam_question_count: 5 }
    ],
    "steamfitterpipefitter-d": [
      { code: "D-11", name: "Installs, tests, maintains, troubleshoots and repairs low pressure steam and condensate systems", exam_question_count: 10 },
      { code: "D-12", name: "Installs, tests, maintains, troubleshoots and repairs high pressure steam and condensate systems", exam_question_count: 14 }
    ],
    "steamfitterpipefitter-e": [
      { code: "E-13", name: "Installs, tests, maintains, troubleshoots and repairs hydronic systems", exam_question_count: 6 },
      { code: "E-14", name: "Installs, tests, maintains, troubleshoots and repairs process piping systems", exam_question_count: 5 },
      { code: "E-15", name: "Installs, tests, maintains, troubleshoots and repairs industrial water and waste treatment systems", exam_question_count: 3 },
      { code: "E-16", name: "Installs, tests, maintains, troubleshoots and repairs hydraulic systems", exam_question_count: 3 },
      { code: "E-17", name: "Installs, tests, maintains, troubleshoots and repairs heating, ventilation, air conditioning and refrigeration (HVACR) systems", exam_question_count: 2 },
      { code: "E-18", name: "Installs, tests, maintains, troubleshoots and repairs fuel systems", exam_question_count: 3 },
      { code: "E-19", name: "Installs, tests, maintains, troubleshoots and repairs medical gas systems", exam_question_count: 2 },
      { code: "E-20", name: "Installs, tests, maintains, troubleshoots and repairs compressed air and pneumatic systems", exam_question_count: 3 }
    ],
    "steamfitterpipefitter-f": [
      { code: "F-22", name: "Installs, tests, maintains, troubleshoots and repairs geo-exchange and geothermal systems", exam_question_count: 2 },
      { code: "F-23", name: "Installs, tests, maintains, troubleshoots and repairs solar heating systems", exam_question_count: 2 },
      { code: "F-24", name: "Installs, tests, maintains, troubleshoots and repairs heat recovery systems", exam_question_count: 4 }
    ],
    "steamfitterpipefitter-g": [
      { code: "G-25", name: "Prepares system for commissioning, start-up and turnover", exam_question_count: 6 },
      { code: "G-26", name: "Commissions systems", exam_question_count: 5 }
    ]
    },
  },
  "trade-sprinkler-fitter": {
    tradeId: "trade-sprinkler-fitter",
    tradeCode: "420A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/sprinkler-fitter/exam-information.shtml",
    blocks: [
    { id: "sprinklerfitter-a", trade_id: "trade-sprinkler-fitter", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 25, exam_percentage: 21 },
    { id: "sprinklerfitter-b", trade_id: "trade-sprinkler-fitter", code: "B", name: "Installs water supply", sort_order: 2, exam_question_count: 18, exam_percentage: 15 },
    { id: "sprinklerfitter-c", trade_id: "trade-sprinkler-fitter", code: "C", name: "Installs piping", sort_order: 3, exam_question_count: 32, exam_percentage: 27 },
    { id: "sprinklerfitter-d", trade_id: "trade-sprinkler-fitter", code: "D", name: "Installs and lays out fire protection systems and devices", sort_order: 4, exam_question_count: 26, exam_percentage: 22 },
    { id: "sprinklerfitter-e", trade_id: "trade-sprinkler-fitter", code: "E", name: "Inspects, tests and maintains (itm) fire protection systems", sort_order: 5, exam_question_count: 19, exam_percentage: 16 }
    ],
    chapterTasks: {
    "sprinklerfitter-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 5 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "Organizes work", exam_question_count: 8 },
      { code: "A-4", name: "Commission systems", exam_question_count: 4 },
      { code: "A-5", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "sprinklerfitter-b": [
      { code: "B-6", name: "Installs underground water supplies", exam_question_count: 3 },
      { code: "B-7", name: "Installs fire pump units", exam_question_count: 7 },
      { code: "B-8", name: "Installs fire department connections", exam_question_count: 5 },
      { code: "B-9", name: "Installs private water supply systems", exam_question_count: 3 }
    ],
    "sprinklerfitter-c": [
      { code: "C-10", name: "Prepares pipe, tube and fittings for installation", exam_question_count: 9 },
      { code: "C-11", name: "Installs pipe, tube and fittings", exam_question_count: 11 },
      { code: "C-12", name: "Installs piping components", exam_question_count: 12 }
    ],
    "sprinklerfitter-d": [
      { code: "D-13", name: "Installs water-based systems", exam_question_count: 15 },
      { code: "D-14", name: "Installs specialty fire suppression systems", exam_question_count: 4 },
      { code: "D-15", name: "Installs detection devices", exam_question_count: 3 },
      { code: "D-1", name: "D -16 Installs signal-initiating devices", exam_question_count: 4 }
    ],
    "sprinklerfitter-e": [
      { code: "E-17", name: "Maintains and repairs fire protection systems", exam_question_count: 10 },
      { code: "E-1", name: "E -18 Inspects and tests fire protection systems", exam_question_count: 9 }
    ]
    },
  },
  "trade-gasfitter": {
    tradeId: "trade-gasfitter",
    tradeCode: "313D",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/gasfitter_b/exam-information.shtml",
    blocks: [
    { id: "gasfitter-a", trade_id: "trade-gasfitter", code: "A", name: "Common Occupational Skills", sort_order: 1, exam_question_count: 7, exam_percentage: 7 },
    { id: "gasfitter-b", trade_id: "trade-gasfitter", code: "B", name: "Gas Piping Preparation and Assembly", sort_order: 2, exam_question_count: 13, exam_percentage: 13 },
    { id: "gasfitter-c", trade_id: "trade-gasfitter", code: "C", name: "Venting and Air Supply Systems", sort_order: 3, exam_question_count: 13, exam_percentage: 13 },
    { id: "gasfitter-d", trade_id: "trade-gasfitter", code: "D", name: "Controls and Electrical Systems", sort_order: 4, exam_question_count: 18, exam_percentage: 18 },
    { id: "gasfitter-e", trade_id: "trade-gasfitter", code: "E", name: "Installation of Systems and Equipment", sort_order: 5, exam_question_count: 19, exam_percentage: 19 },
    { id: "gasfitter-f", trade_id: "trade-gasfitter", code: "F", name: "Testing and Commissioning of Gas-Fired Systems", sort_order: 6, exam_question_count: 14, exam_percentage: 14 },
    { id: "gasfitter-g", trade_id: "trade-gasfitter", code: "G", name: "Servicing Gas-Fired Systems", sort_order: 7, exam_question_count: 16, exam_percentage: 16 }
    ],
    chapterTasks: {
    "gasfitter-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "Maintains and uses tools and equipment", exam_question_count: 2 },
      { code: "A-3", name: "Plans and prepares for installation, service and maintenance", exam_question_count: 3 }
    ],
    "gasfitter-b": [
      { code: "B-4", name: "Fits tube and tubing for gas piping systems", exam_question_count: 4 },
      { code: "B-5", name: "Fits plastic pipe for gas piping systems", exam_question_count: 3 },
      { code: "B-6", name: "Fits steel pipe for gas piping systems", exam_question_count: 6 }
    ],
    "gasfitter-c": [
      { code: "C-7", name: "Installs venting", exam_question_count: 6 },
      { code: "C-8", name: "Installs air supply system", exam_question_count: 4 },
      { code: "C-9", name: "Installs draft control systems", exam_question_count: 3 }
    ],
    "gasfitter-d": [
      { code: "D-10", name: "Selects and installs electronic components", exam_question_count: 7 },
      { code: "D-11", name: "Selects and installs electrical components", exam_question_count: 8 },
      { code: "D-12", name: "Installs automation and instrumentation control systems", exam_question_count: 3 }
    ],
    "gasfitter-e": [
      { code: "E-13", name: "Installs gas-fired system piping and equipment", exam_question_count: 8 },
      { code: "E-14", name: "Installs gas-fired system components", exam_question_count: 7 },
      { code: "E-15", name: "Installs propane storage and handling systems", exam_question_count: 4 }
    ],
    "gasfitter-f": [
      { code: "F-16", name: "Tests gas-fired systems", exam_question_count: 7 },
      { code: "F-17", name: "Commissions gas-fired systems", exam_question_count: 7 }
    ],
    "gasfitter-g": [
      { code: "G-18", name: "Maintains gas-fired systems", exam_question_count: 6 },
      { code: "G-19", name: "Repairs gas-fired systems", exam_question_count: 7 },
      { code: "G-20", name: "Decommissions gas-fired systems", exam_question_count: 3 }
    ]
    },
  },
  "trade-carpenter": {
    tradeId: "trade-carpenter",
    tradeCode: "403A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/carpenters/exam-information.shtml",
    blocks: [
    { id: "carpenter-a", trade_id: "trade-carpenter", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 12, exam_percentage: 12 },
    { id: "carpenter-b", trade_id: "trade-carpenter", code: "B", name: "Performs planning and layout", sort_order: 2, exam_question_count: 14, exam_percentage: 14 },
    { id: "carpenter-c", trade_id: "trade-carpenter", code: "C", name: "Performs concrete work", sort_order: 3, exam_question_count: 16, exam_percentage: 16 },
    { id: "carpenter-d", trade_id: "trade-carpenter", code: "D", name: "Performs framing", sort_order: 4, exam_question_count: 20, exam_percentage: 20 },
    { id: "carpenter-e", trade_id: "trade-carpenter", code: "E", name: "Performs exterior finishing", sort_order: 5, exam_question_count: 14, exam_percentage: 14 },
    { id: "carpenter-f", trade_id: "trade-carpenter", code: "F", name: "Performs interior finishing", sort_order: 6, exam_question_count: 14, exam_percentage: 14 },
    { id: "carpenter-g", trade_id: "trade-carpenter", code: "G", name: "Performs renovations", sort_order: 7, exam_question_count: 10, exam_percentage: 10 }
    ],
    chapterTasks: {
    "carpenter-a": [
      { code: "A-1", name: "Uses and maintains tools and equipment", exam_question_count: 4 },
      { code: "A-2", name: "Performs safety-related activities", exam_question_count: 3 },
      { code: "A-3", name: "Builds and uses temporary access structures", exam_question_count: 3 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "carpenter-b": [
      { code: "B-5", name: "Interprets documentation", exam_question_count: 5 },
      { code: "B-6", name: "Organizes work", exam_question_count: 3 },
      { code: "B-7", name: "Performs layout", exam_question_count: 6 }
    ],
    "carpenter-c": [
      { code: "C-8", name: "Constructs formwork", exam_question_count: 12 },
      { code: "C-9", name: "Installs concrete, cement-based and epoxy products", exam_question_count: 4 }
    ],
    "carpenter-d": [
      { code: "D-10", name: "Constructs floor systems", exam_question_count: 6 },
      { code: "D-11", name: "Constructs deck systems", exam_question_count: 3 },
      { code: "D-12", name: "Constructs wall systems", exam_question_count: 6 },
      { code: "D-13", name: "Constructs roof and ceiling systems", exam_question_count: 5 }
    ],
    "carpenter-e": [
      { code: "E-14", name: "Installs exterior doors and windows", exam_question_count: 5 },
      { code: "E-15", name: "Installs roofing", exam_question_count: 4 },
      { code: "E-16", name: "Installs exterior finishes", exam_question_count: 5 }
    ],
    "carpenter-f": [
      { code: "F-17", name: "Applies wall and ceiling finishes", exam_question_count: 3 },
      { code: "F-18", name: "Installs flooring", exam_question_count: 2 },
      { code: "F-19", name: "Installs interior doors and windows", exam_question_count: 4 },
      { code: "F-20", name: "Constructs and installs finish components and stairs", exam_question_count: 5 }
    ],
    "carpenter-g": [
      { code: "G-21", name: "Performs renovation-specific support activities", exam_question_count: 5 },
      { code: "G-22", name: "Performs renovation-specific construction activities", exam_question_count: 5 }
    ]
    },
  },
  "trade-bricklayer": {
    tradeId: "trade-bricklayer",
    tradeCode: "401A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/bricklayers/exam-information.shtml",
    blocks: [
    { id: "bricklayer-a", trade_id: "trade-bricklayer", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 14, exam_percentage: 11 },
    { id: "bricklayer-b", trade_id: "trade-bricklayer", code: "B", name: "Performs general masonry practices", sort_order: 2, exam_question_count: 24, exam_percentage: 19 },
    { id: "bricklayer-c", trade_id: "trade-bricklayer", code: "C", name: "Builds masonry systems", sort_order: 3, exam_question_count: 27, exam_percentage: 22 },
    { id: "bricklayer-d", trade_id: "trade-bricklayer", code: "D", name: "Builds natural stone systems", sort_order: 4, exam_question_count: 13, exam_percentage: 10 },
    { id: "bricklayer-e", trade_id: "trade-bricklayer", code: "E", name: "Builds chimneys and fireplaces", sort_order: 5, exam_question_count: 13, exam_percentage: 10 },
    { id: "bricklayer-f", trade_id: "trade-bricklayer", code: "F", name: "Installs refractories and corrosion resistant materials", sort_order: 6, exam_question_count: 10, exam_percentage: 8 },
    { id: "bricklayer-g", trade_id: "trade-bricklayer", code: "G", name: "Performs restoration", sort_order: 7, exam_question_count: 14, exam_percentage: 11 },
    { id: "bricklayer-h", trade_id: "trade-bricklayer", code: "H", name: "Performs additional masonry", sort_order: 8, exam_question_count: 10, exam_percentage: 8 }
    ],
    chapterTasks: {
    "bricklayer-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 3 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 3 },
      { code: "A-3", name: "Uses scaffolding", exam_question_count: 3 },
      { code: "A-4", name: "Organizes work", exam_question_count: 3 },
      { code: "A-5", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "bricklayer-b": [
      { code: "B-6", name: "Performs substrate preparation", exam_question_count: 7 },
      { code: "B-7", name: "Performs fundamental masonry tasks", exam_question_count: 10 },
      { code: "B-8", name: "Uses mortars, grouts and adhesives", exam_question_count: 7 }
    ],
    "bricklayer-c": [
      { code: "C-9", name: "Builds masonry walls", exam_question_count: 12 },
      { code: "C-10", name: "Builds horizontal masonry surfaces", exam_question_count: 6 },
      { code: "C-11", name: "Builds and installs prefabricated masonry units", exam_question_count: 3 },
      { code: "C-12", name: "Installs surface-bonded masonry units", exam_question_count: 6 }
    ],
    "bricklayer-d": [
      { code: "D-13", name: "Builds natural stone walls", exam_question_count: 7 },
      { code: "D-14", name: "Performs mechanically-fastened natural stone cladding procedures", exam_question_count: 6 }
    ],
    "bricklayer-e": [
      { code: "E-15", name: "Builds chimneys", exam_question_count: 7 },
      { code: "E-16", name: "Builds fireplaces", exam_question_count: 6 }
    ],
    "bricklayer-f": [
      { code: "F-17", name: "Installs and maintains refractories", exam_question_count: 6 },
      { code: "F-18", name: "Installs and maintains corrosion resistant materials", exam_question_count: 4 }
    ],
    "bricklayer-g": [
      { code: "G-19", name: "Rebuilds masonry work", exam_question_count: 8 },
      { code: "G-20", name: "Repairs and cleans existing masonry work", exam_question_count: 6 }
    ],
    "bricklayer-h": [
      { code: "H-21", name: "Installs glass blocks", exam_question_count: 2 },
      { code: "H-22", name: "Installs ornamental and sculpted masonry", exam_question_count: 2 },
      { code: "H-23", name: "Builds arches", exam_question_count: 6 }
    ]
    },
  },
  "trade-concrete-finisher": {
    tradeId: "trade-concrete-finisher",
    tradeCode: "404A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/concretefinisher/exam-information.shtml",
    blocks: [
    { id: "concretefinisher-a", trade_id: "trade-concrete-finisher", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 14, exam_percentage: 14 },
    { id: "concretefinisher-b", trade_id: "trade-concrete-finisher", code: "B", name: "Performs site preparation", sort_order: 2, exam_question_count: 9, exam_percentage: 9 },
    { id: "concretefinisher-c", trade_id: "trade-concrete-finisher", code: "C", name: "Places and levels concrete", sort_order: 3, exam_question_count: 18, exam_percentage: 18 },
    { id: "concretefinisher-d", trade_id: "trade-concrete-finisher", code: "D", name: "Finishes plastic concrete", sort_order: 4, exam_question_count: 25, exam_percentage: 25 },
    { id: "concretefinisher-e", trade_id: "trade-concrete-finisher", code: "E", name: "Cures and protects concrete", sort_order: 5, exam_question_count: 15, exam_percentage: 15 },
    { id: "concretefinisher-f", trade_id: "trade-concrete-finisher", code: "F", name: "Modifies and repairs concrete and performs grouting", sort_order: 6, exam_question_count: 19, exam_percentage: 19 }
    ],
    chapterTasks: {
    "concretefinisher-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 3 },
      { code: "A-2", name: "Uses tools and equipment", exam_question_count: 5 },
      { code: "A-3", name: "Organizes work", exam_question_count: 4 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "concretefinisher-b": [
      { code: "B-5", name: "Prepares site", exam_question_count: 5 },
      { code: "B-6", name: "Uses formwork", exam_question_count: 4 }
    ],
    "concretefinisher-c": [
      { code: "C-7", name: "Places concrete", exam_question_count: 8 },
      { code: "C-8", name: "Levels concrete", exam_question_count: 10 }
    ],
    "concretefinisher-d": [
      { code: "D-9", name: "Floats concrete", exam_question_count: 6 },
      { code: "D-10", name: "Hand-tools concrete", exam_question_count: 6 },
      { code: "D-11", name: "Trowels concrete", exam_question_count: 7 },
      { code: "D-12", name: "Applies surface treatments to concrete", exam_question_count: 6 }
    ],
    "concretefinisher-e": [
      { code: "E-13", name: "Cures concrete", exam_question_count: 5 },
      { code: "E-14", name: "Creates contraction joints", exam_question_count: 6 },
      { code: "E-15", name: "Protects concrete", exam_question_count: 4 }
    ],
    "concretefinisher-f": [
      { code: "F-16", name: "Repairs and restores concrete", exam_question_count: 7 },
      { code: "F-17", name: "Applies surface treatments to hardened concrete", exam_question_count: 5 },
      { code: "F-18", name: "Grouts", exam_question_count: 5 },
      { code: "F-1", name: "F -19 Performs cutting and coring", exam_question_count: 2 }
    ]
    },
  },
  "trade-construction-craft-worker": {
    tradeId: "trade-construction-craft-worker",
    tradeCode: "405A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/constcraftwork/exam-information.shtml",
    blocks: [
    { id: "constructioncraftworker-a", trade_id: "trade-construction-craft-worker", code: "A", name: "Common Occupational Skills", sort_order: 1, exam_question_count: 23, exam_percentage: 23 },
    { id: "constructioncraftworker-b", trade_id: "trade-construction-craft-worker", code: "B", name: "Site Work", sort_order: 2, exam_question_count: 19, exam_percentage: 19 },
    { id: "constructioncraftworker-c", trade_id: "trade-construction-craft-worker", code: "C", name: "Scaffolding and Access Equipment", sort_order: 3, exam_question_count: 9, exam_percentage: 9 },
    { id: "constructioncraftworker-d", trade_id: "trade-construction-craft-worker", code: "D", name: "Concrete Work", sort_order: 4, exam_question_count: 18, exam_percentage: 18 },
    { id: "constructioncraftworker-e", trade_id: "trade-construction-craft-worker", code: "E", name: "Masonry Work", sort_order: 5, exam_question_count: 10, exam_percentage: 10 },
    { id: "constructioncraftworker-f", trade_id: "trade-construction-craft-worker", code: "F", name: "Utilities and Pipeline", sort_order: 6, exam_question_count: 11, exam_percentage: 11 },
    { id: "constructioncraftworker-g", trade_id: "trade-construction-craft-worker", code: "G", name: "Roadwork", sort_order: 7, exam_question_count: 10, exam_percentage: 10 }
    ],
    chapterTasks: {
    "constructioncraftworker-a": [
      { code: "A-1", name: "Performs safety-related functions.", exam_question_count: 6 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "Organizes work", exam_question_count: 4 },
      { code: "A-4", name: "Performs routine trade activities", exam_question_count: 7 }
    ],
    "constructioncraftworker-b": [
      { code: "B-5", name: "Prepares site", exam_question_count: 4 },
      { code: "B-6", name: "Performs ground work", exam_question_count: 4 },
      { code: "B-7", name: "Services site", exam_question_count: 6 },
      { code: "B-8", name: "Performs basic demolition", exam_question_count: 2 },
      { code: "B-9", name: "Performs safety watches", exam_question_count: 3 }
    ],
    "constructioncraftworker-c": [
      { code: "C-10", name: "Uses scaffolding", exam_question_count: 5 },
      { code: "C-11", name: "Uses access equipment", exam_question_count: 4 }
    ],
    "constructioncraftworker-d": [
      { code: "D-12", name: "Forms concrete", exam_question_count: 5 },
      { code: "D-13", name: "Places and finishes concrete", exam_question_count: 7 },
      { code: "D-14", name: "Modifies concrete", exam_question_count: 3 },
      { code: "D-15", name: "Places/Applies grout, epoxies and caulking", exam_question_count: 3 }
    ],
    "constructioncraftworker-e": [
      { code: "E-16", name: "Prepares for masonry work", exam_question_count: 5 },
      { code: "E-17", name: "Tends to bricklayers", exam_question_count: 5 }
    ],
    "constructioncraftworker-f": [
      { code: "F-18", name: "Installs utility piping for water and sewer installations", exam_question_count: 5 },
      { code: "F-19", name: "Performs pipeline activities", exam_question_count: 6 }
    ],
    "constructioncraftworker-g": [
      { code: "G-20", name: "Installs road surface material", exam_question_count: 4 },
      { code: "G-21", name: "Installs roadwork components", exam_question_count: 6 }
    ]
    },
  },
  "trade-drywall-finisher-plasterer": {
    tradeId: "trade-drywall-finisher-plasterer",
    tradeCode: "407A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/drywallplaster/exam-information.shtml",
    blocks: [
    { id: "drywallfinisherplasterer-a", trade_id: "trade-drywall-finisher-plasterer", code: "A", name: "Common Occupational Skills", sort_order: 1, exam_question_count: 15, exam_percentage: 15 },
    { id: "drywallfinisherplasterer-b", trade_id: "trade-drywall-finisher-plasterer", code: "B", name: "Taping", sort_order: 2, exam_question_count: 45, exam_percentage: 45 },
    { id: "drywallfinisherplasterer-c", trade_id: "trade-drywall-finisher-plasterer", code: "C", name: "Texturing", sort_order: 3, exam_question_count: 7, exam_percentage: 7 },
    { id: "drywallfinisherplasterer-d", trade_id: "trade-drywall-finisher-plasterer", code: "D", name: "Plastering, Special Coatings and Systems", sort_order: 4, exam_question_count: 9, exam_percentage: 9 },
    { id: "drywallfinisherplasterer-e", trade_id: "trade-drywall-finisher-plasterer", code: "E", name: "Moulding", sort_order: 5, exam_question_count: 5, exam_percentage: 5 },
    { id: "drywallfinisherplasterer-f", trade_id: "trade-drywall-finisher-plasterer", code: "F", name: "Repairs and Restoration", sort_order: 6, exam_question_count: 19, exam_percentage: 19 }
    ],
    chapterTasks: {
    "drywallfinisherplasterer-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 4 },
      { code: "A-3", name: "Performs common work practices and procedures", exam_question_count: 7 }
    ],
    "drywallfinisherplasterer-b": [
      { code: "B-4", name: "Prepares for taping", exam_question_count: 10 },
      { code: "B-5", name: "Tapes wallboard", exam_question_count: 16 },
      { code: "B-6", name: "Finishes wallboard", exam_question_count: 19 }
    ],
    "drywallfinisherplasterer-c": [
      { code: "C-7", name: "Prepares surfaces for texturing", exam_question_count: 3 },
      { code: "C-8", name: "Textures surfaces", exam_question_count: 4 }
    ],
    "drywallfinisherplasterer-d": [
      { code: "D-9", name: "Applies veneer plaster systems", exam_question_count: 5 },
      { code: "D-10", name: "Applies special plaster finishes and specialty coatings", exam_question_count: 4 }
    ],
    "drywallfinisherplasterer-e": [
      { code: "E-12", name: "Installs mouldings", exam_question_count: 5 }
    ],
    "drywallfinisherplasterer-f": [
      { code: "F-13", name: "Troubleshoots problems", exam_question_count: 7 },
      { code: "F-14", name: "Repairs surfaces", exam_question_count: 12 }
    ]
    },
  },
  "trade-floorcovering-installer": {
    tradeId: "trade-floorcovering-installer",
    tradeCode: "408A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/floorcover_install/exam-information.shtml",
    blocks: [
    { id: "floorcoveringinstaller-a", trade_id: "trade-floorcovering-installer", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 13, exam_percentage: 11 },
    { id: "floorcoveringinstaller-b", trade_id: "trade-floorcovering-installer", code: "B", name: "Prepares floor", sort_order: 2, exam_question_count: 28, exam_percentage: 23 },
    { id: "floorcoveringinstaller-c", trade_id: "trade-floorcovering-installer", code: "C", name: "Installs and repairs carpet", sort_order: 3, exam_question_count: 26, exam_percentage: 22 },
    { id: "floorcoveringinstaller-d", trade_id: "trade-floorcovering-installer", code: "D", name: "Installs and repairs resilient flooring", sort_order: 4, exam_question_count: 35, exam_percentage: 29 },
    { id: "floorcoveringinstaller-e", trade_id: "trade-floorcovering-installer", code: "E", name: "Installs and services wood, laminate and floating vinyl plank flooring", sort_order: 5, exam_question_count: 18, exam_percentage: 15 }
    ],
    chapterTasks: {
    "floorcoveringinstaller-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 2 },
      { code: "A-3", name: "Assesses floor and jobsite conditions", exam_question_count: 3 },
      { code: "A-4", name: "Organizes work", exam_question_count: 2 },
      { code: "A-5", name: "Installs transitions, trims and wall bases", exam_question_count: 3 },
      { code: "A-6", name: "Uses communication and mentoring techniques", exam_question_count: 1 }
    ],
    "floorcoveringinstaller-b": [
      { code: "B-7", name: "Removes existing floorcovering and accessories", exam_question_count: 9 },
      { code: "B-8", name: "Prepares substrate", exam_question_count: 19 }
    ],
    "floorcoveringinstaller-c": [
      { code: "C-9", name: "Installs carpet", exam_question_count: 11 },
      { code: "C-10", name: "Performs custom carpet procedures", exam_question_count: 8 },
      { code: "C-11", name: "Installs artificial turf", exam_question_count: 2 },
      { code: "C-12", name: "Repairs carpet", exam_question_count: 5 }
    ],
    "floorcoveringinstaller-d": [
      { code: "D-13", name: "Installs resilient flooring", exam_question_count: 17 },
      { code: "D-14", name: "Performs custom resilient flooring procedures", exam_question_count: 12 },
      { code: "D-15", name: "Repairs resilient flooring and accessories", exam_question_count: 6 }
    ],
    "floorcoveringinstaller-e": [
      { code: "E-16", name: "Installs pre-finished solid, engineered, laminate and floating vinyl plank flooring", exam_question_count: 10 },
      { code: "E-17", name: "Installs custom wood and laminate flooring", exam_question_count: 4 },
      { code: "E-18", name: "Services pre-finished solid, engineered, laminate and floating vinyl plank flooring", exam_question_count: 4 }
    ]
    },
  },
  "trade-glazier": {
    tradeId: "trade-glazier",
    tradeCode: "409A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/glaziers/exam-information.shtml",
    blocks: [
    { id: "glazier-a", trade_id: "trade-glazier", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 20, exam_percentage: 17 },
    { id: "glazier-b", trade_id: "trade-glazier", code: "B", name: "Fabricates and installs commercial window and door systems", sort_order: 2, exam_question_count: 41, exam_percentage: 34 },
    { id: "glazier-c", trade_id: "trade-glazier", code: "C", name: "Installs residential window and door systems", sort_order: 3, exam_question_count: 17, exam_percentage: 14 },
    { id: "glazier-d", trade_id: "trade-glazier", code: "D", name: "Fabricates and installs specialty glass, products and glass systems", sort_order: 4, exam_question_count: 19, exam_percentage: 16 },
    { id: "glazier-e", trade_id: "trade-glazier", code: "E", name: "Performs servicing", sort_order: 5, exam_question_count: 23, exam_percentage: 19 }
    ],
    chapterTasks: {
    "glazier-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "Uses tools and equipment", exam_question_count: 4 },
      { code: "A-3", name: "Uses rigging, hoisting and lifting equipment", exam_question_count: 2 },
      { code: "A-4", name: "Organizes work", exam_question_count: 4 },
      { code: "A-5", name: "Performs routine trade activities", exam_question_count: 6 },
      { code: "A-6", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "glazier-b": [
      { code: "B-7", name: "Fabricates commercial window and door systems", exam_question_count: 14 },
      { code: "B-8", name: "Installs commercial window and door systems", exam_question_count: 27 }
    ],
    "glazier-c": [
      { code: "C-9", name: "Installs residential window systems", exam_question_count: 10 },
      { code: "C-7", name: "Installs residential doors systems", exam_question_count: 7 }
    ],
    "glazier-d": [
      { code: "D-11", name: "Fabricates and installs commercial specialty glass and products", exam_question_count: 13 },
      { code: "D-12", name: "Fabricates and installs residential specialty glass and products", exam_question_count: 6 }
    ],
    "glazier-e": [
      { code: "E-13", name: "Services commercial window and door systems", exam_question_count: 13 },
      { code: "E-14", name: "Services residential window and door systems", exam_question_count: 6 },
      { code: "E-15", name: "Services specialty glass and products", exam_question_count: 4 }
    ]
    },
  },
  "trade-insulator-heat-frost": {
    tradeId: "trade-insulator-heat-frost",
    tradeCode: "410A",
    totalQuestions: 130,
    examUrl: "https://red-seal.ca/eng/trades/insulatorheatfrost/exam-information.shtml",
    blocks: [
    { id: "insulatorheatfrost-a", trade_id: "trade-insulator-heat-frost", code: "A", name: "Performs routine occupational skills", sort_order: 1, exam_question_count: 16, exam_percentage: 12 },
    { id: "insulatorheatfrost-b", trade_id: "trade-insulator-heat-frost", code: "B", name: "Performs industrial applications", sort_order: 2, exam_question_count: 40, exam_percentage: 31 },
    { id: "insulatorheatfrost-c", trade_id: "trade-insulator-heat-frost", code: "C", name: "Performs commercial applications", sort_order: 3, exam_question_count: 39, exam_percentage: 30 },
    { id: "insulatorheatfrost-d", trade_id: "trade-insulator-heat-frost", code: "D", name: "Performs applications common to industrial and commercial systems", sort_order: 4, exam_question_count: 15, exam_percentage: 12 },
    { id: "insulatorheatfrost-e", trade_id: "trade-insulator-heat-frost", code: "E", name: "Performs specialized applications", sort_order: 5, exam_question_count: 12, exam_percentage: 9 },
    { id: "insulatorheatfrost-f", trade_id: "trade-insulator-heat-frost", code: "F", name: "Performs asbestos , lead and mould abatement", sort_order: 6, exam_question_count: 8, exam_percentage: 6 }
    ],
    chapterTasks: {
    "insulatorheatfrost-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 3 },
      { code: "A-3", name: "Organizes work", exam_question_count: 3 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 2 },
      { code: "A-5", name: "Performs routine trade practices", exam_question_count: 6 }
    ],
    "insulatorheatfrost-b": [
      { code: "B-6", name: "Prepares for installation of insulation in industrial applications", exam_question_count: 8 },
      { code: "B-7", name: "Insulates piping and fittings", exam_question_count: 17 },
      { code: "B-8", name: "Insulates tanks, vessels and equipment", exam_question_count: 15 }
    ],
    "insulatorheatfrost-c": [
      { code: "C-9", name: "Prepares for installation of insulation in commercial applications", exam_question_count: 5 },
      { code: "C-10", name: "Insulates plumbing and mechanical piping systems", exam_question_count: 14 },
      { code: "C-11", name: "Insulates mechanical ducting", exam_question_count: 11 },
      { code: "C-12", name: "Insulates mechanical equipment", exam_question_count: 9 }
    ],
    "insulatorheatfrost-d": [
      { code: "D-13", name: "Installs fire stop systems", exam_question_count: 5 },
      { code: "D-14", name: "Insulates for soundproofing", exam_question_count: 2 },
      { code: "D-15", name: "Installs removable covers", exam_question_count: 6 },
      { code: "D-16", name: "Installs underground insulating systems", exam_question_count: 2 }
    ],
    "insulatorheatfrost-e": [
      { code: "E-17", name: "Sprays sealers, coatings and spray-on insulation", exam_question_count: 3 },
      { code: "E-18", name: "Installs fireproofing", exam_question_count: 2 },
      { code: "E-19", name: "Installs insulation for refractory systems", exam_question_count: 3 },
      { code: "E-20", name: "Installs insulation for cryogenic systems", exam_question_count: 4 }
    ],
    "insulatorheatfrost-f": [
      { code: "F-22", name: "Prepares for asbestos abatement", exam_question_count: 3 },
      { code: "F-23", name: "Performs asbestos removal procedures", exam_question_count: 3 },
      { code: "F-24", name: "Performs maintenance and repair", exam_question_count: 1 },
      { code: "F-25", name: "Performs lead abatement and mould remediation", exam_question_count: 1 }
    ]
    },
  },
  "trade-ironworker-structural": {
    tradeId: "trade-ironworker-structural",
    tradeCode: "420G",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/ironwork_structural/exam-information.shtml",
    blocks: [
    { id: "ironworkerstructural-a", trade_id: "trade-ironworker-structural", code: "A", name: "Occupational skills", sort_order: 1, exam_question_count: 14, exam_percentage: 12 },
    { id: "ironworkerstructural-b", trade_id: "trade-ironworker-structural", code: "B", name: "Rigging and hoisting", sort_order: 2, exam_question_count: 30, exam_percentage: 25 },
    { id: "ironworkerstructural-c", trade_id: "trade-ironworker-structural", code: "C", name: "Cranes", sort_order: 3, exam_question_count: 16, exam_percentage: 13 },
    { id: "ironworkerstructural-d", trade_id: "trade-ironworker-structural", code: "D", name: "Erection, assembly and installation", sort_order: 4, exam_question_count: 48, exam_percentage: 40 },
    { id: "ironworkerstructural-e", trade_id: "trade-ironworker-structural", code: "E", name: "Maintenance and upgrading", sort_order: 5, exam_question_count: 12, exam_percentage: 10 }
    ],
    chapterTasks: {
    "ironworkerstructural-a": [
      { code: "A-1", name: "1 Interprets occupational documentation", exam_question_count: 4 },
      { code: "A-2", name: "2 Communicates in the workplace", exam_question_count: 2 },
      { code: "A-3", name: "3 Uses and maintains tools and equipment", exam_question_count: 5 },
      { code: "A-4", name: "4 Organizes work", exam_question_count: 3 }
    ],
    "ironworkerstructural-b": [
      { code: "B-1", name: "5 Selects rigging equipment", exam_question_count: 14 },
      { code: "B-2", name: "6 Uses hoisting and lifting equipment", exam_question_count: 16 }
    ],
    "ironworkerstructural-c": [
      { code: "C-1", name: "7 Assembles and erects cranes", exam_question_count: 10 },
      { code: "C-2", name: "8 Disassembles cranes", exam_question_count: 6 }
    ],
    "ironworkerstructural-d": [
      { code: "D-1", name: "9 Installs primary and secondary structural members", exam_question_count: 24 },
      { code: "D-2", name: "10 Installs ornamental components and systems", exam_question_count: 14 },
      { code: "D-3", name: "11 Installs conveyors, machinery and equipment", exam_question_count: 10 }
    ],
    "ironworkerstructural-e": [
      { code: "E-1", name: "12 Repairs components", exam_question_count: 6 },
      { code: "E-2", name: "13 Decommissions, disassembles and removes structural, mechanical and miscellaneous components", exam_question_count: 6 }
    ]
    },
  },
  "trade-ironworker-reinforcing": {
    tradeId: "trade-ironworker-reinforcing",
    tradeCode: "420R",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/ironwork_reinforce/exam-information.shtml",
    blocks: [
    { id: "ironworkerreinforcing-a", trade_id: "trade-ironworker-reinforcing", code: "A", name: "Occupational skills", sort_order: 1, exam_question_count: 19, exam_percentage: 16 },
    { id: "ironworkerreinforcing-b", trade_id: "trade-ironworker-reinforcing", code: "B", name: "Rigging and hoisting", sort_order: 2, exam_question_count: 28, exam_percentage: 23 },
    { id: "ironworkerreinforcing-c", trade_id: "trade-ironworker-reinforcing", code: "C", name: "Cranes", sort_order: 3, exam_question_count: 5, exam_percentage: 4 },
    { id: "ironworkerreinforcing-d", trade_id: "trade-ironworker-reinforcing", code: "D", name: "Reinforcing", sort_order: 4, exam_question_count: 57, exam_percentage: 48 },
    { id: "ironworkerreinforcing-e", trade_id: "trade-ironworker-reinforcing", code: "E", name: "Pre-stresses/post-tensions", sort_order: 5, exam_question_count: 11, exam_percentage: 9 }
    ],
    chapterTasks: {
    "ironworkerreinforcing-a": [
      { code: "A-1", name: "1 Interprets occupational documentation", exam_question_count: 6 },
      { code: "A-2", name: "2 Communicates in the workplace", exam_question_count: 3 },
      { code: "A-3", name: "3 Uses and maintains tools and equipment", exam_question_count: 6 },
      { code: "A-4", name: "4 Organizes work", exam_question_count: 4 }
    ],
    "ironworkerreinforcing-b": [
      { code: "B-1", name: "5 Selects rigging equipment", exam_question_count: 14 },
      { code: "B-2", name: "6 Uses hoisting and lifting equipment", exam_question_count: 14 }
    ],
    "ironworkerreinforcing-c": [
      { code: "C-1", name: "7 Selects, assembles and erects cranes and components", exam_question_count: 3 },
      { code: "C-2", name: "8 Disassembles cranes", exam_question_count: 2 }
    ],
    "ironworkerreinforcing-d": [
      { code: "D-1", name: "9 Fabricates on-site", exam_question_count: 13 },
      { code: "D-2", name: "10 Installs reinforcing material", exam_question_count: 44 }
    ],
    "ironworkerreinforcing-e": [
      { code: "E-1", name: "11 Places pre-stressed/post-tensioning systems", exam_question_count: 4 },
      { code: "E-2", name: "12 Stresses tendons", exam_question_count: 5 },
      { code: "E-3", name: "13 Grouts tendons", exam_question_count: 2 }
    ]
    },
  },
  "trade-painter-decorator": {
    tradeId: "trade-painter-decorator",
    tradeCode: "411A",
    totalQuestions: 130,
    examUrl: "https://red-seal.ca/eng/trades/paintdeco/exam-information.shtml",
    blocks: [
    { id: "painterdecorator-a", trade_id: "trade-painter-decorator", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 20, exam_percentage: 15 },
    { id: "painterdecorator-b", trade_id: "trade-painter-decorator", code: "B", name: "Prepares surfaces", sort_order: 2, exam_question_count: 30, exam_percentage: 23 },
    { id: "painterdecorator-c", trade_id: "trade-painter-decorator", code: "C", name: "Prepares and applies residential, institutional and commercial paints, coatings and finishes", sort_order: 3, exam_question_count: 31, exam_percentage: 24 },
    { id: "painterdecorator-d", trade_id: "trade-painter-decorator", code: "D", name: "Prepares and applies wall coverings", sort_order: 4, exam_question_count: 9, exam_percentage: 7 },
    { id: "painterdecorator-e", trade_id: "trade-painter-decorator", code: "E", name: "Prepares and applies wood finishes", sort_order: 5, exam_question_count: 11, exam_percentage: 8 },
    { id: "painterdecorator-f", trade_id: "trade-painter-decorator", code: "F", name: "Prepares and applies industrial paints and coatings", sort_order: 6, exam_question_count: 29, exam_percentage: 22 }
    ],
    chapterTasks: {
    "painterdecorator-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "2 Uses and maintains tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "3 Performs routine trade practices", exam_question_count: 6 },
      { code: "A-4", name: "4 Performs quality control assessments", exam_question_count: 3 },
      { code: "A-5", name: "5 Uses communication and mentoring techniques", exam_question_count: 1 }
    ],
    "painterdecorator-b": [
      { code: "B-1", name: "6 Performs general surface preparation", exam_question_count: 9 },
      { code: "B-2", name: "7 Prepares wood surfaces for paints, coatings and wall coverings", exam_question_count: 5 },
      { code: "B-3", name: "8 Prepares concrete and masonry surfaces", exam_question_count: 5 },
      { code: "B-4", name: "9 Prepares metal surfaces", exam_question_count: 6 },
      { code: "B-5", name: "10 Prepares plaster surfaces and drywall", exam_question_count: 5 }
    ],
    "painterdecorator-c": [
      { code: "C-1", name: "11 Prepares for application of residential, institutional and commercial paints and coatings", exam_question_count: 12 },
      { code: "C-2", name: "12 Applies residential, institutional and commercial paints and coatings", exam_question_count: 15 },
      { code: "C-3", name: "13 Applies decorative/specialty finishes", exam_question_count: 4 }
    ],
    "painterdecorator-d": [
      { code: "D-1", name: "14 Prepares for application of wall coverings", exam_question_count: 4 },
      { code: "D-2", name: "15 Applies wall coverings", exam_question_count: 5 }
    ],
    "painterdecorator-e": [
      { code: "E-1", name: "16 Prepares for wood finishing applications", exam_question_count: 5 },
      { code: "E-2", name: "17 Finishes wood surfaces", exam_question_count: 6 }
    ],
    "painterdecorator-f": [
      { code: "F-1", name: "18 Prepares for application of industrial paints and coatings", exam_question_count: 15 },
      { code: "F-2", name: "19 Applies industrial paints and coatings", exam_question_count: 14 }
    ]
    },
  },
  "trade-roofer": {
    tradeId: "trade-roofer",
    tradeCode: "412A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/roof/exam-information.shtml",
    blocks: [
    { id: "roofer-a", trade_id: "trade-roofer", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 23, exam_percentage: 18 },
    { id: "roofer-b", trade_id: "trade-roofer", code: "B", name: "Prepares roof and deck", sort_order: 2, exam_question_count: 18, exam_percentage: 14 },
    { id: "roofer-c", trade_id: "trade-roofer", code: "C", name: "Installs low slope roofing", sort_order: 3, exam_question_count: 38, exam_percentage: 30 },
    { id: "roofer-d", trade_id: "trade-roofer", code: "D", name: "Installs steep slope roofing", sort_order: 4, exam_question_count: 17, exam_percentage: 14 },
    { id: "roofer-e", trade_id: "trade-roofer", code: "E", name: "Waterproofs and damp-proofs surfaces", sort_order: 5, exam_question_count: 12, exam_percentage: 10 },
    { id: "roofer-f", trade_id: "trade-roofer", code: "F", name: "Assesses, maintains and repairs roof", sort_order: 6, exam_question_count: 17, exam_percentage: 14 }
    ],
    chapterTasks: {
    "roofer-a": [
      { code: "A-1", name: "1 Performs safety related functions", exam_question_count: 7 },
      { code: "A-2", name: "2 Uses tools and equipment", exam_question_count: 7 },
      { code: "A-3", name: "3 Organizes work", exam_question_count: 6 },
      { code: "A-4", name: "4 Uses communication and mentoring techniques", exam_question_count: 3 }
    ],
    "roofer-b": [
      { code: "B-1", name: "5 Prepares roof for replacement", exam_question_count: 10 },
      { code: "B-2", name: "6 Prepares deck for roof installation", exam_question_count: 8 }
    ],
    "roofer-c": [
      { code: "C-1", name: "7 Applies low slope roofing components", exam_question_count: 18 },
      { code: "C-2", name: "8 Applies low slope roofing membranes", exam_question_count: 20 }
    ],
    "roofer-d": [
      { code: "D-1", name: "9 Performs common steep slope practices", exam_question_count: 6 },
      { code: "D-2", name: "10 Applies shingles", exam_question_count: 6 },
      { code: "D-3", name: "11 Applies roof tiles", exam_question_count: 2 },
      { code: "D-4", name: "12 Applies pre-formed metal roofing", exam_question_count: 3 }
    ],
    "roofer-e": [
      { code: "E-1", name: "13 Waterproofs surfaces", exam_question_count: 8 },
      { code: "E-2", name: "14 Damp-proofs surfaces", exam_question_count: 4 }
    ],
    "roofer-f": [
      { code: "F-1", name: "15 Assesses roof condition", exam_question_count: 5 },
      { code: "F-2", name: "16 Maintains and repairs low slope roofing", exam_question_count: 7 },
      { code: "F-3", name: "17 Maintains and repairs steep slope roofing", exam_question_count: 5 }
    ]
    },
  },
  "trade-sheet-metal-worker": {
    tradeId: "trade-sheet-metal-worker",
    tradeCode: "413A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/sheetmetalwork/exam-information.shtml",
    blocks: [
    { id: "sheetmetalworker-a", trade_id: "trade-sheet-metal-worker", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 24, exam_percentage: 20 },
    { id: "sheetmetalworker-b", trade_id: "trade-sheet-metal-worker", code: "B", name: "Performs fabrication", sort_order: 2, exam_question_count: 38, exam_percentage: 32 },
    { id: "sheetmetalworker-c", trade_id: "trade-sheet-metal-worker", code: "C", name: "Installs air and material handling systems", sort_order: 3, exam_question_count: 41, exam_percentage: 34 },
    { id: "sheetmetalworker-d", trade_id: "trade-sheet-metal-worker", code: "D", name: "Installs roofing and specialty products", sort_order: 4, exam_question_count: 10, exam_percentage: 8 },
    { id: "sheetmetalworker-e", trade_id: "trade-sheet-metal-worker", code: "E", name: "Performs maintenance and repair", sort_order: 5, exam_question_count: 7, exam_percentage: 6 }
    ],
    chapterTasks: {
    "sheetmetalworker-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 5 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 9 },
      { code: "A-3", name: "Organizes work", exam_question_count: 7 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 3 }
    ],
    "sheetmetalworker-b": [
      { code: "B-5", name: "Performs pattern development", exam_question_count: 13 },
      { code: "B-6", name: "Fabricates sheet metal components for air and material handling systems", exam_question_count: 16 },
      { code: "B-7", name: "Fabricates flashing, roofing, sheeting and cladding", exam_question_count: 3 },
      { code: "B-8", name: "Fabricates specialty products", exam_question_count: 6 }
    ],
    "sheetmetalworker-c": [
      { code: "C-9", name: "Prepares installation site", exam_question_count: 7 },
      { code: "C-10", name: "Installs and connects chimneys, breeching and venting to exhaust appliances and mechanical equipment", exam_question_count: 6 },
      { code: "C-11", name: "Installs air handling system components", exam_question_count: 16 },
      { code: "C-12", name: "Installs material handling system components", exam_question_count: 5 },
      { code: "C-13", name: "Applies thermal insulation, lagging, cladding and flashing", exam_question_count: 3 },
      { code: "C-14", name: "Performs leak testing, air balancing and commissioning", exam_question_count: 4 }
    ],
    "sheetmetalworker-d": [
      { code: "D-15", name: "Installs metal roofing and cladding/siding systems", exam_question_count: 3 },
      { code: "D-16", name: "Installs exterior components", exam_question_count: 2 },
      { code: "D-17", name: "Installs specialty products", exam_question_count: 5 }
    ],
    "sheetmetalworker-e": [
      { code: "E-18", name: "Performs scheduled maintenance", exam_question_count: 3 },
      { code: "E-19", name: "Repairs faulty systems and components", exam_question_count: 4 }
    ]
    },
  },
  "trade-tilesetter": {
    tradeId: "trade-tilesetter",
    tradeCode: "414A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/tileset/exam-information.shtml",
    blocks: [
    { id: "tilesetter-a", trade_id: "trade-tilesetter", code: "A", name: "Occupational skills", sort_order: 1, exam_question_count: 12, exam_percentage: 12 },
    { id: "tilesetter-b", trade_id: "trade-tilesetter", code: "B", name: "Substrate preparation", sort_order: 2, exam_question_count: 15, exam_percentage: 15 },
    { id: "tilesetter-c", trade_id: "trade-tilesetter", code: "C", name: "Layouts", sort_order: 3, exam_question_count: 21, exam_percentage: 21 },
    { id: "tilesetter-d", trade_id: "trade-tilesetter", code: "D", name: "Material preparation", sort_order: 4, exam_question_count: 14, exam_percentage: 14 },
    { id: "tilesetter-e", trade_id: "trade-tilesetter", code: "E", name: "Material setting", sort_order: 5, exam_question_count: 24, exam_percentage: 24 },
    { id: "tilesetter-f", trade_id: "trade-tilesetter", code: "F", name: "Finishing", sort_order: 6, exam_question_count: 14, exam_percentage: 14 }
    ],
    chapterTasks: {
    "tilesetter-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "2 Uses and maintains tools and equipment", exam_question_count: 4 },
      { code: "A-3", name: "3 Organizes work", exam_question_count: 4 }
    ],
    "tilesetter-b": [
      { code: "B-1", name: "4 Removes existing finishes", exam_question_count: 4 },
      { code: "B-2", name: "5 Evaluates and prepares surface", exam_question_count: 7 },
      { code: "B-3", name: "6 Installs specialty products", exam_question_count: 4 }
    ],
    "tilesetter-c": [
      { code: "C-1", name: "7 Lays out work area", exam_question_count: 16 },
      { code: "C-2", name: "8 Evaluates joints", exam_question_count: 5 }
    ],
    "tilesetter-d": [
      { code: "D-1", name: "9 Inspects materials", exam_question_count: 3 },
      { code: "D-2", name: "10 Prepares material for installation", exam_question_count: 6 },
      { code: "D-3", name: "11 Mixes materials", exam_question_count: 5 }
    ],
    "tilesetter-e": [
      { code: "E-1", name: "12 Installs tiles", exam_question_count: 13 },
      { code: "E-2", name: "13 Installs stone slabs", exam_question_count: 7 },
      { code: "E-3", name: "14 Pours terrazzo mixture", exam_question_count: 4 }
    ],
    "tilesetter-f": [
      { code: "F-1", name: "15 Finishes installed product", exam_question_count: 9 },
      { code: "F-2", name: "16 Finishes terrazzo and stone", exam_question_count: 5 }
    ]
    },
  },
  "trade-cabinetmaker": {
    tradeId: "trade-cabinetmaker",
    tradeCode: "415A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/cabinetmakers/exam-information.shtml",
    blocks: [
    { id: "cabinetmaker-a", trade_id: "trade-cabinetmaker", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 16, exam_percentage: 13 },
    { id: "cabinetmaker-b", trade_id: "trade-cabinetmaker", code: "B", name: "Performs machining", sort_order: 2, exam_question_count: 19, exam_percentage: 16 },
    { id: "cabinetmaker-c", trade_id: "trade-cabinetmaker", code: "C", name: "Performs forming and laminating", sort_order: 3, exam_question_count: 13, exam_percentage: 11 },
    { id: "cabinetmaker-d", trade_id: "trade-cabinetmaker", code: "D", name: "Installs veneers and laminates", sort_order: 4, exam_question_count: 14, exam_percentage: 12 },
    { id: "cabinetmaker-e", trade_id: "trade-cabinetmaker", code: "E", name: "Performs shop assembly", sort_order: 5, exam_question_count: 20, exam_percentage: 17 },
    { id: "cabinetmaker-f", trade_id: "trade-cabinetmaker", code: "F", name: "Performs finishing", sort_order: 6, exam_question_count: 14, exam_percentage: 12 },
    { id: "cabinetmaker-g", trade_id: "trade-cabinetmaker", code: "G", name: "Performs on-site assembly and installation", sort_order: 7, exam_question_count: 15, exam_percentage: 13 },
    { id: "cabinetmaker-h", trade_id: "trade-cabinetmaker", code: "H", name: "Performs specialized operations", sort_order: 8, exam_question_count: 9, exam_percentage: 8 }
    ],
    chapterTasks: {
    "cabinetmaker-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "Maintains tools and equipment", exam_question_count: 4 },
      { code: "A-3", name: "Organizes work", exam_question_count: 4 },
      { code: "A-4", name: "Performs routine work practices", exam_question_count: 4 },
      { code: "A-5", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "cabinetmaker-b": [
      { code: "B-6", name: "Machines components using stationary and portable power tools", exam_question_count: 14 },
      { code: "B-7", name: "Machines components using automated and CNC equipment", exam_question_count: 5 }
    ],
    "cabinetmaker-c": [
      { code: "C-8", name: "Creates curved components using wood and composite materials", exam_question_count: 6 },
      { code: "C-9", name: "Laminates wood and composite materials", exam_question_count: 7 }
    ],
    "cabinetmaker-d": [
      { code: "D-10", name: "Applies veneers", exam_question_count: 7 },
      { code: "D-11", name: "Applies laminate sheets", exam_question_count: 7 }
    ],
    "cabinetmaker-e": [
      { code: "E-12", name: "Assembles cabinets and furniture", exam_question_count: 11 },
      { code: "E-13", name: "Assembles architectural millwork products", exam_question_count: 9 }
    ],
    "cabinetmaker-f": [
      { code: "F-14", name: "Prepares surface for finishing", exam_question_count: 7 },
      { code: "F-15", name: "Finishes wood products", exam_question_count: 7 }
    ],
    "cabinetmaker-g": [
      { code: "G-16", name: "Modifies products to site conditions", exam_question_count: 4 },
      { code: "G-17", name: "Installs cabinets and countertops", exam_question_count: 6 },
      { code: "G-18", name: "Installs architectural millwork products and mouldings", exam_question_count: 5 }
    ],
    "cabinetmaker-h": [
      { code: "H-19", name: "Builds stairs and balustrades", exam_question_count: 3 },
      { code: "H-20", name: "Works with solid surface material and custom countertops", exam_question_count: 3 },
      { code: "H-21", name: "Creates decorative woodwork", exam_question_count: 1 },
      { code: "H-22", name: "Restores woodwork", exam_question_count: 2 }
    ]
    },
  },
  "trade-lather-interior-systems": {
    tradeId: "trade-lather-interior-systems",
    tradeCode: "416A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/latherintsysmech/exam-information.shtml",
    blocks: [
    { id: "latherinteriorsystems-a", trade_id: "trade-lather-interior-systems", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 27, exam_percentage: 31 },
    { id: "latherinteriorsystems-c", trade_id: "trade-lather-interior-systems", code: "C", name: "Installs interior systems", sort_order: 2, exam_question_count: 45, exam_percentage: 51 },
    { id: "latherinteriorsystems-d", trade_id: "trade-lather-interior-systems", code: "D", name: "Installs exterior systems", sort_order: 3, exam_question_count: 16, exam_percentage: 18 }
    ],
    chapterTasks: {
    "latherinteriorsystems-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 3 },
      { code: "A-2", name: "Uses tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "Organizes work", exam_question_count: 7 },
      { code: "A-4", name: "Performs routine trade activities", exam_question_count: 8 },
      { code: "A-5", name: "Uses communication and mentoring techniques", exam_question_count: 3 }
    ],
    "latherinteriorsystems-c": [
      { code: "C-8", name: "Installs wall systems and components", exam_question_count: 15 },
      { code: "C-9", name: "Installs ceiling systems", exam_question_count: 14 },
      { code: "C-10", name: "Installs access flooring systems", exam_question_count: 2 },
      { code: "C-11", name: "Installs sound barriers and lead radiation shielding", exam_question_count: 5 },
      { code: "C-12", name: "Installs smoke and fire barriers", exam_question_count: 9 }
    ],
    "latherinteriorsystems-d": [
      { code: "D-13", name: "Installs insulation and membranes", exam_question_count: 8 },
      { code: "D-14", name: "Prepares surface for exterior finishes", exam_question_count: 6 },
      { code: "D-15", name: "Installs exterior finishes", exam_question_count: 2 }
    ]
    },
  },
  "trade-millwright": {
    tradeId: "trade-millwright",
    tradeCode: "433A",
    totalQuestions: 135,
    examUrl: "https://red-seal.ca/eng/trades/industrialmech/exam-information.shtml",
    blocks: [
    { id: "millwright-a", trade_id: "trade-millwright", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 25, exam_percentage: 19 },
    { id: "millwright-b", trade_id: "trade-millwright", code: "B", name: "Performs rigging, hoisting/lifting and moving", sort_order: 2, exam_question_count: 17, exam_percentage: 13 },
    { id: "millwright-c", trade_id: "trade-millwright", code: "C", name: "Services mechanical power transmission components and systems", sort_order: 3, exam_question_count: 32, exam_percentage: 24 },
    { id: "millwright-d", trade_id: "trade-millwright", code: "D", name: "Services material handling / process systems", sort_order: 4, exam_question_count: 24, exam_percentage: 18 },
    { id: "millwright-e", trade_id: "trade-millwright", code: "E", name: "Services fluid power systems", sort_order: 5, exam_question_count: 21, exam_percentage: 16 },
    { id: "millwright-f", trade_id: "trade-millwright", code: "F", name: "Performs preventative and predictive maintenance, commissioning and decommissioning", sort_order: 6, exam_question_count: 16, exam_percentage: 12 }
    ],
    chapterTasks: {
    "millwright-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "Uses tools and equipment", exam_question_count: 5 },
      { code: "A-3", name: "Performs routine trade tasks", exam_question_count: 7 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 3 },
      { code: "A-5", name: "Performs measuring and layout", exam_question_count: 4 },
      { code: "A-6", name: "Performs cutting and welding operations", exam_question_count: 2 }
    ],
    "millwright-b": [
      { code: "B-7", name: "Plans rigging, hoisting/lifting and moving", exam_question_count: 8 },
      { code: "B-8", name: "Rigs, hoists/lifts and moves load", exam_question_count: 9 }
    ],
    "millwright-c": [
      { code: "C-9", name: "Services prime movers", exam_question_count: 5 },
      { code: "C-10", name: "Services shafts, bearings and seals", exam_question_count: 6 },
      { code: "C-11", name: "Services couplings, clutches and brakes", exam_question_count: 5 },
      { code: "C-12", name: "Services chain and belt drive systems", exam_question_count: 5 },
      { code: "C-13", name: "Services gear systems", exam_question_count: 5 },
      { code: "C-14", name: "Performs shaft alignment procedures", exam_question_count: 6 }
    ],
    "millwright-d": [
      { code: "D-15", name: "Services robotics and automated equipment", exam_question_count: 1 },
      { code: "D-16", name: "Services fans and blowers", exam_question_count: 4 },
      { code: "D-17", name: "Services pumps", exam_question_count: 5 },
      { code: "D-18", name: "Services compressors", exam_question_count: 5 },
      { code: "D-19", name: "Services process piping, tanks and containers", exam_question_count: 4 },
      { code: "D-20", name: "Services conveying systems", exam_question_count: 5 }
    ],
    "millwright-e": [
      { code: "E-21", name: "Services hydraulic systems", exam_question_count: 12 },
      { code: "E-22", name: "Services pneumatic and vacuum systems", exam_question_count: 9 }
    ],
    "millwright-f": [
      { code: "F-23", name: "Performs preventative and predictive maintenance", exam_question_count: 11 },
      { code: "F-24", name: "Commissions and decommissions equipment", exam_question_count: 5 }
    ]
    },
  },
  "trade-machinist": {
    tradeId: "trade-machinist",
    tradeCode: "429A",
    totalQuestions: 135,
    examUrl: "https://red-seal.ca/eng/trades/machinists/exam-information.shtml",
    blocks: [
    { id: "machinist-a", trade_id: "trade-machinist", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 13, exam_percentage: 10 },
    { id: "machinist-b", trade_id: "trade-machinist", code: "B", name: "Performs benchwork", sort_order: 2, exam_question_count: 11, exam_percentage: 8 },
    { id: "machinist-c", trade_id: "trade-machinist", code: "C", name: "Machines using power saws", sort_order: 3, exam_question_count: 8, exam_percentage: 6 },
    { id: "machinist-d", trade_id: "trade-machinist", code: "D", name: "Machines using drill presses", sort_order: 4, exam_question_count: 9, exam_percentage: 7 },
    { id: "machinist-e", trade_id: "trade-machinist", code: "E", name: "Machines using conventional lathes", sort_order: 5, exam_question_count: 28, exam_percentage: 21 },
    { id: "machinist-f", trade_id: "trade-machinist", code: "F", name: "Machines using conventional milling machines", sort_order: 6, exam_question_count: 28, exam_percentage: 21 },
    { id: "machinist-g", trade_id: "trade-machinist", code: "G", name: "Machines using precision grinding machines", sort_order: 7, exam_question_count: 11, exam_percentage: 8 },
    { id: "machinist-h", trade_id: "trade-machinist", code: "H", name: "Machines using computer numerical control (cnc) machines", sort_order: 8, exam_question_count: 27, exam_percentage: 20 }
    ],
    chapterTasks: {
    "machinist-a": [
      { code: "A-1", name: "Performs safety-related tasks", exam_question_count: 2 },
      { code: "A-2", name: "Organizes work", exam_question_count: 3 },
      { code: "A-3", name: "Uses communication and mentoring techniques", exam_question_count: 2 },
      { code: "A-4", name: "Processes workpiece material", exam_question_count: 4 },
      { code: "A-5", name: "Maintains machines, tooling and inspection equipment", exam_question_count: 2 }
    ],
    "machinist-b": [
      { code: "B-6", name: "Performs hand processes", exam_question_count: 8 },
      { code: "B-7", name: "Refurbishes components", exam_question_count: 3 }
    ],
    "machinist-c": [
      { code: "C-8", name: "Sets up power saws", exam_question_count: 5 },
      { code: "C-9", name: "Operates power saws", exam_question_count: 3 }
    ],
    "machinist-d": [
      { code: "D-10", name: "Sets up drill presses", exam_question_count: 5 },
      { code: "D-11", name: "Operates drill presses", exam_question_count: 4 }
    ],
    "machinist-e": [
      { code: "E-12", name: "Sets up conventional lathes", exam_question_count: 14 },
      { code: "E-13", name: "Operates conventional lathes", exam_question_count: 14 }
    ],
    "machinist-f": [
      { code: "F-14", name: "Sets up conventional milling machines", exam_question_count: 15 },
      { code: "F-15", name: "Operates conventional milling machines", exam_question_count: 13 }
    ],
    "machinist-g": [
      { code: "G-16", name: "Sets up precision grinding machines", exam_question_count: 6 },
      { code: "G-17", name: "Operates precision grinding machines", exam_question_count: 5 }
    ],
    "machinist-h": [
      { code: "H-18", name: "Performs CNC programming", exam_question_count: 12 },
      { code: "H-19", name: "Sets up CNC machines", exam_question_count: 8 },
      { code: "H-20", name: "Operates CNC machines", exam_question_count: 7 }
    ]
    },
  },
  "trade-tool-die-maker": {
    tradeId: "trade-tool-die-maker",
    tradeCode: "430A",
    totalQuestions: 135,
    examUrl: "https://red-seal.ca/eng/trades/tooldiemaker/exam-information.shtml",
    blocks: [
    { id: "tooldiemaker-a", trade_id: "trade-tool-die-maker", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 20, exam_percentage: 15 },
    { id: "tooldiemaker-b", trade_id: "trade-tool-die-maker", code: "B", name: "Operates machine-tools", sort_order: 2, exam_question_count: 45, exam_percentage: 33 },
    { id: "tooldiemaker-c", trade_id: "trade-tool-die-maker", code: "C", name: "Performs heat treatment", sort_order: 3, exam_question_count: 13, exam_percentage: 10 },
    { id: "tooldiemaker-d", trade_id: "trade-tool-die-maker", code: "D", name: "Performs design and development of prototypes and production tools", sort_order: 4, exam_question_count: 57, exam_percentage: 42 }
    ],
    chapterTasks: {
    "tooldiemaker-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 5 },
      { code: "A-2", name: "Maintains machine-tools, accessories and cutting tools", exam_question_count: 3 },
      { code: "A-3", name: "Organizes work", exam_question_count: 5 },
      { code: "A-4", name: "Performs benchwork", exam_question_count: 5 },
      { code: "A-5", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "tooldiemaker-b": [
      { code: "B-6", name: "Operates power saws", exam_question_count: 4 },
      { code: "B-7", name: "Operates drill presses", exam_question_count: 4 },
      { code: "B-8", name: "Operates conventional lathes", exam_question_count: 9 },
      { code: "B-9", name: "Operates conventional milling machines", exam_question_count: 9 },
      { code: "B-10", name: "Operates grinding machines", exam_question_count: 9 },
      { code: "B-11", name: "Operates computer numerical control (CNC) machines", exam_question_count: 6 },
      { code: "B-12", name: "Operates electrical discharge machines (EDM)", exam_question_count: 4 }
    ],
    "tooldiemaker-c": [
      { code: "C-13", name: "Heat treats materials", exam_question_count: 10 },
      { code: "C-14", name: "Tests heat treated materials", exam_question_count: 3 }
    ],
    "tooldiemaker-d": [
      { code: "D-15", name: "Performs production tool design", exam_question_count: 9 },
      { code: "D-16", name: "Develops prototype", exam_question_count: 6 },
      { code: "D-17", name: "Fits and assembles production tools", exam_question_count: 15 },
      { code: "D-18", name: "Proves out production tools", exam_question_count: 14 },
      { code: "D-19", name: "Repairs and maintains production tools", exam_question_count: 13 }
    ]
    },
  },
  "trade-metal-fabricator": {
    tradeId: "trade-metal-fabricator",
    tradeCode: "431A",
    totalQuestions: 130,
    examUrl: "https://red-seal.ca/eng/trades/metalfabfit/exam-information.shtml",
    blocks: [
    { id: "metalfabricator-a", trade_id: "trade-metal-fabricator", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 34, exam_percentage: 26 },
    { id: "metalfabricator-b", trade_id: "trade-metal-fabricator", code: "B", name: "Fabricates components", sort_order: 2, exam_question_count: 56, exam_percentage: 43 },
    { id: "metalfabricator-c", trade_id: "trade-metal-fabricator", code: "C", name: "Assembles components", sort_order: 3, exam_question_count: 40, exam_percentage: 31 }
    ],
    chapterTasks: {
    "metalfabricator-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 6 },
      { code: "A-2", name: "2 Uses and maintains tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "3 Organizes work", exam_question_count: 6 },
      { code: "A-4", name: "4 Performs quality assurance throughout fabrication and assembly process", exam_question_count: 7 },
      { code: "A-5", name: "5 Handles materials", exam_question_count: 6 },
      { code: "A-6", name: "6 Uses communication and mentoring techniques", exam_question_count: 3 }
    ],
    "metalfabricator-b": [
      { code: "B-1", name: "7 Performs layout", exam_question_count: 24 },
      { code: "B-2", name: "8 Cuts materials", exam_question_count: 17 },
      { code: "B-3", name: "9 Forms materials", exam_question_count: 15 }
    ],
    "metalfabricator-c": [
      { code: "C-1", name: "10 Fits and fastens sub‑components and components", exam_question_count: 19 },
      { code: "C-2", name: "11 Performs welding activities", exam_question_count: 13 },
      { code: "C-3", name: "12 Completes project", exam_question_count: 8 }
    ]
    },
  },
  "trade-refrigeration-ac-mechanic": {
    tradeId: "trade-refrigeration-ac-mechanic",
    tradeCode: "313A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/refrig-ac-mech/exam-information.shtml",
    blocks: [
    { id: "refrigerationacmechanic-a", trade_id: "trade-refrigeration-ac-mechanic", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 13, exam_percentage: 10 },
    { id: "refrigerationacmechanic-b", trade_id: "trade-refrigeration-ac-mechanic", code: "B", name: "Performs routine trade activities", sort_order: 2, exam_question_count: 19, exam_percentage: 15 },
    { id: "refrigerationacmechanic-c", trade_id: "trade-refrigeration-ac-mechanic", code: "C", name: "Plans installation", sort_order: 3, exam_question_count: 18, exam_percentage: 14 },
    { id: "refrigerationacmechanic-d", trade_id: "trade-refrigeration-ac-mechanic", code: "D", name: "Performs installation", sort_order: 4, exam_question_count: 26, exam_percentage: 21 },
    { id: "refrigerationacmechanic-e", trade_id: "trade-refrigeration-ac-mechanic", code: "E", name: "Performs commissioning", sort_order: 5, exam_question_count: 21, exam_percentage: 17 },
    { id: "refrigerationacmechanic-f", trade_id: "trade-refrigeration-ac-mechanic", code: "F", name: "Performs maintenance and service", sort_order: 6, exam_question_count: 28, exam_percentage: 22 }
    ],
    chapterTasks: {
    "refrigerationacmechanic-a": [
      { code: "A-1", name: "Task&nbsp;A-1 Performs safety-related functions", exam_question_count: 3 },
      { code: "A-2", name: "Task&nbsp;A-2 Uses tools and equipment", exam_question_count: 5 },
      { code: "A-3", name: "Task&nbsp;A-3 Organizes work", exam_question_count: 3 },
      { code: "A-4", name: "Task&nbsp;A-4 Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "refrigerationacmechanic-b": [
      { code: "B-1", name: "Task&nbsp;B-5 Performs work site preparation", exam_question_count: 5 },
      { code: "B-2", name: "Task&nbsp;B-6 Performs trade activities", exam_question_count: 14 }
    ],
    "refrigerationacmechanic-c": [
      { code: "C-1", name: "Task&nbsp;C-7 Plans installation of HVAC/R systems", exam_question_count: 11 },
      { code: "C-2", name: "Task&nbsp;C-8 Plans installation of control systems", exam_question_count: 7 }
    ],
    "refrigerationacmechanic-d": [
      { code: "D-1", name: "Task&nbsp;D-9 Installs HVAC/R systems", exam_question_count: 16 },
      { code: "D-2", name: "Task&nbsp;D-10 Installs control systems", exam_question_count: 10 }
    ],
    "refrigerationacmechanic-e": [
      { code: "E-1", name: "Task&nbsp;E-11 Commissions HVAC/R systems", exam_question_count: 13 },
      { code: "E-2", name: "Task&nbsp;E-12 Commissions control systems", exam_question_count: 8 }
    ],
    "refrigerationacmechanic-f": [
      { code: "F-1", name: "Task&nbsp;F-13 Maintains HVAC/R systems", exam_question_count: 8 },
      { code: "F-2", name: "Task&nbsp;F-14 Services HVAC/R systems", exam_question_count: 11 },
      { code: "F-3", name: "Task&nbsp;F-15 Maintains and services control systems", exam_question_count: 9 }
    ]
    },
  },
  "trade-boilermaker": {
    tradeId: "trade-boilermaker",
    tradeCode: "420B",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/boilermakers/exam-information.shtml",
    blocks: [
    { id: "boilermaker-a", trade_id: "trade-boilermaker", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 31, exam_percentage: 26 },
    { id: "boilermaker-b", trade_id: "trade-boilermaker", code: "B", name: "Performs rigging and hoisting", sort_order: 2, exam_question_count: 36, exam_percentage: 30 },
    { id: "boilermaker-c", trade_id: "trade-boilermaker", code: "C", name: "Completes new construction", sort_order: 3, exam_question_count: 27, exam_percentage: 23 },
    { id: "boilermaker-d", trade_id: "trade-boilermaker", code: "D", name: "Peforms repairs, maintenance, upgrading and testing", sort_order: 4, exam_question_count: 26, exam_percentage: 22 }
    ],
    chapterTasks: {
    "boilermaker-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 5 },
      { code: "A-2", name: "Uses tools, equipment and work platforms", exam_question_count: 9 },
      { code: "A-3", name: "Organizes work", exam_question_count: 6 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 3 },
      { code: "A-5", name: "Performs cutting and welding activities", exam_question_count: 8 }
    ],
    "boilermaker-b": [
      { code: "B-6", name: "Plans lift", exam_question_count: 11 },
      { code: "B-7", name: "Rigs load", exam_question_count: 10 },
      { code: "B-8", name: "Hoists load", exam_question_count: 10 },
      { code: "B-9", name: "Performs post-lift activities", exam_question_count: 5 }
    ],
    "boilermaker-c": [
      { code: "C-10", name: "Performs fabrication", exam_question_count: 10 },
      { code: "C-11", name: "Assembles and fits vessels and components", exam_question_count: 10 },
      { code: "C-12", name: "Fastens components", exam_question_count: 7 }
    ],
    "boilermaker-d": [
      { code: "D-13", name: "Services vessels and components", exam_question_count: 17 },
      { code: "D-14", name: "Removes vessels and components", exam_question_count: 9 }
    ]
    },
  },
  "trade-automotive-service-technician": {
    tradeId: "trade-automotive-service-technician",
    tradeCode: "310S",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/autoservtech/exam-information.shtml",
    blocks: [
    { id: "automotiveservicetechnician-a", trade_id: "trade-automotive-service-technician", code: "A", name: "Performs Common Occupational Skills", sort_order: 1, exam_question_count: 9, exam_percentage: 7 },
    { id: "automotiveservicetechnician-b", trade_id: "trade-automotive-service-technician", code: "B", name: "Diagnoses and repairs engine and engine support systems", sort_order: 2, exam_question_count: 22, exam_percentage: 18 },
    { id: "automotiveservicetechnician-c", trade_id: "trade-automotive-service-technician", code: "C", name: "Diagnoses and repairs vehicle module communications systems", sort_order: 3, exam_question_count: 12, exam_percentage: 10 },
    { id: "automotiveservicetechnician-d", trade_id: "trade-automotive-service-technician", code: "D", name: "Diagnoses and repairs driveline systems", sort_order: 4, exam_question_count: 17, exam_percentage: 14 },
    { id: "automotiveservicetechnician-e", trade_id: "trade-automotive-service-technician", code: "E", name: "Diagnoses and repairs electrical and comfort control systems", sort_order: 5, exam_question_count: 23, exam_percentage: 18 },
    { id: "automotiveservicetechnician-f", trade_id: "trade-automotive-service-technician", code: "F", name: "Diagnoses and repairs steering and suspension, braking, control systems, tires, hubs and wheel bearings", sort_order: 6, exam_question_count: 23, exam_percentage: 18 },
    { id: "automotiveservicetechnician-g", trade_id: "trade-automotive-service-technician", code: "G", name: "Diagnoses and repairs restraint systems, body components, accessories and trim", sort_order: 7, exam_question_count: 10, exam_percentage: 8 },
    { id: "automotiveservicetechnician-h", trade_id: "trade-automotive-service-technician", code: "H", name: "Diagnoses and repairs hybrid and electric vehicles (EV) systems", sort_order: 8, exam_question_count: 9, exam_percentage: 7 }
    ],
    chapterTasks: {
    "automotiveservicetechnician-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "Uses tools, equipment and documentation", exam_question_count: 5 }
    ],
    "automotiveservicetechnician-b": [
      { code: "B-4", name: "Diagnoses engine systems", exam_question_count: 4 },
      { code: "B-5", name: "Repairs engine systems", exam_question_count: 4 },
      { code: "B-6", name: "Diagnoses gasoline engine support systems", exam_question_count: 5 },
      { code: "B-7", name: "Repairs gasoline engine support systems", exam_question_count: 4 },
      { code: "B-8", name: "Diagnoses diesel engine support systems", exam_question_count: 3 },
      { code: "B-9", name: "Repairs diesel engine support systems", exam_question_count: 2 }
    ],
    "automotiveservicetechnician-c": [
      { code: "C-10", name: "Diagnoses vehicle networking systems", exam_question_count: 8 },
      { code: "C-11", name: "Repairs vehicle networking systems", exam_question_count: 4 }
    ],
    "automotiveservicetechnician-d": [
      { code: "D-12", name: "Diagnoses driveline systems", exam_question_count: 10 },
      { code: "D-13", name: "Repairs driveline systems", exam_question_count: 7 }
    ],
    "automotiveservicetechnician-e": [
      { code: "E-14", name: "Diagnoses electrical systems and components", exam_question_count: 8 },
      { code: "E-15", name: "Repairs electrical systems and components", exam_question_count: 6 },
      { code: "E-16", name: "Diagnoses heating, ventilation and air conditioning (HVAC) and comfort control systems", exam_question_count: 5 },
      { code: "E-17", name: "Repairs heating, ventilation and air conditioning (HVAC) and comfort control systems", exam_question_count: 4 }
    ],
    "automotiveservicetechnician-f": [
      { code: "F-18", name: "Diagnoses steering and suspension, braking, control systems, tires, wheels, hubs and wheel bearings", exam_question_count: 13 },
      { code: "F-19", name: "Repairs steering and suspension, braking, control systems, tires, wheels, hubs and wheel bearings", exam_question_count: 10 }
    ],
    "automotiveservicetechnician-g": [
      { code: "G-20", name: "Diagnoses restraint systems, body components, accessories and trim", exam_question_count: 6 },
      { code: "G-21", name: "Repairs restraint systems, body components, accessories and trim", exam_question_count: 4 }
    ],
    "automotiveservicetechnician-h": [
      { code: "H-22", name: "Diagnoses hybrid and electric vehicle (EV) systems", exam_question_count: 5 },
      { code: "H-23", name: "Repairs hybrid and electric vehicle (EV) systems", exam_question_count: 4 }
    ]
    },
  },
  "trade-heavy-duty-equipment-technician": {
    tradeId: "trade-heavy-duty-equipment-technician",
    tradeCode: "421A",
    totalQuestions: 135,
    examUrl: "https://red-seal.ca/eng/trades/heavydutyequiptech/exam-information.shtml",
    blocks: [
    { id: "heavydutyequipmenttechnician-a", trade_id: "trade-heavy-duty-equipment-technician", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 10, exam_percentage: 7 },
    { id: "heavydutyequipmenttechnician-b", trade_id: "trade-heavy-duty-equipment-technician", code: "B", name: "Services, diagnoses and repairs engines and supporting systems", sort_order: 2, exam_question_count: 20, exam_percentage: 15 },
    { id: "heavydutyequipmenttechnician-c", trade_id: "trade-heavy-duty-equipment-technician", code: "C", name: "Services, diagnoses and repairs steering, suspension, brake and undercarriage systems, and wheel assemblies", sort_order: 3, exam_question_count: 16, exam_percentage: 12 },
    { id: "heavydutyequipmenttechnician-d", trade_id: "trade-heavy-duty-equipment-technician", code: "D", name: "Services, diagnoses and repairs electrical and electronic systems", sort_order: 4, exam_question_count: 25, exam_percentage: 19 },
    { id: "heavydutyequipmenttechnician-e", trade_id: "trade-heavy-duty-equipment-technician", code: "E", name: "Services, diagnoses and repairs drivetrain systems", sort_order: 5, exam_question_count: 17, exam_percentage: 13 },
    { id: "heavydutyequipmenttechnician-f", trade_id: "trade-heavy-duty-equipment-technician", code: "F", name: "Services, diagnoses and repairs environmental control systems", sort_order: 6, exam_question_count: 9, exam_percentage: 7 },
    { id: "heavydutyequipmenttechnician-g", trade_id: "trade-heavy-duty-equipment-technician", code: "G", name: "Services, diagnoses and repairs hydraulic, hydrostatic and pneumatic systems", sort_order: 7, exam_question_count: 25, exam_percentage: 19 },
    { id: "heavydutyequipmenttechnician-h", trade_id: "trade-heavy-duty-equipment-technician", code: "H", name: "Services, diagnoses and repairs structural components, operator stations, attachments and accessories", sort_order: 8, exam_question_count: 9, exam_percentage: 7 },
    { id: "heavydutyequipmenttechnician-i", trade_id: "trade-heavy-duty-equipment-technician", code: "I", name: "Services, diagnoses and repairs hybrid and all-electric equipment", sort_order: 9, exam_question_count: 4, exam_percentage: 3 }
    ],
    chapterTasks: {
    "heavydutyequipmenttechnician-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 3 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 4 },
      { code: "A-3", name: "Performs routine work practices", exam_question_count: 3 }
    ],
    "heavydutyequipmenttechnician-b": [
      { code: "B-5", name: "Services, diagnoses and repairs base engines", exam_question_count: 3 },
      { code: "B-6", name: "Services, diagnoses and repairs lubrication systemsRepairs engines and engine support systems", exam_question_count: 2 },
      { code: "B-7", name: "Services, diagnoses and repairs intake systems", exam_question_count: 2 },
      { code: "B-8", name: "Services, diagnoses and repairs exhaust systems", exam_question_count: 2 },
      { code: "B-9", name: "Services, diagnoses and repairs engine management systems", exam_question_count: 3 },
      { code: "B-10", name: "Services, diagnoses and repairs fuel delivery systems", exam_question_count: 3 },
      { code: "B-11", name: "Services, diagnoses and repairs emission control systems", exam_question_count: 3 },
      { code: "B-12", name: "Services, diagnoses and repairs cooling systems", exam_question_count: 2 }
    ],
    "heavydutyequipmenttechnician-c": [
      { code: "C-13", name: "Services, diagnoses and repairs steering systems", exam_question_count: 4 },
      { code: "C-14", name: "Services, diagnoses and repairs suspension systems", exam_question_count: 3 },
      { code: "C-15", name: "Services, diagnoses and repairs brake systems", exam_question_count: 4 },
      { code: "C-16", name: "Services, diagnoses and repairs undercarriage systems", exam_question_count: 3 },
      { code: "C-17", name: "Services, diagnoses and repairs wheel assemblies", exam_question_count: 2 }
    ],
    "heavydutyequipmenttechnician-d": [
      { code: "D-18", name: "Service, diagnoses and repairs charging systems", exam_question_count: 5 },
      { code: "D-19", name: "Service, diagnoses and repairs starting systems", exam_question_count: 4 },
      { code: "D-20", name: "Service, diagnoses and repairs battery systems", exam_question_count: 4 },
      { code: "D-21", name: "Services, diagnoses and repairs electrical components", exam_question_count: 6 },
      { code: "D-22", name: "Services, diagnoses and repairs equipment management systems and electronic components", exam_question_count: 6 }
    ],
    "heavydutyequipmenttechnician-e": [
      { code: "E-23", name: "Services, diagnoses and repairs clutches", exam_question_count: 1 },
      { code: "E-24", name: "Services, diagnoses and repairs torque converters, fluid couplers and hydraulic retarders", exam_question_count: 2 },
      { code: "E-25", name: "Services, diagnoses and repairs manual transmissions and transfer cases", exam_question_count: 2 },
      { code: "E-26", name: "Services, diagnoses and repairs automatic and powershift transmissions", exam_question_count: 4 },
      { code: "E-27", name: "Services, diagnoses and repairs driveline systems", exam_question_count: 2 },
      { code: "E-28", name: "Services, diagnoses and repairs drive axles and differentials", exam_question_count: 3 },
      { code: "E-29", name: "Services, diagnoses and repairs final drive systems", exam_question_count: 3 }
    ],
    "heavydutyequipmenttechnician-f": [
      { code: "F-30", name: "Services, diagnoses and repairs heating systems", exam_question_count: 3 },
      { code: "F-31", name: "Services, diagnoses and repairs ventilation and filtration systems", exam_question_count: 2 },
      { code: "F-32", name: "Services, diagnoses and repairs air conditioning systems", exam_question_count: 3 },
      { code: "F-33", name: "Services, diagnoses and repairs sound suppression systems", exam_question_count: 1 }
    ],
    "heavydutyequipmenttechnician-g": [
      { code: "G-34", name: "Services, diagnoses and repairs hydraulic systems", exam_question_count: 11 },
      { code: "G-35", name: "Services, diagnoses and repairs hydrostatic systems", exam_question_count: 9 },
      { code: "G-36", name: "Services, diagnoses and repairs pneumatic systems", exam_question_count: 5 }
    ],
    "heavydutyequipmenttechnician-h": [
      { code: "H-37", name: "Services, diagnoses and repairs structural components", exam_question_count: 3 },
      { code: "H-38", name: "Services, diagnoses and repairs operator station components", exam_question_count: 3 },
      { code: "H-39", name: "Services, diagnoses and repairs attachments and accessories", exam_question_count: 3 }
    ],
    "heavydutyequipmenttechnician-i": [
      { code: "I-40", name: "Services, diagnoses and repairs hybrid equipment", exam_question_count: 2 },
      { code: "I-41", name: "Services, diagnoses and repairs all-electric equipment", exam_question_count: 2 }
    ]
    },
  },
  "trade-truck-transport-mechanic": {
    tradeId: "trade-truck-transport-mechanic",
    tradeCode: "310T",
    totalQuestions: 135,
    examUrl: "https://red-seal.ca/eng/trades/trucktranspmech/exam-information.shtml",
    blocks: [
    { id: "trucktransportmechanic-a", trade_id: "trade-truck-transport-mechanic", code: "A", name: "Common Occupational Skills", sort_order: 1, exam_question_count: 8, exam_percentage: 6 },
    { id: "trucktransportmechanic-b", trade_id: "trade-truck-transport-mechanic", code: "B", name: "Services, diagnoses and repairs engines and supporting systems", sort_order: 2, exam_question_count: 21, exam_percentage: 16 },
    { id: "trucktransportmechanic-c", trade_id: "trade-truck-transport-mechanic", code: "C", name: "Services, diagnoses and repairs air systems and brake systems", sort_order: 3, exam_question_count: 17, exam_percentage: 13 },
    { id: "trucktransportmechanic-d", trade_id: "trade-truck-transport-mechanic", code: "D", name: "Services, diagnoses and repairs electrical and electronic systems", sort_order: 4, exam_question_count: 22, exam_percentage: 16 },
    { id: "trucktransportmechanic-e", trade_id: "trade-truck-transport-mechanic", code: "E", name: "Services, diagnoses and repairs drive trains", sort_order: 5, exam_question_count: 17, exam_percentage: 13 },
    { id: "trucktransportmechanic-f", trade_id: "trade-truck-transport-mechanic", code: "F", name: "Services, diagnoses and repairs steering, chassis/frames, suspensions, tires, wheels and hubs", sort_order: 6, exam_question_count: 18, exam_percentage: 13 },
    { id: "trucktransportmechanic-g", trade_id: "trade-truck-transport-mechanic", code: "G", name: "Services, diagnoses and repairs cabs", sort_order: 7, exam_question_count: 5, exam_percentage: 4 },
    { id: "trucktransportmechanic-h", trade_id: "trade-truck-transport-mechanic", code: "H", name: "Services, diagnoses and repairs trailers", sort_order: 8, exam_question_count: 8, exam_percentage: 6 },
    { id: "trucktransportmechanic-i", trade_id: "trade-truck-transport-mechanic", code: "I", name: "Services, diagnoses and repairs climate control systems", sort_order: 9, exam_question_count: 7, exam_percentage: 5 },
    { id: "trucktransportmechanic-j", trade_id: "trade-truck-transport-mechanic", code: "J", name: "Services, diagnoses and repairs hydraulic systems", sort_order: 10, exam_question_count: 8, exam_percentage: 6 },
    { id: "trucktransportmechanic-k", trade_id: "trade-truck-transport-mechanic", code: "K", name: "Services, diagnoses and repairs hybrid and electric vehicles (EV)", sort_order: 11, exam_question_count: 4, exam_percentage: 3 }
    ],
    chapterTasks: {
    "trucktransportmechanic-a": [
      { code: "A-1", name: "1 Performs safety-related functions.", exam_question_count: 2 },
      { code: "A-2", name: "2 Uses and maintains tools and equipment.", exam_question_count: 3 },
      { code: "A-3", name: "3 Performs routine trade activities.", exam_question_count: 2 },
      { code: "A-4", name: "4 Uses communication and mentoring techniques.", exam_question_count: 1 }
    ],
    "trucktransportmechanic-b": [
      { code: "B-1", name: "5 Services, diagnoses and repairs base engines.", exam_question_count: 3 },
      { code: "B-2", name: "6 Services, diagnoses and repairs lubrication systems.", exam_question_count: 2 },
      { code: "B-3", name: "7 Services, diagnoses and repairs intake systems.", exam_question_count: 2 },
      { code: "B-4", name: "8 Services, diagnoses and repairs exhaust systems.", exam_question_count: 3 },
      { code: "B-5", name: "9 Services, diagnoses and repairs engine management systems.", exam_question_count: 4 },
      { code: "B-6", name: "10 Services, diagnoses and repairs fuel delivery systems.", exam_question_count: 3 },
      { code: "B-7", name: "11 Services, diagnoses and repairs engine retarder systems.", exam_question_count: 2 },
      { code: "B-8", name: "12 Services, diagnoses and repairs cooling systems.", exam_question_count: 2 }
    ],
    "trucktransportmechanic-c": [
      { code: "C-1", name: "13 Services, diagnoses and repairs air systems.", exam_question_count: 9 },
      { code: "C-2", name: "14 Services, diagnoses and repairs brake systems.", exam_question_count: 8 }
    ],
    "trucktransportmechanic-d": [
      { code: "D-1", name: "15 Services, diagnoses and repairs batteries systems.", exam_question_count: 3 },
      { code: "D-2", name: "16 Services, diagnoses and repairs charging systems.", exam_question_count: 4 },
      { code: "D-3", name: "17 Services, diagnoses and repairs spark ignition systems.", exam_question_count: 2 },
      { code: "D-4", name: "18 Services, diagnoses and repairs starting systems.", exam_question_count: 4 },
      { code: "D-5", name: "19 Services, diagnoses and repairs electrical components and accessories.", exam_question_count: 5 },
      { code: "D-6", name: "20 Services, diagnoses and repairs vehicle management systems and electronic components.", exam_question_count: 4 }
    ],
    "trucktransportmechanic-e": [
      { code: "E-1", name: "21 Services, diagnoses and repairs clutches.", exam_question_count: 2 },
      { code: "E-2", name: "22 Services, diagnoses and repairs manual transmission and transfer cases.", exam_question_count: 3 },
      { code: "E-3", name: "23 Services, diagnoses and repairs automatic transmissions.", exam_question_count: 2 },
      { code: "E-4", name: "24 Services, diagnoses and repairs automated transmissions.", exam_question_count: 4 },
      { code: "E-5", name: "25 Services, diagnoses and repairs driveline systems.", exam_question_count: 2 },
      { code: "E-6", name: "26 Services, diagnoses and repairs drive axle assemblies.", exam_question_count: 3 },
      { code: "E-7", name: "27 Services, diagnoses and repairs drive train retarders.", exam_question_count: 1 }
    ],
    "trucktransportmechanic-f": [
      { code: "F-1", name: "28 Services, diagnoses and repairs steering systems.", exam_question_count: 5 },
      { code: "F-2", name: "29 Services, diagnoses and repairs chassis/frames.", exam_question_count: 2 },
      { code: "F-3", name: "30 Services, diagnoses and repairs suspension.", exam_question_count: 4 },
      { code: "F-4", name: "31 Services, diagnoses and repairs hitches and couplers.", exam_question_count: 3 },
      { code: "F-5", name: "32 Services, diagnoses and repairs tires, wheels and hubs.", exam_question_count: 4 }
    ],
    "trucktransportmechanic-g": [
      { code: "G-1", name: "33 Services, diagnoses and repairs interior cab components.", exam_question_count: 3 },
      { code: "G-2", name: "34 Services, diagnoses and repairs exterior cab components.", exam_question_count: 2 }
    ],
    "trucktransportmechanic-h": [
      { code: "H-1", name: "35 Services, diagnoses and repairs trailer components and accessories.", exam_question_count: 5 },
      { code: "H-2", name: "36 Services, diagnoses and repairs heating and refrigeration systems.", exam_question_count: 3 }
    ],
    "trucktransportmechanic-i": [
      { code: "I-1", name: "37 Services, diagnoses and repairs heating and ventilation systems.", exam_question_count: 3 },
      { code: "I-2", name: "38 Services, diagnoses and repairs air conditioning systems.", exam_question_count: 4 }
    ],
    "trucktransportmechanic-j": [
      { code: "J-1", name: "39 Services, diagnoses and repairs hydraulic components", exam_question_count: 8 }
    ],
    "trucktransportmechanic-k": [
      { code: "K-1", name: "40 Services, diagnoses and repairs hybrid vehicles", exam_question_count: 2 },
      { code: "K-2", name: "41 Services, diagnoses and repairs electric vehicles (EV)", exam_question_count: 2 }
    ]
    },
  },
  "trade-motorcycle-technician": {
    tradeId: "trade-motorcycle-technician",
    tradeCode: "422A",
    totalQuestions: 130,
    examUrl: "https://red-seal.ca/eng/trades/motorcycle-tech/exam-information.shtml",
    blocks: [
    { id: "motorcycletechnician-b", trade_id: "trade-motorcycle-technician", code: "B", name: "Maintains chassis and suspension", sort_order: 1, exam_question_count: 13, exam_percentage: 11 },
    { id: "motorcycletechnician-c", trade_id: "trade-motorcycle-technician", code: "C", name: "Maintains wheels and tires", sort_order: 2, exam_question_count: 11, exam_percentage: 9 },
    { id: "motorcycletechnician-d", trade_id: "trade-motorcycle-technician", code: "D", name: "Maintains brakes", sort_order: 3, exam_question_count: 13, exam_percentage: 11 },
    { id: "motorcycletechnician-e", trade_id: "trade-motorcycle-technician", code: "E", name: "Maintains engines", sort_order: 4, exam_question_count: 18, exam_percentage: 15 },
    { id: "motorcycletechnician-f", trade_id: "trade-motorcycle-technician", code: "F", name: "Maintains power transfer", sort_order: 5, exam_question_count: 16, exam_percentage: 13 },
    { id: "motorcycletechnician-g", trade_id: "trade-motorcycle-technician", code: "G", name: "Maintains electrical systems", sort_order: 6, exam_question_count: 20, exam_percentage: 16 },
    { id: "motorcycletechnician-h", trade_id: "trade-motorcycle-technician", code: "H", name: "Maintains vehicle management systems", sort_order: 7, exam_question_count: 16, exam_percentage: 13 },
    { id: "motorcycletechnician-i", trade_id: "trade-motorcycle-technician", code: "I", name: "Maintains fuel and exhaust systems", sort_order: 8, exam_question_count: 15, exam_percentage: 12 }
    ],
    chapterTasks: {
    "motorcycletechnician-b": [
      { code: "B-5", name: "- Diagnoses chassis and components", exam_question_count: 3 },
      { code: "B-6", name: "- Services chassis and components", exam_question_count: 3 },
      { code: "B-7", name: "- Diagnoses suspension systems", exam_question_count: 4 },
      { code: "B-8", name: "- Services suspension systems", exam_question_count: 3 }
    ],
    "motorcycletechnician-c": [
      { code: "C-9", name: "- Diagnoses wheels and tires", exam_question_count: 5 },
      { code: "C-10", name: "- Services wheels and tires", exam_question_count: 6 }
    ],
    "motorcycletechnician-d": [
      { code: "D-11", name: "- Diagnoses braking systems", exam_question_count: 6 },
      { code: "D-12", name: "- Services braking systems", exam_question_count: 7 }
    ],
    "motorcycletechnician-e": [
      { code: "E-13", name: "- Diagnoses two-stroke and four-stroke engines", exam_question_count: 9 },
      { code: "E-14", name: "- Services two-stroke and four-stroke engines", exam_question_count: 9 }
    ],
    "motorcycletechnician-f": [
      { code: "F-15", name: "- Diagnoses clutches and primary drive", exam_question_count: 2 },
      { code: "F-16", name: "- Services clutches and primary drive", exam_question_count: 3 },
      { code: "F-17", name: "- Diagnoses transmissions", exam_question_count: 2 },
      { code: "F-18", name: "- Services transmissions", exam_question_count: 4 },
      { code: "F-19", name: "- Diagnoses final drive", exam_question_count: 2 },
      { code: "F-20", name: "- Services final drive", exam_question_count: 3 }
    ],
    "motorcycletechnician-g": [
      { code: "G-21", name: "- Diagnoses electrical systems", exam_question_count: 14 },
      { code: "G-22", name: "- Services electrical systems", exam_question_count: 6 }
    ],
    "motorcycletechnician-h": [
      { code: "H-23", name: "- Diagnoses vehicle management systems", exam_question_count: 11 },
      { code: "H-24", name: "- Services vehicle management systems", exam_question_count: 5 }
    ],
    "motorcycletechnician-i": [
      { code: "I-25", name: "- Diagnoses fuel and exhaust systems", exam_question_count: 9 },
      { code: "I-26", name: "- Services fuel and exhaust systems", exam_question_count: 6 }
    ]
    },
  },
  "trade-motor-vehicle-body-repairer": {
    tradeId: "trade-motor-vehicle-body-repairer",
    tradeCode: "310B",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/auto-body-col-tech/exam-information.shtml",
    blocks: [
    { id: "motorvehiclebodyrepairer-a", trade_id: "trade-motor-vehicle-body-repairer", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 15, exam_percentage: 13 },
    { id: "motorvehiclebodyrepairer-b", trade_id: "trade-motor-vehicle-body-repairer", code: "B", name: "Repairs frame and structural components", sort_order: 2, exam_question_count: 28, exam_percentage: 23 },
    { id: "motorvehiclebodyrepairer-c", trade_id: "trade-motor-vehicle-body-repairer", code: "C", name: "Repairs non-structural outer body panels and related components", sort_order: 3, exam_question_count: 24, exam_percentage: 20 },
    { id: "motorvehiclebodyrepairer-d", trade_id: "trade-motor-vehicle-body-repairer", code: "D", name: "Repairs mechanical, electrical and alternative-fuel system components", sort_order: 4, exam_question_count: 13, exam_percentage: 11 },
    { id: "motorvehiclebodyrepairer-e", trade_id: "trade-motor-vehicle-body-repairer", code: "E", name: "Repairs interior components and services restraint systems", sort_order: 5, exam_question_count: 12, exam_percentage: 10 },
    { id: "motorvehiclebodyrepairer-f", trade_id: "trade-motor-vehicle-body-repairer", code: "F", name: "Performs refinishing procedures", sort_order: 6, exam_question_count: 22, exam_percentage: 18 },
    { id: "motorvehiclebodyrepairer-g", trade_id: "trade-motor-vehicle-body-repairer", code: "G", name: "Performs detailing and cleaning", sort_order: 7, exam_question_count: 6, exam_percentage: 5 }
    ],
    chapterTasks: {
    "motorvehiclebodyrepairer-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 2 },
      { code: "A-2", name: "2 Uses and maintains tools and equipment", exam_question_count: 2 },
      { code: "A-3", name: "3 Uses and maintains welding equipment", exam_question_count: 2 },
      { code: "A-4", name: "4 Organizes work and uses documentation", exam_question_count: 2 },
      { code: "A-5", name: "5 Uses communication and mentoring techniques", exam_question_count: 1 },
      { code: "A-6", name: "6 Removes and installs trim and hardware", exam_question_count: 2 },
      { code: "A-7", name: "7 Performs final inspections", exam_question_count: 2 },
      { code: "A-8", name: "8 Applies corrosion protection and sound deadening materials", exam_question_count: 2 }
    ],
    "motorvehiclebodyrepairer-b": [
      { code: "B-1", name: "9 Prepares for repair and replacement of structural components", exam_question_count: 11 },
      { code: "B-2", name: "10 Repairs, removes and installs structural components", exam_question_count: 12 },
      { code: "B-3", name: "11 Removes, installs and repairs structural and laminated glass", exam_question_count: 5 }
    ],
    "motorvehiclebodyrepairer-c": [
      { code: "C-1", name: "12 Removes, repairs and installs metal panels and components", exam_question_count: 11 },
      { code: "C-2", name: "13 Removes, repairs and installs plastic and composite panels and components", exam_question_count: 9 },
      { code: "C-3", name: "14 Removes and installs non-structural glass", exam_question_count: 4 }
    ],
    "motorvehiclebodyrepairer-d": [
      { code: "D-1", name: "15 Deactivates and reactivates alternative-fuel systems", exam_question_count: 2 },
      { code: "D-2", name: "16 Removes and installs mechanical components", exam_question_count: 7 },
      { code: "D-3", name: "17 Removes, repairs and installs electrical and electronic components", exam_question_count: 4 }
    ],
    "motorvehiclebodyrepairer-e": [
      { code: "E-1", name: "18 Repairs and replaces interior components", exam_question_count: 5 },
      { code: "E-2", name: "19 Services supplemental restraint systems (SRS)", exam_question_count: 7 }
    ],
    "motorvehiclebodyrepairer-f": [
      { code: "F-1", name: "20 Prepares surface", exam_question_count: 5 },
      { code: "F-2", name: "21 Uses repair materials", exam_question_count: 3 },
      { code: "F-3", name: "22 Prepares refinishing equipment", exam_question_count: 3 },
      { code: "F-4", name: "23 Prepares refinishing materials", exam_question_count: 4 },
      { code: "F-5", name: "24 Applies refinishing materials", exam_question_count: 5 },
      { code: "F-6", name: "25 Performs post-refinishing functions", exam_question_count: 2 }
    ],
    "motorvehiclebodyrepairer-g": [
      { code: "G-1", name: "26 Details exterior", exam_question_count: 4 },
      { code: "G-2", name: "27 Cleans vehicle", exam_question_count: 2 }
    ]
    },
  },
  "trade-automotive-refinishing-technician": {
    tradeId: "trade-automotive-refinishing-technician",
    tradeCode: "310R",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/auto-refinish-tech/exam-information.shtml",
    blocks: [
    { id: "automotiverefinishingtechnician-a", trade_id: "trade-automotive-refinishing-technician", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 20, exam_percentage: 17 },
    { id: "automotiverefinishingtechnician-b", trade_id: "trade-automotive-refinishing-technician", code: "B", name: "Performs preparation", sort_order: 2, exam_question_count: 50, exam_percentage: 42 },
    { id: "automotiverefinishingtechnician-c", trade_id: "trade-automotive-refinishing-technician", code: "C", name: "Performs refinishing procedures", sort_order: 3, exam_question_count: 50, exam_percentage: 42 }
    ],
    chapterTasks: {
    "automotiverefinishingtechnician-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "Maintains tools and equipment", exam_question_count: 8 },
      { code: "A-3", name: "Organizes work", exam_question_count: 6 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "automotiverefinishingtechnician-b": [
      { code: "B-5", name: "Prepares surface", exam_question_count: 32 },
      { code: "B-6", name: "Uses repair materials", exam_question_count: 18 }
    ],
    "automotiverefinishingtechnician-c": [
      { code: "C-7", name: "Prepares refinishing equipment", exam_question_count: 8 },
      { code: "C-8", name: "Prepares refinishing materials", exam_question_count: 14 },
      { code: "C-9", name: "Applies refinishing materials", exam_question_count: 20 },
      { code: "C-10", name: "Performs post-refinishing functions", exam_question_count: 8 }
    ]
    },
  },
  "trade-agricultural-equipment-technician": {
    tradeId: "trade-agricultural-equipment-technician",
    tradeCode: "423A",
    totalQuestions: 125,
    examUrl: "https://red-seal.ca/eng/trades/agriequiptech/exam-information.shtml",
    blocks: [
    { id: "agriculturalequipmenttechnician-a", trade_id: "trade-agricultural-equipment-technician", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 6, exam_percentage: 5 },
    { id: "agriculturalequipmenttechnician-b", trade_id: "trade-agricultural-equipment-technician", code: "B", name: "Diagnoses and repairs engines and engine support systems", sort_order: 2, exam_question_count: 18, exam_percentage: 14 },
    { id: "agriculturalequipmenttechnician-c", trade_id: "trade-agricultural-equipment-technician", code: "C", name: "Diagnoses and repairs drive trains", sort_order: 3, exam_question_count: 16, exam_percentage: 13 },
    { id: "agriculturalequipmenttechnician-d", trade_id: "trade-agricultural-equipment-technician", code: "D", name: "Diagnoses and repairs hydraulic, hydrostatic and pneumatic systems", sort_order: 4, exam_question_count: 22, exam_percentage: 18 },
    { id: "agriculturalequipmenttechnician-e", trade_id: "trade-agricultural-equipment-technician", code: "E", name: "Diagnoses and repairs electrical and electronic systems", sort_order: 5, exam_question_count: 24, exam_percentage: 19 },
    { id: "agriculturalequipmenttechnician-f", trade_id: "trade-agricultural-equipment-technician", code: "F", name: "Diagnoses and repairs steering, brakes and suspensions", sort_order: 6, exam_question_count: 13, exam_percentage: 10 },
    { id: "agriculturalequipmenttechnician-g", trade_id: "trade-agricultural-equipment-technician", code: "G", name: "Diagnoses and repairs structural components and operator stations", sort_order: 7, exam_question_count: 8, exam_percentage: 6 },
    { id: "agriculturalequipmenttechnician-h", trade_id: "trade-agricultural-equipment-technician", code: "H", name: "Diagnoses and repairs agricultural equipment", sort_order: 8, exam_question_count: 18, exam_percentage: 14 }
    ],
    chapterTasks: {
    "agriculturalequipmenttechnician-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 1 },
      { code: "A-2", name: "Performs routine work practices", exam_question_count: 2 },
      { code: "A-3", name: "Organizes work", exam_question_count: 1 },
      { code: "A-4", name: "Uses and maintains tools and equipment", exam_question_count: 2 }
    ],
    "agriculturalequipmenttechnician-b": [
      { code: "B-6", name: "Diagnoses engine and engine support systems", exam_question_count: 11 },
      { code: "B-7", name: "Repairs engine and engine support systems", exam_question_count: 7 }
    ],
    "agriculturalequipmenttechnician-c": [
      { code: "C-8", name: "Diagnoses drive trains", exam_question_count: 9 },
      { code: "C-9", name: "Repairs drive trains", exam_question_count: 7 }
    ],
    "agriculturalequipmenttechnician-d": [
      { code: "D-10", name: "Diagnoses hydraulic, hydrostatic and pneumatic systems", exam_question_count: 13 },
      { code: "D-11", name: "Repairs hydraulic, hydrostatic and pneumatic systems", exam_question_count: 9 }
    ],
    "agriculturalequipmenttechnician-e": [
      { code: "E-12", name: "Diagnoses electrical/electronic power and control monitoring systems", exam_question_count: 15 },
      { code: "E-13", name: "Repairs electrical/electronic power and control monitoring systems", exam_question_count: 9 }
    ],
    "agriculturalequipmenttechnician-f": [
      { code: "F-14", name: "Diagnoses steering and brake systems", exam_question_count: 3 },
      { code: "F-15", name: "Repairs steering and brake systems", exam_question_count: 4 },
      { code: "F-16", name: "Diagnoses track, wheel and suspension systems", exam_question_count: 3 },
      { code: "F-17", name: "Repairs track, wheel and suspension systems", exam_question_count: 3 }
    ],
    "agriculturalequipmenttechnician-g": [
      { code: "G-18", name: "Diagnoses structural components", exam_question_count: 1 },
      { code: "G-19", name: "Repairs structural components", exam_question_count: 2 },
      { code: "G-20", name: "Diagnoses climate control systems", exam_question_count: 3 },
      { code: "G-21", name: "Repairs climate control systems", exam_question_count: 2 }
    ],
    "agriculturalequipmenttechnician-h": [
      { code: "H-22", name: "Prepares agricultural equipment", exam_question_count: 2 },
      { code: "H-23", name: "Diagnoses precision farming equipment", exam_question_count: 2 },
      { code: "H-24", name: "Repairs precision farming equipment", exam_question_count: 1 },
      { code: "H-25", name: "Diagnoses land preparation, tillage and seeding/planting equipment", exam_question_count: 2 },
      { code: "H-26", name: "Repairs land preparation, tillage and seeding/planting equipment", exam_question_count: 2 },
      { code: "H-27", name: "Diagnoses harvesting, hay and forage equipment", exam_question_count: 3 },
      { code: "H-28", name: "Repairs harvesting, hay and forage equipment", exam_question_count: 2 },
      { code: "H-29", name: "Diagnoses application and irrigation equipment", exam_question_count: 2 },
      { code: "H-30", name: "Repairs application and irrigation equipment", exam_question_count: 2 }
    ]
    },
  },
  "trade-recreation-vehicle-technician": {
    tradeId: "trade-recreation-vehicle-technician",
    tradeCode: "424A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/recvehservtech/exam-information.shtml",
    blocks: [
    { id: "recreationvehicletechnician-a", trade_id: "trade-recreation-vehicle-technician", code: "A", name: "Common occupational skills", sort_order: 1, exam_question_count: 10, exam_percentage: 8 },
    { id: "recreationvehicletechnician-b", trade_id: "trade-recreation-vehicle-technician", code: "B", name: "Plumbing systems", sort_order: 2, exam_question_count: 17, exam_percentage: 14 },
    { id: "recreationvehicletechnician-c", trade_id: "trade-recreation-vehicle-technician", code: "C", name: "Electrical systems", sort_order: 3, exam_question_count: 22, exam_percentage: 18 },
    { id: "recreationvehicletechnician-d", trade_id: "trade-recreation-vehicle-technician", code: "D", name: "LP gas systems", sort_order: 4, exam_question_count: 18, exam_percentage: 15 },
    { id: "recreationvehicletechnician-e", trade_id: "trade-recreation-vehicle-technician", code: "E", name: "Appliances and consumer products", sort_order: 5, exam_question_count: 18, exam_percentage: 15 },
    { id: "recreationvehicletechnician-f", trade_id: "trade-recreation-vehicle-technician", code: "F", name: "Interior and exterior components", sort_order: 6, exam_question_count: 15, exam_percentage: 13 },
    { id: "recreationvehicletechnician-g", trade_id: "trade-recreation-vehicle-technician", code: "G", name: "Frames and mechanical components", sort_order: 7, exam_question_count: 12, exam_percentage: 10 },
    { id: "recreationvehicletechnician-h", trade_id: "trade-recreation-vehicle-technician", code: "H", name: "Towing systems", sort_order: 8, exam_question_count: 8, exam_percentage: 7 }
    ],
    chapterTasks: {
    "recreationvehicletechnician-a": [
      { code: "A-1", name: "1 Performs safety-related activities", exam_question_count: 2 },
      { code: "A-2", name: "2 Uses and maintains tools and equipment", exam_question_count: 3 },
      { code: "A-3", name: "3 Performs common work practices and procedures", exam_question_count: 3 },
      { code: "A-4", name: "4 Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "recreationvehicletechnician-b": [
      { code: "B-1", name: "5 Diagnoses plumbing systems", exam_question_count: 7 },
      { code: "B-2", name: "6 Services potable water systems", exam_question_count: 5 },
      { code: "B-3", name: "7 Services waste water systems", exam_question_count: 5 }
    ],
    "recreationvehicletechnician-c": [
      { code: "C-1", name: "8 Diagnoses electrical systems", exam_question_count: 8 },
      { code: "C-2", name: "9 Services AC electrical system", exam_question_count: 6 },
      { code: "C-3", name: "10 Services DC electrical system", exam_question_count: 6 },
      { code: "C-4", name: "11 Services generators", exam_question_count: 2 }
    ],
    "recreationvehicletechnician-d": [
      { code: "D-1", name: "12 Diagnoses LP gas systems", exam_question_count: 10 },
      { code: "D-2", name: "13 Services LP gas systems", exam_question_count: 8 }
    ],
    "recreationvehicletechnician-e": [
      { code: "E-1", name: "14 Diagnoses appliances", exam_question_count: 5 },
      { code: "E-2", name: "15 Services water heaters", exam_question_count: 2 },
      { code: "E-3", name: "16 Services furnaces", exam_question_count: 3 },
      { code: "E-4", name: "17 Services cooktops and ranges", exam_question_count: 2 },
      { code: "E-5", name: "18 Services refrigerators and ice makers", exam_question_count: 3 },
      { code: "E-6", name: "19 Services air conditioners and heat pumps", exam_question_count: 2 },
      { code: "E-7", name: "20 Services consumer products", exam_question_count: 1 }
    ],
    "recreationvehicletechnician-f": [
      { code: "F-1", name: "21 Diagnoses interior and exterior components", exam_question_count: 7 },
      { code: "F-2", name: "22 Services interior components", exam_question_count: 4 },
      { code: "F-3", name: "23 Services exterior components", exam_question_count: 4 }
    ],
    "recreationvehicletechnician-g": [
      { code: "G-1", name: "24 Diagnoses frames and mechanical components", exam_question_count: 4 },
      { code: "G-2", name: "25 Services frames", exam_question_count: 1 },
      { code: "G-3", name: "26 Services running gear", exam_question_count: 2 },
      { code: "G-4", name: "27 Services levelling systems", exam_question_count: 2 },
      { code: "G-5", name: "28 Services slide-out systems", exam_question_count: 2 },
      { code: "G-6", name: "29 Services lifting systems", exam_question_count: 1 }
    ],
    "recreationvehicletechnician-h": [
      { code: "H-1", name: "30 Diagnoses towing systems", exam_question_count: 4 },
      { code: "H-2", name: "31 Services tow vehicle systems", exam_question_count: 2 },
      { code: "H-3", name: "32 Services towed vehicle systems", exam_question_count: 2 }
    ]
    },
  },
  "trade-parts-technician": {
    tradeId: "trade-parts-technician",
    tradeCode: "425A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/parts-tech/exam-information.shtml",
    blocks: [
    { id: "partstechnician-a", trade_id: "trade-parts-technician", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 19, exam_percentage: 16 },
    { id: "partstechnician-b", trade_id: "trade-parts-technician", code: "B", name: "Performs customer service", sort_order: 2, exam_question_count: 26, exam_percentage: 22 },
    { id: "partstechnician-c", trade_id: "trade-parts-technician", code: "C", name: "Performs parts acquisition", sort_order: 3, exam_question_count: 29, exam_percentage: 24 },
    { id: "partstechnician-d", trade_id: "trade-parts-technician", code: "D", name: "Performs warehousing and inventory", sort_order: 4, exam_question_count: 30, exam_percentage: 25 },
    { id: "partstechnician-e", trade_id: "trade-parts-technician", code: "E", name: "Applies business practices", sort_order: 5, exam_question_count: 16, exam_percentage: 13 }
    ],
    chapterTasks: {
    "partstechnician-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "2 Uses tools and equipment", exam_question_count: 6 },
      { code: "A-3", name: "3 Organizes work", exam_question_count: 5 },
      { code: "A-4", name: "4 Communicates with others", exam_question_count: 4 }
    ],
    "partstechnician-b": [
      { code: "B-1", name: "5 Provides services to retail customers", exam_question_count: 6 },
      { code: "B-2", name: "6 Provides services to wholesale customers", exam_question_count: 6 },
      { code: "B-3", name: "7 Provides services to internal customers", exam_question_count: 5 },
      { code: "B-4", name: "8 Provides general customer service and support", exam_question_count: 9 }
    ],
    "partstechnician-c": [
      { code: "C-1", name: "9 Identifies parts", exam_question_count: 16 },
      { code: "C-2", name: "10 Sources parts", exam_question_count: 13 }
    ],
    "partstechnician-d": [
      { code: "D-1", name: "11 Handles parts and materials", exam_question_count: 12 },
      { code: "D-2", name: "12 Performs inventory control", exam_question_count: 10 },
      { code: "D-3", name: "13 Performs shipping and receiving duties", exam_question_count: 8 }
    ],
    "partstechnician-e": [
      { code: "E-1", name: "14 Promotes products and services", exam_question_count: 4 },
      { code: "E-2", name: "15 Implements pricing formula", exam_question_count: 5 },
      { code: "E-3", name: "16 Processes financial transactions", exam_question_count: 7 }
    ]
    },
  },
  "trade-cook": {
    tradeId: "trade-cook",
    tradeCode: "440A",
    totalQuestions: 150,
    examUrl: "https://red-seal.ca/eng/trades/cooks/exam-information.shtml",
    blocks: [
    { id: "cook-a", trade_id: "trade-cook", code: "A", name: "Hygiene, sanitation and safety", sort_order: 1, exam_question_count: 13, exam_percentage: 9 },
    { id: "cook-b", trade_id: "trade-cook", code: "B", name: "Common occupational skills", sort_order: 2, exam_question_count: 11, exam_percentage: 7 },
    { id: "cook-c", trade_id: "trade-cook", code: "C", name: "Produce", sort_order: 3, exam_question_count: 12, exam_percentage: 8 },
    { id: "cook-d", trade_id: "trade-cook", code: "D", name: "Stocks, broths and soups", sort_order: 4, exam_question_count: 12, exam_percentage: 8 },
    { id: "cook-e", trade_id: "trade-cook", code: "E", name: "Sauces", sort_order: 5, exam_question_count: 13, exam_percentage: 9 },
    { id: "cook-f", trade_id: "trade-cook", code: "F", name: "Cheese, dairy, plant-based dairy alternatives, eggs and egg products", sort_order: 6, exam_question_count: 10, exam_percentage: 7 },
    { id: "cook-g", trade_id: "trade-cook", code: "G", name: "Pastas, noodles, stuffed pastas and dumplings", sort_order: 7, exam_question_count: 10, exam_percentage: 7 },
    { id: "cook-h", trade_id: "trade-cook", code: "H", name: "Grains, pulses, seeds, nuts and alternative proteins", sort_order: 8, exam_question_count: 11, exam_percentage: 7 },
    { id: "cook-i", trade_id: "trade-cook", code: "I", name: "Meats, game, poultry, game birds and variety meats", sort_order: 9, exam_question_count: 16, exam_percentage: 11 },
    { id: "cook-j", trade_id: "trade-cook", code: "J", name: "Fish and seafood", sort_order: 10, exam_question_count: 15, exam_percentage: 10 },
    { id: "cook-k", trade_id: "trade-cook", code: "K", name: "Salads and sandwiches", sort_order: 11, exam_question_count: 9, exam_percentage: 6 },
    { id: "cook-l", trade_id: "trade-cook", code: "L", name: "Specialty preparation", sort_order: 12, exam_question_count: 8, exam_percentage: 5 },
    { id: "cook-m", trade_id: "trade-cook", code: "M", name: "Sweet and savoury baked goods and desserts", sort_order: 13, exam_question_count: 10, exam_percentage: 7 }
    ],
    chapterTasks: {
    "cook-a": [
      { code: "A-1", name: "Performs safety and hygiene-related functions", exam_question_count: 5 },
      { code: "A-2", name: "Practices food safety procedures", exam_question_count: 8 }
    ],
    "cook-b": [
      { code: "B-3", name: "Uses tools and equipment", exam_question_count: 2 },
      { code: "B-4", name: "Organizes work", exam_question_count: 1 },
      { code: "B-5", name: "Manages information", exam_question_count: 1 },
      { code: "B-6", name: "Manages products", exam_question_count: 2 },
      { code: "B-7", name: "Performs trade activities", exam_question_count: 2 },
      { code: "B-8", name: "Adapts cooking practices to meet dietary requirements", exam_question_count: 2 },
      { code: "B-9", name: "Uses communication and mentoring techniques", exam_question_count: 1 }
    ],
    "cook-c": [
      { code: "C-10", name: "Prepares herbs and spices", exam_question_count: 3 },
      { code: "C-11", name: "Prepares vegetables", exam_question_count: 5 },
      { code: "C-12", name: "Prepares fruit", exam_question_count: 4 }
    ],
    "cook-d": [
      { code: "D-13", name: "Prepares stocks and broths", exam_question_count: 6 },
      { code: "D-14", name: "Prepares soups", exam_question_count: 6 }
    ],
    "cook-e": [
      { code: "E-15", name: "Prepares thickening and binding agents", exam_question_count: 4 },
      { code: "E-16", name: "Prepares sauces", exam_question_count: 9 }
    ],
    "cook-f": [
      { code: "F-17", name: "Uses cheese, dairy products and plant-based dairy alternative products", exam_question_count: 5 },
      { code: "F-18", name: "Prepares eggs and egg-based dishes", exam_question_count: 5 }
    ],
    "cook-g": [
      { code: "G-19", name: "Prepares pastas and noodles", exam_question_count: 6 },
      { code: "G-20", name: "Prepares stuffed pastas and dumplings", exam_question_count: 4 }
    ],
    "cook-h": [
      { code: "H-21", name: "Prepares grains and pulses", exam_question_count: 4 },
      { code: "H-22", name: "Prepares seeds and nuts", exam_question_count: 3 },
      { code: "H-23", name: "Prepares alternative proteins", exam_question_count: 4 }
    ],
    "cook-i": [
      { code: "I-24", name: "Prepares meats and game meats", exam_question_count: 8 },
      { code: "I-25", name: "Prepares poultry and game birds", exam_question_count: 6 },
      { code: "I-26", name: "Prepares variety meats", exam_question_count: 2 }
    ],
    "cook-j": [
      { code: "J-27", name: "Prepares fin fish", exam_question_count: 7 },
      { code: "J-28", name: "Prepares seafood", exam_question_count: 8 }
    ],
    "cook-k": [
      { code: "K-29", name: "Prepares sandwiches", exam_question_count: 3 },
      { code: "K-30", name: "Prepares salads", exam_question_count: 3 },
      { code: "K-31", name: "Prepares condiments, preserves and dressings", exam_question_count: 3 }
    ],
    "cook-l": [
      { code: "L-32", name: "Prepares hors d&rsquo;oeuvres and other finger foods", exam_question_count: 3 },
      { code: "L-33", name: "Prepares charcuterie and cured products", exam_question_count: 2 },
      { code: "L-34", name: "Prepares gels and glazes", exam_question_count: 1 },
      { code: "L-35", name: "Prepares marinades, rubs and brines", exam_question_count: 2 }
    ],
    "cook-m": [
      { code: "M-36", name: "Prepares dough-based products", exam_question_count: 2 },
      { code: "M-37", name: "Prepares batter-based products", exam_question_count: 2 },
      { code: "M-38", name: "Prepares creams, mousses, frozen desserts, fillings, icings, toppings and sugar works", exam_question_count: 2 },
      { code: "M-39", name: "Assembles cakes", exam_question_count: 1 },
      { code: "M-40", name: "Prepares savoury and sweet pastries and pies", exam_question_count: 2 },
      { code: "M-41", name: "Prepares chocolate", exam_question_count: 1 }
    ]
    },
  },
  "trade-baker": {
    tradeId: "trade-baker",
    tradeCode: "441A",
    totalQuestions: 150,
    examUrl: "https://red-seal.ca/eng/trades/bakers/exam-information.shtml",
    blocks: [
    { id: "baker-a", trade_id: "trade-baker", code: "A", name: "Performs Common Occupational Skills", sort_order: 1, exam_question_count: 23, exam_percentage: 15 },
    { id: "baker-b", trade_id: "trade-baker", code: "B", name: "Prepares Fermented Goods", sort_order: 2, exam_question_count: 41, exam_percentage: 27 },
    { id: "baker-c", trade_id: "trade-baker", code: "C", name: "Prepares Cookies, Bars, Cakes, Pastry and Quick Breads", sort_order: 3, exam_question_count: 33, exam_percentage: 22 },
    { id: "baker-d", trade_id: "trade-baker", code: "D", name: "Prepares Assembly and Finishing", sort_order: 4, exam_question_count: 26, exam_percentage: 17 },
    { id: "baker-e", trade_id: "trade-baker", code: "E", name: "Prepares Chocolate and Confections", sort_order: 5, exam_question_count: 15, exam_percentage: 10 },
    { id: "baker-f", trade_id: "trade-baker", code: "F", name: "Prepares Desserts, Ice Creams and Ices", sort_order: 6, exam_question_count: 12, exam_percentage: 8 }
    ],
    chapterTasks: {
    "baker-a": [
      { code: "A-1", name: "Performs safety- and hygiene-related functions", exam_question_count: 3 },
      { code: "A-2", name: "Practices food safety procedures", exam_question_count: 3 },
      { code: "A-3", name: "Uses and maintains tools and equipment", exam_question_count: 3 },
      { code: "A-4", name: "Organizes work", exam_question_count: 4 },
      { code: "A-5", name: "Manages products and information", exam_question_count: 4 },
      { code: "A-6", name: "Performs routine work practices", exam_question_count: 3 },
      { code: "A-7", name: "Adapts bakery practices to meet dietary requirements", exam_question_count: 3 }
    ],
    "baker-b": [
      { code: "B-9", name: "Prepares pre-ferment", exam_question_count: 6 },
      { code: "B-10", name: "Prepares dough", exam_question_count: 11 },
      { code: "B-11", name: "Forms dough", exam_question_count: 9 },
      { code: "B-12", name: "Forms laminated dough", exam_question_count: 7 },
      { code: "B-13", name: "Finishes fermented goods", exam_question_count: 8 }
    ],
    "baker-c": [
      { code: "C-14", name: "Prepares cookies and bars", exam_question_count: 7 },
      { code: "C-15", name: "Prepares quick breads", exam_question_count: 7 },
      { code: "C-16", name: "Prepares pastry doughs", exam_question_count: 9 },
      { code: "C-17", name: "Prepares cakes", exam_question_count: 10 }
    ],
    "baker-d": [
      { code: "D-18", name: "Prepares creams, custards, fillings, decorating pastes and icings", exam_question_count: 6 },
      { code: "D-19", name: "Prepares savoury fillings", exam_question_count: 3 },
      { code: "D-20", name: "Prepares sauces, glazes and garnishes", exam_question_count: 4 },
      { code: "D-21", name: "Assembles and bakes sweet and savoury pastries", exam_question_count: 4 },
      { code: "D-22", name: "Assembles cakes and other baked goods", exam_question_count: 5 },
      { code: "D-23", name: "Decorates and finishes baked goods", exam_question_count: 4 }
    ],
    "baker-e": [
      { code: "E-24", name: "Prepares chocolate", exam_question_count: 9 },
      { code: "E-25", name: "Prepares confections and sugar work", exam_question_count: 6 }
    ],
    "baker-f": [
      { code: "F-26", name: "Prepares plated desserts", exam_question_count: 4 },
      { code: "F-27", name: "Prepares ice creams and ices", exam_question_count: 4 },
      { code: "F-28", name: "Prepares frozen desserts", exam_question_count: 4 }
    ]
    },
  },
  "trade-hairstylist": {
    tradeId: "trade-hairstylist",
    tradeCode: "443A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/hairstylists/exam-information.shtml",
    blocks: [
    { id: "hairstylist-a", trade_id: "trade-hairstylist", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 14, exam_percentage: 12 },
    { id: "hairstylist-b", trade_id: "trade-hairstylist", code: "B", name: "Performs hair and scalp care", sort_order: 2, exam_question_count: 11, exam_percentage: 9 },
    { id: "hairstylist-c", trade_id: "trade-hairstylist", code: "C", name: "Cuts hair", sort_order: 3, exam_question_count: 24, exam_percentage: 20 },
    { id: "hairstylist-d", trade_id: "trade-hairstylist", code: "D", name: "Styles hair", sort_order: 4, exam_question_count: 16, exam_percentage: 13 },
    { id: "hairstylist-e", trade_id: "trade-hairstylist", code: "E", name: "Performs chemical texture services on hair", sort_order: 5, exam_question_count: 17, exam_percentage: 14 },
    { id: "hairstylist-f", trade_id: "trade-hairstylist", code: "F", name: "Alters hair colour", sort_order: 6, exam_question_count: 25, exam_percentage: 21 },
    { id: "hairstylist-g", trade_id: "trade-hairstylist", code: "G", name: "Performs specialized services", sort_order: 7, exam_question_count: 6, exam_percentage: 5 },
    { id: "hairstylist-h", trade_id: "trade-hairstylist", code: "H", name: "Performs salon operations", sort_order: 8, exam_question_count: 7, exam_percentage: 6 }
    ],
    chapterTasks: {
    "hairstylist-a": [
      { code: "A-1", name: "Performs safety-related and hygienic functions", exam_question_count: 4 },
      { code: "A-2", name: "Uses tools and equipment", exam_question_count: 4 },
      { code: "A-3", name: "Prepares for client services", exam_question_count: 3 },
      { code: "A-4", name: "Uses communication and mentoring techniques", exam_question_count: 3 }
    ],
    "hairstylist-b": [
      { code: "B-5", name: "Analyzes and responds to hair and scalp conditions", exam_question_count: 6 },
      { code: "B-6", name: "Shampoos and conditions hair and scalp", exam_question_count: 5 }
    ],
    "hairstylist-c": [
      { code: "C-7", name: "Cuts diverse textures of hair using cutting tools", exam_question_count: 19 },
      { code: "C-8", name: "Cuts facial and nape hair", exam_question_count: 5 }
    ],
    "hairstylist-d": [
      { code: "D-9", name: "Prepares and styles wet hair", exam_question_count: 8 },
      { code: "D-10", name: "Styles and finishes dry hair", exam_question_count: 8 }
    ],
    "hairstylist-e": [
      { code: "E-11", name: "Chemically waves hair", exam_question_count: 10 },
      { code: "E-12", name: "Chemically relaxes hair", exam_question_count: 7 }
    ],
    "hairstylist-f": [
      { code: "F-13", name: "Colours hair", exam_question_count: 9 },
      { code: "F-14", name: "Lightens hair", exam_question_count: 7 },
      { code: "F-15", name: "Performs colour correction", exam_question_count: 9 }
    ],
    "hairstylist-g": [
      { code: "G-16", name: "Performs services for hair extensions, wigs and hairpieces", exam_question_count: 4 },
      { code: "G-17", name: "Performs basic services on the face and nape", exam_question_count: 2 }
    ],
    "hairstylist-h": [
      { code: "H-18", name: "Performs front desk responsibilities", exam_question_count: 4 },
      { code: "H-19", name: "Establishes business fundamentals", exam_question_count: 3 }
    ]
    },
  },
  "trade-heavy-equipment-operator-dozer": {
    tradeId: "trade-heavy-equipment-operator-dozer",
    tradeCode: "450A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/heavyequipop_dozer/exam-information.shtml",
    blocks: [
    { id: "heavyequipmentoperatordozer-a", trade_id: "trade-heavy-equipment-operator-dozer", code: "A", name: "Common Occupational Skills", sort_order: 1, exam_question_count: 24, exam_percentage: 24 },
    { id: "heavyequipmentoperatordozer-b", trade_id: "trade-heavy-equipment-operator-dozer", code: "B", name: "Heavy Equipment (Dozer) Inspection and Basic Maintenance", sort_order: 2, exam_question_count: 26, exam_percentage: 26 },
    { id: "heavyequipmentoperatordozer-c", trade_id: "trade-heavy-equipment-operator-dozer", code: "C", name: "Heavy Equipment Operator (Dozer) Tasks", sort_order: 3, exam_question_count: 50, exam_percentage: 50 }
    ],
    chapterTasks: {
    "heavyequipmentoperatordozer-a": [
      { code: "A-1", name: "Uses and maintains tools and equipment", exam_question_count: 5 },
      { code: "A-2", name: "Maintains safe work environment", exam_question_count: 11 },
      { code: "A-3", name: "Organizes work", exam_question_count: 8 }
    ],
    "heavyequipmentoperatordozer-b": [
      { code: "B-4", name: "Performs scheduled maintenance", exam_question_count: 13 },
      { code: "B-5", name: "Performs inspections", exam_question_count: 13 }
    ],
    "heavyequipmentoperatordozer-c": [
      { code: "C-6", name: "Performs basic heavy equipment operator (dozer) functions", exam_question_count: 20 },
      { code: "C-7", name: "Transports equipment", exam_question_count: 5 },
      { code: "C-8", name: "Operates dozers", exam_question_count: 25 }
    ]
    },
  },
  "trade-mobile-crane-operator": {
    tradeId: "trade-mobile-crane-operator",
    tradeCode: "451A",
    totalQuestions: 110,
    examUrl: "https://red-seal.ca/eng/trades/mobilecrane_op/exam-information.shtml",
    blocks: [
    { id: "mobilecraneoperator-a", trade_id: "trade-mobile-crane-operator", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 7, exam_percentage: 6 },
    { id: "mobilecraneoperator-b", trade_id: "trade-mobile-crane-operator", code: "B", name: "Performs hoisting calculations", sort_order: 2, exam_question_count: 20, exam_percentage: 18 },
    { id: "mobilecraneoperator-c", trade_id: "trade-mobile-crane-operator", code: "C", name: "Inspects and maintains crane", sort_order: 3, exam_question_count: 14, exam_percentage: 13 },
    { id: "mobilecraneoperator-d", trade_id: "trade-mobile-crane-operator", code: "D", name: "Performs rigging", sort_order: 4, exam_question_count: 13, exam_percentage: 12 },
    { id: "mobilecraneoperator-e", trade_id: "trade-mobile-crane-operator", code: "E", name: "Plans lift, prepares site and sets up crane", sort_order: 5, exam_question_count: 16, exam_percentage: 15 },
    { id: "mobilecraneoperator-f", trade_id: "trade-mobile-crane-operator", code: "F", name: "Assembles, disassembles and transports crane", sort_order: 6, exam_question_count: 15, exam_percentage: 14 },
    { id: "mobilecraneoperator-g", trade_id: "trade-mobile-crane-operator", code: "G", name: "Operates crane", sort_order: 7, exam_question_count: 25, exam_percentage: 23 }
    ],
    chapterTasks: {
    "mobilecraneoperator-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 4 },
      { code: "A-2", name: "2 Uses communication and mentoring techniques", exam_question_count: 3 }
    ],
    "mobilecraneoperator-b": [
      { code: "B-1", name: "3 Determines load weights", exam_question_count: 6 },
      { code: "B-2", name: "4 Calculates crane capacity", exam_question_count: 8 },
      { code: "B-3", name: "5 Performs rigging calculations", exam_question_count: 6 }
    ],
    "mobilecraneoperator-c": [
      { code: "C-1", name: "6 Performs pre-operational checks and regular inspections", exam_question_count: 6 },
      { code: "C-2", name: "7 Performs operational and continual checks", exam_question_count: 5 },
      { code: "C-3", name: "8 Performs minor crane maintenance", exam_question_count: 3 }
    ],
    "mobilecraneoperator-d": [
      { code: "D-1", name: "9 Inspects, maintains and stores slings and hardware", exam_question_count: 6 },
      { code: "D-2", name: "10 Follows rigging procedures", exam_question_count: 7 }
    ],
    "mobilecraneoperator-e": [
      { code: "E-1", name: "11 Performs pre-lift planning", exam_question_count: 9 },
      { code: "E-2", name: "12 Sets up crane", exam_question_count: 7 }
    ],
    "mobilecraneoperator-f": [
      { code: "F-1", name: "13 Loads and unloads components for transport", exam_question_count: 3 },
      { code: "F-2", name: "14 Drives crane on public roadways", exam_question_count: 2 },
      { code: "F-3", name: "15 Assembles and disassembles lattice boom cranes", exam_question_count: 4 },
      { code: "F-4", name: "16 Assembles and disassembles telescopic boom cranes", exam_question_count: 4 },
      { code: "F-5", name: "17 Assembles and disassembles specialty equipment and attachments", exam_question_count: 2 }
    ],
    "mobilecraneoperator-g": [
      { code: "G-1", name: "18 Performs common craning operations", exam_question_count: 5 },
      { code: "G-2", name: "19 Operates friction drive lattice boom cranes", exam_question_count: 2 },
      { code: "G-3", name: "20 Operates hydraulic drive lattice boom cranes", exam_question_count: 6 },
      { code: "G-4", name: "21 Operates telescopic boom cranes", exam_question_count: 5 },
      { code: "G-5", name: "22 Performs specialty craning operations", exam_question_count: 4 },
      { code: "G-6", name: "23 Secures crane", exam_question_count: 3 }
    ]
    },
  },
  "trade-tower-crane-operator": {
    tradeId: "trade-tower-crane-operator",
    tradeCode: "452A",
    totalQuestions: 100,
    examUrl: "https://red-seal.ca/eng/trades/towercrane_op/exam-information.shtml",
    blocks: [
    { id: "towercraneoperator-a", trade_id: "trade-tower-crane-operator", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 11, exam_percentage: 11 },
    { id: "towercraneoperator-b", trade_id: "trade-tower-crane-operator", code: "B", name: "Inspects and maintains crane", sort_order: 2, exam_question_count: 21, exam_percentage: 21 },
    { id: "towercraneoperator-c", trade_id: "trade-tower-crane-operator", code: "C", name: "Performs crane set-up, hoisting calculations and lift planning", sort_order: 3, exam_question_count: 23, exam_percentage: 23 },
    { id: "towercraneoperator-d", trade_id: "trade-tower-crane-operator", code: "D", name: "Performs rigging", sort_order: 4, exam_question_count: 17, exam_percentage: 17 },
    { id: "towercraneoperator-e", trade_id: "trade-tower-crane-operator", code: "E", name: "Operates crane", sort_order: 5, exam_question_count: 28, exam_percentage: 28 }
    ],
    chapterTasks: {
    "towercraneoperator-a": [
      { code: "A-1", name: "1 Performs safety-related functions", exam_question_count: 8 },
      { code: "A-2", name: "2 Uses communication and mentoring techniques", exam_question_count: 3 }
    ],
    "towercraneoperator-b": [
      { code: "B-1", name: "3 Performs pre-operational checks and regular inspections", exam_question_count: 10 },
      { code: "B-2", name: "4 Performs continual checks", exam_question_count: 6 },
      { code: "B-3", name: "5 Performs minor crane maintenance", exam_question_count: 5 }
    ],
    "towercraneoperator-c": [
      { code: "C-1", name: "6 Participates in tower crane assembly, disassembly and transportation", exam_question_count: 6 },
      { code: "C-2", name: "7 Participates in tower crane climbing and reconfigurations", exam_question_count: 8 },
      { code: "C-3", name: "8 Plans lifts", exam_question_count: 9 }
    ],
    "towercraneoperator-d": [
      { code: "D-1", name: "9 Inspects, maintains and stores rigging equipment", exam_question_count: 8 },
      { code: "D-2", name: "10 Follows rigging procedures", exam_question_count: 9 }
    ],
    "towercraneoperator-e": [
      { code: "E-1", name: "11 Performs pre-lift (warm-up) activities", exam_question_count: 6 },
      { code: "E-2", name: "12 Operates tower cranes", exam_question_count: 10 },
      { code: "E-3", name: "13 Performs specialty tower crane operations", exam_question_count: 6 },
      { code: "E-4", name: "14 Shuts down and secures tower cranes", exam_question_count: 6 }
    ]
    },
  },
  "trade-landscape-horticulturist": {
    tradeId: "trade-landscape-horticulturist",
    tradeCode: "460A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/landscapehorticulture/exam-information.shtml",
    blocks: [
    { id: "landscapehorticulturist-a", trade_id: "trade-landscape-horticulturist", code: "A", name: "Performs common occupational skills", sort_order: 1, exam_question_count: 23, exam_percentage: 19 },
    { id: "landscapehorticulturist-b", trade_id: "trade-landscape-horticulturist", code: "B", name: "Applies horticultural principles", sort_order: 2, exam_question_count: 29, exam_percentage: 24 },
    { id: "landscapehorticulturist-c", trade_id: "trade-landscape-horticulturist", code: "C", name: "Performs landscape construction", sort_order: 3, exam_question_count: 40, exam_percentage: 33 },
    { id: "landscapehorticulturist-d", trade_id: "trade-landscape-horticulturist", code: "D", name: "Performs landscape maintenance", sort_order: 4, exam_question_count: 28, exam_percentage: 23 },
    { id: "landscapehorticulturist-e", trade_id: "trade-landscape-horticulturist", code: "E", name: "Works in production of plant material (Not Common Core)", sort_order: 5, exam_question_count: 0, exam_percentage: 0 }
    ],
    chapterTasks: {
    "landscapehorticulturist-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 5 },
      { code: "A-2", name: "Uses tools, equipment and vehicles", exam_question_count: 6 },
      { code: "A-3", name: "Organizes work", exam_question_count: 7 },
      { code: "A-4", name: "Participates in marketing and sales", exam_question_count: 3 },
      { code: "A-5", name: "Uses communication and mentoring techniques", exam_question_count: 2 }
    ],
    "landscapehorticulturist-b": [
      { code: "B-6", name: "Applies horticultural practices", exam_question_count: 18 },
      { code: "B-7", name: "Applies environmental practices", exam_question_count: 11 }
    ],
    "landscapehorticulturist-c": [
      { code: "C-8", name: "Performs pre-construction activities", exam_question_count: 10 },
      { code: "C-9", name: "Installs hardscape", exam_question_count: 13 },
      { code: "C-10", name: "Installs softscape", exam_question_count: 11 },
      { code: "C-11", name: "Installs green infrastructure systems", exam_question_count: 6 }
    ],
    "landscapehorticulturist-d": [
      { code: "D-12", name: "Maintains hardscape", exam_question_count: 9 },
      { code: "D-13", name: "Maintains softscape", exam_question_count: 13 },
      { code: "D-14", name: "Maintains green infrastructure", exam_question_count: 6 }
    ]
    },
  },
  "trade-appliance-service-technician": {
    tradeId: "trade-appliance-service-technician",
    tradeCode: "462A",
    totalQuestions: 120,
    examUrl: "https://red-seal.ca/eng/trades/applianceservtech/exam-information.shtml",
    blocks: [
    { id: "applianceservicetechnician-a", trade_id: "trade-appliance-service-technician", code: "A", name: "Occupational Skills", sort_order: 1, exam_question_count: 8, exam_percentage: 7 },
    { id: "applianceservicetechnician-b", trade_id: "trade-appliance-service-technician", code: "B", name: "Electrical And Electronic Systems", sort_order: 2, exam_question_count: 36, exam_percentage: 30 },
    { id: "applianceservicetechnician-c", trade_id: "trade-appliance-service-technician", code: "C", name: "Mechanical Systems", sort_order: 3, exam_question_count: 22, exam_percentage: 18 },
    { id: "applianceservicetechnician-d", trade_id: "trade-appliance-service-technician", code: "D", name: "Water Systems", sort_order: 4, exam_question_count: 14, exam_percentage: 12 },
    { id: "applianceservicetechnician-e", trade_id: "trade-appliance-service-technician", code: "E", name: "Air Systems", sort_order: 5, exam_question_count: 11, exam_percentage: 9 },
    { id: "applianceservicetechnician-f", trade_id: "trade-appliance-service-technician", code: "F", name: "Refrigeration Sealed Systems", sort_order: 6, exam_question_count: 29, exam_percentage: 24 },
    { id: "applianceservicetechnician-g", trade_id: "trade-appliance-service-technician", code: "G", name: "Gas Systems (Not Common Core)", sort_order: 7, exam_question_count: 0, exam_percentage: 0 }
    ],
    chapterTasks: {
    "applianceservicetechnician-a": [
      { code: "A-1", name: "Performs safety-related functions", exam_question_count: 1 },
      { code: "A-2", name: "Uses and maintains tools and equipment", exam_question_count: 2 },
      { code: "A-3", name: "Organizes work", exam_question_count: 2 },
      { code: "A-4", name: "Prepares for installation", exam_question_count: 1 },
      { code: "A-5", name: "Removes and installs appliances", exam_question_count: 2 }
    ],
    "applianceservicetechnician-b": [
      { code: "B-6", name: "Diagnoses electrical and electronic components", exam_question_count: 23 },
      { code: "B-7", name: "Repairs electrical and electronic systems", exam_question_count: 13 }
    ],
    "applianceservicetechnician-c": [
      { code: "C-8", name: "Diagnoses drive systems", exam_question_count: 6 },
      { code: "C-9", name: "Repairs drive systems", exam_question_count: 5 },
      { code: "C-10", name: "Services cabinets and consoles", exam_question_count: 2 },
      { code: "C-11", name: "Diagnoses suspension systems", exam_question_count: 5 },
      { code: "C-12", name: "Repairs suspension systems", exam_question_count: 4 }
    ],
    "applianceservicetechnician-d": [
      { code: "D-13", name: "Diagnoses water systems", exam_question_count: 7 },
      { code: "D-14", name: "Repairs water systems", exam_question_count: 7 }
    ],
    "applianceservicetechnician-e": [
      { code: "E-15", name: "Diagnoses forced air systems", exam_question_count: 5 },
      { code: "E-16", name: "Repairs forced air systems", exam_question_count: 4 },
      { code: "E-17", name: "Services static air systems", exam_question_count: 2 }
    ],
    "applianceservicetechnician-f": [
      { code: "F-18", name: "Diagnoses refrigeration sealed systems", exam_question_count: 12 },
      { code: "F-19", name: "Recovers refrigerant", exam_question_count: 5 },
      { code: "F-20", name: "Repairs refrigeration sealed systems", exam_question_count: 12 }
    ]
    },
  },
};

export const ALL_RSOS_BLOCKS: RsosBlock[] = Object.values(RSOS_EXAM_DATA).flatMap((d) => d.blocks);

export const ALL_CHAPTER_TASKS: Record<string, RsosChapterTask[]> = Object.assign(
  {},
  ...Object.values(RSOS_EXAM_DATA).map((d) => d.chapterTasks),
);

/** Placeholder RSOS blocks for catalog trades not listed on red-seal.ca. */
export const UNMAPPED_TRADE_RSOS: TradeRsosExamData[] = [
  {
    tradeId: "trade-electric-motor-systems-technician",
    tradeCode: "426A",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "electricmotorsystemstechnician-a", trade_id: "trade-electric-motor-systems-technician", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
  {
    tradeId: "trade-industrial-instrument-technician",
    tradeCode: "447B",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "industrialinstrumenttechnician-a", trade_id: "trade-industrial-instrument-technician", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
  {
    tradeId: "trade-elevator-constructor",
    tradeCode: "435A",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "elevatorconstructor-a", trade_id: "trade-elevator-constructor", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
  {
    tradeId: "trade-locksmith",
    tradeCode: "436A",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "locksmith-a", trade_id: "trade-locksmith", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
  {
    tradeId: "trade-water-well-driller",
    tradeCode: "461A",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "waterwelldriller-a", trade_id: "trade-water-well-driller", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
  {
    tradeId: "trade-concrete-pump-operator",
    tradeCode: "463A",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "concretepumpoperator-a", trade_id: "trade-concrete-pump-operator", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
  {
    tradeId: "trade-turbine-technician",
    tradeCode: "464A",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "turbinetechnician-a", trade_id: "trade-turbine-technician", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
  {
    tradeId: "trade-rig-technician",
    tradeCode: "465A",
    totalQuestions: 120,
    examUrl: "",
    blocks: [
      { id: "rigtechnician-a", trade_id: "trade-rig-technician", code: "A", name: "Trade competencies", sort_order: 1, exam_question_count: 120, exam_percentage: 100 },
    ],
    chapterTasks: {},
  },
];
