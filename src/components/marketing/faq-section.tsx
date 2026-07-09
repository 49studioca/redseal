"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_DATA = [
  {
    q: "Is this an official Red Seal tool?",
    a: "No - it's an independent study aid from RedSealGuide, not affiliated with the Red Seal Program or any provincial authority.",
  },
  {
    q: "Does it cover my province?",
    a: "Yes - all 13 provinces and territories. Province-specific code amendments are flagged in each module.",
  },
  {
    q: "How does it find my weak spots?",
    a: "Every question is tagged by Red Seal block. We track your accuracy and drill the blocks you score lowest on.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, in two clicks from your dashboard - cancel anytime, including during your discounted first week.",
  },
  {
    q: "Does it work on my phone on site?",
    a: "Built mobile-first. Knock out questions on a break; progress syncs everywhere.",
  },
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className="mx-auto max-w-[820px] px-6 py-[78px]">
      <div className="text-center">
        <div className="text-[13px] font-bold uppercase tracking-wider text-[#D8232A]">
          FAQ
        </div>
        <h2 className="mt-2.5 font-[family-name:var(--font-barlow-condensed)] text-[46px] font-bold leading-none tracking-tight">
          Straight answers
        </h2>
      </div>
      <div className="mt-[34px] flex flex-col gap-3">
        {FAQ_DATA.map((item, i) => {
          const open = openFaq === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-[13px] border border-[#E5E0D8] bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(open ? -1 : i)}
                className="flex w-full cursor-pointer items-center gap-3.5 border-none bg-transparent px-5 py-[18px] text-left"
              >
                <span className="flex-1 font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#1F2A37]">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <div className="px-5 pb-5 text-[15px] leading-relaxed text-[#64748B]">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
