"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Camera,
  CreditCard,
  KeyRound,
  Loader2,
  Mail,
  Trash2,
  Wrench,
} from "lucide-react";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PLANS } from "@/lib/stripe/config";
import {
  AVATAR_OPTION_SEEDS,
  apprenticeAvatarUrl,
  avatarSeedFromUrl,
  defaultAvatarSeedForUser,
} from "@/lib/avatars/options";
import type { Profile } from "@/types";

type ProfileFormProps = {
  userName: string;
  email: string;
  userKey: string;
  avatarUrl?: string | null;
  tradeName: string;
  tradeCode: string;
  subscriptionTier: Profile["subscription_tier"];
  isAdmin?: boolean;
};

export function ProfileForm({
  userName,
  email,
  userKey,
  avatarUrl: initialAvatarUrl,
  tradeName,
  tradeCode,
  subscriptionTier,
  isAdmin,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(
    initialAvatarUrl ?? apprenticeAvatarUrl(defaultAvatarSeedForUser(userKey)),
  );
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const plan = PLANS[subscriptionTier] ?? PLANS.free;
  const selectedSeed = useMemo(() => avatarSeedFromUrl(avatarUrl), [avatarUrl]);

  const saveAvatarSeed = async (seed: string) => {
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed }),
        credentials: "same-origin",
      });
      const data = (await res.json()) as { avatarUrl?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not update avatar");
      }
      setAvatarUrl(data.avatarUrl ?? apprenticeAvatarUrl(seed));
      setPickerOpen(false);
      router.refresh();
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Could not update avatar",
      );
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarBusy(true);
    setAvatarError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const data = (await res.json()) as { avatarUrl?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not upload photo");
      }
      setAvatarUrl(
        data.avatarUrl ??
          apprenticeAvatarUrl(defaultAvatarSeedForUser(userKey)),
      );
      setPickerOpen(false);
      router.refresh();
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Could not upload photo",
      );
    } finally {
      setAvatarBusy(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordBusy(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not update password");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated");
      setPasswordOpen(false);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Could not update password",
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleDeleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    setDeleteError(null);
    setDeleteBusy(true);

    try {
      const res = await fetch("/api/profile/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not delete account");
      }
      router.push("/auth?signin");
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Could not delete account",
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <Card className="mt-5 overflow-hidden p-0 sm:mt-6">
        <div className="border-b border-[#E5E0D8] bg-gradient-to-br from-[#1F2A37] to-[#2C3A4A] px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={`${userName} profile avatar`}
                className="h-14 w-14 rounded-full border-2 border-white/25 bg-[#FCEBEC] object-cover"
              />
              <button
                type="button"
                onClick={() => setPickerOpen((open) => !open)}
                disabled={avatarBusy}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#1F2A37] text-white shadow-md transition-colors hover:bg-[#2C3A4A] disabled:opacity-60"
                aria-label="Choose avatar"
                aria-expanded={pickerOpen}
              >
                {avatarBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => void handleAvatarChange(event)}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-[family-name:var(--font-barlow-semi)] text-xl font-bold text-white">
                  {userName}
                </h2>
                {isAdmin && (
                  <Badge className="bg-white/15 text-white">Admin</Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-[#9FB4C7]">
                Tap the camera to pick an avatar
              </p>
            </div>
          </div>
          {avatarError && (
            <p className="mt-3 text-sm text-[#FCA5A5]">{avatarError}</p>
          )}
        </div>

        {pickerOpen && (
          <div className="border-b border-[#E5E0D8] bg-[#FAF8F4] px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Choose avatar
                </div>
                <p className="mt-0.5 text-sm text-[#64748B]">
                  Same style as apprentice stories. One is assigned by default.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPickerOpen(false)}
              >
                Close
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2.5 sm:grid-cols-8 sm:gap-3">
              {AVATAR_OPTION_SEEDS.map((seed) => {
                const selected = selectedSeed === seed;
                return (
                  <button
                    key={seed}
                    type="button"
                    disabled={avatarBusy}
                    onClick={() => void saveAvatarSeed(seed)}
                    className={`relative aspect-square overflow-hidden rounded-full border-2 transition ${
                      selected
                        ? "border-[#D8232A] ring-2 ring-[#D8232A]/25"
                        : "border-[#E5E0D8] hover:border-[#C0271E]/50"
                    } disabled:opacity-60`}
                    aria-label={`Select avatar ${seed}`}
                    aria-pressed={selected}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={apprenticeAvatarUrl(seed)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={avatarBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload photo instead
              </Button>
            </div>
          </div>
        )}

        <div className="divide-y divide-[#ECE6DC]">
          <div className="flex items-start gap-3 px-4 py-4 sm:px-6">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Email
              </div>
              <div className="mt-0.5 break-all font-semibold text-[#1F2A37]">
                {email}
              </div>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Password
                </div>
                <p className="mt-0.5 text-sm text-[#64748B]">
                  Update the password you use to sign in
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  setPasswordOpen((open) => !open);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
              >
                {passwordOpen ? "Cancel" : "Change"}
              </Button>
            </div>

            {passwordSuccess && !passwordOpen && (
              <p className="mt-3 text-sm text-[#15803D]">{passwordSuccess}</p>
            )}

            {passwordOpen && (
              <form
                onSubmit={(event) => void handlePasswordSubmit(event)}
                className="mt-4 space-y-3 rounded-xl border border-[#E5E0D8] bg-[#FBF9F6] p-4"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                    Current password
                  </label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                    New password
                  </label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                    Confirm new password
                  </label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-[#B91C1C]">{passwordError}</p>
                )}
                <Button type="submit" size="sm" disabled={passwordBusy}>
                  {passwordBusy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Subscription & billing
                </div>
                <div className="mt-0.5 font-semibold text-[#1F2A37]">
                  Current plan: {plan.name}
                </div>
                <p className="mt-1 text-sm text-[#64748B]">
                  Update cards, view invoices, or cancel with access through
                  your paid period.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/billing">
                <Button size="sm" variant="secondary">
                  Manage billing
                </Button>
              </Link>
              {subscriptionTier === "free" && (
                <UpgradeButton label="Upgrade to Pro" size="sm" />
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Change trade</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Currently studying{" "}
              <span className="font-semibold text-[#0F172A]">
                {tradeName} ({tradeCode})
              </span>
              . Switch your primary trade exam anytime.
            </p>
            <Link href="/onboarding" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">
                Select different trade
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card className="mt-4 border-[#F3C5C7] p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[#B91C1C]">Delete account</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Permanently delete your RedSealGuide account, progress, and
              subscription. This cannot be undone.
            </p>
          </div>
          {!deleteOpen && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 border-[#F3C5C7] text-[#B91C1C] hover:bg-[#FEF2F2]"
              onClick={() => {
                setDeleteOpen(true);
                setDeleteError(null);
              }}
            >
              Delete
            </Button>
          )}
        </div>

        {deleteOpen && (
          <form
            onSubmit={(event) => void handleDeleteAccount(event)}
            className="mt-4 space-y-3 rounded-xl border border-[#F3C5C7] bg-[#FEF8F8] p-4"
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Type DELETE to confirm
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Password
              </label>
              <Input
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
            </div>
            {deleteError && (
              <p className="text-sm text-[#B91C1C]">{deleteError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={deleteBusy}
                className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] shadow-none"
              >
                {deleteBusy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete my account"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deleteBusy}
                onClick={() => {
                  setDeleteOpen(false);
                  setDeletePassword("");
                  setDeleteConfirmation("");
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </>
  );
}
