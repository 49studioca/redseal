import { APPRENTICE_STORIES } from "@/components/marketing/apprentice-stories";
import { PROVINCIAL_GUIDES, TRADES, getBlocksForTrade, getTradeDetailContent } from "@/data/seed";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/plans";
import type { Trade } from "@/types";

export const SITE_URL = "https://www.redsealguide.com";
export const SITE_NAME = "RedSealGuide";
export const SITE_TITLE = "RedSealGuide | AI Red Seal Exam Prep for Canada";
export const SITE_DESCRIPTION =
  "AI-powered Red Seal exam prep for Canadian trades: RSOS-aligned practice questions, mock exams, province-aware study guidance, and readiness tracking.";

/** Public aggregate rating shown in SoftwareApplication rich results. */
export const SITE_AGGREGATE_RATING = {
  ratingValue: "4.9",
  reviewCount: 127,
  ratingCount: 127,
  bestRating: "5",
  worstRating: "1",
} as const;

export const INDEXABLE_UTILITY_ROUTES = [
  "/trades",
  "/pricing",
  "/about",
  "/contact",
  "/careers",
  "/privacy",
  "/terms",
  "/refunds",
  "/disclaimer",
] as const;

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

const LOGO_URL = absoluteUrl("/red-seal-logo.png");
const LOGO_SVG_URL = absoluteUrl("/redseal-logo.svg");
const OG_IMAGE_URL = absoluteUrl("/opengraph-image");

export function tradeUrl(trade: Trade) {
  return absoluteUrl(`/trades/${trade.slug}`);
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function logoImageObject() {
  return {
    "@type": "ImageObject" as const,
    "@id": `${SITE_URL}/#logo`,
    url: LOGO_URL,
    contentUrl: LOGO_URL,
    width: 320,
    height: 320,
    caption: SITE_NAME,
  };
}

function aggregateRatingSchema() {
  return {
    "@type": "AggregateRating" as const,
    ratingValue: SITE_AGGREGATE_RATING.ratingValue,
    reviewCount: SITE_AGGREGATE_RATING.reviewCount,
    ratingCount: SITE_AGGREGATE_RATING.ratingCount,
    bestRating: SITE_AGGREGATE_RATING.bestRating,
    worstRating: SITE_AGGREGATE_RATING.worstRating,
  };
}

/** Reviews visible on the homepage testimonial section (5-star UI). */
function homepageReviewSchema() {
  return APPRENTICE_STORIES.slice(0, 6).map((story) => ({
    "@type": "Review" as const,
    author: {
      "@type": "Person" as const,
      name: story.name,
      jobTitle: story.role,
      address: {
        "@type": "PostalAddress" as const,
        addressLocality: story.place,
        addressCountry: "CA",
      },
    },
    reviewBody: story.quote,
    reviewRating: {
      "@type": "Rating" as const,
      ratingValue: "5",
      bestRating: "5",
      worstRating: "1",
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  }));
}

function subscriptionOffersSchema() {
  const plans = [
    {
      plan: SUBSCRIPTION_PLANS.monthly,
      name: "Monthly",
      billingDuration: "P1M",
      url: absoluteUrl("/pricing"),
    },
    {
      plan: SUBSCRIPTION_PLANS.quarterly,
      name: "Exam Prep (3 months)",
      billingDuration: "P3M",
      url: absoluteUrl("/pricing"),
    },
    {
      plan: SUBSCRIPTION_PLANS.annual,
      name: "Annual",
      billingDuration: "P1Y",
      url: absoluteUrl("/pricing"),
    },
  ];

  return {
    "@type": "AggregateOffer" as const,
    priceCurrency: "CAD",
    lowPrice: String(SUBSCRIPTION_PLANS.monthly.price),
    highPrice: String(SUBSCRIPTION_PLANS.annual.price),
    offerCount: plans.length,
    availability: "https://schema.org/InStock",
    offers: plans.map(({ plan, name, billingDuration, url }) => ({
      "@type": "Offer" as const,
      name,
      price: String(plan.price),
      priceCurrency: "CAD",
      category: "Subscription",
      url,
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
      description: plan.billingNote,
      eligibleRegion: {
        "@type": "Country" as const,
        name: "Canada",
      },
      priceSpecification: {
        "@type": "UnitPriceSpecification" as const,
        price: String(plan.price),
        priceCurrency: "CAD",
        billingDuration,
        unitText: plan.periodLabel.replace(/^\//, "").trim(),
      },
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["RedSeal Guide", "RedSeal AI Prep"],
    url: SITE_URL,
    logo: logoImageObject(),
    image: [LOGO_URL, LOGO_SVG_URL, OG_IMAGE_URL],
    description: SITE_DESCRIPTION,
    email: "support@redsealguide.com",
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
      logo: LOGO_URL,
    },
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
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@redsealguide.com",
        areaServed: "CA",
        availableLanguage: ["en-CA", "en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "billing support",
        email: "billing@redsealguide.com",
        areaServed: "CA",
        availableLanguage: ["en-CA", "en"],
      },
    ],
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
    description: SITE_DESCRIPTION,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    about: [
      "Red Seal exam preparation",
      "Canadian apprenticeship exam practice",
      "RSOS-aligned study plans",
    ],
  };
}

export function homepageSchema() {
  const liveTradeCount = TRADES.filter((trade) => trade.status === "live").length;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "en-CA",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#app` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
        },
        mainEntity: { "@id": `${SITE_URL}/#app` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        alternateName: "RedSeal AI Prep",
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Exam prep",
        operatingSystem: "Web, iOS, Android",
        browserRequirements: "Requires JavaScript",
        url: SITE_URL,
        image: [OG_IMAGE_URL, LOGO_URL],
        screenshot: OG_IMAGE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "en-CA",
        isAccessibleForFree: true,
        featureList: [
          `${liveTradeCount} live Red Seal trade libraries`,
          "RSOS-aligned practice questions",
          "Timed mock exams",
          "Weak-spot targeting by Red Seal block",
          "Province-aware study notes",
          "In-lesson word translation",
          "Flashcards and readiness tracking",
        ],
        offers: subscriptionOffersSchema(),
        aggregateRating: aggregateRatingSchema(),
        review: homepageReviewSchema(),
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        audience: {
          "@type": "Audience",
          audienceType:
            "Canadian tradespeople preparing for Red Seal certification exams",
          geographicArea: {
            "@type": "Country",
            name: "Canada",
          },
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
        isPartOf: { "@id": `${SITE_URL}/#webpage` },
        mainEntity: [
          {
            "@type": "Question",
            name: "Is this an official Red Seal tool?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No — it's an independent study aid from RedSealGuide, not affiliated with the Red Seal Program or any provincial authority.",
            },
          },
          {
            "@type": "Question",
            name: "Does it cover my province?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The platform supports all 13 provinces and territories. Province-specific code amendments are flagged when they apply.",
            },
          },
          {
            "@type": "Question",
            name: "What can I try for free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Free starter access includes the first Block A lesson, 5 mock-exam questions, 5 flashcards, and 5 translations. You don't need a credit card to start.",
            },
          },
          {
            "@type": "Question",
            name: "How does it find my weak spots?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Every question is tagged by Red Seal block. We track your accuracy and drill the blocks you score lowest on.",
            },
          },
          {
            "@type": "Question",
            name: "How do billing and cancellation work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Paid plans renew automatically at the displayed interval: monthly, every 3 months, or yearly. You can cancel from your dashboard at any time and keep access through the paid period.",
            },
          },
          {
            "@type": "Question",
            name: "What is the refund policy?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "New subscriptions have a 24-hour refund window. See the full refund policy at redsealguide.com/refunds for eligibility and processing details.",
            },
          },
          {
            "@type": "Question",
            name: "Does it work on my phone on site?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Built mobile-first. Knock out questions on a break; progress syncs everywhere.",
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

export function breadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function blogPostingSchema(post: {
  slug: string;
  title: string;
  seo_title?: string | null;
  seo_description?: string | null;
  excerpt?: string | null;
  cover_image_url?: string | null;
  author_name: string;
  keywords?: string[];
  published_at?: string | null;
  updated_at?: string | null;
  wordCount?: number;
  trade_slug?: string | null;
  trade_name?: string | null;
}) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const about = post.trade_slug
    ? [
        {
          "@type": "LearningResource",
          name: `${post.trade_name} Red Seal exam prep`,
          url: absoluteUrl(`/trades/${post.trade_slug}`),
        },
      ]
    : [
        {
          "@type": "Thing",
          name: "Red Seal Program exam preparation",
          description:
            "Canadian interprovincial trade certification exam prep for all Red Seal trades.",
        },
      ];

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en-CA",
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    keywords: post.keywords?.length ? post.keywords.join(", ") : undefined,
    wordCount: post.wordCount,
    about,
    author: {
      "@type": "Organization",
      name: post.author_name,
      url: SITE_URL,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
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
