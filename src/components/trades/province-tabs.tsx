"use client";

import { useState } from "react";
import { BookOpen, Clock, GraduationCap } from "lucide-react";
import type { ProvinceDifferencePanel } from "@/lib/provincial-guide";

interface ProvinceTabsProps {
  provinces: ProvinceDifferencePanel[];
  tradeCode: string;
}

export function ProvinceTabs({ provinces, tradeCode }: ProvinceTabsProps) {
  const [active, setActive] = useState(provinces[0]?.code ?? "");
  const panel = provinces.find((p) => p.code === active) ?? provinces[0];

  if (!panel) return null;

  return (
    <div className="mt-6">
      <div
        role="tablist"
        aria-label="Provinces and territories"
        className="flex flex-wrap gap-2"
      >
        {provinces.map((province) => {
          const isActive = province.code === panel.code;
          return (
            <button
              key={province.code}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(province.code)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? "border-[#C0271E] bg-[#C0271E] text-white"
                  : "border-[#E5E0D8] bg-white text-[#475569] hover:border-[#C0271E]/40 hover:text-[#1F2A37]"
              }`}
            >
              {province.name}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className="mt-5 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F4] p-5 sm:p-6"
      >
        <h3 className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#1F2A37]">
          {tradeCode} in {panel.name}
        </h3>

        <dl className="mt-4 space-y-4">
          <div className="flex gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#C0271E]" />
            <div>
              <dt className="text-sm font-semibold text-[#1F2A37]">
                Code adoption
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-[#64748B]">
                {panel.codeAdoption}
              </dd>
              <dd className="mt-1 text-xs text-[#94A3B8]">
                Local code: {panel.localCodeName} · Exam standard:{" "}
                {panel.nationalCode}
              </dd>
            </div>
          </div>

          {panel.apprenticeship && (
            <div className="flex gap-3">
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#C0271E]" />
              <div>
                <dt className="text-sm font-semibold text-[#1F2A37]">
                  Apprenticeship path
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#64748B]">
                  {panel.apprenticeship}
                  {panel.apprenticeshipHours
                    ? ` (~${panel.apprenticeshipHours.toLocaleString()} hours)`
                    : ""}
                </dd>
              </div>
            </div>
          )}

          {panel.examInfo && (
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#C0271E]" />
              <div>
                <dt className="text-sm font-semibold text-[#1F2A37]">
                  Exam format
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#64748B]">
                  {panel.examInfo}
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
