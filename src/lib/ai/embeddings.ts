import OpenAI from "openai";

const OPENAI_EMBED_MODEL = "text-embedding-3-small";
const OPENROUTER_EMBED_MODEL =
  process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small";
const EMBEDDING_DIM = 1536;

function openaiClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key ? new OpenAI({ apiKey: key }) : null;
}

function openrouterClient(): OpenAI | null {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return key
    ? new OpenAI({
        apiKey: key,
        baseURL: "https://openrouter.ai/api/v1",
      })
    : null;
}

/** True when OpenAI or OpenRouter can produce real embeddings. */
export function hasEmbeddingProvider(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY?.trim() || process.env.OPENROUTER_API_KEY?.trim(),
  );
}

function mockEmbedding(text: string): number[] {
  return Array(EMBEDDING_DIM)
    .fill(0)
    .map((_, i) => Math.sin(i + text.length) * 0.1);
}

/**
 * Embed text for RAG / retrieval. Prefers OpenAI directly, then OpenRouter.
 * OPENROUTER_MODEL is a chat model — embeddings always use text-embedding-3-small
 * (1536 dims) so vectors stay compatible with reference_chunks.
 */
export async function embedText(
  text: string,
  options?: { allowMock?: boolean },
): Promise<number[]> {
  const input = text.slice(0, 7000);
  const openai = openaiClient();
  if (openai) {
    const response = await openai.embeddings.create({
      model: OPENAI_EMBED_MODEL,
      input,
    });
    return response.data[0]?.embedding ?? [];
  }

  const openrouter = openrouterClient();
  if (openrouter) {
    const response = await openrouter.embeddings.create({
      model: OPENROUTER_EMBED_MODEL,
      input,
      dimensions: EMBEDDING_DIM,
    });
    return response.data[0]?.embedding ?? [];
  }

  if (options?.allowMock !== false) {
    return mockEmbedding(input);
  }
  throw new Error(
    "No embeddings provider configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY.",
  );
}

/** Embed when a provider exists; otherwise null (for ingest scripts). */
export async function embedTextIfAvailable(text: string): Promise<number[] | null> {
  if (!hasEmbeddingProvider()) return null;
  return embedText(text, { allowMock: false });
}
