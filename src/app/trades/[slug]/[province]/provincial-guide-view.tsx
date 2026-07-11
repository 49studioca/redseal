import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/components/marketing/sections";
import { getTradeBySlug, PROVINCIAL_GUIDES } from "@/data/seed";
import { buildSignupHref } from "@/lib/auth/signup-context";
import { normalizeProvinceCode } from "@/lib/provinces";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ProvincialGuideView({
  slug,
  province,
}: {
  slug: string;
  province: string;
}) {
  const trade = getTradeBySlug(slug);
  if (!trade) notFound();

  const guide = PROVINCIAL_GUIDES.find(
    (g) => g.trade_id === trade.id && g.slug === province,
  );
  if (!guide) notFound();

  const sections =
    (guide.content as { sections?: { heading: string; body: string }[] })
      .sections ?? [];

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href={`/trades/${slug}`}
          className="text-sm font-semibold text-[#C0271E]"
        >
          ← {trade.name}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-barlow-condensed)] text-4xl font-bold">
          {guide.title}
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {guide.apprenticeship_hours && (
            <Card className="p-4 text-center">
              <div className="font-[family-name:var(--font-ibm-mono)] text-2xl font-bold">
                {guide.apprenticeship_hours}
              </div>
              <div className="text-xs text-[#64748B]">Apprenticeship hours</div>
            </Card>
          )}
          {guide.code_adoption && (
            <Card className="p-4 text-center sm:col-span-2">
              <div className="text-sm font-semibold">Code adoption</div>
              <div className="text-xs text-[#64748B]">
                {guide.code_adoption}
              </div>
            </Card>
          )}
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold">
                {section.heading}
              </h2>
              <p className="mt-2 leading-relaxed text-[#64748B]">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {guide.exam_info && (
          <Card className="mt-10 p-6">
            <h3 className="font-semibold">Exam info</h3>
            <p className="mt-2 text-sm text-[#64748B]">{guide.exam_info}</p>
          </Card>
        )}

        <Link
          href={buildSignupHref({
            tradeSlug: slug,
            province: normalizeProvinceCode(guide.province_code),
            redirect: `/trades/${slug}/${province}`,
          })}
          className="mt-8 inline-block"
        >
          <Button size="lg">Start preparing for {trade.code}</Button>
        </Link>
      </div>
      <MarketingFooter />
    </div>
  );
}
