import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/components/marketing/sections";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TranslateFeatureShowcase } from "@/components/marketing/translate-feature-showcase";
import {
  getTradeBySlug,
  getTradeDetailContent,
  getBlocksForTrade,
  PROVINCIAL_GUIDES,
} from "@/data/seed";
import { fetchQuestions, fetchTradeBySlug } from "@/lib/data";
import { buildSignupHref } from "@/lib/auth/signup-context";
import { jsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Trade } from "@/types";
import type { TradeDetailContent } from "@/types";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  recall: "Knowledge & recall",
  application: "Procedural & application",
  critical: "Critical thinking",
};

const QUESTION_TYPE_DESCRIPTIONS: Record<string, string> = {
  recall: "Remember facts, definitions, code rules, and standard procedures.",
  application: "Apply step-by-step procedures to complete a task correctly.",
  critical:
    "Analyze scenarios, troubleshoot problems, and choose the best solution.",
};

function tradeFaq(trade: Trade, detail: TradeDetailContent | undefined) {
  const bookType = trade.is_open_book
    ? `Yes — reference documents such as ${trade.reference_doc_types.join(", ")} are permitted during the exam.`
    : "No — the exam is closed-book. Mathematical formulas and acronyms are provided at the sitting where applicable.";

  return [
    {
      q: `How many questions are on the ${trade.name} Red Seal exam?`,
      a: `The interprovincial ${trade.code} Red Seal exam has ${trade.exam_question_count} multiple-choice questions over ${trade.exam_time_minutes / 60} hours. You need ${trade.pass_percentage}% to pass.`,
    },
    {
      q: `What is the pass mark for the ${trade.code} Red Seal exam?`,
      a: `You must score at least ${trade.pass_percentage}% on the ${trade.name} interprovincial Red Seal examination to earn your Red Seal endorsement.`,
    },
    {
      q: `Is the ${trade.name} Red Seal exam open book?`,
      a: bookType,
    },
    {
      q: `How should I prepare for the ${trade.name} Red Seal exam?`,
      a: `Study the Red Seal Occupational Standard (RSOS), drill practice questions by RSOS block, and run full-length mock exams under timed conditions. RedSealGuide builds an AI study plan aligned to the official ${trade.exam_question_count}-question blueprint.`,
    },
    {
      q: `What is the RSOS for ${trade.name}?`,
      a:
        detail?.trade_scope ??
        `The Red Seal Occupational Standard defines every task and knowledge area tested on the ${trade.code} interprovincial exam.`,
    },
  ];
}

function TradeCta({
  trade,
  variant = "primary",
  className = "",
}: {
  trade: Trade;
  variant?: "primary" | "inline";
  className?: string;
}) {
  const signupHref = buildSignupHref({
    tradeSlug: trade.slug,
    redirect: `/trades/${trade.slug}`,
  });

  if (trade.status === "coming_soon") {
    return (
      <Link href={signupHref} className={className}>
        <Button variant={variant === "primary" ? "white" : "primary"}>
          Get notified — sign up free
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    );
  }

  return (
    <Link href={signupHref} className={className}>
      <Button variant={variant === "primary" ? "white" : "primary"}>
        <Zap className="h-4 w-4" />
        Start free {trade.short_name} prep
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}

export async function TradeDetailView({ slug }: { slug: string }) {
  const trade = getTradeBySlug(slug);
  if (!trade) notFound();

  const detail = getTradeDetailContent(trade.id);
  const blocks = getBlocksForTrade(trade.id);
  const provinces = PROVINCIAL_GUIDES.filter((g) => g.trade_id === trade.id);
  const dbTrade = await fetchTradeBySlug(slug);
  const questions = dbTrade ? await fetchQuestions(dbTrade.id) : [];
  const sampleQ = questions[0];
  const faq = tradeFaq(trade, detail);
  const examHours = trade.exam_time_minutes / 60;
  const isLive = trade.status === "live";

  const features = [
    {
      icon: Sparkles,
      title: "AI-built study plan",
      body: `Custom quizzes target your weak ${trade.code} RSOS blocks — not generic test banks.`,
      color: "text-[#C0271E]",
      bg: "bg-[#FCEBEC]",
    },
    {
      icon: ClipboardCheck,
      title: "Full mock exams",
      body: `${trade.exam_question_count} questions, ${examHours}-hour timer, ${trade.pass_percentage}% pass threshold — exam-day conditions.`,
      color: "text-[#059669]",
      bg: "bg-[#ECFDF5]",
    },
    {
      icon: Target,
      title: "RSOS block drills",
      body: `Practice by official major work activity — the same blueprint used on the ${trade.name} Red Seal exam.`,
      color: "text-[#2563EB]",
      bg: "bg-[#EFF6FF]",
    },
    {
      icon: GraduationCap,
      title: "Readiness tracking",
      body: "See your score climb block by block until you hit 70%+ exam readiness.",
      color: "text-[#D97706]",
      bg: "bg-[#FFFBEB]",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_560px_at_78%_-10%,#E23A30_0%,#D8232A_48%,#B81A20_100%)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #fff 1.5px, transparent 0)",
              backgroundSize: "26px 26px",
              maskImage: "linear-gradient(180deg, #000, transparent 92%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-[1180px] px-6 pb-14 pt-8 sm:pb-16 sm:pt-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-[#FCE3E4]/80"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <Link href="/trades" className="hover:text-white">
              Red Seal trades
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="text-white">{trade.name}</span>
          </nav>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-[#FCE3E4]">
                <span className="text-2xl leading-none">{trade.icon}</span>
                {trade.code} · Interprovincial Red Seal
                {!isLive && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Coming soon
                  </span>
                )}
              </div>
              <h1 className="mt-5 font-[family-name:var(--font-barlow-condensed)] text-[38px] font-bold leading-[0.98] tracking-tight sm:text-[52px]">
                {trade.name} Red Seal
                <br />
                <span className="underline decoration-white/45 decoration-2 underline-offset-4">
                  exam prep
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#FCE3E4] sm:text-lg">
                {isLive
                  ? `AI-built practice questions, RSOS block drills, and timed mock exams for the ${trade.code} interprovincial Red Seal exam — built for Canadian apprentices and journeypersons.`
                  : `${trade.description} Full AI exam prep for this trade is coming soon — sign up to get notified.`}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm font-semibold text-[#FCE3E4]">
                {[
                  `${trade.exam_question_count} official-format practice questions`,
                  `RSOS-aligned · ${blocks.length || "All"} exam blocks covered`,
                  "Free to start — no credit card needed",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <TradeCta trade={trade} />
                <Link href="/pricing">
                  <Button
                    variant="ghost"
                    className="h-[42px] border border-white/25 bg-white/10 text-white hover:bg-white/20"
                  >
                    View pricing
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#FCE3E4]/70">
                {trade.code} exam at a glance
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Questions",
                    value: String(trade.exam_question_count),
                  },
                  { label: "Time limit", value: `${examHours} hrs` },
                  { label: "Pass mark", value: `${trade.pass_percentage}%` },
                  {
                    label: "Format",
                    value: trade.is_open_book ? "Open-book" : "Closed-book",
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs text-[#FCE3E4]/70">{stat.label}</dt>
                    <dd className="mt-0.5 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {detail?.question_type_breakdown && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-xs font-semibold text-[#FCE3E4]/70">
                    Question types (% of exam)
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {detail.question_type_breakdown.map((qt) => (
                      <li
                        key={qt.type}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-[#FCE3E4]">{qt.label}</span>
                        <span className="shrink-0 font-[family-name:var(--font-ibm-mono)] text-xs font-medium">
                          {qt.range} of exam
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#C2151B]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-4 px-6 py-6 md:grid-cols-4">
          {[
            {
              value: String(trade.exam_question_count),
              label: "Exam questions",
            },
            { value: `${examHours}h`, label: "Timed mock exams" },
            { value: String(blocks.length || "—"), label: "RSOS blocks" },
            { value: `${trade.pass_percentage}%`, label: "Pass threshold" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-[family-name:var(--font-barlow-condensed)] text-[34px] font-bold leading-none text-white">
                {s.value}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[#FCE3E4] sm:text-[13px]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-6 py-14 sm:py-16">
        {/* Platform features */}
        <section>
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
              Why RedSealGuide
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold tracking-tight sm:text-4xl">
              The smartest way to prep for your {trade.code} Red Seal exam
            </h2>
            <p className="mt-3 text-[#64748B]">
              Stop flipping dusty binders. Drill RSOS-aligned{" "}
              {trade.name.toLowerCase()} practice questions, run full mock
              exams, translate lesson words in your language, and track
              readiness — all in one platform built for Canadian tradespeople.
            </p>
          </div>

          <TranslateFeatureShowcase
            tradeName={trade.name}
            tradeCode={trade.code}
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-[#E5E0D8] bg-white p-5"
                >
                  <div
                    className={`inline-flex rounded-xl p-2.5 ${f.bg} ${f.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-barlow-semi)] text-base font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <TradeCta trade={trade} variant="inline" />
          </div>
        </section>

        {/* Trade scope */}
        {detail?.trade_scope && (
          <section className="mt-16 rounded-2xl border border-[#E5E0D8] bg-[#F6F3EE] p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-1 h-6 w-6 shrink-0 text-[#C0271E]" />
              <div>
                <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold sm:text-2xl">
                  What does a {trade.name} do?
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#64748B] sm:text-base">
                  {detail.trade_scope}
                </p>
                {detail.red_seal_summary && (
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#475569]">
                    {detail.red_seal_summary}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Meta cards */}
        {(detail?.noc_code ||
          detail?.designation_year ||
          detail?.designated_provinces) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {detail.noc_code && (
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                  NOC code
                </p>
                <p className="mt-1 font-[family-name:var(--font-ibm-mono)] text-xl font-semibold">
                  {detail.noc_code}
                </p>
              </Card>
            )}
            {detail.designation_year && (
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                  Red Seal since
                </p>
                <p className="mt-1 font-[family-name:var(--font-ibm-mono)] text-xl font-semibold">
                  {detail.designation_year}
                </p>
              </Card>
            )}
            {detail.designated_provinces && (
              <Card className="p-5">
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

        {/* Exam format */}
        <section className="mt-16">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold tracking-tight">
            {trade.code} Red Seal exam format
          </h2>
          <p className="mt-2 max-w-2xl text-[#64748B]">
            Everything you need to know about the interprovincial{" "}
            {trade.name.toLowerCase()} examination — and how RedSealGuide
            mirrors it.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold">Official exam structure</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#64748B]">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
                  {trade.exam_question_count} multiple-choice questions
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
                  {examHours}-hour time limit
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
                  {trade.pass_percentage}% required to pass
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
                  {trade.is_open_book ? "Open-book" : "Closed-book"}
                  {trade.is_open_book
                    ? ` (${trade.reference_doc_types.join(", ")} permitted)`
                    : ""}
                </li>
                {detail?.exam_notes?.map((note) => (
                  <li key={note} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
                    {note}
                  </li>
                ))}
              </ul>
            </Card>

            {detail?.question_type_breakdown && (
              <Card className="p-6">
                <h3 className="font-semibold">Question types on the exam</h3>
                <p className="mt-2 text-sm text-[#64748B]">
                  The Red Seal Program groups every exam question into three
                  cognitive levels. The percentage is how much of the{" "}
                  {trade.exam_question_count}-question exam falls in that
                  category — not your personal score.
                </p>
                <ul className="mt-5 space-y-4">
                  {detail.question_type_breakdown.map((qt) => (
                    <li
                      key={qt.type}
                      className="border-b border-[#ECE6DC] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#475569]">
                            {qt.label}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                            {QUESTION_TYPE_DESCRIPTIONS[qt.type] ??
                              "Questions at this cognitive level on the official exam."}
                          </p>
                        </div>
                        <span className="shrink-0 font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                          {qt.range} of exam
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </section>

        {/* RSOS blueprint */}
        {blocks.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold tracking-tight">
                  {trade.name} RSOS exam blueprint
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
                  Each block shows how many exam questions come from that RSOS
                  major work activity, and what share of the full{" "}
                  {trade.exam_question_count}-question exam it represents.
                </p>
              </div>
              {isLive && (
                <TradeCta trade={trade} variant="inline" className="shrink-0" />
              )}
            </div>
            <div className="mt-8 space-y-3">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="rounded-xl border border-[#E5E0D8] px-4 py-3.5 transition hover:border-[#C0271E]/40 hover:shadow-sm"
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
                    <span className="shrink-0 text-right font-[family-name:var(--font-ibm-mono)] text-sm text-[#64748B]">
                      {block.exam_question_count} Qs
                      {block.exam_percentage != null && (
                        <>
                          <span className="text-[#CBD5E1]"> · </span>
                          {block.exam_percentage}% of exam
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sample question */}
        {sampleQ && (
          <section className="mt-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
                  Try a question
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold tracking-tight">
                  Sample {trade.code} practice question
                </h2>
              </div>
              <TradeCta trade={trade} variant="inline" className="shrink-0" />
            </div>
            <Card className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-medium text-[#C0271E]">
                  {QUESTION_TYPE_LABELS[sampleQ.question_type] ??
                    sampleQ.question_type}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed sm:text-base">
                {sampleQ.stem}
              </p>
              <ol className="mt-5 space-y-2">
                {sampleQ.options.map((opt) => (
                  <li
                    key={opt.key}
                    className={`rounded-lg border px-4 py-2.5 text-sm ${
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
              <p className="mt-5 text-sm text-[#64748B]">
                <span className="font-medium text-[#475569]">
                  Explanation:{" "}
                </span>
                {sampleQ.explanation}
              </p>
            </Card>
          </section>
        )}

        {/* Provincial guides */}
        {provinces.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#C0271E]" />
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold sm:text-2xl">
                {trade.name} Red Seal guides by province
              </h2>
            </div>
            <p className="mt-2 text-sm text-[#64748B]">
              Registration steps, apprenticeship requirements, and
              province-specific exam info for the {trade.code} Red Seal.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {provinces.map((p) => (
                <Link key={p.id} href={`/trades/${slug}/${p.slug}`}>
                  <Button variant="secondary" size="sm">
                    {p.province_name}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-16">
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
              FAQ
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold tracking-tight">
              {trade.name} Red Seal exam — common questions
            </h2>
          </div>
          <dl className="mt-8 divide-y divide-[#E5E0D8] rounded-2xl border border-[#E5E0D8]">
            {faq.map((item) => (
              <div key={item.q} className="p-5 sm:p-6">
                <dt className="font-[family-name:var(--font-barlow-semi)] text-base font-semibold text-[#1F2A37]">
                  {item.q}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Official resources */}
        {detail?.official_links && detail.official_links.length > 0 && (
          <section className="mt-16">
            <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold sm:text-2xl">
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
              Apprenticeship (CCDA). RedSealGuide is unofficial and not
              affiliated with the Red Seal Program.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {detail.official_links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full rounded-xl border border-[#E5E0D8] p-4 transition hover:border-[#C0271E] hover:shadow-sm"
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
      </div>

      <PricingSection />

      <div className="mx-auto max-w-[1180px] px-6 pb-14 sm:pb-16">
        {/* Final CTA */}
        <section className="mt-16 overflow-hidden rounded-2xl bg-[#1F2A37] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold leading-tight sm:text-4xl">
                Pass your {trade.code} Red Seal exam the first time
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                Join apprentices and journeypersons across Canada using
                RedSealGuide to drill RSOS-aligned {trade.name.toLowerCase()}{" "}
                practice questions, run timed mock exams, and track exam
                readiness — free to start.
              </p>
              <ul className="mt-5 space-y-2 text-sm font-semibold text-[#CBD5E1]">
                {[
                  "No credit card to start",
                  "AI quiz ready in under 2 minutes",
                  "All provinces & territories",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#F4564E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <TradeCta trade={trade} />
              <Link
                href="/trades"
                className="text-sm font-semibold text-[#94A3B8] hover:text-white"
              >
                Browse all 56 Red Seal trades →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <MarketingFooter />
    </div>
  );
}
