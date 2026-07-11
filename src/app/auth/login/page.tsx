import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ signin: "" });
  if (params.redirect) query.set("redirect", params.redirect);
  if (params.error) query.set("error", params.error);
  redirect(`/auth?${query.toString()}`);
}
