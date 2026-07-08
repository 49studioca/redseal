import Link from "next/link";
import { MapPin } from "lucide-react";
import type { ProvincialStudyContext } from "@/lib/content/province-content";

export function ProvincialStudyBanner({
  context,
  tradeSlug,
}: {
  context: ProvincialStudyContext;
  tradeSlug: string;
}) {
  return (
    <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7]">
          <MapPin className="h-4 w-4 text-[#B45309]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#92400E]">
            Studying for {context.provinceName} ({context.provinceCode})
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#78350F]">
            {context.codeAdoption} Practice and lessons flag provincial
            differences while keeping Red Seal exam answers aligned with{" "}
            {context.nationalCode}.
          </p>
          {context.examInfo && (
            <p className="mt-2 font-[family-name:var(--font-ibm-mono)] text-xs text-[#A16207]">
              {context.examInfo}
            </p>
          )}
          {context.guideSlug && (
            <Link
              href={`/trades/${tradeSlug}/${context.guideSlug}`}
              className="mt-2 inline-block text-sm font-semibold text-[#B45309] hover:underline"
            >
              View {context.provinceName} exam guide
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
