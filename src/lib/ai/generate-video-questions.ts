import OpenAI from "openai";
import type { QuestionOption } from "@/types";
import type { DiscoveredBlockVideo } from "@/lib/ai/find-block-learning-videos";

const openrouter = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      timeout: 30_000,
      maxRetries: 1,
    })
  : null;

const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export type GeneratedVideoQuestion = {
  stem: string;
  options: QuestionOption[];
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
};

function mockQuestions(video: DiscoveredBlockVideo): GeneratedVideoQuestion[] {
  return [
    {
      stem: `What is the main focus of "${video.title}"?`,
      options: [
        { key: "A", text: video.topicLabel },
        { key: "B", text: "Entertainment and music" },
        { key: "C", text: "Unrelated hobby content" },
        { key: "D", text: "General news headlines" },
      ],
      correct_option: "A",
      explanation: `This video covers ${video.topicLabel}. ${video.description ?? ""}`.trim(),
    },
    {
      stem: "Why is this topic important for your Red Seal exam prep?",
      options: [
        { key: "A", text: "It aligns with RSOS block skills you will be tested on" },
        { key: "B", text: "It replaces all code book study" },
        { key: "C", text: "It is optional entertainment only" },
        { key: "D", text: "It covers US-only standards exclusively" },
      ],
      correct_option: "A",
      explanation:
        "Block videos reinforce practical skills and concepts from the RSOS occupational standard.",
    },
  ];
}

export async function generateVideoComprehensionQuestions(input: {
  tradeName: string;
  tradeCode: string;
  blockName: string;
  blockCode: string;
  video: DiscoveredBlockVideo;
  questionCount?: number;
}): Promise<GeneratedVideoQuestion[]> {
  const count = input.questionCount ?? 3;
  if (!openrouter) return mockQuestions(input.video);

  const systemPrompt = `You write short comprehension checks for Canadian Red Seal apprentices AFTER they watch a training video.
Questions must test whether they understood key trade concepts from the video topic — not trivia about the YouTube channel.

Return JSON only:
{
  "questions": [
    {
      "stem": "clear question about the skill or concept",
      "options": [
        {"key":"A","text":"..."},
        {"key":"B","text":"..."},
        {"key":"C","text":"..."},
        {"key":"D","text":"..."}
      ],
      "correct_option": "B",
      "explanation": "why the answer is correct and what to remember on the job/exam"
    }
  ]
}

Rules:
- Generate exactly ${count} questions
- Focus on safety, procedure, code application, troubleshooting, or best practices relevant to the topic
- Use Canadian trade standards — never US NEC/IPC unless comparing differences
- Distractors must be plausible apprentice mistakes
- Keep stems under 200 characters; options concise
- Do NOT ask "what is the video title" or meta questions about YouTube`;

  const userPrompt = `Trade: ${input.tradeName} (${input.tradeCode})
Block ${input.blockCode}: ${input.blockName}
Video topic: ${input.video.topicLabel}
Video title: ${input.video.title}
Video description: ${input.video.description ?? "N/A"}
Learning goal: ${input.video.searchQuery}`;

  try {
    const response = await openrouter.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return mockQuestions(input.video);

    const parsed = JSON.parse(content) as {
      questions?: GeneratedVideoQuestion[];
    };

    const questions = (parsed.questions ?? [])
      .filter(
        (q) =>
          q.stem &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.correct_option &&
          q.explanation,
      )
      .slice(0, count);

    return questions.length >= 2 ? questions : mockQuestions(input.video);
  } catch {
    return mockQuestions(input.video);
  }
}

export async function generateQuestionsForVideos(input: {
  tradeName: string;
  tradeCode: string;
  blockName: string;
  blockCode: string;
  videos: DiscoveredBlockVideo[];
  questionsPerVideo?: number;
}): Promise<Map<string, GeneratedVideoQuestion[]>> {
  const map = new Map<string, GeneratedVideoQuestion[]>();
  for (const video of input.videos) {
    const questions = await generateVideoComprehensionQuestions({
      tradeName: input.tradeName,
      tradeCode: input.tradeCode,
      blockName: input.blockName,
      blockCode: input.blockCode,
      video,
      questionCount: input.questionsPerVideo ?? 3,
    });
    map.set(video.youtubeId, questions);
  }
  return map;
}
