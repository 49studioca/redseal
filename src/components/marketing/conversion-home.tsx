import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  Play,
  Star,
  Target,
  Wrench,
  Zap,
  Droplets,
  Flame,
  Hammer,
  Cog,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getTradeBySlug } from "@/data/seed";
import { cn } from "@/lib/utils";
import { InteractiveToolkit } from "@/components/marketing/interactive-toolkit";

function StudyPlanHook() {
  return (
    <div
      className="conversion-card-glow relative mx-auto w-full max-w-[510px]"
      aria-label="Example of a personalized daily study recommendation"
    >
      <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(31,42,55,0.16)]">
        <div className="flex items-center justify-between border-b border-[#E8E2D9] bg-[#FBF9F5] px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#D8232A] text-white">
              <Wrench className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Your score plan
              </p>
              <p className="text-sm font-bold text-[#1F2A37]">
                Construction Electrician
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#FCEBEC] px-2.5 py-1 text-[11px] font-bold text-[#B6291F]">
            Example plan
          </span>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#FCEBEC] text-[#D8232A]">
              <Target className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#D8232A]">
                Biggest score opportunity
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-[-0.025em] text-[#1F2A37] sm:text-[30px]">
                Motor controls
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Block B · Current accuracy 58%
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#64748B]">
              <span>Your accuracy</span>
              <span>Exam target 70%</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-[#EEE9E1]">
              <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-[#D8232A] to-[#F4564E]" />
              <span className="absolute bottom-0 left-[70%] top-0 w-0.5 bg-[#1F2A37]" />
            </div>
          </div>

          <div className="mt-6 rounded-[16px] border border-[#E5E0D8] bg-[#FAF8F4] p-4 sm:p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
              Today’s 15-minute plan
            </p>
            <div className="mt-4 space-y-3">
              {[
                {
                  icon: Play,
                  label: "Learn",
                  detail: "Motor starter circuits · 6 min",
                },
                {
                  icon: Target,
                  label: "Drill",
                  detail: "8 weak-spot questions",
                },
                {
                  icon: ClipboardCheck,
                  label: "Review",
                  detail: "4 missed concepts",
                },
              ].map(({ icon: Icon, label, detail }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white text-[#D8232A] shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="min-w-0 text-sm text-[#64748B]">
                    <span className="font-extrabold text-[#1F2A37]">
                      {label}
                    </span>
                    <span className="mx-1.5 text-[#C8C0B6]">·</span>
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#E8E2D9] bg-[#1F2A37] px-5 py-3.5 text-sm font-bold text-white sm:px-7">
          <Check className="h-4 w-4 text-[#5EE2A0]" strokeWidth={3} />
          No more wondering what to study next.
        </div>
      </div>
    </div>
  );
}

export function ConversionHero() {
  return (
    <section
      id="top"
      className="conversion-hero-grid relative overflow-hidden bg-[#FBF9F5]"
    >
      <div className="pointer-events-none absolute -right-36 -top-44 h-[520px] w-[520px] rounded-full bg-[#FCEBEC] blur-3xl" />
      <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:pb-24 lg:pt-24">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F2C7C4] bg-white px-3 py-1.5 text-xs font-bold text-[#B6291F] shadow-sm">
            <MapPin className="h-3.5 w-3.5" />
            Built for Canada’s Red Seal exam
          </div>
          <h1 className="mt-5 max-w-[620px] text-[38px] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#1F2A37] sm:text-[58px] lg:text-[66px]">
            <span className="block">Know what to study.</span>
            <span className="block text-[#D8232A]">Be ready to pass.</span>
          </h1>
          <p className="mt-5 max-w-[560px] text-[17px] leading-relaxed text-[#5B6877] sm:text-lg">
            A personalized study plan with lessons, smart drills, and realistic
            mock exams for your trade and province.
          </p>
          <div className="mt-7">
            <Link
              href="/auth?signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-[54px] rounded-[12px] px-7 text-base shadow-[0_10px_24px_rgba(216,35,42,0.22)]",
              )}
            >
              Build my free study plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#64748B] sm:text-sm">
            {["No credit card", "2-minute setup", "Free starter access"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check
                    className="h-3.5 w-3.5 text-[#059669]"
                    strokeWidth={3}
                  />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="min-w-0">
          <StudyPlanHook />
        </div>
      </div>
    </section>
  );
}

const TRUST_ITEMS = [
  {
    icon: BookOpen,
    value: "5",
    title: "complete learning paths",
    detail: "Lessons ordered by RSOS",
  },
  {
    icon: Target,
    value: "40k+",
    title: "practice questions",
    detail: "Targeted to your weak areas",
  },
  { icon: ClipboardCheck, value: "+100", title: "mock exams", detail: "" },
  { icon: Play, value: "+250", title: "videos", detail: "" },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Platform benefits"
      className="border-y border-[#E5E0D8] bg-white"
    >
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 px-4 py-5 sm:px-6 lg:grid-cols-4 lg:py-6">
        {TRUST_ITEMS.map(({ icon: Icon, value, title, detail }, index) => (
          <div
            key={title}
            className={cn(
              "flex items-center gap-3 px-2 py-3 sm:px-4",
              index > 0 && "lg:border-l lg:border-[#E5E0D8]",
            )}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#FCEBEC] text-[#D8232A]">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="text-base font-extrabold leading-none text-[#D8232A] sm:text-lg">
                {value}
              </p>
              <p className="mt-1 text-xs font-extrabold text-[#1F2A37] sm:text-[13px]">
                {title}
              </p>
              {detail ? (
                <p className="mt-0.5 text-[10px] text-[#7B8794] sm:text-[11px]">
                  {detail}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Wrench,
    number: "01",
    title: "Choose your trade",
    body: "Tell us what ticket you’re working toward.",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Set your province",
    body: "We surface the codes and notes that apply.",
  },
  {
    icon: Target,
    number: "03",
    title: "Follow your plan",
    body: "Learn, practise, and watch your readiness rise.",
  },
];

export function CompactHowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[650px] text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D8232A]">
            Ready in two minutes
          </p>
          <h2 className="mt-3 text-balance text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#1F2A37] sm:text-[46px]">
            Your next study session, already planned.
          </h2>
        </div>
        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, number, title, body }, index) => (
            <div
              key={title}
              className="group relative rounded-[20px] border border-[#E5E0D8] bg-[#FBF9F5] p-6 transition-all hover:-translate-y-1 hover:border-[#E9B4B1] hover:bg-white hover:shadow-[0_16px_36px_rgba(31,42,55,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#FCEBEC] text-[#D8232A]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-bold text-[#B0B8C1]">
                  {number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-extrabold text-[#1F2A37]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                {body}
              </p>
              {index < STEPS.length - 1 && (
                <ChevronRight className="absolute -right-[18px] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-[#D0C8BE] md:block" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/auth?signup"
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#C0271E] hover:gap-2.5"
          >
            Build my free plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FeatureBento() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-y border-[#E5E0D8] bg-[#F6F3EE]"
    >
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-[720px]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D8232A]">
            One connected toolkit
          </p>
          <h2 className="mt-3 text-balance text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#1F2A37] sm:text-[46px]">
            Less guessing. More progress you can see.
          </h2>
        </div>
        <InteractiveToolkit />
      </div>
    </section>
  );
}

const POPULAR_TRADES = [
  { name: "Electrician", slug: "construction-electrician", icon: Zap },
  { name: "Plumber", slug: "plumber", icon: Droplets },
  { name: "Welder", slug: "welder", icon: Flame },
  { name: "Carpenter", slug: "carpenter", icon: Hammer },
  { name: "Industrial Electrician", slug: "industrial-electrician", icon: Cog },
];

export function CompactTrades() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D8232A]">
              Find your trade
            </p>
            <h2 className="mt-2 text-[30px] font-extrabold tracking-[-0.03em] text-[#1F2A37] sm:text-[38px]">
              Prep built around your ticket.
            </h2>
          </div>
          <Link
            href="/trades"
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#C0271E]"
          >
            Explore all 56 trades <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {POPULAR_TRADES.map(({ name, slug, icon: Icon }) => {
            const live = getTradeBySlug(slug)?.status === "live";
            return (
              <Link
                key={slug}
                href={`/trades/${slug}`}
                className="group relative flex min-h-28 flex-col justify-between rounded-[18px] border border-[#E5E0D8] bg-[#FBF9F5] p-4 hover:border-[#D8232A]/40 hover:bg-white hover:shadow-md"
              >
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#D8232A] shadow-sm">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#1F2A37]">
                    {name}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-[#8A96A3]">
                    {live ? "Study now" : "Outline available"}
                  </p>
                </div>
                <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-[#C8C0B6] transition-transform group-hover:translate-x-1 group-hover:text-[#D8232A]" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  {
    quote:
      "I stopped guessing which blocks to study. The weak-spot drills showed me exactly where my score was dropping.",
    name: "Amir S.",
    role: "Plumber · BC",
  },
  {
    quote:
      "Failed by four points. Six weeks on here, then passed the retake with an 84.",
    name: "Dylan K.",
    role: "Electrician · ON",
  },
  {
    quote:
      "Tapping a word mid-lesson kept me studying instead of leaving to search every welding term.",
    name: "Priya M.",
    role: "Welder · AB",
  },
];

export function CompactProof() {
  return (
    <section className="border-y border-[#E5E0D8] bg-[#F6F3EE]">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[620px] text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D8232A]">
            Built for real exam pressure
          </p>
          <h2 className="mt-3 text-[32px] font-extrabold tracking-[-0.035em] text-[#1F2A37] sm:text-[42px]">
            Study with a clearer next step.
          </h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className="rounded-[20px] border border-[#E5E0D8] bg-white p-6"
            >
              <div className="flex gap-0.5 text-[#F4A11A]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] font-semibold leading-relaxed text-[#334155]">
                “{review.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-[#EEE9E1] pt-4">
                <p className="text-sm font-extrabold text-[#1F2A37]">
                  {review.name}
                </p>
                <p className="mt-0.5 text-xs text-[#7B8794]">{review.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CompactFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#C91F26] text-white">
      <div className="conversion-cta-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-7 px-6 py-14 text-center sm:py-16 lg:flex-row lg:text-left">
        <div>
          <p className="text-sm font-bold text-white/75">
            Your first lesson is ready when you are.
          </p>
          <h2 className="mt-2 text-balance text-[34px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[42px]">
            Start building exam confidence today.
          </h2>
        </div>
        <div className="shrink-0">
          <Link
            href="/auth?signup"
            className={cn(
              buttonVariants({ variant: "white", size: "lg" }),
              "h-[54px] rounded-[12px] px-7 text-base shadow-xl",
            )}
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2.5 text-center text-xs font-semibold text-white/70">
            No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
