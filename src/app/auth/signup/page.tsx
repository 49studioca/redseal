import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AD_CLICK_COOKIE_NAME,
  appendAdClickParams,
  mergeAdClickParams,
} from "@/lib/analytics/ad-click-ids";

export const metadata: Metadata = {
  title: "Sign up",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ signup: "" });

  const source = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") source.set(key, value);
  }
  const cookieStore = await cookies();
  appendAdClickParams(
    query,
    mergeAdClickParams(source, cookieStore.get(AD_CLICK_COOKIE_NAME)?.value),
  );

  redirect(`/auth?${query.toString()}`);
}
