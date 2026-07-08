export type TextPart =
  | { type: "text"; content: string }
  | { type: "math"; content: string; display?: boolean }
  | { type: "break" };

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** JSON often turns `\text` into a tab + `ext` — repair common stripped macros in prose. */
function repairStrippedLatexMacros(text: string): string {
  let repaired = text;

  repaired = repaired.replace(/\(\s*ext\{([^}]+)\}\)/g, "\\(\\text{$1}\\)");
  repaired = repaired.replace(
    /(^|[^\w\\])ext\{([^}]+)\}/g,
    "$1\\(\\text{$2}\\)",
  );
  repaired = repaired.replace(
    /\(\s*rac\{([^}]*)\}\{([^}]*)\}\)/g,
    "\\(\\frac{$1}{$2}\\)",
  );

  return repaired;
}

/** AI often writes `\(L\) L` — drop the redundant plain symbol after inline math. */
export function normalizeInlineMathText(text: string): string {
  let normalized = repairStrippedLatexMacros(text.trim());

  normalized = normalized.replace(
    /\\\(\s*([\w]+?)\s*\\\)(\s*)\1(?=[\s,.;:!?)]|$)/gi,
    "\\($1\\)",
  );

  normalized = normalized.replace(
    /\$([\w]+?)\$(\s*)\1(?=[\s,.;:!?)]|$)/gi,
    "$$1$",
  );

  return normalized;
}

function trimLeadingDuplicatePlainSymbol(
  mathContent: string,
  textContent: string,
): string {
  const symbol = mathContent.trim();
  if (!/^[\w]{1,8}$/.test(symbol)) return textContent;

  const pattern = new RegExp(
    `^\\s*${escapeRegExp(symbol)}(?=[\\s,.;:!?)]|$)`,
    "i",
  );
  return textContent.replace(pattern, "");
}

function dedupePlainTextAfterMath(parts: TextPart[]): TextPart[] {
  const cleaned: TextPart[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.type === "break") {
      cleaned.push(part);
      continue;
    }
    if (
      part.type === "math" &&
      !part.display &&
      i + 1 < parts.length &&
      parts[i + 1].type === "text"
    ) {
      const nextPart = parts[i + 1];
      if (nextPart.type !== "text") continue;
      const nextText = trimLeadingDuplicatePlainSymbol(
        part.content,
        nextPart.content,
      );
      cleaned.push(part);
      if (nextText) {
        cleaned.push({ type: "text", content: nextText });
      }
      i++;
      continue;
    }
    cleaned.push(part);
  }

  return cleaned;
}

const RICH_MATH_PATTERN =
  /\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\\\((.+?)\\\)|\$(?!\$)(.+?)\$/g;

/** Split text on display `\[...\]`, `$$...$$`, and inline `\(...\)` / `$...$` math. */
export function splitTextWithInlineMath(text: string): TextPart[] {
  const source = normalizeInlineMathText(text);
  const parts: TextPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = RICH_MATH_PATTERN.exec(source)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: source.slice(lastIndex, match.index),
      });
    }

    const display = match[1] !== undefined || match[2] !== undefined;
    parts.push({
      type: "math",
      content: match[1] ?? match[2] ?? match[3] ?? match[4] ?? "",
      display,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push({ type: "text", content: source.slice(lastIndex) });
  }

  const result: TextPart[] =
    parts.length > 0 ? parts : [{ type: "text", content: source }];
  return dedupePlainTextAfterMath(result);
}

export function textHasInlineMath(text: string): boolean {
  const normalized = normalizeInlineMathText(text);
  return (
    /\\\[[\s\S]+?\\\]/.test(normalized) ||
    /\$\$[\s\S]+?\$\$/.test(normalized) ||
    /\\\(.+?\\\)/.test(normalized) ||
    /\$(?!\$).+?\$/.test(normalized)
  );
}

export function textHasDisplayMath(text: string): boolean {
  const normalized = normalizeInlineMathText(text);
  return /\\\[[\s\S]+?\\\]/.test(normalized) || /\$\$[\s\S]+?\$\$/.test(normalized);
}

/** Raw LaTeX command fragments embedded in plain text (check-question variable lines). */
const RAW_LATEX_FRAGMENT =
  /\\(?:text\{[^}]*\}|frac\{[^}]*\}\{[^}]*\}|times|%)/;

function containsLatexFragments(text: string): boolean {
  return RAW_LATEX_FRAGMENT.test(text.trim());
}

function textChunkHasEquationTail(text: string): boolean {
  const t = text.trim();
  return (
    /^\s*=/.test(t) &&
    (looksLikeRawLatex(t) ||
      /\\(?:times|text|frac|%)/.test(t) ||
      /\d\s*\\%/.test(t))
  );
}

/** Merge `\(\text{X}\)` + ` = 3\% \times \text{Y}` into one inline equation. */
function coalesceFragmentedEquationParts(parts: TextPart[]): TextPart[] {
  const out: TextPart[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.type === "break") {
      out.push(part);
      continue;
    }

    if (
      part.type === "math" &&
      !part.display &&
      i + 1 < parts.length &&
      parts[i + 1].type === "text"
    ) {
      const nextPart = parts[i + 1];
      if (nextPart.type !== "text") continue;
      if (!textChunkHasEquationTail(nextPart.content)) {
        out.push(part);
        continue;
      }
      out.push({
        type: "math",
        content: `${part.content}${nextPart.content}`.trim(),
        display: false,
      });
      i++;
      continue;
    }

    out.push(part);
  }

  return out;
}

/** Prose followed by a named equation, e.g. `3% ... Voltage Drop = 3\% \times \text{...}`. */
function extractTrailingEquation(text: string): {
  prose: string;
  equation?: string;
} {
  const trimmed = normalizeInlineMathText(text);

  const textMacroEq = trimmed.match(
    /^([\s\S]*?)\s*(\\text\{[^}]+\}\s*=[\s\S]+)$/,
  );
  if (textMacroEq?.[1]?.trim() && textMacroEq[2]?.trim()) {
    return { prose: textMacroEq[1].trim(), equation: textMacroEq[2].trim() };
  }

  const namedEq = trimmed.match(
    /^([\s\S]*?)\s*((?:[A-Z][a-z]+(?:\s+[A-Za-z]+)*)\s*=\s*[\s\S]*\\(?:times|text|frac|%)[\s\S]*)$/,
  );
  if (namedEq?.[1]?.trim() && namedEq[2]?.trim()) {
    const equation = namedEq[2].trim();
    const label = namedEq[2].match(/^([A-Z][a-z]+(?:\s+[A-Za-z]+)*)\s*=/)?.[1];
    const normalizedEquation = label
      ? equation.replace(label, `\\text{${label}}`)
      : equation;
    return { prose: namedEq[1].trim(), equation: normalizedEquation };
  }

  return { prose: trimmed };
}

function parseEquationSegment(text: string, preferDisplay = false): TextPart[] {
  const trimmed = normalizeInlineMathText(text);
  if (!trimmed) return [];

  if (textHasInlineMath(trimmed)) {
    const parts = coalesceFragmentedEquationParts(splitTextWithInlineMath(trimmed));
    if (
      preferDisplay &&
      parts.length === 1 &&
      parts[0].type === "math" &&
      shouldRenderAsDisplayMath(parts[0].content)
    ) {
      return [{ type: "math", content: parts[0].content, display: true }];
    }
    return parts;
  }

  if (preferDisplay && shouldRenderAsDisplayMath(trimmed)) {
    return [{ type: "math", content: trimmed, display: true }];
  }

  if (looksLikeRawLatex(trimmed) || containsLatexFragments(trimmed)) {
    if (shouldRenderAsDisplayMath(trimmed)) {
      return [{ type: "math", content: trimmed, display: preferDisplay }];
    }
    if (!preferDisplay && looksLikeVariableDefinitions(trimmed)) {
      return parseVariableDefinitions(trimmed);
    }
    if (/=/.test(trimmed) && containsLatexFragments(trimmed)) {
      return [{ type: "math", content: trimmed, display: preferDisplay }];
    }
    return splitRawLatexMixedText(trimmed);
  }

  return [{ type: "text", content: trimmed }];
}

function shouldRenderAsDisplayMath(text: string): boolean {
  const t = text.trim();
  if (/\\frac\{/.test(t)) return true;
  // Named formula lines like `\text{Voltage Drop} = ...`
  return /^\\text\{[^}]+\}\s*=/.test(t);
}

/** Split prose like `L = 50 \text{ m}, I = 15 \text{ A}` into text + inline math. */
function splitRawLatexMixedText(text: string): TextPart[] {
  const source = normalizeInlineMathText(text);
  const parts: TextPart[] = [];
  const re = /\\(?:text\{[^}]*\}|frac\{[^}]*\}\{[^}]*\})/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source)) !== null) {
    if (match.index > lastIndex) {
      const chunk = source.slice(lastIndex, match.index);
      if (chunk) parts.push({ type: "text", content: chunk });
    }
    parts.push({ type: "math", content: match[0], display: false });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    const chunk = source.slice(lastIndex);
    if (chunk) parts.push({ type: "text", content: chunk });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: source }];
}

/** Prose after `;` — e.g. `L = 50 \text{ m}, I = 15 \text{ A}`. */
function looksLikeVariableDefinitions(text: string): boolean {
  const t = text.trim();
  return /^[A-Za-z]\s*=/.test(t) && containsLatexFragments(t);
}

function parseVariableDefinitions(text: string): TextPart[] {
  const trimmed = normalizeInlineMathText(text);
  if (!trimmed) return [];
  if (looksLikeVariableDefinitions(trimmed)) {
    return [{ type: "math", content: trimmed, display: false }];
  }
  return splitRawLatexMixedText(trimmed);
}

function parseMathSegment(text: string, preferDisplay = false): TextPart[] {
  return parseEquationSegment(text, preferDisplay);
}

/** Raw LaTeX without \( \) or \[ \] delimiters — common in check_question answers. */
export function looksLikeRawLatex(text: string): boolean {
  const trimmed = text.trim();
  return (
    /\\(text|frac|times|sqrt|cdot|left|right|pm|leq|geq)\{/.test(trimmed) ||
    /\\(?:times|%)/.test(trimmed) ||
    /\(\s*ext\{/.test(trimmed) ||
    /(?:^|[^\w\\])ext\{/.test(trimmed) ||
    /\(\s*rac\{/.test(trimmed) ||
    containsLatexFragments(trimmed)
  );
}

export function textNeedsMathRendering(text: string): boolean {
  return textHasInlineMath(text) || looksLikeRawLatex(text);
}

/** Parse delimited math, formula;definitions check answers, or mixed raw LaTeX. */
export function parseLessonMathText(text: string): TextPart[] {
  const trimmed = normalizeInlineMathText(text);
  const semi = trimmed.indexOf(";");

  if (semi > 0) {
    const before = trimmed.slice(0, semi).trim();
    const after = trimmed.slice(semi + 1).trim();
    const beforeIsFormula =
      shouldRenderAsDisplayMath(before) ||
      (looksLikeRawLatex(before) && !looksLikeVariableDefinitions(before));
    const afterIsFormula =
      shouldRenderAsDisplayMath(after) ||
      (looksLikeRawLatex(after) &&
        !looksLikeVariableDefinitions(after) &&
        (/^\\text\{/.test(after) || textHasInlineMath(after)));

    if (!beforeIsFormula && afterIsFormula) {
      return [
        ...parseEquationSegment(before, false),
        { type: "break" },
        ...parseEquationSegment(after, true),
      ];
    }

    return [
      ...parseEquationSegment(before, true),
      ...(after
        ? [{ type: "break" as const }, ...parseEquationSegment(after, false)]
        : []),
    ];
  }

  const { prose, equation } = extractTrailingEquation(trimmed);
  if (equation) {
    return [
      { type: "text", content: prose },
      { type: "break" },
      ...parseEquationSegment(equation, true),
    ];
  }

  if (textHasInlineMath(trimmed)) {
    return coalesceFragmentedEquationParts(splitTextWithInlineMath(trimmed));
  }

  return parseEquationSegment(trimmed, shouldRenderAsDisplayMath(trimmed));
}
