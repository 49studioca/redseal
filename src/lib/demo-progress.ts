export const DEMO_BLOCK_MASTERY_COOKIE = "demo_block_mastery";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type BlockMasteryStats = {
  questions_attempted: number;
  questions_correct: number;
  mastery_score: number;
};

export type TradeBlockMastery = Record<string, BlockMasteryStats>;

export type DemoBlockMasteryStore = Record<string, TradeBlockMastery>;

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

export function readDemoBlockMastery(
  cookies: CookieStore,
): DemoBlockMasteryStore {
  const raw = cookies.get(DEMO_BLOCK_MASTERY_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as DemoBlockMasteryStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeDemoBlockMastery(
  cookies: CookieStore,
  store: DemoBlockMasteryStore,
): void {
  if (!cookies.set) return;
  cookies.set(
    DEMO_BLOCK_MASTERY_COOKIE,
    encodeURIComponent(JSON.stringify(store)),
    {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    },
  );
}

export function recordDemoBlockAnswer(
  cookies: CookieStore,
  tradeId: string,
  blockId: string,
  isCorrect: boolean,
): BlockMasteryStats {
  const store = readDemoBlockMastery(cookies);
  const tradeMastery = store[tradeId] ?? {};
  const current = tradeMastery[blockId] ?? {
    questions_attempted: 0,
    questions_correct: 0,
    mastery_score: 0,
  };

  const questions_attempted = current.questions_attempted + 1;
  const questions_correct = current.questions_correct + (isCorrect ? 1 : 0);
  const mastery_score = (questions_correct / questions_attempted) * 100;

  const nextStats: BlockMasteryStats = {
    questions_attempted,
    questions_correct,
    mastery_score,
  };

  store[tradeId] = {
    ...tradeMastery,
    [blockId]: nextStats,
  };
  writeDemoBlockMastery(cookies, store);
  return nextStats;
}

export function applyDemoBlockExamResults(
  cookies: CookieStore,
  tradeId: string,
  blockScores: Record<string, { correct: number; total: number }>,
): void {
  const store = readDemoBlockMastery(cookies);
  const tradeMastery = { ...(store[tradeId] ?? {}) };

  for (const [blockId, { correct, total }] of Object.entries(blockScores)) {
    if (total <= 0) continue;
    const current = tradeMastery[blockId] ?? {
      questions_attempted: 0,
      questions_correct: 0,
      mastery_score: 0,
    };
    const questions_attempted = current.questions_attempted + total;
    const questions_correct = current.questions_correct + correct;
    tradeMastery[blockId] = {
      questions_attempted,
      questions_correct,
      mastery_score: (questions_correct / questions_attempted) * 100,
    };
  }

  store[tradeId] = tradeMastery;
  writeDemoBlockMastery(cookies, store);
}

export function getDemoTradeMastery(
  cookies: CookieStore,
  tradeId: string,
): TradeBlockMastery {
  return readDemoBlockMastery(cookies)[tradeId] ?? {};
}

// Client-side helper for setting cookie from browser
export function setDemoBlockMasteryClient(store: DemoBlockMasteryStore) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${DEMO_BLOCK_MASTERY_COOKIE}=${encodeURIComponent(JSON.stringify(store))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function recordDemoBlockAnswerClient(
  tradeId: string,
  blockId: string,
  isCorrect: boolean,
): BlockMasteryStats {
  const store = readDemoBlockMastery({
    get: (name) => {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
      return match ? { value: match.split("=").slice(1).join("=") } : undefined;
    },
  });
  const tradeMastery = store[tradeId] ?? {};
  const current = tradeMastery[blockId] ?? {
    questions_attempted: 0,
    questions_correct: 0,
    mastery_score: 0,
  };

  const questions_attempted = current.questions_attempted + 1;
  const questions_correct = current.questions_correct + (isCorrect ? 1 : 0);
  const mastery_score = (questions_correct / questions_attempted) * 100;

  store[tradeId] = {
    ...tradeMastery,
    [blockId]: {
      questions_attempted,
      questions_correct,
      mastery_score,
    },
  };
  setDemoBlockMasteryClient(store);
  return store[tradeId][blockId];
}

export function applyDemoBlockExamResultsClient(
  tradeId: string,
  blockScores: Record<string, { correct: number; total: number }>,
): void {
  const store = readDemoBlockMastery({
    get: (name) => {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
      return match ? { value: match.split("=").slice(1).join("=") } : undefined;
    },
  });
  const tradeMastery = { ...(store[tradeId] ?? {}) };

  for (const [blockId, { correct, total }] of Object.entries(blockScores)) {
    if (total <= 0) continue;
    const current = tradeMastery[blockId] ?? {
      questions_attempted: 0,
      questions_correct: 0,
      mastery_score: 0,
    };
    const questions_attempted = current.questions_attempted + total;
    const questions_correct = current.questions_correct + correct;
    tradeMastery[blockId] = {
      questions_attempted,
      questions_correct,
      mastery_score: (questions_correct / questions_attempted) * 100,
    };
  }

  store[tradeId] = tradeMastery;
  setDemoBlockMasteryClient(store);
}
