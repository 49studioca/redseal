export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9'-]/gi, "").trim();
}

export function contextKeyFromSnippet(context: string): string {
  const normalized = context
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  if (!normalized) return "";
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function extractContextSnippet(text: string, wordIndex: number): string {
  const tokens = text.split(/(\s+)/);
  let wordCount = 0;
  let charPos = 0;

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      charPos += token.length;
      continue;
    }
    if (wordCount === wordIndex) {
      const start = Math.max(0, charPos - 80);
      const end = Math.min(text.length, charPos + token.length + 80);
      return text.slice(start, end).trim();
    }
    wordCount++;
    charPos += token.length;
  }

  return text.slice(0, 160).trim();
}

export function tokenizeText(text: string): { word: string; isWord: boolean }[] {
  return text.split(/(\s+|[.,;:!?()[\]{}""''—–-]+)/).map((part) => ({
    word: part,
    isWord: /^[A-Za-z][A-Za-z'-]*$/.test(part) && part.length > 2,
  }));
}
