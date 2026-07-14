import { ProfileForm } from "@/components/dashboard/profile-form";
import { getDashboardSession } from "@/lib/dashboard-session";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { usesSupabaseData } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const { userName, trade, subscriptionTier, isAdmin } =
    await getDashboardSession();
  const user = usesSupabaseData() ? await getServerSessionUser() : null;
  const email = user?.email ?? "demo@redsealguide.com";

  let avatarUrl: string | null =
    (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  if (usesSupabaseData() && user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    avatarUrl = profile?.avatar_url ?? avatarUrl;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Profile
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Manage your photo, email, password, billing, and account
      </p>

      <ProfileForm
        userName={userName}
        email={email}
        avatarUrl={avatarUrl}
        tradeName={trade.name}
        tradeCode={trade.code}
        subscriptionTier={subscriptionTier}
        isAdmin={isAdmin}
      />
    </div>
  );
}
