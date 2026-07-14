import type { Metadata } from "next";
import { TRADES, getTradeBySlug } from "@/data/seed";
import { PROVINCES } from "@/lib/provinces";
import { resolveProvincialGuide } from "@/lib/provincial-guide";
import { SITE_NAME, absoluteUrl, jsonLd } from "@/lib/seo";
import { ProvincialGuideView } from "./provincial-guide-view";

export async function generateMetadata(
  props: PageProps<"/trades/[slug]/[province]">,
): Promise<Metadata> {
  const { slug, province } = await props.params;
  const trade = getTradeBySlug(slug);
  const guide = trade ? resolveProvincialGuide(trade, province) : null;
  if (!guide) return {};
  const canonical = `/trades/${slug}/${province}`;

  return {
    title: guide.title,
    description: guide.meta_description ?? undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${guide.title} | ${SITE_NAME}`,
      description: guide.meta_description ?? undefined,
      url: absoluteUrl(canonical),
      type: "article",
    },
  };
}

export default async function ProvincialGuidePage(
  props: PageProps<"/trades/[slug]/[province]">,
) {
  const { slug, province } = await props.params;
  const trade = getTradeBySlug(slug);
  const guide = trade ? resolveProvincialGuide(trade, province) : null;
  const schema =
    trade && guide
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${absoluteUrl(`/trades/${slug}/${province}`)}#article`,
          headline: guide.title,
          description: guide.meta_description,
          url: absoluteUrl(`/trades/${slug}/${province}`),
          inLanguage: "en-CA",
          about: [
            `${trade.name} Red Seal exam`,
            `${guide.province_name} apprenticeship requirements`,
            "Red Seal exam registration",
          ],
          publisher: {
            "@id": `${absoluteUrl("/")}#organization`,
          },
        }
      : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      )}
      <ProvincialGuideView slug={slug} province={province} />
    </>
  );
}

export function generateStaticParams() {
  return TRADES.flatMap((trade) =>
    PROVINCES.map((province) => ({
      slug: trade.slug,
      province: province.slug,
    })),
  );
}
