import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/components/marketing/sections";
import {
  getTradeBySlug,
  getTradeDetailContent,
  getBlocksForTrade,
  PROVINCIAL_GUIDES,
} from "@/data/seed";
import { fetchQuestions, fetchTradeBySlug } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  recall: "Knowledge & recall",
  application: "Procedural & application",
  critical: "Critical thinking",
};

export async function TradeDetailView({ slug }: { slug: string }) {
  const trade = getTradeBySlug(slug);
  if (!trade) notFound();

  const detail = getTradeDetailContent(trade.id);
  const blocks = getBlocksForTrade(trade.id);
  const provinces = PROVINCIAL_GUIDES.filter((g) => g.trade_id === trade.id);
  const dbTrade = await fetchTradeBySlug(slug);
  const questions = dbTrade ? await fetchQuestions(dbTrade.id) : [];
  const sampleQ = questions[0];

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <div className="mx-auto max-w-[1180px] px-6 py-16">
        <span className="text-5xl">{trade.icon}</span>
        <h1 className="mt-4 font-[family-name:var(--font-barlow-condensed)] text-4xl font-bold">
          {trade.name} ({trade.code})
        </h1>
        <p className="mt-2 max-w-3xl text-[#64748B]">{trade.description}</p>
        {trade.status === "coming_soon" && (
          <p className="mt-4 rounded-xl border border-[#E5E0D8] bg-[#F6F3EE] px-4 py-3 text-sm text-[#64748B]">
            Full exam prep for this trade is coming soon. Sign up to get
            notified when practice questions and mock exams are available.
          </p>
        )}
        {detail?.red_seal_summary && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#475569]">
            {detail.red_seal_summary}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth/signup">
            <Button>Start free prep</Button>
          </Link>
          {provinces.map((p) => (
            <Link key={p.id} href={`/trades/${slug}/${p.slug}`}>
              <Button variant="secondary" size="sm">
                {p.province_name} guide
              </Button>
            </Link>
          ))}
        </div>

        {detail?.trade_scope && (
          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold">
              What this trade covers
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#64748B]">
              {detail.trade_scope}
            </p>
          </section>
        )}

        {(detail?.noc_code ||
          detail?.designation_year ||
          detail?.designated_provinces) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {detail.noc_code && (
              <Card className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                  NOC code
                </p>
                <p className="mt-1 font-[family-name:var(--font-ibm-mono)] text-lg font-semibold">
                  {detail.noc_code}
                </p>
              </Card>
            )}
            {detail.designation_year && (
              <Card className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                  Red Seal since
                </p>
                <p className="mt-1 font-[family-name:var(--font-ibm-mono)] text-lg font-semibold">
                  {detail.designation_year}
                </p>
              </Card>
            )}
            {detail.designated_provinces && (
              <Card className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                  Available in
                </p>
                <p className="mt-1 text-sm font-medium leading-snug">
                  {detail.designated_provinces.join(", ")}
                </p>
                {detail.alternate_title && (
                  <p className="mt-2 text-xs text-[#64748B]">
                    Also known as: {detail.alternate_title}
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-semibold">Exam format</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
              <li>• {trade.exam_question_count} multiple-choice questions</li>
              <li>• {trade.exam_time_minutes / 60}-hour time limit</li>
              <li>• {trade.pass_percentage}% required to pass</li>
              <li>
                • {trade.is_open_book ? "Open-book" : "Closed-book"}
                {trade.is_open_book
                  ? ` (${trade.reference_doc_types.join(", ")} permitted)`
                  : ""}
              </li>
              {detail?.exam_notes?.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </Card>

          {detail?.question_type_breakdown && (
            <Card className="p-6">
              <h2 className="font-semibold">Question types</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Every question has one correct answer and three incorrect
                options — not trick questions, but distractors are not always
                obvious.
              </p>
              <ul className="mt-4 space-y-3">
                {detail.question_type_breakdown.map((qt) => (
                  <li
                    key={qt.type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[#475569]">{qt.label}</span>
                    <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                      {qt.range}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {blocks.length > 0 && (
          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold">
              Exam blueprint (RSOS)
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#64748B]">
              Questions are distributed across major work activities defined in
              the Red Seal Occupational Standard — the same breakdown used on
              the official exam.
            </p>
            <div className="mt-6 space-y-3">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="rounded-lg border border-[#E5E0D8] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                        Block {block.code}
                      </span>
                      <p className="truncate text-sm font-medium">
                        {block.name}
                      </p>
                    </div>
                    <span className="shrink-0 font-[family-name:var(--font-ibm-mono)] text-sm text-[#64748B]">
                      {block.exam_question_count} Qs
                      {block.exam_percentage != null &&
                        ` · ${block.exam_percentage}%`}
                    </span>
                  </div>
                  {block.exam_percentage != null && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <div
                        className="h-full rounded-full bg-[#C0271E]"
                        style={{ width: `${block.exam_percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {sampleQ && (
          <section className="mt-12">
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">Sample question</h2>
                <span className="rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-medium text-[#C0271E]">
                  {QUESTION_TYPE_LABELS[sampleQ.question_type] ??
                    sampleQ.question_type}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{sampleQ.stem}</p>
              <ol className="mt-4 space-y-2">
                {sampleQ.options.map((opt) => (
                  <li
                    key={opt.key}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      opt.key === sampleQ.correct_option
                        ? "border-[#C0271E]/30 bg-[#FEF2F2] font-medium"
                        : "border-[#E5E0D8]"
                    }`}
                  >
                    <span className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                      {opt.key}.
                    </span>{" "}
                    {opt.text}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-[#64748B]">
                <span className="font-medium text-[#475569]">
                  Explanation:{" "}
                </span>
                {sampleQ.explanation}
              </p>
            </Card>
          </section>
        )}

        {detail?.official_links && detail.official_links.length > 0 && (
          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold">
              Official Red Seal resources
            </h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Source material from the{" "}
              <a
                href="https://red-seal.ca/eng/welcome.shtml"
                className="text-[#C0271E] underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Red Seal Program
              </a>{" "}
              — administered by the Canadian Council of Directors of
              Apprenticeship (CCDA).
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {detail.official_links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-[#E5E0D8] p-4 transition hover:border-[#C0271E] hover:shadow-sm"
                  >
                    <span className="text-sm font-medium text-[#C0271E]">
                      {link.label} →
                    </span>
                    {link.description && (
                      <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                        {link.description}
                      </p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 rounded-2xl bg-[#1F2A37] px-8 py-10 text-white">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold">
            Ready to prepare for your {trade.code} exam?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[#94A3B8]">
            Practice by RSOS block, run timed mock exams, and track readiness —
            aligned with the official {trade.exam_question_count}-question
            blueprint.
          </p>
          <Link href="/auth/signup" className="mt-6 inline-block">
            <Button variant="white">Start free prep</Button>
          </Link>
        </div>
      </div>
      <MarketingFooter />
    </div>
  );
}
