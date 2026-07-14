import Link from "next/link";
import { blogTradeLabel } from "@/lib/blog/trade-label";

export function BlogTradeBadge({
  tradeSlug,
  tradeName,
  className = "",
}: {
  tradeSlug?: string | null;
  tradeName?: string | null;
  className?: string;
}) {
  const label = blogTradeLabel({
    trade_slug: tradeSlug,
    trade_name: tradeName,
  });
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide";

  if (tradeSlug) {
    return (
      <Link
        href={`/trades/${tradeSlug}`}
        className={`${base} bg-[#FCEBEC] text-[#C0271E] hover:bg-[#F9D4D6] ${className}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <span className={`${base} bg-[#EFF6FF] text-[#2563EB] ${className}`}>
      {label}
    </span>
  );
}
