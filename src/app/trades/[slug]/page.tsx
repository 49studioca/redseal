import type { Metadata } from "next";
import { TRADES, getTradeBySlug, getTradeDetailContent } from "@/data/seed";
import { TradeDetailView } from "./trade-detail-view";

export async function generateMetadata(
  props: PageProps<"/trades/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const trade = getTradeBySlug(slug);
  if (!trade) return {};
  return {
    title: `${trade.name} Red Seal Exam Prep | RedSealGuide`,
    description:
      getTradeDetailContent(trade.id)?.trade_scope?.slice(0, 155) ??
      `Practice questions, mock exams, and learning paths for the ${trade.code} ${trade.name} Red Seal exam.`,
  };
}

export default async function TradeDetailPage(
  props: PageProps<"/trades/[slug]">,
) {
  const { slug } = await props.params;
  return <TradeDetailView slug={slug} />;
}

export function generateStaticParams() {
  return TRADES.map((t) => ({ slug: t.slug }));
}
