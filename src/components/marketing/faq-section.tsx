"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_DATA: { q: string; a: ReactNode }[] = [
  {
    q: "Is this an official Red Seal tool?",
    a: "No — it's an independent study aid from RedSealGuide, not affiliated with the Red Seal Program or any provincial authority.",
  },
  {
    q: "Does it cover my province?",
    a: "The platform supports all 13 provinces and territories. Province-specific code amendments are flagged when they apply.",
  },
  {
    q: "What can I try for free?",
    a: "Free starter access includes the first Block A lesson, 5 mock-exam questions, 5 flashcards, and 5 translations. You don't need a credit card to start.",
  },
  {
    q: "How does it find my weak spots?",
    a: "Every question is tagged by Red Seal block. We track your accuracy and drill the blocks you score lowest on.",
  },
  {
    q: "How do billing and cancellation work?",
    a: "Paid plans renew automatically at the displayed interval: monthly, every 3 months, or yearly. You can cancel from your dashboard at any time and keep access through the paid period.",
  },
  {
    q: "What is the refund policy?",
    a: (
      <>
        New subscriptions have a 24-hour refund window. See the{" "}
        <Link
          href="/refunds"
          className="font-semibold text-[#C0271E] underline underline-offset-2"
        >
          full refund policy
        </Link>{" "}
        for eligibility and processing details.
      </>
    ),
  },
  {
    q: "Does it work on my phone on site?",
    a: "Built mobile-first. Knock out questions on a break; progress syncs everywhere.",
  },
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto max-w-[820px] px-6 py-16 sm:py-24">
        <div className="text-center">
          <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
            FAQ
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-[0.98] tracking-tight sm:text-[52px]">
            Straight{" "}
            <em className="font-bold italic text-[#D8232A]">answers</em>
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-relaxed text-[#64748B]">
            Clear details about free access, billing, refunds, coverage, and
            studying on the go.
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-2.5 sm:mt-12">
          {FAQ_DATA.map((item, i) => {
            const open = openFaq === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden border-b border-[#E5E0D8] bg-transparent"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  id={`faq-button-${i}`}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full cursor-pointer items-center gap-3.5 border-none bg-transparent px-1 py-5 text-left"
                >
                  <span className="flex-1 font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#1F2A37]">
                    {item.q}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className="px-1 pb-5 text-[15px] leading-relaxed text-[#64748B]"
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
