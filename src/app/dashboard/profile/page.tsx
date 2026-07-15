import { ProfileForm } from "@/components/dashboard/profile-form";
import { getDashboardSession } from "@/lib/dashboard-session";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { usesSupabaseData } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  defaultAvatarUrlForUser,
  resolveAvatarUrl,
} from "@/lib/avatars/options";

export default async function ProfilePage() {
  const { userName, trade, subscriptionTier, isAdmin } =
    await getDashboardSession();
  const user = usesSupabaseData() ? await getServerSessionUser() : null;
  const email = user?.email ?? "demo@redsealguide.com";
  const userKey = user?.id ?? email;

  let avatarUrl: string | null =
    (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  if (usesSupabaseData() && user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    const resolved = resolveAvatarUrl(
      profile?.avatar_url ?? avatarUrl,
      user.id,
    );
    if (!profile?.avatar_url) {
      await supabase
        .from("profiles")
        .update({ avatar_url: resolved })
        .eq("id", user.id);
    }
    avatarUrl = resolved;
  } else {
    avatarUrl = resolveAvatarUrl(avatarUrl, userKey);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Profile
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Manage your avatar, email, password, billing, and account
      </p>

      <ProfileForm
        userName={userName}
        email={email}
        userKey={userKey}
        avatarUrl={avatarUrl ?? defaultAvatarUrlForUser(userKey)}
        tradeName={trade.name}
        tradeCode={trade.code}
        subscriptionTier={subscriptionTier}
        isAdmin={isAdmin}
      />
    </div>
  );
}
