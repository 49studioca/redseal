export type QuestionType = "recall" | "application" | "critical";
export type ReviewStatus = "draft" | "approved" | "rejected" | "deprecated";

export interface QuestionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
  distractor_rationale?: string;
}

export interface CodeCitation {
  rule_number: string;
  section_title?: string;
  excerpt?: string;
  doc_id?: string;
}

export interface Trade {
  id: string;
  code: string;
  slug: string;
  name: string;
  short_name: string;
  icon: string;
  exam_question_count: number;
  exam_time_minutes: number;
  pass_percentage: number;
  is_open_book: boolean;
  reference_doc_types: string[];
  status: "live" | "coming_soon" | "beta";
  description?: string;
}

export interface TradeQuestionTypeBreakdown {
  type: QuestionType;
  label: string;
  range: string;
}

export interface TradeOfficialLink {
  label: string;
  href: string;
  description?: string;
}

export interface TradeDetailContent {
  trade_scope: string;
  red_seal_summary: string;
  noc_code?: string;
  designation_year?: number;
  designated_provinces?: string[];
  alternate_title?: string;
  question_type_breakdown?: TradeQuestionTypeBreakdown[];
  official_links: TradeOfficialLink[];
  exam_notes?: string[];
}

export interface RsosBlock {
  id: string;
  trade_id: string;
  code: string;
  name: string;
  sort_order: number;
  exam_question_count: number;
  exam_percentage?: number;
}

export interface RsosChapterTask {
  code: string;
  name: string;
  exam_question_count: number;
}

export interface Question {
  id: string;
  trade_id: string;
  subtask_id?: string;
  block_id?: string;
  stem: string;
  options: QuestionOption[];
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  code_citations: CodeCitation[];
  question_type: QuestionType;
  difficulty: number;
  code_version?: string;
  province?: string;
  requires_reference: boolean;
  review_status: ReviewStatus;
}

export interface Lesson {
  id: string;
  trade_id: string;
  block_id?: string;
  subtask_id?: string;
  title: string;
  slug: string;
  summary?: string;
  content_blocks: ContentBlock[];
  audio_url?: string;
  sort_order: number;
  code_version?: string;
  province?: string;
  review_status: ReviewStatus;
  estimated_minutes: number;
}

export interface ContentBlock {
  type: "text" | "heading" | "image" | "math" | "video" | "callout" | "check_question";
  content: string;
  meta?: Record<string, unknown>;
}

export interface Flashcard {
  id: string;
  trade_id: string;
  subtask_id?: string;
  front: string;
  back: string;
  province?: string;
  review_status: ReviewStatus;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  selected_trade_id?: string;
  subscription_tier: "free" | "pro_trade" | "pro_all" | "org_seat";
  exam_date?: string;
  province?: string;
  onboarding_completed: boolean;
  is_admin: boolean;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  trade_id: string;
  diagnostic_score?: number;
  weak_block_ids: string[];
  lesson_order: string[];
  readiness_score: number;
  target_exam_date?: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  trade_id: string;
  status: "in_progress" | "completed" | "abandoned";
  question_ids: string[];
  started_at: string;
  completed_at?: string;
  time_limit_minutes: number;
  score?: number;
  passed?: boolean;
  block_scores?: Record<string, number>;
}

export interface ReferenceChunk {
  id: string;
  doc_id: string;
  rule_number?: string;
  section_title?: string;
  content: string;
  page_number?: number;
  code_version: string;
}

export interface GenerationJob {
  id: string;
  trade_id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed";
  input_params: Record<string, unknown>;
  output_refs: unknown[];
  retrieved_chunks: unknown[];
  model?: string;
  created_at: string;
}

export interface ProvincialGuide {
  id: string;
  trade_id: string;
  province_code: string;
  province_name: string;
  slug: string;
  title: string;
  content: Record<string, unknown>;
  apprenticeship_hours?: number;
  prerequisites?: string;
  code_adoption?: string;
  exam_info?: string;
  meta_description?: string;
}
