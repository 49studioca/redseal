import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionOption, ReviewStatus } from "@/types";
import {
  discoverBlockLearningVideos,
  type DiscoveredBlockVideo,
} from "@/lib/ai/find-block-learning-videos";
import { generateQuestionsForVideos } from "@/lib/ai/generate-video-questions";
import type { RsosChapterTask } from "@/types";
import { resolveBlockId, resolveTradeId } from "@/lib/content/persist-generated";
import { cleanYoutubeTitle } from "@/lib/youtube/title";

export type BlockLearningVideo = {
  id: string;
  trade_id: string;
  block_id: string;
  youtube_id: string;
  title: string;
  description?: string | null;
  channel_hint?: string | null;
  search_query?: string | null;
  topic_label?: string | null;
  sort_order: number;
  review_status: ReviewStatus;
};

export type BlockVideoQuestion = {
  id: string;
  video_id: string;
  stem: string;
  options: QuestionOption[];
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  sort_order: number;
};

export type BlockVideoWithQuestions = BlockLearningVideo & {
  questions: BlockVideoQuestion[];
  progress?: {
    completed: boolean;
    questions_correct: number;
    questions_attempted: number;
  };
};

export async function generateAndPersistBlockVideos(
  supabase: SupabaseClient,
  input: {
    tradeCode: string;
    tradeName: string;
    tradeId: string;
    blockCode: string;
    blockName: string;
    blockId: string;
    chapterTasks: RsosChapterTask[];
    adminUserId?: string;
    videoCount?: number;
  },
) {
  const videos = await discoverBlockLearningVideos({
    tradeCode: input.tradeCode,
    tradeName: input.tradeName,
    blockCode: input.blockCode,
    blockName: input.blockName,
    chapterTasks: input.chapterTasks,
    maxVideos: input.videoCount,
  });

  const questionMap = await generateQuestionsForVideos({
    tradeName: input.tradeName,
    tradeCode: input.tradeCode,
    blockName: input.blockName,
    blockCode: input.blockCode,
    videos,
    questionsPerVideo: 3,
  });

  const dbTradeId = await resolveTradeId(supabase, input.tradeCode);
  const dbBlockId = await resolveBlockId(supabase, dbTradeId, input.blockCode);

  const { data: existing } = await supabase
    .from("block_learning_videos")
    .select("id")
    .eq("block_id", dbBlockId);

  const existingIds = (existing ?? []).map((row) => row.id as string);
  if (existingIds.length) {
    await supabase
      .from("block_video_questions")
      .delete()
      .in("video_id", existingIds);
    await supabase
      .from("block_learning_videos")
      .delete()
      .eq("block_id", dbBlockId);
  }

  const savedVideos: BlockLearningVideo[] = [];

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const { data: row, error } = await supabase
      .from("block_learning_videos")
      .insert({
        trade_id: dbTradeId,
        block_id: dbBlockId,
        youtube_id: video.youtubeId,
        title: cleanYoutubeTitle(video.title),
        description: video.description ?? null,
        search_query: video.searchQuery,
        topic_label: video.topicLabel,
        sort_order: i,
        review_status: "approved",
        generated_by: input.adminUserId ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;
    savedVideos.push(row as BlockLearningVideo);

    const questions = questionMap.get(video.youtubeId) ?? [];
    if (questions.length) {
      const { error: qError } = await supabase.from("block_video_questions").insert(
        questions.map((q, qi) => ({
          video_id: (row as BlockLearningVideo).id,
          stem: q.stem,
          options: q.options,
          correct_option: q.correct_option,
          explanation: q.explanation,
          sort_order: qi,
        })),
      );
      if (qError) throw qError;
    }
  }

  return {
    trade_id: dbTradeId,
    block_id: dbBlockId,
    videos: savedVideos,
    video_count: savedVideos.length,
    question_count: savedVideos.reduce(
      (sum, v) => sum + (questionMap.get(v.youtube_id)?.length ?? 0),
      0,
    ),
    discovered: videos.map((v: DiscoveredBlockVideo) => ({
      youtube_id: v.youtubeId,
      title: v.title,
      topic_label: v.topicLabel,
      search_query: v.searchQuery,
      relevance_score: v.relevanceScore,
    })),
  };
}

export async function fetchBlockVideosForTrade(
  supabase: SupabaseClient,
  tradeId: string,
  userId?: string,
): Promise<BlockVideoWithQuestions[]> {
  const { data: videos, error } = await supabase
    .from("block_learning_videos")
    .select("*")
    .eq("trade_id", tradeId)
    .eq("review_status", "approved")
    .order("sort_order");

  if (error) throw error;
  if (!videos?.length) return [];

  const videoIds = videos.map((v) => v.id as string);

  const { data: questions } = await supabase
    .from("block_video_questions")
    .select("*")
    .in("video_id", videoIds)
    .order("sort_order");

  let progressRows: {
    video_id: string;
    completed: boolean;
    questions_correct: number;
    questions_attempted: number;
  }[] = [];

  if (userId) {
    const { data: progress } = await supabase
      .from("block_video_progress")
      .select("video_id, completed, questions_correct, questions_attempted")
      .eq("user_id", userId)
      .in("video_id", videoIds);
    progressRows = (progress ?? []) as typeof progressRows;
  }

  const questionsByVideo = new Map<string, BlockVideoQuestion[]>();
  for (const q of questions ?? []) {
    const list = questionsByVideo.get(q.video_id as string) ?? [];
    list.push(q as BlockVideoQuestion);
    questionsByVideo.set(q.video_id as string, list);
  }

  const progressByVideo = new Map(progressRows.map((p) => [p.video_id, p]));

  return (videos as BlockLearningVideo[]).map((video) => ({
    ...video,
    questions: questionsByVideo.get(video.id) ?? [],
    progress: progressByVideo.get(video.id),
  }));
}

export async function fetchBlockVideoById(
  supabase: SupabaseClient,
  videoId: string,
  userId?: string,
): Promise<BlockVideoWithQuestions | null> {
  const { data: video, error } = await supabase
    .from("block_learning_videos")
    .select("*")
    .eq("id", videoId)
    .eq("review_status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!video) return null;

  const { data: questions } = await supabase
    .from("block_video_questions")
    .select("*")
    .eq("video_id", videoId)
    .order("sort_order");

  let progress: BlockVideoWithQuestions["progress"];
  if (userId) {
    const { data: row } = await supabase
      .from("block_video_progress")
      .select("completed, questions_correct, questions_attempted")
      .eq("user_id", userId)
      .eq("video_id", videoId)
      .maybeSingle();
    if (row) progress = row as BlockVideoWithQuestions["progress"];
  }

  return {
    ...(video as BlockLearningVideo),
    questions: (questions ?? []) as BlockVideoQuestion[],
    progress,
  };
}

export async function saveVideoProgress(
  supabase: SupabaseClient,
  input: {
    userId: string;
    videoId: string;
    questionsAttempted: number;
    questionsCorrect: number;
    completed: boolean;
  },
) {
  const { error } = await supabase.from("block_video_progress").upsert(
    {
      user_id: input.userId,
      video_id: input.videoId,
      questions_attempted: input.questionsAttempted,
      questions_correct: input.questionsCorrect,
      completed: input.completed,
      completed_at: input.completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,video_id" },
  );
  if (error) throw error;
}
