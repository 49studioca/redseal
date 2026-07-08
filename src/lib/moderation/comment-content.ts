export type ModerationResult =
  | { ok: true }
  | { ok: false; message: string };

const MAX_COMMENT_LENGTH = 500;
const MIN_COMMENT_LENGTH = 3;

/** Normalize text for pattern matching (lowercase, leetspeak, whitespace). */
function normalizeForScan(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/\s+/g, " ")
    .trim();
}

const EMAIL_PATTERN =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;

const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/;

const URL_PATTERN =
  /\b(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+\.(?:com|net|org|ca|io|co|me|app|link|xyz|info|biz)\b/i;

const SOCIAL_HANDLE_PATTERN =
  /\B@[A-Za-z0-9_]{3,32}\b/;

const CONTACT_PHRASES = [
  "call me",
  "text me",
  "email me",
  "my number",
  "my phone",
  "my email",
  "contact me",
  "reach me",
  "whatsapp",
  "telegram",
  "discord.gg",
  "snapchat",
  "instagram",
  "add me on",
  "dm me",
  "message me on",
];

const FORBIDDEN_WORDS = [
  "fuck",
  "fucking",
  "fucker",
  "shit",
  "shitty",
  "bitch",
  "bastard",
  "asshole",
  "dick",
  "pussy",
  "cunt",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "retarded",
];

function containsForbiddenWord(normalized: string): boolean {
  const padded = ` ${normalized} `;
  return FORBIDDEN_WORDS.some((word) => {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    return re.test(padded);
  });
}

function containsContactPhrase(normalized: string): boolean {
  return CONTACT_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function validateDiscussionComment(text: string): ModerationResult {
  const trimmed = text.trim();

  if (trimmed.length < MIN_COMMENT_LENGTH) {
    return {
      ok: false,
      message: "Comment is too short.",
    };
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return {
      ok: false,
      message: `Comment must be ${MAX_COMMENT_LENGTH} characters or less.`,
    };
  }

  const normalized = normalizeForScan(trimmed);

  if (EMAIL_PATTERN.test(trimmed)) {
    return {
      ok: false,
      message: "Please do not share email addresses in comments.",
    };
  }

  if (PHONE_PATTERN.test(trimmed)) {
    return {
      ok: false,
      message: "Please do not share phone numbers in comments.",
    };
  }

  if (URL_PATTERN.test(trimmed)) {
    return {
      ok: false,
      message: "Please do not share links or website addresses in comments.",
    };
  }

  if (SOCIAL_HANDLE_PATTERN.test(trimmed)) {
    return {
      ok: false,
      message: "Please do not share social media handles in comments.",
    };
  }

  if (containsContactPhrase(normalized)) {
    return {
      ok: false,
      message:
        "Please do not share contact information. Keep comments about the question only.",
    };
  }

  if (containsForbiddenWord(normalized)) {
    return {
      ok: false,
      message: "Your comment contains language that is not allowed.",
    };
  }

  return { ok: true };
}

export function validateReportDetails(text: string): ModerationResult {
  if (!text.trim()) return { ok: true };
  return validateDiscussionComment(text);
}
