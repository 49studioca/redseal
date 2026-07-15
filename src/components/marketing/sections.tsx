import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Building2,
  Car,
  ClipboardCheck,
  Cog,
  Droplets,
  Flame,
  Gauge,
  Hammer,
  HardHat,
  Languages,
  Smartphone,
  Sparkles,
  Star,
  Video,
  Wind,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingMobileNav } from "@/components/marketing/mobile-nav";
import {
  HeroGuideCard,
  HeroTradeChips,
} from "@/components/marketing/hero-quiz";
import { AnimatedTranslateDemo } from "@/components/marketing/animated-translate-demo";
import { TestimonialRoll } from "@/components/marketing/testimonial-roll";
import { StoryAvatar } from "@/components/marketing/story-avatar";
import { APPRENTICE_STORIES } from "@/components/marketing/apprentice-stories";
import { getTradeBySlug, TRADES } from "@/data/seed";

const ACTIVE_TRADE_COUNT = TRADES.filter(
  (trade) => trade.status === "live",
).length;

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1ECE3] bg-white/[0.88] backdrop-blur-[10px]">
      <div className="mx-auto flex h-[60px] max-w-[1180px] items-center gap-2 px-4 sm:h-[70px] sm:gap-[26px] sm:px-6">
        <Link
          href="/#top"
          className="flex min-w-0 shrink items-center gap-2 sm:gap-[11px]"
        >
          <Image
            src="/redseal-logo.svg"
            alt="RedSeal seal mark"
            width={38}
            height={38}
            className="h-8 w-8 shrink-0 sm:h-[38px] sm:w-[38px]"
          />
          <div className="min-w-0 leading-none">
            <div className="truncate font-[family-name:var(--font-barlow-condensed)] text-[17px] font-bold uppercase tracking-wide sm:text-[21px]">
              <span className="text-[#D8232A]">RedSeal</span>{" "}
              <span className="text-[#1F2A37]">AI&nbsp;Prep</span>
            </div>
            <div className="mt-px hidden font-[family-name:var(--font-ibm-mono)] text-[10px] tracking-wide text-[#94A3B8] sm:block">
              redsealguide.com
            </div>
          </div>
        </Link>
        <nav className="ml-3.5 hidden items-center gap-1 md:flex">
          {[
            { href: "/#how", label: "How it works" },
            { href: "/trades", label: "Trades" },
            { href: "/#pricing", label: "Pricing" },
            { href: "/#faq", label: "FAQ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[14.5px] font-semibold text-[#475569] hover:bg-[#F3EFE8]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Link
          href="/auth?signin"
          className="hidden shrink-0 rounded-[9px] px-3.5 py-2 text-[14.5px] font-semibold text-[#1F2A37] hover:bg-[#F3EFE8] sm:inline-flex"
        >
          Log in
        </Link>
        <Link href="/auth?signup" className="shrink-0">
          <Button
            size="sm"
            className="h-9 px-3 text-xs sm:h-[42px] sm:px-[18px] sm:text-sm"
          >
            Start free
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(1400px_720px_at_78%_-18%,#E23A30_0%,#D8232A_42%,#9E1419_100%)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(180deg, #000, transparent 88%)",
          }}
        />
        <div className="pointer-events-none absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 pb-4 pt-14 sm:px-6 sm:pt-20 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:pb-6 md:pt-24">
          <div className="home-fade-up">
            <p className="font-[family-name:var(--font-barlow-condensed)] text-[22px] font-bold uppercase leading-none tracking-wide text-white sm:text-[26px]">
              Study the right blocks. Stop guessing.
            </p>
            <h1 className="mt-4 max-w-[560px] text-balance font-[family-name:var(--font-barlow-condensed)] text-[44px] font-bold leading-[0.94] tracking-tight sm:text-[58px] md:text-[68px]">
              Prepare for your Red Seal
              <br />
              <span className="underline decoration-white/45 decoration-2 underline-offset-4 sm:decoration-[3px] sm:underline-offset-[7px]">
                with a clear plan.
              </span>
            </h1>
            <p className="mt-5 max-w-[420px] text-base leading-relaxed text-[#FCE3E4] sm:mt-6 sm:text-lg">
              Pick your trade and province. Get an RSOS-aligned study path with
              lessons, targeted drills, and timed mock exams.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/auth?signup">
                <Button
                  variant="white"
                  className="h-11 px-5 text-sm sm:h-[52px] sm:px-6 sm:text-base"
                >
                  Build my free plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#pricing">
                <Button
                  variant="ghost"
                  className="h-11 border border-white/25 bg-white/10 px-5 text-sm text-white hover:bg-white/18 sm:h-[52px] sm:px-6 sm:text-base"
                >
                  See plans &amp; pricing
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-sm font-medium text-white/80">
              No credit card · About 2 minutes · Free starter access
            </p>
          </div>
          <div className="home-fade-up home-fade-up-delay">
            <HeroGuideCard />
          </div>
        </div>
        <HeroTradeChips />
      </div>
    </section>
  );
}

export function StatsBar() {
  const stats = [
    {
      value: String(ACTIVE_TRADE_COUNT),
      label: "Complete trade libraries live",
    },
    { value: "40k+", label: "Practice questions" },
    { value: "56", label: "RSOS trade outlines listed" },
    { value: "13", label: "Provinces & territories" },
  ];
  return (
    <section className="border-y border-[#E5E0D8] bg-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4 md:gap-4 md:py-12">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-none text-[#D8232A]">
              {s.value}
            </div>
            <div className="mt-1.5 text-[13.5px] font-semibold text-[#64748B]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      no: "01",
      title: (
        <>
          Bring your <em className="font-bold italic text-[#D8232A]">trade</em>.
          Or just pick one.
        </>
      ),
      body: `Choose from ${ACTIVE_TRADE_COUNT} complete trade libraries available today and set your province. You can also browse RSOS outlines for all 56 Red Seal trades.`,
      visual: (
        <div className="rounded-[18px] border border-[#E5E0D8] bg-white p-5 shadow-[0_12px_40px_rgba(31,42,55,0.06)]">
          <div className="font-[family-name:var(--font-ibm-mono)] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Step 01 · Trade
          </div>
          <div className="mt-4 space-y-2.5">
            {[
              { name: "Construction Electrician", code: "309A", hot: true },
              { name: "Plumber", code: "447A", hot: false },
              { name: "Welder", code: "276A", hot: false },
            ].map((t) => (
              <div
                key={t.code}
                className={`flex items-center justify-between rounded-[12px] border px-3.5 py-3 ${
                  t.hot
                    ? "border-[#D8232A]/35 bg-[#FCEBEC]"
                    : "border-[#E5E0D8] bg-[#FAF8F4]"
                }`}
              >
                <span className="font-[family-name:var(--font-barlow-semi)] text-sm font-semibold text-[#1F2A37]">
                  {t.name}
                </span>
                <span className="font-[family-name:var(--font-ibm-mono)] text-[11px] text-[#94A3B8]">
                  {t.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      no: "02",
      title: (
        <>
          We build it from the{" "}
          <em className="font-bold italic text-[#D8232A]">ground up</em>.
        </>
      ),
      body: "Your RSOS-aligned modules, weak-spot drills, and mock exams are organized around the blocks for your trade.",
      visual: (
        <div className="rounded-[18px] border border-[#E5E0D8] bg-white p-5 shadow-[0_12px_40px_rgba(31,42,55,0.06)]">
          <div className="font-[family-name:var(--font-ibm-mono)] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Step 02 · Building
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "RSOS blocks mapped", pct: 100 },
              { label: "Practice bank generated", pct: 86 },
              { label: "Mock exam scheduled", pct: 62 },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex justify-between text-[12.5px] font-semibold text-[#475569]">
                  <span>{row.label}</span>
                  <span className="text-[#D8232A]">{row.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E5E0D8]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D8232A] to-[#F4A11A] transition-all"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-[12px] bg-[#F6F3EE] px-3.5 py-3 text-[13px] leading-snug text-[#64748B]">
            &ldquo;Build a 6-week plan for Block A &amp; B — electrician,
            Ontario.&rdquo;
          </p>
        </div>
      ),
    },
    {
      no: "03",
      title: (
        <>
          And it ships as{" "}
          <em className="font-bold italic text-[#D8232A]">exam-ready</em> prep.
        </>
      ),
      body: "Lessons, flashcards, quizzes, timed mocks, and a readiness score. Open it tonight — study on site tomorrow.",
      visual: (
        <div className="rounded-[18px] border border-[#E5E0D8] bg-white p-5 shadow-[0_12px_40px_rgba(31,42,55,0.06)]">
          <div className="font-[family-name:var(--font-ibm-mono)] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Step 03 · Ready
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">
                Readiness score
              </div>
              <div className="mt-1 font-[family-name:var(--font-barlow-condensed)] text-[48px] font-bold leading-none text-[#059669]">
                73%
              </div>
            </div>
            <div className="rounded-full border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-1.5 text-[12px] font-bold text-[#059669]">
              Practice target met
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Lessons", "Drills", "Mocks"].map((m) => (
              <div
                key={m}
                className="rounded-[10px] border border-[#E5E0D8] bg-[#FAF8F4] py-3 text-center text-[12px] font-bold text-[#1F2A37]"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how" className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
            How it works
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-[0.98] tracking-tight sm:text-[52px]">
            From trade pick to{" "}
            <em className="font-bold italic text-[#D8232A]">exam day</em>
          </h2>
        </div>

        <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
          {steps.map((step, i) => (
            <div
              key={step.no}
              className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <div className="font-[family-name:var(--font-ibm-mono)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                  step {step.no}
                </div>
                <h3 className="mt-3 max-w-[440px] font-[family-name:var(--font-barlow-condensed)] text-[34px] font-bold leading-[1.02] tracking-tight text-[#1F2A37] sm:text-[42px]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[440px] text-[15.5px] leading-relaxed text-[#64748B] sm:text-base">
                  {step.body}
                </p>
              </div>
              <div className="home-float">{step.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LearningExperience() {
  const modes = [
    {
      title: "Lessons",
      body: "RSOS block lessons with Canadian code citations — never US standards.",
      icon: BookOpen,
    },
    {
      title: "Flashcards",
      body: "Quick reps for formulas, symbols, and code tables on break.",
      icon: BookMarked,
    },
    {
      title: "Video learning",
      body: "Watch curated training videos for each RSOS block, then prove you got it.",
      icon: Video,
    },
    {
      title: "Quizzes",
      body: "Adaptive drills that rebuild around the blocks you miss.",
      icon: Sparkles,
    },
    {
      title: "Mock exams",
      body: "100 questions, 4 hours, closed-book — exam-day pressure.",
      icon: ClipboardCheck,
    },
    {
      title: "Readiness",
      body: "One score that shows which blocks need another round of practice.",
      icon: Gauge,
    },
    {
      title: "Translate",
      body: "Tap any word for trade-aware translation in your language.",
      icon: Languages,
    },
  ];

  return (
    <section id="features" className="border-y border-[#E5E0D8] bg-[#F6F3EE]">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-[720px]">
          <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
            The experience
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-[0.98] tracking-tight sm:text-[52px]">
            A RedSeal plan is a{" "}
            <em className="font-bold italic text-[#D8232A]">complete</em> prep
            experience.
          </h2>
          <p className="mt-4 max-w-[540px] text-base leading-relaxed text-[#64748B]">
            Multiple ways to learn, real mocks to prove it, and tools that
            follow you from the bench to the break room.
          </p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-white text-[#C0271E] shadow-[0_2px_10px_rgba(31,42,55,0.05)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#1F2A37]">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#64748B]">
                    {m.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3 sm:mt-16">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569]">
            <Smartphone className="h-4 w-4 text-[#D8232A]" />
            Phone-first for on-site reps
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-[#CBD5E1] sm:inline-block" />
          <span className="text-sm font-semibold text-[#475569]">
            Canadian codes only · CEC · NPC · CSA
          </span>
        </div>

        <AnimatedTranslateDemo />
      </div>
    </section>
  );
}

export function TradesPreview() {
  const tradeCards = [
    {
      name: "Electrician",
      code: "309A",
      slug: "construction-electrician",
      icon: Zap,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      name: "Plumber",
      code: "447A",
      slug: "plumber",
      icon: Droplets,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      name: "Carpenter",
      code: "403A",
      slug: "carpenter",
      icon: Hammer,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      name: "Welder",
      code: "276A",
      slug: "welder",
      icon: Flame,
      bg: "bg-[#FEF2F2]",
      color: "text-[#DC2626]",
    },
    {
      name: "HVAC/R Tech",
      code: "313A",
      slug: "refrigeration-ac-mechanic",
      icon: Wind,
      bg: "bg-white",
      color: "text-[#1F2A37]",
    },
    {
      name: "Auto Service",
      code: "310S",
      slug: "automotive-service-technician",
      icon: Car,
      bg: "bg-[#F0FDF4]",
      color: "text-[#16A34A]",
    },
    {
      name: "Millwright",
      code: "433A",
      slug: "millwright",
      icon: Cog,
      bg: "bg-white",
      color: "text-[#1F2A37]",
    },
    {
      name: "Ironworker",
      code: "420G",
      slug: "ironworker-structural",
      icon: Building2,
      bg: "bg-white",
      color: "text-[#475569]",
    },
  ];

  return (
    <section id="trades" className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-[640px]">
          <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
            Supported trades
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-[0.98] tracking-tight sm:text-[52px]">
            Built for <em className="font-bold italic text-[#D8232A]">every</em>{" "}
            kind of trade.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#64748B]">
            From wire to weld — same RedSeal prep, shaped to your ticket.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-3.5 md:grid-cols-4">
          {[...tradeCards]
            .map((t) => ({
              ...t,
              isLive: getTradeBySlug(t.slug)?.status === "live",
            }))
            .sort((a, b) => Number(b.isLive) - Number(a.isLive))
            .map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.code}
                  href={`/trades/${t.slug}`}
                  className={`relative flex items-center gap-2 rounded-[14px] border bg-[#F6F3EE] p-3 transition-all hover:-translate-y-0.5 hover:border-[#C0271E] hover:bg-white hover:shadow-[0_8px_20px_rgba(31,42,55,0.08)] sm:gap-3 sm:p-[18px] ${
                    t.isLive
                      ? "border-transparent"
                      : "border-transparent opacity-90"
                  }`}
                >
                  {!t.isLive && (
                    <span className="absolute right-2 top-2 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#64748B] sm:right-2.5 sm:top-2.5 sm:text-[10px]">
                      Soon
                    </span>
                  )}
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] sm:h-11 sm:w-11 ${t.bg} ${t.color}`}
                  >
                    <Icon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
                  </span>
                  <span className="min-w-0 pr-8 sm:pr-10">
                    <span className="block truncate font-[family-name:var(--font-barlow-semi)] text-sm font-semibold text-[#1F2A37] sm:text-base">
                      {t.name}
                    </span>
                    <span className="mt-px block font-[family-name:var(--font-ibm-mono)] text-[10px] text-[#94A3B8] sm:text-[11px]">
                      {t.code}
                    </span>
                  </span>
                </Link>
              );
            })}
        </div>
        <div className="mt-8 flex justify-start sm:mt-10">
          <Link
            href="/trades"
            className="flex items-center gap-1.5 text-sm font-bold text-[#C0271E] sm:text-[15px]"
          >
            See all 56 trades
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TestimonialSection({
  tradeSlug,
  tradeName,
}: {
  tradeSlug?: string;
  tradeName?: string;
} = {}) {
  const preferred = tradeSlug
    ? APPRENTICE_STORIES.filter((story) => story.tradeSlug === tradeSlug)
    : [];
  const rest = APPRENTICE_STORIES.filter(
    (story) => story.tradeSlug !== tradeSlug,
  );
  const ordered = [...preferred, ...rest];
  const featured = ordered[0];

  return (
    <section className="bg-[#F6F3EE]">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
            Apprentice stories
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-[0.98] tracking-tight sm:text-[52px]">
            Built with real exam{" "}
            <em className="font-bold italic text-[#D8232A]">pressure</em> in
            mind
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#64748B]">
            {tradeName
              ? `How tradespeople prep for ${tradeName} — and tickets like it.`
              : "How Canadian apprentices use RedSeal Guide before booking their ticket."}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="relative overflow-hidden rounded-[24px] bg-[#1F2A37] px-6 py-10 text-white sm:px-10 sm:py-12 lg:min-h-[368px]">
            <div className="pointer-events-none absolute -right-6 top-4 font-[family-name:var(--font-barlow-condensed)] text-[140px] font-bold leading-none text-white/[0.06] sm:right-8 sm:top-2 sm:text-[180px]">
              &rdquo;
            </div>
            <div className="relative flex h-full flex-col justify-center">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#F4A11A] text-[#F4A11A] sm:h-[18px] sm:w-[18px]"
                  />
                ))}
              </div>
              <p className="mt-5 font-[family-name:var(--font-barlow-semi)] text-[24px] font-medium leading-snug tracking-tight sm:text-[30px] md:text-[32px]">
                &ldquo;
                {featured.highlight
                  ? featured.quote
                      .split(featured.highlight)
                      .map((part, i, arr) =>
                        i < arr.length - 1 ? (
                          <span key={i}>
                            {part}
                            <em className="font-bold italic text-white underline decoration-[#F4A11A]/70 underline-offset-[4px]">
                              {featured.highlight}
                            </em>
                          </span>
                        ) : (
                          <span key={i}>{part}</span>
                        ),
                      )
                  : featured.quote}
                &rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <StoryAvatar
                  story={featured}
                  size="lg"
                  className="ring-[#D8232A]/40"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold sm:text-base">
                    {featured.name}
                  </div>
                  <div className="text-xs leading-snug text-[#9FBBD2] sm:text-[13.5px]">
                    {featured.role} · {featured.place}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TestimonialRoll stories={ordered} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8] sm:mt-8">
          <span>Made in Canada</span>
          <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
          <span>Canadian codes</span>
          <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
          <span>Cancel anytime</span>
          <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
          <span>24h refund window</span>
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(1000px_520px_at_50%_115%,#E0392F_0%,#D8232A_45%,#B81A20_100%)] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1.5px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(720px 380px at 50% 30%, #000, transparent)",
        }}
      />
      <div className="relative mx-auto max-w-[760px] px-6 py-20 text-center sm:py-24">
        <div className="mx-auto grid h-[56px] w-[56px] place-items-center rounded-[14px] bg-white text-[#D8232A] shadow-[0_10px_26px_rgba(0,0,0,0.20)]">
          <HardHat className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-balance font-[family-name:var(--font-barlow-condensed)] text-[44px] font-bold leading-none tracking-tight sm:text-[56px]">
          Your turn to{" "}
          <em className="font-bold italic underline decoration-white/40 decoration-2 underline-offset-4">
            pass
          </em>
          .
        </h2>
        <p className="mt-4 text-lg text-[#FCE3E4]">
          Start with the first Block A lesson, 5 mock questions, 5 flashcards,
          and 5 translations. No credit card required.
        </p>
        <Link href="/auth?signup" className="mt-8 inline-block">
          <Button
            variant="white"
            className="h-14 rounded-[13px] px-[30px] text-[17.5px] font-extrabold shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
          >
            Build my free plan
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function MarketingFooter() {
  const footCols = [
    {
      head: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "Trades", href: "/trades" },
        { label: "Pricing", href: "/pricing" },
        { label: "Mock exams", href: "/#features" },
        { label: "How it works", href: "/#how" },
      ],
    },
    {
      head: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      head: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Refunds", href: "/refunds" },
      ],
    },
  ];

  return (
    <footer className="bg-[#161E27] text-[#9FBBD2]">
      <div className="mx-auto max-w-[1180px] px-6 pb-6 pt-10 md:pb-[30px] md:pt-12">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-[30px]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/redseal-logo.svg"
                alt="RedSeal seal mark"
                width={34}
                height={34}
                className="shrink-0"
              />
              <div className="font-[family-name:var(--font-barlow-condensed)] text-[19px] font-bold uppercase tracking-wide text-white">
                RedSeal AI Prep
              </div>
            </div>
            <p className="mt-3.5 max-w-[320px] text-[13.5px] leading-relaxed">
              AI-powered Red Seal exam prep for Canadian tradespeople. Built by
              trades folks who were tired of dusty study binders.
            </p>
            <div className="mt-3.5 font-[family-name:var(--font-ibm-mono)] text-xs text-[#5F87A6]">
              redsealguide.com
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:contents">
            {footCols.map((col) => (
              <div key={col.head}>
                <div className="text-xs font-bold uppercase tracking-wider text-[#F4564E]">
                  {col.head}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {col.links.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="text-sm hover:text-white"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.07] pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-6 py-4 text-[12.5px] leading-relaxed text-[#5F87A6] sm:flex-row sm:flex-wrap sm:justify-between sm:gap-3.5 sm:py-[18px]">
          <span>
            © 2026 redsealguide.com · Unofficial - not affiliated with the Red
            Seal Program or any provincial authority.
          </span>
          <span className="shrink-0">Made in Canada 🍁</span>
        </div>
      </div>
      <MarketingMobileNav />
    </footer>
  );
}
