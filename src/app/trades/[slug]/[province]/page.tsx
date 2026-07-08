import type { Metadata } from "next";
import { TRADES, PROVINCIAL_GUIDES, getTradeBySlug } from "@/data/seed";
import { ProvincialGuideView } from "./provincial-guide-view";

export async function generateMetadata(
  props: PageProps<"/trades/[slug]/[province]">,
): Promise<Metadata> {
  const { slug, province } = await props.params;
  const trade = getTradeBySlug(slug);
  const guide = PROVINCIAL_GUIDES.find(
    (g) => g.trade_id === trade?.id && g.slug === province,
  );
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.meta_description ?? undefined,
  };
}

export default async function ProvincialGuidePage(
  props: PageProps<"/trades/[slug]/[province]">,
) {
  const { slug, province } = await props.params;
  return <ProvincialGuideView slug={slug} province={province} />;
}

export function generateStaticParams() {
  return PROVINCIAL_GUIDES.flatMap((g) => {
    const trade = TRADES.find((t) => t.id === g.trade_id);
    return trade ? [{ slug: trade.slug, province: g.slug }] : [];
  });
}
