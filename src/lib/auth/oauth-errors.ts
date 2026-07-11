export function getOAuthErrorMessage(
  provider: "google" | "apple",
  message: string,
): string {
  const providerLabel = provider === "google" ? "Google" : "Apple";

  if (
    message.includes("provider is not enabled") ||
    message.includes("Unsupported provider")
  ) {
    return `${providerLabel} sign-in is not enabled in Supabase yet. Open Authentication → Providers in your Supabase dashboard, enable ${providerLabel}, and add your OAuth client credentials.`;
  }

  return message;
}
