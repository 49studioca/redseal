export const DEMO_BOOKMARKS_COOKIE = "demo_question_bookmarks";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
  set?: (
    name: string,
    value: string,
    options?: {
      path?: string;
      maxAge?: number;
      sameSite?: "lax" | "strict" | "none";
    },
  ) => void;
};

export function readDemoBookmarks(cookies: CookieStore): string[] {
  const raw = cookies.get(DEMO_BOOKMARKS_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDemoBookmarks(
  cookies: CookieStore,
  questionIds: string[],
): void {
  if (!cookies.set) return;
  cookies.set(
    DEMO_BOOKMARKS_COOKIE,
    encodeURIComponent(JSON.stringify(questionIds)),
    {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    },
  );
}

export function toggleDemoBookmark(
  cookies: CookieStore,
  questionId: string,
): boolean {
  const current = readDemoBookmarks(cookies);
  const exists = current.includes(questionId);
  const next = exists
    ? current.filter((id) => id !== questionId)
    : [...current, questionId];
  writeDemoBookmarks(cookies, next);
  return !exists;
}

export function isDemoBookmarked(
  cookies: CookieStore,
  questionId: string,
): boolean {
  return readDemoBookmarks(cookies).includes(questionId);
}
