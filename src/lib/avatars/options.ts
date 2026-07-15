/** Shared DiceBear Notionists avatars used in testimonials + profile. */

export const AVATAR_STYLE = "notionists" as const;
export const AVATAR_BACKGROUND = "fcebec" as const;

/** Curated selectable seeds (same family as marketing stories). */
export const AVATAR_OPTION_SEEDS = [
  "dylan-k-electrician",
  "amir-s-plumber",
  "priya-m-welder",
  "marcus-t-carpenter",
  "jordan-l-industrial",
  "chris-r-electrician",
  "sofia-v-plumber",
  "nate-w-welder",
  "elena-p-carpenter",
  "omar-h-industrial",
  "alex-millwright",
  "blake-hvac",
  "casey-ironworker",
  "dana-auto",
  "eden-steamfitter",
  "finley-sprinkler",
  "harper-powerline",
  "indigo-instrument",
  "jules-motor",
  "kai-refrigeration",
] as const;

export type AvatarOptionSeed = (typeof AVATAR_OPTION_SEEDS)[number];

export function isAvatarOptionSeed(value: string): value is AvatarOptionSeed {
  return (AVATAR_OPTION_SEEDS as readonly string[]).includes(value);
}

export function apprenticeAvatarUrl(seed: string) {
  const params = new URLSearchParams({
    seed,
    backgroundColor: AVATAR_BACKGROUND,
    radius: "50",
  });
  return `https://api.dicebear.com/9.x/${AVATAR_STYLE}/svg?${params.toString()}`;
}

/** Stable hash → option index so each user gets a predictable default. */
export function defaultAvatarSeedForUser(userKey: string): AvatarOptionSeed {
  let hash = 0;
  for (let i = 0; i < userKey.length; i += 1) {
    hash = (hash * 31 + userKey.charCodeAt(i)) >>> 0;
  }
  return AVATAR_OPTION_SEEDS[hash % AVATAR_OPTION_SEEDS.length];
}

export function defaultAvatarUrlForUser(userKey: string) {
  return apprenticeAvatarUrl(defaultAvatarSeedForUser(userKey));
}

/** Return stored URL, or a deterministic default when missing. */
export function resolveAvatarUrl(
  stored: string | null | undefined,
  userKey: string,
) {
  if (stored?.trim()) return stored.trim();
  return defaultAvatarUrlForUser(userKey || "demo");
}

export function avatarSeedFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("dicebear.com")) return null;
    const seed = parsed.searchParams.get("seed");
    return seed && isAvatarOptionSeed(seed) ? seed : null;
  } catch {
    return null;
  }
}
