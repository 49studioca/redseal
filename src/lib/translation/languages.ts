export type LanguageOption = {
  code: string;
  label: string;
  nativeLabel: string;
};

export const TRANSLATION_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "tl", label: "Tagalog", nativeLabel: "Tagalog" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "fa", label: "Persian", nativeLabel: "فارسی" },
  { code: "zh", label: "Mandarin", nativeLabel: "中文" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt" },
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська" },
];

export function getLanguageLabel(code: string): string {
  return (
    TRANSLATION_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase()
  );
}

export function getLanguageNativeLabel(code: string): string {
  return (
    TRANSLATION_LANGUAGES.find((l) => l.code === code)?.nativeLabel ??
    getLanguageLabel(code)
  );
}
