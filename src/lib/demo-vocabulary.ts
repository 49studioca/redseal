export const DEMO_VOCABULARY_COOKIE = "demo_saved_words";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type DemoSavedWord = {
  id: string;
  word: string;
  target_language: string;
  translation: string | null;
  definition: string | null;
  context_explanation: string | null;
  context_snippet: string | null;
  context_key: string;
  created_at: string;
};

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

export function readDemoVocabulary(cookies: CookieStore): DemoSavedWord[] {
  const raw = cookies.get(DEMO_VOCABULARY_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as DemoSavedWord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDemoVocabulary(
  cookies: CookieStore,
  words: DemoSavedWord[],
): void {
  if (!cookies.set) return;
  cookies.set(
    DEMO_VOCABULARY_COOKIE,
    encodeURIComponent(JSON.stringify(words.slice(0, 100))),
    {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    },
  );
}

export function upsertDemoVocabularyWord(
  cookies: CookieStore,
  entry: Omit<DemoSavedWord, "id" | "created_at"> & { id?: string },
): DemoSavedWord {
  const words = readDemoVocabulary(cookies);
  const saved: DemoSavedWord = {
    ...entry,
    id: entry.id ?? crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  const next = [
    saved,
    ...words.filter(
      (word) =>
        !(
          word.word === saved.word &&
          word.target_language === saved.target_language &&
          word.context_key === saved.context_key
        ),
    ),
  ];

  writeDemoVocabulary(cookies, next);
  return saved;
}

export function deleteDemoVocabularyWord(
  cookies: CookieStore,
  id: string,
): boolean {
  const words = readDemoVocabulary(cookies);
  const next = words.filter((word) => word.id !== id);
  if (next.length === words.length) return false;
  writeDemoVocabulary(cookies, next);
  return true;
}
