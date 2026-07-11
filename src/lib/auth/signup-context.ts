import { getTradeBySlug } from "@/data/seed";
import {
  getProvinceBySlug,
  isProvinceCode,
  type ProvinceCode,
} from "@/lib/provinces";

export type SignupContext = {
  tradeSlug: string | null;
  tradeId: string | null;
  province: ProvinceCode | null;
};

export function parseSignupContext(searchParams: URLSearchParams): SignupContext {
  let tradeSlug = searchParams.get("trade")?.trim() || null;
  let province: ProvinceCode | null = null;

  const provinceParam = searchParams.get("province")?.trim().toUpperCase();
  if (provinceParam && isProvinceCode(provinceParam)) {
    province = provinceParam;
  }

  const redirect = searchParams.get("redirect");
  if (redirect) {
    const match = redirect.match(/^\/trades\/([^/?#]+)(?:\/([^/?#]+))?/);
    if (match) {
      tradeSlug ??= match[1];
      if (!province && match[2]) {
        const entry = getProvinceBySlug(match[2]);
        if (entry) province = entry.code;
      }
    }
  }

  const trade = tradeSlug ? getTradeBySlug(tradeSlug) : undefined;

  return {
    tradeSlug: trade?.slug ?? tradeSlug,
    tradeId: trade?.id ?? null,
    province,
  };
}

export function buildSignupHref(opts: {
  tradeSlug?: string;
  province?: ProvinceCode;
  redirect?: string;
}) {
  const params = new URLSearchParams({ signup: "" });
  if (opts.tradeSlug) params.set("trade", opts.tradeSlug);
  if (opts.province) params.set("province", opts.province);
  if (opts.redirect) params.set("redirect", opts.redirect);
  return `/auth?${params.toString()}`;
}

export function appendSignupContextToSearchParams(
  params: URLSearchParams,
  context: { tradeSlug?: string | null; province?: ProvinceCode | null },
) {
  if (context.tradeSlug) params.set("trade", context.tradeSlug);
  if (context.province) params.set("province", context.province);
}
