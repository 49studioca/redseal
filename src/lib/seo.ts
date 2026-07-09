import { PROVINCIAL_GUIDES, TRADES, getBlocksForTrade, getTradeDetailContent } from "@/data/seed";
import type { Trade } from "@/types";

export const SITE_URL = "https://www.redsealguide.com";
export const SITE_NAME = "RedSealGuide";
export const SITE_TITLE = "RedSealGuide | AI Red Seal Exam Prep for Canada";
export const SITE_DESCRIPTION =
  "AI-powered Red Seal exam prep for Canadian trades: RSOS-aligned practice questions, mock exams, province-aware study guidance, and readiness tracking.";

export const INDEXABLE_UTILITY_ROUTES = ["/trades"] as const;

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function tradeUrl(trade: Trade) {
  return absoluteUrl(`/trades/${trade.slug}`);
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/redseal-logo.svg"),
    description: SITE_DESCRIPTION,
    areaServed: {
      "@type": "Country",
      name: "Canada",
    },
    knowsAbout: [
      "Red Seal exam preparation",
      "Red Seal Occupational Standard",
      "Canadian skilled trades",
      "Apprenticeship exam practice",
      "Interprovincial Red Seal exams",
    ],
    sameAs: ["https://red-seal.ca/eng/welcome.shtml"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-CA",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/trades?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function homepageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          category: "Subscription",
          priceCurrency: "CAD",
        },
        audience: {
          "@type": "Audience",
          audienceType: "Canadian tradespeople preparing for Red Seal certification exams",
        },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#red-seal-trades`,
        name: "Red Seal trades covered by RedSealGuide",
        numberOfItems: TRADES.length,
        itemListElement: TRADES.slice(0, 12).map((trade, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${trade.name} Red Seal exam prep`,
          url: tradeUrl(trade),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Is RedSealGuide an official Red Seal tool?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. RedSealGuide is an independent study aid and is not affiliated with the Red Seal Program or any provincial authority.",
            },
          },
          {
            "@type": "Question",
            name: "Does RedSealGuide cover all provinces and territories?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. RedSealGuide supports learners across Canada's provinces and territories and flags province-specific code or registration differences where relevant.",
            },
          },
        ],
      },
    ],
  };
}

export function tradeSchema(trade: Trade) {
  const detail = getTradeDetailContent(trade.id);
  const blocks = getBlocksForTrade(trade.id);

  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${tradeUrl(trade)}#learning-resource`,
    name: `${trade.name} Red Seal Exam Prep`,
    url: tradeUrl(trade),
    description:
      detail?.red_seal_summary ??
      trade.description ??
      `Practice for the ${trade.code} ${trade.name} Red Seal exam.`,
    inLanguage: "en-CA",
    about: [
      "Red Seal exam preparation",
      `${trade.name} trade certification`,
      "Red Seal Occupational Standard",
    ],
    educationalLevel: "Apprenticeship and trade certification",
    learningResourceType: ["Practice questions", "Mock exams", "Study guide"],
    teaches: blocks.slice(0, 8).map((block) => block.name),
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    isAccessibleForFree: true,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "apprentice",
    },
  };
}

export function allPublicSitemapRoutes() {
  const staticRoutes = ["/", ...INDEXABLE_UTILITY_ROUTES];
  const tradeRoutes = TRADES.map((trade) => `/trades/${trade.slug}`);
  const provinceRoutes = PROVINCIAL_GUIDES.flatMap((guide) => {
    const trade = TRADES.find((item) => item.id === guide.trade_id);
    return trade ? [`/trades/${trade.slug}/${guide.slug}`] : [];
  });

  return [...staticRoutes, ...tradeRoutes, ...provinceRoutes];
}
