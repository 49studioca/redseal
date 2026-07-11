import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookMarked,
  Building2,
  Car,
  Check,
  ClipboardCheck,
  Cog,
  Droplets,
  Flame,
  Gauge,
  GraduationCap,
  Hammer,
  HardHat,
  Languages,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Wind,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroGuideCard,
  HeroTradeChips,
  Sparkles as HeroSparkles,
  Zap as HeroZap,
  CircleCheck as HeroCircleCheck,
} from "@/components/marketing/hero-quiz";

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
            { href: "/pricing", label: "Pricing" },
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
    <section id="top" className="relative text-white">
      <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(1200px_640px_at_82%_-12%,#E23A30_0%,#D8232A_46%,#B81A20_100%)]">
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
      </div>

      <div className="relative">
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-4 pb-0 pt-12 sm:px-6 sm:pt-16 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-0 md:pt-16">
          <div>
            <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pl-2 pr-3.5 text-[11px] font-semibold leading-snug text-[#CFE0EE] sm:text-[12.5px]">
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F4A11A] px-2 py-0.5 text-[10px] font-extrabold text-[#1F2A37] sm:text-[11px]">
                <HeroSparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> AI-built
              </span>
              <span className="min-w-0">
                Unofficial Red Seal prep, rebuilt for 2026
              </span>
            </div>
            <h1 className="mt-5 text-balance font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-[0.96] tracking-tight sm:text-[52px] md:text-[64px]">
              Pass your Red Seal
              <br />
              the{" "}
              <span className="underline decoration-white/50 decoration-2 underline-offset-4 sm:decoration-[3px] sm:underline-offset-[6px]">
                first time.
              </span>
            </h1>
            <p className="mt-4 max-w-[440px] text-base leading-normal text-[#FCE3E4] sm:mt-[18px] sm:text-lg">
              Your Red Seal study guide — AI-built lessons, drills, and mock
              exams for every trade.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
              <Link href="/auth?signup">
                <Button
                  variant="white"
                  className="h-10 px-3.5 text-sm sm:h-[52px] sm:px-6 sm:text-base"
                >
                  <HeroZap className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sm:hidden">Start free</span>
                  <span className="hidden sm:inline">
                    Start free — no credit card needed
                  </span>
                </Button>
              </Link>
            </div>
            <div className="mt-[26px] flex flex-col gap-2.5 text-[13.5px] font-semibold text-[#FCE3E4]">
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
          <HeroGuideCard />
        </div>
        <HeroTradeChips />
      </div>
    </section>
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
      icon: HardHat,
      iconColor: "text-[#C0271E]",
    },
    {
      no: "02",
      title: "AI builds your plan",
      body: "Custom quizzes on your weak blocks.",
      icon: Sparkles,
      iconColor: "text-[#C0271E]",
    },
    {
      no: "03",
      title: "Drill, mock, pass",
      body: "Climb past 70% readiness.",
      icon: GraduationCap,
      iconColor: "text-[#059669]",
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
      <div className="mt-12 rounded-[20px] border border-[#ECE6DC] bg-[#F6F3EE] px-5 py-9 sm:px-8 sm:py-10">
        <ol className="relative grid select-none gap-9 md:grid-cols-3 md:gap-6">
          <div
            className="pointer-events-none absolute inset-x-[12%] top-9 hidden h-px bg-gradient-to-r from-transparent via-[#D8232A]/25 to-transparent md:block"
            aria-hidden
          />
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <li key={st.no} className="list-none">
                <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                  <div className="relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-2 border-white bg-white shadow-[0_2px_10px_rgba(31,42,55,0.07)] md:h-[72px] md:w-[72px]">
                    <span className="font-[family-name:var(--font-ibm-mono)] text-[10px] font-bold leading-none text-[#94A3B8]">
                      {st.no}
                    </span>
                    <Icon className={`h-5 w-5 ${st.iconColor}`} />
                  </div>
                  <div className="min-w-0 pt-0.5 md:pt-4">
                    <h3 className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#1F2A37] sm:text-xl">
                      {st.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-snug text-[#64748B] sm:text-[14.5px]">
                      {st.body}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
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
      title: "Word translation",
      body: (
        <>
          Click any word to <b>translate</b> lessons in your language.
        </>
      ),
      icon: Languages,
      bg: "bg-[#EFF6FF]",
      color: "text-[#2563EB]",
    },
  ];

  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-[30px] pt-[54px] sm:px-6">
      <div className="grid gap-[18px] md:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#E0392F] to-[#C2151B] p-5 text-white sm:p-8">
          <div className="absolute bottom-[-40px] right-[-30px] h-[200px] w-[200px] rounded-full bg-black/10" />
          <div className="relative flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wide text-[#FCE3E4] sm:text-[13px]">
            <Target className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Weak-spot
            targeting
          </div>
          <h3 className="relative mt-3.5 max-w-[440px] font-[family-name:var(--font-barlow-condensed)] text-[26px] font-bold leading-[1.02] sm:text-[30px] md:text-[34px]">
            Every wrong answer makes your next quiz smarter
          </h3>
          <p className="relative mt-3 max-w-[440px] text-sm leading-relaxed text-[#FCE3E4] sm:text-[15.5px]">
            We rebuild your modules around the blocks that trip you up — no
            wasted reps.
          </p>
          <div className="relative mt-4 flex flex-wrap gap-1.5 sm:mt-[22px] sm:gap-2.5">
            {[
              { label: "Adaptive difficulty", mobileLabel: "Adaptive" },
              { label: "Spaced repetition", mobileLabel: "Spaced rep" },
              { label: "Per-block analytics", mobileLabel: "Analytics" },
            ].map((tag) => (
              <span
                key={tag.label}
                className="rounded-[9px] border border-white/10 bg-white/[0.08] px-2 py-1.5 text-[11px] font-semibold sm:px-3 sm:py-2 sm:text-[13px]"
              >
                <span className="sm:hidden">{tag.mobileLabel}</span>
                <span className="hidden sm:inline">{tag.label}</span>
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
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-[72px]">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#D8232A] sm:text-[13px]">
            Supported trades
          </div>
          <h2 className="mt-2.5 font-[family-name:var(--font-barlow-condensed)] text-[32px] font-bold leading-none tracking-tight sm:text-[40px] md:text-[46px]">
            From wire to weld, we&apos;ve got your ticket
          </h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-[34px] sm:gap-3.5 md:grid-cols-4">
          {tradeCards.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.code}
                href="/auth?signup"
                className="flex items-center gap-2 rounded-[14px] border border-[#E5E0D8] bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[#C0271E] hover:shadow-[0_8px_20px_rgba(31,42,55,0.10)] sm:gap-3 sm:p-[18px]"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] sm:h-11 sm:w-11 ${t.bg} ${t.color}`}
                >
                  <Icon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
                </span>
                <span className="min-w-0">
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
        <div className="mt-6 flex justify-center sm:mt-8">
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

export function TestimonialSection() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-[78px]">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#E0392F] to-[#C2151B] px-5 py-8 text-white sm:px-11 sm:py-12">
        <div className="pointer-events-none absolute right-3 top-3 font-[family-name:var(--font-barlow-condensed)] text-[100px] font-bold leading-none text-white/[0.16] sm:right-[30px] sm:top-6 sm:text-[160px]">
          &rdquo;
        </div>
        <div className="relative max-w-[760px]">
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-white text-white sm:h-[18px] sm:w-[18px]"
              />
            ))}
          </div>
          <p className="mt-4 font-[family-name:var(--font-barlow-semi)] text-[22px] font-medium leading-snug tracking-tight sm:mt-[18px] sm:text-[26px] md:text-[30px]">
            &ldquo;Failed the electrician exam by 4 points. Six weeks on here,
            passed the retake with an{" "}
            <span className="font-bold underline decoration-white/50 underline-offset-[3px]">
              84
            </span>
            .&rdquo;
          </p>
          <div className="mt-5 flex items-center gap-3 sm:mt-6">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white/25 bg-[#1F2A37] font-[family-name:var(--font-barlow-semi)] text-sm font-bold sm:h-12 sm:w-12 sm:text-base">
              DK
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold sm:text-base">Dylan K.</div>
              <div className="text-xs leading-snug text-[#FCE3E4] sm:text-[13.5px]">
                Construction Electrician · Hamilton, ON
              </div>
            </div>
          </div>
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
        <Link href="/auth?signup" className="mt-[26px] inline-block">
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
                      key={l}
                      href="/#top"
                      className="text-sm hover:text-white"
                    >
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-6 py-4 text-[12.5px] leading-relaxed text-[#5F87A6] sm:flex-row sm:flex-wrap sm:justify-between sm:gap-3.5 sm:py-[18px]">
          <span>
            © 2026 redsealguide.com · Unofficial - not affiliated with the Red
            Seal Program or any provincial authority.
          </span>
          <span className="shrink-0">Made in Canada 🍁</span>
        </div>
      </div>
    </footer>
  );
}
