import { redirect } from "next/navigation";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string; plan?: string }>;
};

/** Legacy Stripe return path → dashboard success handler. */
export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const next = new URLSearchParams({ checkout: "success" });
  if (params.session_id) next.set("session_id", params.session_id);
  if (params.plan) next.set("plan", params.plan);
  redirect(`/dashboard?${next.toString()}`);
}
