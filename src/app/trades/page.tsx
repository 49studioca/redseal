import Link from "next/link";
import type { Metadata } from "next";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/components/marketing/sections";
import { TRADES } from "@/data/seed";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";
import {
  tradeCardImageAlt,
  tradeCardImageSrc,
} from "@/lib/storage/trade-card-images";

export const metadata: Metadata = {
  title: `All Red Seal Trades Covered`,
  description:
    "Browse all Red Seal trades covered by RedSealGuide, including Construction Electrician, Plumber, Welder, Industrial Electrician, Carpenter, and more.",
  alternates: {
    canonical: "/trades",
  },
  openGraph: {
    title: `All Red Seal Trades Covered | ${SITE_NAME}`,
    description:
      "Find RSOS-aligned exam prep pages for Canada's Red Seal trades.",
    url: "/trades",
  },
};

export default function TradesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/trades")}#collection`,
    name: "All Red Seal Trades Covered",
    description:
      "Browse Red Seal exam prep pages for Canadian trades covered by RedSealGuide.",
    url: absoluteUrl("/trades"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TRADES.length,
      itemListElement: TRADES.map((trade, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${trade.name} Red Seal exam prep`,
        url: absoluteUrl(`/trades/${trade.slug}`),
      })),
    },
  };

  return (
    <div className="app-mobile-content min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <MarketingHeader />
      <div className="mx-auto max-w-[1180px] px-6 py-16">
        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-bold">
          Red Seal Trades
        </h1>
        <p className="mt-2 text-[#64748B]">
          Choose your trade to start exam prep
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[...TRADES]
            .sort((a, b) => {
              if (a.status === b.status) return a.name.localeCompare(b.name);
              return a.status === "live" ? -1 : 1;
            })
            .map((trade) => {
              const cardImage = tradeCardImageSrc(trade.slug);
              const cardAlt =
                tradeCardImageAlt(trade.slug) ?? `${trade.name} Red Seal trade`;

              return (
                <Link
                  key={trade.id}
                  href={`/trades/${trade.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] transition hover:border-[#C0271E] hover:shadow-lg"
                >
                  {cardImage ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F6F3EE]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardImage}
                        alt={cardAlt}
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  {trade.status === "coming_soon" && (
                    <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#64748B] shadow-sm">
                      Coming soon
                    </span>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="flex items-center gap-2 font-[family-name:var(--font-barlow-semi)] text-xl font-semibold">
                      <span
                        className={cardImage ? "text-2xl" : "text-4xl"}
                        aria-hidden="true"
                      >
                        {trade.icon}
                      </span>
                      {trade.name}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-snug text-[#64748B] line-clamp-3">
                      {trade.description}
                    </p>
                  </div>
                  <div className="border-t border-[#E5E0D8] bg-[#FAF8F4] px-6 py-3">
                    <p className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                      {trade.code} · {trade.exam_question_count} Qs
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
      <MarketingFooter />
    </div>
  );
}
