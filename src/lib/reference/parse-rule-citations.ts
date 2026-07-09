export type TextSegment =
  | { type: "text"; content: string }
  | { type: "rule"; content: string; ruleNumber: string };

const RULE_CITATION_RE =
  /(?:CEC\s+)?Rule\s+(\d+(?:-\d+)?(?:\(\d+\))*(?:\([a-z]\))*)/gi;

export function textHasRuleCitations(text: string): boolean {
  RULE_CITATION_RE.lastIndex = 0;
  return RULE_CITATION_RE.test(text);
}

export function parseRuleCitations(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const re = new RegExp(RULE_CITATION_RE.source, "gi");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: "rule",
      content: match[0],
      ruleNumber: match[1],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", content: text }];
}
