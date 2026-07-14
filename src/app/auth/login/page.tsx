import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appendAdClickParams } from "@/lib/analytics/ad-click-ids";

export const metadata: Metadata = {
  title: "Log in",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ signin: "" });

  const redirectTo = typeof params.redirect === "string" ? params.redirect : "";
  const error = typeof params.error === "string" ? params.error : "";
  if (redirectTo) query.set("redirect", redirectTo);
  if (error) query.set("error", error);

  const source = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") source.set(key, value);
  }
  appendAdClickParams(query, source);

  redirect(`/auth?${query.toString()}`);
}
