import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookMarked,
  Building2,
  Car,
  Check,
  ChevronRight,
  ClipboardCheck,
  Cog,
  Droplets,
  Flame,
  Gauge,
  GraduationCap,
  Hammer,
  HardHat,
  MousePointerClick,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Target,
  Wind,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroQuizProvider,
  HeroQuizCard,
  HeroTradeChips,
  Sparkles as HeroSparkles,
  Zap as HeroZap,
  PlayCircle as HeroPlayCircle,
  CircleCheck as HeroCircleCheck,
} from "@/components/marketing/hero-quiz";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1ECE3] bg-white/[0.88] backdrop-blur-[10px]">
      <div className="mx-auto flex h-[70px] max-w-[1180px] items-center gap-[26px] px-6">
        <Link href="/#top" className="flex items-center gap-[11px]">
          <Image
            src="/redseal-logo.svg"
            alt="RedSeal seal mark"
            width={38}
            height={38}
            className="shrink-0"
          />
          <div className="leading-none">
            <div className="whitespace-nowrap font-[family-name:var(--font-barlow-condensed)] text-[21px] font-bold uppercase tracking-wide">
              <span className="text-[#D8232A]">RedSeal</span>{" "}
              <span className="text-[#1F2A37]">AI&nbsp;Prep</span>
            </div>
            <div className="mt-px font-[family-name:var(--font-ibm-mono)] text-[10px] tracking-wide text-[#94A3B8]">
              tradesguide.ca
            </div>
          </div>
        </Link>
        <nav className="ml-3.5 hidden items-center gap-1 md:flex">
          {[
            { href: "/#how", label: "How it works" },
            { href: "/#trades", label: "Trades" },
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
          href="/auth/login"
          className="rounded-[9px] px-3.5 py-2 text-[14.5px] font-semibold text-[#1F2A37] hover:bg-[#F3EFE8]"
        >
          Log in
        </Link>
        <Link href="/auth/signup">
          <Button size="md">
            Start free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

export function HeroSection() {
  return (
    <HeroQuizProvider>
      <section
        id="top"
        className="relative overflow-hidden bg-[radial-gradient(1200px_640px_at_82%_-12%,#E23A30_0%,#D8232A_46%,#B81A20_100%)] text-white"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1.5px, transparent 0)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(180deg, #000, transparent 92%)",
          }}
        />
        <div className="pointer-events-none absolute bottom-[-120px] right-[-130px] h-[420px] w-[420px] rounded-full border-2 border-dashed border-white/20" />
        <div className="pointer-events-none absolute right-[-170px] top-[-110px] h-[340px] w-[340px] rounded-full bg-black/10" />

        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-6 pb-0 pt-16 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-0 md:pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pl-2 pr-3.5 text-[12.5px] font-semibold text-[#CFE0EE]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F4A11A] px-2 py-0.5 text-[11px] font-extrabold text-[#1F2A37]">
                <HeroSparkles className="h-3.5 w-3.5" /> AI-built
              </span>
              Unofficial Red Seal prep, rebuilt for 2026
            </div>
            <h1 className="mt-5 text-balance font-[family-name:var(--font-barlow-condensed)] text-[64px] font-bold leading-[0.96] tracking-tight">
              Pass your Red Seal
              <br />
              the{" "}
              <span className="underline decoration-white/50 decoration-[3px] underline-offset-[6px]">
                first time.
              </span>
            </h1>
            <p className="mt-[18px] max-w-[440px] text-lg leading-normal text-[#FCE3E4]">
              AI builds your study plan around{" "}
              <b className="text-white">your</b> weak spots. Pick a trade and
              go.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/auth/signup">
                <Button variant="white" size="lg">
                  <HeroZap className="h-5 w-5" /> Start free — no card
                </Button>
              </Link>
              <Link href="/#how">
                <Button
                  size="lg"
                  className="h-[52px] border-[1.5px] border-white/50 bg-transparent px-[22px] text-base font-bold text-white hover:bg-white/10"
                >
                  <HeroPlayCircle className="h-[18px] w-[18px]" /> See how it
                  works
                </Button>
              </Link>
            </div>
            <div className="mt-[26px] flex flex-wrap gap-[18px] text-[13.5px] font-semibold text-[#FCE3E4]">
              {[
                "All 56 Red Seal trades",
                "Every province & territory",
                "Maple-leaf code, not US",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <HeroCircleCheck className="h-4 w-4 text-white" /> {t}
                </span>
              ))}
            </div>
          </div>
          <HeroQuizCard />
        </div>
        <HeroTradeChips />
      </section>
    </HeroQuizProvider>
  );
}

export function StatsBar() {
  const stats = [
    { value: "56", label: "Red Seal trades covered" },
    { value: "40k+", label: "Practice questions" },
    { value: "13", label: "Provinces & territories" },
    { value: "92%", label: "First-try pass rate*" },
  ];
  return (
    <section className="bg-[#C2151B]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-[18px] px-6 py-[26px] md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-[family-name:var(--font-barlow-condensed)] text-[38px] font-bold leading-none text-white">
              {s.value}
            </div>
            <div className="mt-0.5 text-[13px] font-semibold text-[#FCE3E4]">
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
      title: "Pick your trade",
      body: "All 56 Red Seal trades.",
      icon: MousePointerClick,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      no: "02",
      title: "AI builds your plan",
      body: "Custom quizzes on your weak blocks.",
      icon: Sparkles,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      no: "03",
      title: "Drill, mock, pass",
      body: "Climb past 70% readiness.",
      icon: GraduationCap,
      bg: "bg-[#ECFDF5]",
      color: "text-[#059669]",
    },
  ];
  return (
    <section
      id="how"
      className="mx-auto max-w-[1180px] px-6 pb-[30px] pt-[84px]"
    >
      <div className="mx-auto max-w-[640px] text-center">
        <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
          How it works
        </div>
        <h2 className="mt-2.5 font-[family-name:var(--font-barlow-condensed)] text-[46px] font-bold leading-none tracking-tight">
          Three steps to exam-ready
        </h2>
      </div>
      <div className="mt-12 flex flex-wrap items-stretch justify-center gap-1.5">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={st.no}
              className="flex min-w-[210px] flex-1 items-center gap-1.5"
            >
              <div className="relative flex-1 rounded-2xl border border-[#E5E0D8] bg-white px-[22px] py-[26px] text-center">
                <div className="absolute right-4 top-3.5 font-[family-name:var(--font-barlow-condensed)] text-[34px] font-bold leading-none text-[#F1ECE3]">
                  {st.no}
                </div>
                <div
                  className={`mx-auto grid h-16 w-16 place-items-center rounded-[18px] ${st.bg} ${st.color}`}
                >
                  <Icon className="h-[30px] w-[30px]" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-barlow-semi)] text-xl font-semibold">
                  {st.title}
                </h3>
                <p className="mt-1 text-[14.5px] leading-snug text-[#64748B]">
                  {st.body}
                </p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="hidden h-[22px] w-[22px] shrink-0 text-[#CBD5E1] lg:block" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FeatureHighlight() {
  const miniFeatures = [
    {
      title: "Real mock exams",
      body: "100 questions, 4 hours, closed-book — just like exam day.",
      icon: ClipboardCheck,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      title: "Canadian code, always",
      body: "Cites the current CE & plumbing codes — never the US ones.",
      icon: BookMarked,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
  ];

  const rowFeatures = [
    {
      title: "Readiness score",
      body: "One number: are you ready to book?",
      icon: Gauge,
      bg: "bg-[#F6F3EE]",
      color: "text-[#1F2A37]",
    },
    {
      title: "Study on site",
      body: "Phone-first, five-minute reps.",
      icon: Smartphone,
      bg: "bg-[#F6F3EE]",
      color: "text-[#1F2A37]",
    },
    {
      title: "Streaks",
      body: "Nudges, no gamified nonsense.",
      icon: Flame,
      bg: "bg-[#FEF2F2]",
      color: "text-[#DC2626]",
    },
  ];

  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-[30px] pt-[54px]">
      <div className="grid gap-[18px] md:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#E0392F] to-[#C2151B] p-8 text-white">
          <div className="absolute bottom-[-40px] right-[-30px] h-[200px] w-[200px] rounded-full bg-black/10" />
          <div className="relative flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-wide text-[#FCE3E4]">
            <Target className="h-[18px] w-[18px]" /> Weak-spot targeting
          </div>
          <h3 className="relative mt-3.5 max-w-[440px] font-[family-name:var(--font-barlow-condensed)] text-[34px] font-bold leading-[1.02]">
            Every wrong answer makes your next quiz smarter
          </h3>
          <p className="relative mt-3 max-w-[440px] text-[15.5px] leading-relaxed text-[#FCE3E4]">
            We rebuild your modules around the blocks that trip you up — no
            wasted reps.
          </p>
          <div className="relative mt-[22px] flex flex-wrap gap-2.5">
            {[
              "Adaptive difficulty",
              "Spaced repetition",
              "Per-block analytics",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-[9px] border border-white/10 bg-white/[0.08] px-3 py-2 text-[13px] font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[18px]">
          {miniFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex flex-1 items-start gap-[15px] rounded-2xl border border-[#E5E0D8] bg-white p-[22px]"
              >
                <div
                  className={`grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl ${f.bg} ${f.color}`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-barlow-semi)] text-[18.5px] font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-[14.5px] leading-normal text-[#64748B]">
                    {f.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-[18px] grid gap-[18px] md:grid-cols-3">
        {rowFeatures.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="flex items-start gap-3.5 rounded-2xl border border-[#E5E0D8] bg-white p-[22px]"
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-[11px] ${f.bg} ${f.color}`}
              >
                <Icon className="h-[21px] w-[21px]" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm leading-normal text-[#64748B]">
                  {f.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TradesPreview() {
  const tradeCards = [
    {
      name: "Electrician",
      code: "309A",
      icon: Zap,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      name: "Plumber",
      code: "306A",
      icon: Droplets,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      name: "Carpenter",
      code: "403A",
      icon: Hammer,
      bg: "bg-[#FCEBEC]",
      color: "text-[#C0271E]",
    },
    {
      name: "Welder",
      code: "456A",
      icon: Flame,
      bg: "bg-[#FEF2F2]",
      color: "text-[#DC2626]",
    },
    {
      name: "HVAC/R Tech",
      code: "313A",
      icon: Wind,
      bg: "bg-[#F6F3EE]",
      color: "text-[#1F2A37]",
    },
    {
      name: "Auto Service",
      code: "310S",
      icon: Car,
      bg: "bg-[#F0FDF4]",
      color: "text-[#16A34A]",
    },
    {
      name: "Millwright",
      code: "433A",
      icon: Cog,
      bg: "bg-[#F6F3EE]",
      color: "text-[#1F2A37]",
    },
    {
      name: "Ironworker",
      code: "420A",
      icon: Building2,
      bg: "bg-[#F3EFE8]",
      color: "text-[#475569]",
    },
  ];

  return (
    <section
      id="trades"
      className="mt-10 border-y border-[#E5E0D8] bg-[#F6F3EE]"
    >
      <div className="mx-auto max-w-[1180px] px-6 py-[72px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
              Supported trades
            </div>
            <h2 className="mt-2.5 font-[family-name:var(--font-barlow-condensed)] text-[46px] font-bold leading-none tracking-tight">
              From wire to weld, we&apos;ve got your ticket
            </h2>
          </div>
          <Link
            href="/trades"
            className="flex items-center gap-1.5 text-[15px] font-bold text-[#C0271E]"
          >
            See all 56 trades
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-[34px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {tradeCards.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.code}
                href="/auth/signup"
                className="flex items-center gap-3 rounded-[14px] border border-[#E5E0D8] bg-white p-[18px] transition-all hover:-translate-y-0.5 hover:border-[#C0271E] hover:shadow-[0_8px_20px_rgba(31,42,55,0.10)]"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-[11px] ${t.bg} ${t.color}`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <span>
                  <span className="block font-[family-name:var(--font-barlow-semi)] text-base font-semibold text-[#1F2A37]">
                    {t.name}
                  </span>
                  <span className="mt-px block font-[family-name:var(--font-ibm-mono)] text-[11px] text-[#94A3B8]">
                    {t.code}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TestimonialSection() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-[78px]">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#E0392F] to-[#C2151B] px-11 py-12 text-white">
        <div className="pointer-events-none absolute right-[30px] top-6 font-[family-name:var(--font-barlow-condensed)] text-[160px] font-bold leading-none text-white/[0.16]">
          &rdquo;
        </div>
        <div className="relative max-w-[760px]">
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className="h-[18px] w-[18px] fill-white text-white"
              />
            ))}
          </div>
          <p className="mt-[18px] font-[family-name:var(--font-barlow-semi)] text-[30px] font-medium leading-snug tracking-tight">
            &ldquo;Failed the electrician exam by 4 points. Six weeks on here,
            passed the retake with an{" "}
            <span className="font-bold underline decoration-white/50 underline-offset-[3px]">
              84
            </span>
            .&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-white/25 bg-[#1F2A37] font-[family-name:var(--font-barlow-semi)] text-base font-bold">
              DK
            </div>
            <div>
              <div className="text-base font-bold">Dylan K.</div>
              <div className="text-[13.5px] text-[#FCE3E4]">
                Construction Electrician · Hamilton, ON
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  const sharedFeatures = [
    "All 56 Red Seal trades",
    "Unlimited AI quizzes",
    "Unlimited mock exams",
    "Weak-spot targeting",
    "Code-referenced answers",
    "Cancel anytime",
  ];

  const plans = [
    {
      name: "Weekly",
      accent: "text-[#C0271E]",
      price: "$9.99",
      per: "first week",
      sub: "then $19.99 / week",
      cta: "Start for $9.99",
      popular: false,
      dark: false,
    },
    {
      name: "Monthly",
      accent: "text-white",
      price: "$7.99",
      per: "first week",
      sub: "then $59.99 / month",
      cta: "Start for $7.99",
      popular: true,
      dark: true,
    },
    {
      name: "Quarterly",
      accent: "text-[#C0271E]",
      price: "$5.99",
      per: "first week",
      sub: "then $99.99 / quarter",
      cta: "Start for $5.99",
      popular: false,
      dark: false,
    },
  ];

  return (
    <section id="pricing" className="border-y border-[#E5E0D8] bg-[#F6F3EE]">
      <div className="mx-auto max-w-[1180px] px-6 py-[78px]">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
            Pricing
          </div>
          <h2 className="mt-2.5 font-[family-name:var(--font-barlow-condensed)] text-[46px] font-bold leading-none tracking-tight">
            Cheaper than rewriting the exam
          </h2>
          <p className="mt-3 text-[17px] text-[#64748B]">
            A re-test costs hundreds and weeks of your time. Try any plan for
            your first week, then keep going — or cancel.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FCEBEC] px-[15px] py-[7px] text-[13.5px] font-bold text-[#B6291F]">
            <Tag className="h-[15px] w-[15px]" />
            Every plan: discounted first week · cancel anytime
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-[18px] md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[18px] p-7 ${
                plan.dark
                  ? "border-[1.5px] border-white/40 bg-gradient-to-br from-[#E0392F] to-[#C2151B] text-white shadow-[0_18px_40px_rgba(216,35,42,0.32)]"
                  : "border border-[#E5E0D8] bg-white text-[#1F2A37] shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4 rounded-[7px] bg-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#D8232A]">
                  Most popular
                </div>
              )}
              <div
                className={`font-[family-name:var(--font-barlow-semi)] text-sm font-bold uppercase tracking-wide ${plan.accent}`}
              >
                {plan.name}
              </div>
              <div className="mt-3.5 flex items-baseline gap-1">
                <span
                  className={`font-[family-name:var(--font-barlow-condensed)] text-[50px] font-bold leading-[0.9] ${plan.dark ? "text-white" : "text-[#1F2A37]"}`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-[15px] font-semibold ${plan.dark ? "text-[#FCE3E4]" : "text-[#94A3B8]"}`}
                >
                  {plan.per}
                </span>
              </div>
              <div
                className={`mt-1.5 text-[13.5px] ${plan.dark ? "text-[#FCE3E4]" : "text-[#94A3B8]"}`}
              >
                {plan.sub}
              </div>
              <Link href="/auth/signup" className="mt-5 block">
                <Button
                  variant={plan.dark ? "white" : "dark"}
                  className="h-[46px] w-full rounded-[11px] text-[15px] font-extrabold"
                >
                  {plan.cta}
                </Button>
              </Link>
              <div
                className={`my-5 h-px ${plan.dark ? "bg-white/10" : "bg-[#ECE6DC]"}`}
              />
              <div className="flex flex-col gap-[11px]">
                {sharedFeatures.map((f) => (
                  <div
                    key={f}
                    className={`flex items-start gap-2 text-sm ${plan.dark ? "text-[#FCE3E4]" : "text-[#334155]"}`}
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${plan.dark ? "text-white" : "text-[#059669]"}`}
                    />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(1000px_520px_at_50%_115%,#E0392F_0%,#D8232A_45%,#B81A20_100%)] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1.5px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(720px 380px at 50% 30%, #000, transparent)",
        }}
      />
      <div className="relative mx-auto max-w-[760px] px-6 py-20 text-center">
        <div className="mx-auto grid h-[60px] w-[60px] place-items-center rounded-[15px] bg-white text-[#D8232A] shadow-[0_10px_26px_rgba(0,0,0,0.20)]">
          <HardHat className="h-[30px] w-[30px]" />
        </div>
        <h2 className="mt-[22px] text-balance font-[family-name:var(--font-barlow-condensed)] text-[52px] font-bold leading-none tracking-tight">
          Your ticket is waiting.
          <br />
          Go earn it.
        </h2>
        <p className="mt-3.5 text-lg text-[#FCE3E4]">
          Start free today — build your first AI quiz in under two minutes.
        </p>
        <Link href="/auth/signup" className="mt-[26px] inline-block">
          <Button
            variant="white"
            className="h-14 rounded-[13px] px-[30px] text-[17.5px] font-extrabold shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
          >
            <Zap className="h-[22px] w-[22px]" /> Start free
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
      links: ["Features", "Trades", "Pricing", "Mock exams", "Mobile app"],
    },
    {
      head: "Company",
      links: ["About", "Blog", "Careers", "Contact"],
    },
    {
      head: "Legal",
      links: ["Privacy", "Terms", "Disclaimer", "Refunds"],
    },
  ];

  return (
    <footer className="bg-[#161E27] text-[#9FBBD2]">
      <div className="mx-auto grid max-w-[1180px] gap-[30px] px-6 pb-[30px] pt-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
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
            tradesguide.ca
          </div>
        </div>
        {footCols.map((col) => (
          <div key={col.head}>
            <div className="text-xs font-bold uppercase tracking-wider text-[#F4564E]">
              {col.head}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {col.links.map((l) => (
                <Link key={l} href="/#top" className="text-sm hover:text-white">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-3.5 px-6 py-[18px] text-[12.5px] text-[#5F87A6]">
          <span>
            © 2026 tradesguide.ca · Unofficial — not affiliated with the Red
            Seal Program or any provincial authority.
          </span>
          <span>Made in Canada 🍁</span>
        </div>
      </div>
    </footer>
  );
}
