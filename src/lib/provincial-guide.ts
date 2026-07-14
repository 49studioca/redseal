import { PROVINCIAL_GUIDES } from "@/data/seed";
import {
  PROVINCES,
  getProvinceBySlug,
  getTradeCodeAdoption,
  normalizeProvinceCode,
} from "@/lib/provinces";
import type { ProvincialGuide, Trade } from "@/types";

/** Provincial/territorial apprenticeship authorities (public information). */
const APPRENTICESHIP_AUTHORITY: Record<string, string> = {
  ON: "Skilled Trades Ontario",
  BC: "SkilledTradesBC",
  AB: "Alberta Apprenticeship and Industry Training",
  SK: "Saskatchewan Apprenticeship and Trade Certification Commission",
  MB: "Apprenticeship Manitoba",
  QC: "the Commission de la construction du Québec (CCQ)",
  NB: "Apprenticeship and Occupational Certification (PETL)",
  NS: "the Nova Scotia Apprenticeship Agency",
  PE: "Apprenticeship PEI",
  NL: "Apprenticeship and Certification (Newfoundland and Labrador)",
  YT: "Yukon Apprenticeship",
  NT: "Apprenticeship Northwest Territories",
  NU: "Nunavut Apprenticeship",
};

function examInfoLine(trade: Trade): string {
  const hours = trade.exam_time_minutes / 60;
  const hoursLabel = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
  return `${trade.exam_question_count} questions, ${hoursLabel} hours, ${trade.pass_percentage}% to pass, ${
    trade.is_open_book ? "open-book" : "closed-book"
  }`;
}

/** Build a province guide from trade + province data when none is authored. */
function synthesizeGuide(trade: Trade, provinceSlug: string): ProvincialGuide | null {
  const province = getProvinceBySlug(provinceSlug);
  if (!province) return null;

  const authority =
    APPRENTICESHIP_AUTHORITY[province.code] ??
    `your provincial apprenticeship authority`;
  const adoption = getTradeCodeAdoption(
    trade.code,
    normalizeProvinceCode(province.code),
  );

  return {
    id: `pg-${trade.slug}-${province.slug}`,
    trade_id: trade.id,
    province_code: province.code,
    province_name: province.name,
    slug: province.slug,
    title: `How to Challenge the ${trade.code} Exam in ${province.name}`,
    content: {
      sections: [
        {
          heading: "Apprenticeship Requirements",
          body: `In ${province.name}, apprenticeship for the ${trade.name} trade is administered through ${authority}. Requirements combine on-the-job hours with technical (in-school) training. Confirm the current hour totals and training levels with ${authority}, as they vary by province.`,
        },
        {
          heading: "Exam Eligibility",
          body: `You can write the ${trade.code} Red Seal exam after completing a registered apprenticeship, or by challenging it as a trade qualifier / Trade Equivalency Assessment if you have enough documented work experience. ${authority} reviews eligibility and approves your exam sitting.`,
        },
        {
          heading: "Code Adoption",
          body: `${adoption.codeAdoption} The Red Seal exam is scored against the national standard (${adoption.nationalCode}), not provincial amendments.`,
        },
      ],
    },
    prerequisites: `Registered apprenticeship or challenge/TEA approval through ${authority}`,
    code_adoption: `${adoption.localCodeName} (based on ${adoption.nationalCode})`,
    exam_info: examInfoLine(trade),
    meta_description: `How to prepare for and challenge the ${trade.code} ${trade.name} Red Seal exam in ${province.name} — apprenticeship path, eligibility, and provincial code info.`,
  };
}

/**
 * Resolve the provincial guide for a trade: prefer an authored PROVINCIAL_GUIDES
 * entry, otherwise synthesize an accurate one so every province is covered.
 */
export function resolveProvincialGuide(
  trade: Trade,
  provinceSlug: string,
): ProvincialGuide | null {
  const authored = PROVINCIAL_GUIDES.find(
    (g) => g.trade_id === trade.id && g.slug === provinceSlug,
  );
  if (authored) return authored;
  return synthesizeGuide(trade, provinceSlug);
}

/** All provinces/territories a trade guide is available for (i.e. all of them). */
export function provincialGuideList(trade: Trade): ProvincialGuide[] {
  return PROVINCES.map((province) =>
    resolveProvincialGuide(trade, province.slug),
  ).filter((guide): guide is ProvincialGuide => guide !== null);
}

export type ProvinceDifferencePanel = {
  code: string;
  name: string;
  nationalCode: string;
  localCodeName: string;
  codeAdoption: string;
  examInfo?: string;
  apprenticeship?: string;
  apprenticeshipHours?: number;
};

/** Province-specific highlights for the on-page tabs (no navigation needed). */
export function provinceDifferencePanels(trade: Trade): ProvinceDifferencePanel[] {
  return PROVINCES.map((province) => {
    const code = normalizeProvinceCode(province.code);
    const adoption = getTradeCodeAdoption(trade.code, code);
    const guide = resolveProvincialGuide(trade, province.slug);
    return {
      code: province.code,
      name: province.name,
      nationalCode: adoption.nationalCode,
      localCodeName: adoption.localCodeName,
      codeAdoption: adoption.codeAdoption,
      examInfo: guide?.exam_info,
      apprenticeship: guide?.prerequisites,
      apprenticeshipHours: guide?.apprenticeship_hours,
    };
  });
}
