import type { ReactNode } from "react";
import {
  MarketingHeader,
  MarketingFooter,
  CtaBand,
} from "@/components/marketing/sections";

export function MarketingContentPage({
  kicker,
  title,
  intro,
  updated,
  children,
  showCta = true,
}: {
  kicker?: string;
  title: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
  showCta?: boolean;
}) {
  return (
    <div className="app-mobile-content min-h-screen bg-white">
      <MarketingHeader />
      <section className="border-b border-[#F1ECE3] bg-gradient-to-b from-[#FBF8F2] to-white">
        <div className="mx-auto max-w-[820px] px-6 pb-10 pt-12 md:pb-14 md:pt-16">
          {kicker ? (
            <div className="text-xs font-bold uppercase tracking-wider text-[#F4564E]">
              {kicker}
            </div>
          ) : null}
          <h1 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-[38px] font-extrabold leading-[1.05] tracking-tight text-[#1F2A37] md:text-[52px]">
            {title}
          </h1>
          {intro ? (
            <p className="mt-4 max-w-[620px] text-[16.5px] leading-relaxed text-[#4A5A6A]">
              {intro}
            </p>
          ) : null}
          {updated ? (
            <div className="mt-5 font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
              Last updated {updated}
            </div>
          ) : null}
        </div>
      </section>
      <article className="mx-auto max-w-[820px] px-6 py-12 md:py-16">
        <div className="marketing-prose space-y-6 text-[15.5px] leading-relaxed text-[#3B4A59]">
          {children}
        </div>
      </article>
      {showCta ? <CtaBand /> : null}
      <MarketingFooter />
    </div>
  );
}

export function ContentSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[24px] font-bold tracking-tight text-[#1F2A37] md:text-[27px]">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
