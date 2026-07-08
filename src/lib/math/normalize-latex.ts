/**
 * Repair LaTeX in math blocks after JSON parsing.
 * AI often emits single backslashes (e.g. \frac); JSON treats \f as form-feed and \t as tab.
 */
export function normalizeMathLatex(math: string): string {
  let s = math.trim();

  s = s.replace(/\u000Crac/g, "\\frac");
  s = s.replace(/\u0009imes/g, "\\times");
  s = s.replace(/\u0009ext\{/g, "\\text{");
  s = s.replace(/\u0009heta/g, "\\theta");
  s = s.replace(/\u0009an\b/g, "\\tan");
  s = s.replace(/\u0009au/g, "\\tau");
  s = s.replace(/(^|[^\\a-zA-Z])rac\{/g, "$1\\frac{");
  s = s.replace(/(^|[^\\a-zA-Z])ext\{/g, "$1\\text{");
  s = s.replace(/(^|[^\\a-zA-Z])imes(?![a-zA-Z])/g, "$1\\times");
  s = s.replace(/([^\\])%/g, "$1\\%");

  if (s.includes("\\\\") && !/\\begin\{[a-z]+\}/.test(s)) {
    s = `\\begin{gathered}${s}\\end{gathered}`;
  }

  return s;
}

export type ParsedMathBlock = {
  latex: string;
  example?: string;
};

function unescapeJsonFragment(value: string): string {
  return value.replace(/\\(.)/g, (match, char: string, index: number, full: string) => {
    const after = full.slice(index + 2);

    if (char === "t" && /^(imes|ext\{|heta|au|an\b|o\b|riangle|ag|ilde|op)/.test(after)) {
      return "\\t";
    }
    if (char === "f" && /^(rac\{|loor|orall)/.test(after)) {
      return "\\f";
    }
    if (char === "n" && /^(eq|u|abla|ewline|ot|earrow)/.test(after)) {
      return "\\n";
    }

    switch (char) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      case "\\":
        return "\\";
      case '"':
        return '"';
      default:
        return `\\${char}`;
    }
  });
}

/** Unwrap double-escaped JSON strings from AI output / storage. */
function unwrapMathJsonEnvelope(raw: string): string {
  let s = raw.trim();
  for (let i = 0; i < 3; i++) {
    const next = s.replace(/\\"/g, '"');
    if (next === s) break;
    s = next;
  }
  return s;
}

function extractJsonStringField(raw: string, field: string): string | undefined {
  const patterns = [
    new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`),
    new RegExp(`\\\\"${field}\\\\"\\s*:\\s*\\\\"((?:[^"\\\\]|\\\\.)*)\\\\"`),
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) return unescapeJsonFragment(match[1]);
  }

  const textMacro = new RegExp(`"?${field}"?\\s*:\\s*\\\\text\\{([^}]*)\\}`);
  const textMatch = raw.match(textMacro);
  if (textMatch) return textMatch[1];

  return undefined;
}

function parseMathJsonObject(raw: string): ParsedMathBlock | null {
  const attempts = [unwrapMathJsonEnvelope(raw), raw];

  for (const attempt of attempts) {
    if (!attempt.trim().startsWith("{")) continue;

    try {
      const parsed = JSON.parse(attempt) as Record<string, unknown>;
      const formula = parsed.formula ?? parsed.latex ?? parsed.math;
      if (typeof formula === "string") {
        const example =
          typeof parsed.example === "string"
            ? parsed.example
            : extractJsonStringField(attempt, "example");
        return { latex: normalizeMathLatex(formula), example };
      }
    } catch {
      const formula = extractJsonStringField(attempt, "formula");
      if (formula) {
        return {
          latex: normalizeMathLatex(formula),
          example: extractJsonStringField(attempt, "example"),
        };
      }
    }
  }

  return null;
}

export function looksLikeMathJson(content: string): boolean {
  const t = content.trim();
  return (
    t.startsWith("{") &&
    (t.includes('"formula"') ||
      t.includes('\\"formula\\"') ||
      t.includes('"latex"') ||
      t.includes('"math"'))
  );
}

/** AI sometimes nests { formula, example } inside math content instead of plain LaTeX. */
export function parseMathBlockContent(content: string): ParsedMathBlock {
  const trimmed = content.trim();

  if (trimmed.startsWith("{")) {
    const parsed = parseMathJsonObject(trimmed);
    if (parsed) return parsed;
  }

  return { latex: normalizeMathLatex(trimmed) };
}
