import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
  Video,
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
} from "@/data/seed";
import { provinceDifferencePanels } from "@/lib/provincial-guide";
import { getTradeImageSrc } from "@/lib/trade-images";
import { ProvinceTabs } from "@/components/trades/province-tabs";
import { ComingSoonNotify } from "@/components/trades/coming-soon-notify";
import { buildSignupHref } from "@/lib/auth/signup-context";
import { jsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Trade } from "@/types";
import type { TradeDetailContent } from "@/types";

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
      <a href="#notify" className={className}>
        <Button
          variant={variant === "primary" ? "white" : "primary"}
          className="whitespace-nowrap"
        >
          Get notified — sign up free
          <ArrowRight className="h-4 w-4" />
        </Button>
      </a>
    );
  }

  return (
    <Link href={signupHref} className={className}>
      <Button
        variant={variant === "primary" ? "white" : "primary"}
        className="whitespace-nowrap"
      >
        <Zap className="h-4 w-4 shrink-0" />
        Start free {trade.short_name} prep
        <ArrowRight className="h-4 w-4 shrink-0" />
      </Button>
    </Link>
  );
}

export function TradeDetailView({ slug }: { slug: string }) {
  const trade = getTradeBySlug(slug);
  if (!trade) notFound();

  const detail = getTradeDetailContent(trade.id);
  const blocks = getBlocksForTrade(trade.id);
  const provincePanels = provinceDifferencePanels(trade);
  const faq = tradeFaq(trade, detail);
  const examHours = trade.exam_time_minutes / 60;
  const isLive = trade.status === "live";
  const tradeImage = getTradeImageSrc(trade.slug);

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
      icon: Video,
      title: "Video learning",
      body: `Watch curated trade videos mapped to each RSOS block, then answer check-in questions to lock it in.`,
      color: "text-[#7C3AED]",
      bg: "bg-[#F5F3FF]",
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
    <div className="app-mobile-content min-h-screen bg-white">
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

          <div
            className={`mt-8 grid items-center gap-10 ${tradeImage ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}
          >
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
              <h1 className="mt-5 font-[family-name:var(--font-barlow-condensed)] font-bold leading-[0.98] tracking-tight">
                <span className="block text-[38px] sm:text-[52px]">
                  {trade.name}
                </span>
                <span className="mt-1 block text-[22px] sm:text-[28px]">
                  Red Seal{" "}
                  <span className="underline decoration-white/45 decoration-2 underline-offset-4">
                    exam prep
                  </span>
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#FCE3E4] sm:text-lg">
                {isLive
                  ? `AI practice questions, RSOS block drills, and timed mock exams for the ${trade.code} exam.`
                  : `${trade.description} Full AI prep coming soon.`}
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

            {tradeImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                <Image
                  src={tradeImage}
                  alt={`${trade.name} on the job`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <span className="text-base leading-none">{trade.icon}</span>
                  {trade.name}
                </div>
              </div>
            )}
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
        {/* Coming soon — notify me (draft trades only) */}
        {!isLive && (
          <ComingSoonNotify
            tradeSlug={trade.slug}
            tradeCode={trade.code}
            tradeName={trade.name}
          />
        )}

        {/* Platform features */}
        <section>
          <div className="max-w-2xl">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
              Why RedSealGuide
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold tracking-tight sm:text-4xl">
              The smartest way to prep for your {trade.code} Red Seal exam
            </h2>
          </div>

          <TranslateFeatureShowcase
            tradeName={trade.name}
            tradeCode={trade.code}
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
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

        {/* Provincial guides */}
        {provincePanels.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#C0271E]" />
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold sm:text-2xl">
                {trade.name} by province
              </h2>
            </div>
            <p className="mt-2 text-sm text-[#64748B]">
              The {trade.code} Red Seal exam is national, but code adoption and
              the apprenticeship path differ by province. Select yours to see
              what&apos;s specific.
            </p>
            <ProvinceTabs provinces={provincePanels} tradeCode={trade.code} />
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
          <div className="mt-8 divide-y divide-[#E5E0D8] overflow-hidden rounded-2xl border border-[#E5E0D8]">
            {faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-[family-name:var(--font-barlow-semi)] text-base font-semibold text-[#1F2A37] transition hover:bg-[#FAF8F4] sm:p-6 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-[#64748B] sm:px-6 sm:pb-6">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
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
                Drill RSOS-aligned questions, run timed mock exams, and track
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
