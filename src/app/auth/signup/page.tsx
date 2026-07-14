import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appendAdClickParams } from "@/lib/analytics/ad-click-ids";

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
  appendAdClickParams(query, source);

  redirect(`/auth?${query.toString()}`);
}
