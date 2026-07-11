export const PROVINCES = [
  { code: "ON", name: "Ontario", slug: "ontario" },
  { code: "BC", name: "British Columbia", slug: "british-columbia" },
  { code: "AB", name: "Alberta", slug: "alberta" },
  { code: "SK", name: "Saskatchewan", slug: "saskatchewan" },
  { code: "MB", name: "Manitoba", slug: "manitoba" },
  { code: "QC", name: "Quebec", slug: "quebec" },
  { code: "NB", name: "New Brunswick", slug: "new-brunswick" },
  { code: "NS", name: "Nova Scotia", slug: "nova-scotia" },
  { code: "PE", name: "Prince Edward Island", slug: "prince-edward-island" },
  { code: "NL", name: "Newfoundland and Labrador", slug: "newfoundland-and-labrador" },
  { code: "YT", name: "Yukon", slug: "yukon" },
  { code: "NT", name: "Northwest Territories", slug: "northwest-territories" },
  { code: "NU", name: "Nunavut", slug: "nunavut" },
] as const;

export type ProvinceCode = (typeof PROVINCES)[number]["code"];

export const DEFAULT_PROVINCE: ProvinceCode = "ON";

const PROVINCE_CODES = new Set<string>(PROVINCES.map((p) => p.code));

export function isProvinceCode(value: string): value is ProvinceCode {
  return PROVINCE_CODES.has(value);
}

export function getProvinceByCode(code: string) {
  return PROVINCES.find((p) => p.code === code) ?? PROVINCES[0];
}

export function getProvinceBySlug(slug: string) {
  return PROVINCES.find((p) => p.slug === slug);
}

export function normalizeProvinceCode(code?: string | null): ProvinceCode {
  if (code && isProvinceCode(code)) return code;
  return DEFAULT_PROVINCE;
}

type TradeCodeFamily = "electrical" | "plumbing" | "welding" | "general";

function tradeFamily(tradeCode: string): TradeCodeFamily {
  const code = tradeCode.toUpperCase();
  if (code.includes("309") || code.startsWith("442")) return "electrical";
  if (code.includes("447") || code.includes("306")) return "plumbing";
  if (code.includes("276") || code.includes("456")) return "welding";
  return "general";
}

const ELECTRICAL_ADOPTION: Partial<
  Record<ProvinceCode, { localCodeName: string; codeAdoption: string }>
> = {
  ON: {
    localCodeName: "OESC",
    codeAdoption:
      "Ontario adopts the CEC as the Ontario Electrical Safety Code (OESC) with Ontario-specific amendments.",
  },
  BC: {
    localCodeName: "BC Electrical Code",
    codeAdoption:
      "British Columbia adopts the CEC with BC-specific amendments.",
  },
  AB: {
    localCodeName: "AEMA Electrical Code",
    codeAdoption:
      "Alberta adopts the CEC with Alberta-specific amendments under the Safety Codes Act.",
  },
  QC: {
    localCodeName: "Quebec Construction Code",
    codeAdoption:
      "Quebec adopts the CEC with Quebec-specific amendments in the Construction Code.",
  },
};

const PLUMBING_ADOPTION: Partial<
  Record<ProvinceCode, { localCodeName: string; codeAdoption: string }>
> = {
  ON: {
    localCodeName: "Ontario Building Code (plumbing)",
    codeAdoption:
      "Ontario adopts the NPC with Ontario-specific plumbing amendments in the Ontario Building Code.",
  },
  BC: {
    localCodeName: "BC Plumbing Code",
    codeAdoption:
      "British Columbia adopts the NPC with BC-specific plumbing amendments.",
  },
  AB: {
    localCodeName: "Alberta Plumbing Code",
    codeAdoption:
      "Alberta adopts the NPC with Alberta-specific plumbing amendments.",
  },
};

const WELDING_ADOPTION: Partial<
  Record<ProvinceCode, { localCodeName: string; codeAdoption: string }>
> = {
  ON: {
    localCodeName: "Ontario OHS + CSA W59",
    codeAdoption:
      "Ontario workplaces follow provincial OHS regulations alongside CSA W59 for structural welding.",
  },
  BC: {
    localCodeName: "WorkSafeBC + CSA W59",
    codeAdoption:
      "BC workplaces follow WorkSafeBC regulations alongside CSA W59 for structural welding.",
  },
};

export function getTradeCodeAdoption(tradeCode: string, provinceCode: ProvinceCode) {
  const province = getProvinceByCode(provinceCode);
  const family = tradeFamily(tradeCode);

  if (family === "electrical") {
    const specific = ELECTRICAL_ADOPTION[provinceCode];
    return {
      nationalCode: "CEC (Canadian Electrical Code)",
      localCodeName: specific?.localCodeName ?? `Provincial electrical code (${province.name})`,
      codeAdoption:
        specific?.codeAdoption ??
        `${province.name} adopts the CEC with province-specific amendments for installations.`,
    };
  }

  if (family === "plumbing") {
    const specific = PLUMBING_ADOPTION[provinceCode];
    return {
      nationalCode: "NPC (National Plumbing Code of Canada)",
      localCodeName: specific?.localCodeName ?? `Provincial plumbing code (${province.name})`,
      codeAdoption:
        specific?.codeAdoption ??
        `${province.name} adopts the NPC with province-specific plumbing amendments.`,
    };
  }

  if (family === "welding") {
    const specific = WELDING_ADOPTION[provinceCode];
    return {
      nationalCode: "CSA W59 / W47.1 (structural welding standards)",
      localCodeName: specific?.localCodeName ?? `Provincial OHS + CSA standards (${province.name})`,
      codeAdoption:
        specific?.codeAdoption ??
        `${province.name} follows provincial OHS regulations alongside national CSA welding standards.`,
    };
  }

  return {
    nationalCode: "National Red Seal trade standards",
    localCodeName: `${province.name} trade regulations`,
    codeAdoption: `${province.name} may have province-specific regulations that supplement national Red Seal standards.`,
  };
}

export function formatProvincePromptContext(
  provinceCode: ProvinceCode,
  tradeCode: string,
): string {
  const province = getProvinceByCode(provinceCode);
  const adoption = getTradeCodeAdoption(tradeCode, provinceCode);

  return `Learner province: ${province.name} (${provinceCode})
Provincial code adoption: ${adoption.codeAdoption}
Local code name: ${adoption.localCodeName}
National exam standard: ${adoption.nationalCode}

Red Seal exam rules:
- Exam questions and correct answers must align with the NATIONAL standard (${adoption.nationalCode}), not provincial amendments.
- Teach and explain using the national code as the exam baseline.
- When ${province.name} differs from national, add a callout (meta.variant: "warning", meta.province_note: true) explaining the provincial difference.
- Practice questions must be answerable using the national standard unless clearly marked as provincial context only.`;
}
