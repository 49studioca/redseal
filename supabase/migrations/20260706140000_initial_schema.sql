-- RedSealGuide initial schema
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Enums
CREATE TYPE question_type AS ENUM ('recall', 'application', 'critical');
CREATE TYPE review_status AS ENUM ('draft', 'approved', 'rejected', 'deprecated');
CREATE TYPE generation_job_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE exam_attempt_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro_trade', 'pro_all', 'org_seat');
CREATE TYPE org_role AS ENUM ('owner', 'instructor', 'member');
CREATE TYPE report_status AS ENUM ('open', 'triaged', 'resolved', 'dismissed');

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🔧',
  exam_question_count INT NOT NULL DEFAULT 120,
  exam_time_minutes INT NOT NULL DEFAULT 240,
  pass_percentage INT NOT NULL DEFAULT 70,
  recall_ratio_min NUMERIC(4,3) NOT NULL DEFAULT 0.15,
  recall_ratio_max NUMERIC(4,3) NOT NULL DEFAULT 0.25,
  application_ratio_min NUMERIC(4,3) NOT NULL DEFAULT 0.60,
  application_ratio_max NUMERIC(4,3) NOT NULL DEFAULT 0.70,
  critical_ratio_min NUMERIC(4,3) NOT NULL DEFAULT 0.10,
  critical_ratio_max NUMERIC(4,3) NOT NULL DEFAULT 0.20,
  is_open_book BOOLEAN NOT NULL DEFAULT FALSE,
  reference_doc_types TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('live', 'coming_soon', 'beta')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RSOS taxonomy
CREATE TABLE rsos_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  exam_question_count INT NOT NULL DEFAULT 0,
  exam_percentage NUMERIC(5,2),
  UNIQUE(trade_id, code)
);

CREATE TABLE rsos_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES rsos_blocks(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  exam_question_count INT NOT NULL DEFAULT 0,
  UNIQUE(block_id, code)
);

CREATE TABLE rsos_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES rsos_tasks(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(task_id, code)
);

-- Trade generation profiles
CREATE TABLE trade_generation_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL UNIQUE REFERENCES trades(id) ON DELETE CASCADE,
  glossary JSONB NOT NULL DEFAULT '{}',
  code_standards TEXT[] NOT NULL DEFAULT '{}',
  calculation_templates JSONB NOT NULL DEFAULT '[]',
  diagram_style TEXT,
  distractor_patterns JSONB NOT NULL DEFAULT '[]',
  system_prompt_suffix TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reference documents for RAG + open-book viewer
CREATE TABLE reference_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  code_version TEXT NOT NULL,
  storage_path TEXT,
  is_licensed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reference_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES reference_docs(id) ON DELETE CASCADE,
  rule_number TEXT,
  section_title TEXT,
  content TEXT NOT NULL,
  page_number INT,
  code_version TEXT NOT NULL,
  embedding extensions.vector(1536),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reference_chunks_embedding_idx ON reference_chunks
  USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES rsos_subtasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content_blocks JSONB NOT NULL DEFAULT '[]',
  audio_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  code_version TEXT,
  review_status review_status NOT NULL DEFAULT 'draft',
  estimated_minutes INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trade_id, slug)
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES rsos_subtasks(id) ON DELETE SET NULL,
  block_id UUID REFERENCES rsos_blocks(id) ON DELETE SET NULL,
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  code_citations JSONB NOT NULL DEFAULT '[]',
  question_type question_type NOT NULL DEFAULT 'application',
  difficulty INT NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  code_version TEXT,
  media_urls JSONB NOT NULL DEFAULT '[]',
  requires_reference BOOLEAN NOT NULL DEFAULT FALSE,
  review_status review_status NOT NULL DEFAULT 'draft',
  generation_job_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- options JSONB shape: [{ key: "A", text: "...", distractor_rationale: "..." }, ...]

CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  subtask_id UUID REFERENCES rsos_subtasks(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  code_version TEXT,
  review_status review_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mock_exam_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL UNIQUE REFERENCES trades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  question_count INT NOT NULL,
  time_minutes INT NOT NULL DEFAULT 240,
  block_distribution JSONB NOT NULL,
  type_distribution JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  selected_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  exam_date DATE,
  province TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizations (B2B)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seat_count INT NOT NULL DEFAULT 0,
  seats_used INT NOT NULL DEFAULT 0,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'member',
  invited_email TEXT,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Progress & attempts
CREATE TABLE subtask_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subtask_id UUID NOT NULL REFERENCES rsos_subtasks(id) ON DELETE CASCADE,
  mastery_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  questions_attempted INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  mistake_patterns JSONB NOT NULL DEFAULT '[]',
  UNIQUE(user_id, subtask_id)
);

CREATE TABLE block_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  block_id UUID NOT NULL REFERENCES rsos_blocks(id) ON DELETE CASCADE,
  mastery_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  questions_attempted INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, block_id)
);

CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  filters JSONB NOT NULL DEFAULT '{}',
  question_ids UUID[] NOT NULL DEFAULT '{}',
  current_index INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  template_id UUID REFERENCES mock_exam_templates(id) ON DELETE SET NULL,
  status exam_attempt_status NOT NULL DEFAULT 'in_progress',
  question_ids UUID[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_limit_minutes INT NOT NULL DEFAULT 240,
  score NUMERIC(5,2),
  passed BOOLEAN,
  block_scores JSONB,
  type_scores JSONB
);

CREATE TABLE attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  time_spent_seconds INT,
  answered_at TIMESTAMPTZ,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE question_bookmarks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

CREATE TABLE question_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES question_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.5,
  interval_days INT NOT NULL DEFAULT 0,
  repetitions INT NOT NULL DEFAULT 0,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_review_at TIMESTAMPTZ,
  last_quality INT,
  UNIQUE(user_id, flashcard_id)
);

CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  diagnostic_score NUMERIC(5,2),
  weak_block_ids UUID[] NOT NULL DEFAULT '{}',
  lesson_order UUID[] NOT NULL DEFAULT '{}',
  target_exam_date DATE,
  readiness_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, trade_id)
);

CREATE TABLE diagnostic_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  question_ids UUID[] NOT NULL DEFAULT '{}',
  answers JSONB NOT NULL DEFAULT '{}',
  score NUMERIC(5,2),
  block_scores JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status generation_job_status NOT NULL DEFAULT 'pending',
  input_params JSONB NOT NULL DEFAULT '{}',
  output_refs JSONB NOT NULL DEFAULT '[]',
  retrieved_chunks JSONB NOT NULL DEFAULT '[]',
  model TEXT,
  token_count INT,
  cost_cents INT,
  error_message TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE questions ADD CONSTRAINT fk_generation_job
  FOREIGN KEY (generation_job_id) REFERENCES generation_jobs(id) ON DELETE SET NULL;

-- Provincial SEO content
CREATE TABLE provincial_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  province_code TEXT NOT NULL,
  province_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  apprenticeship_hours INT,
  prerequisites TEXT,
  code_adoption TEXT,
  exam_info TEXT,
  meta_description TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(trade_id, province_code)
);

-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER study_plans_updated_at BEFORE UPDATE ON study_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsos_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsos_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsos_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_generation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtask_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provincial_guides ENABLE ROW LEVEL SECURITY;

-- Public read for published content
CREATE POLICY "trades_public_read" ON trades FOR SELECT USING (true);
CREATE POLICY "rsos_public_read" ON rsos_blocks FOR SELECT USING (true);
CREATE POLICY "rsos_tasks_public_read" ON rsos_tasks FOR SELECT USING (true);
CREATE POLICY "rsos_subtasks_public_read" ON rsos_subtasks FOR SELECT USING (true);
CREATE POLICY "lessons_public_read" ON lessons FOR SELECT USING (review_status = 'approved');
CREATE POLICY "questions_public_read" ON questions FOR SELECT USING (review_status = 'approved');
CREATE POLICY "flashcards_public_read" ON flashcards FOR SELECT USING (review_status = 'approved');
CREATE POLICY "mock_templates_public_read" ON mock_exam_templates FOR SELECT USING (true);
CREATE POLICY "provincial_guides_public_read" ON provincial_guides FOR SELECT USING (published = true);
CREATE POLICY "reference_docs_public_read" ON reference_docs FOR SELECT USING (true);
CREATE POLICY "reference_chunks_public_read" ON reference_chunks FOR SELECT USING (true);

-- Profiles: users manage own
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User-owned data
CREATE POLICY "mastery_own" ON subtask_mastery FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "block_mastery_own" ON block_mastery FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "practice_own" ON practice_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "exam_attempts_own" ON exam_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "attempt_answers_own" ON attempt_answers FOR ALL
  USING (EXISTS (SELECT 1 FROM exam_attempts ea WHERE ea.id = attempt_id AND ea.user_id = auth.uid()));
CREATE POLICY "bookmarks_own" ON question_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "comments_read" ON question_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON question_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON question_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reports_insert" ON question_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_own_read" ON question_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "flashcard_reviews_own" ON flashcard_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "study_plans_own" ON study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "diagnostic_own" ON diagnostic_attempts FOR ALL USING (auth.uid() = user_id);

-- Org policies
CREATE POLICY "org_members_read" ON org_members FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM org_members om WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'instructor')
  ));
CREATE POLICY "orgs_read_member" ON organizations FOR SELECT
  USING (EXISTS (SELECT 1 FROM org_members om WHERE om.org_id = organizations.id AND om.user_id = auth.uid()));

-- Admin policies (using is_admin on profile)
CREATE POLICY "admin_all_lessons" ON lessons FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "admin_all_questions" ON questions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "admin_all_flashcards" ON flashcards FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "admin_generation_jobs" ON generation_jobs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "admin_trade_profiles" ON trade_generation_profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "admin_reference_docs" ON reference_docs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "admin_reference_chunks" ON reference_chunks FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY "admin_reports" ON question_reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Instructor can read org member progress
CREATE POLICY "instructor_read_profiles" ON profiles FOR SELECT
  USING (
    auth.uid() = id OR EXISTS (
      SELECT 1 FROM org_members instructor
      JOIN org_members apprentice ON instructor.org_id = apprentice.org_id
      WHERE instructor.user_id = auth.uid()
        AND instructor.role IN ('owner', 'instructor')
        AND apprentice.user_id = profiles.id
    )
  );
CREATE POLICY "instructor_read_mastery" ON subtask_mastery FOR SELECT
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM org_members instructor
      JOIN org_members apprentice ON instructor.org_id = apprentice.org_id
      WHERE instructor.user_id = auth.uid()
        AND instructor.role IN ('owner', 'instructor')
        AND apprentice.user_id = subtask_mastery.user_id
    )
  );
CREATE POLICY "instructor_read_exams" ON exam_attempts FOR SELECT
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM org_members instructor
      JOIN org_members apprentice ON instructor.org_id = apprentice.org_id
      WHERE instructor.user_id = auth.uid()
        AND instructor.role IN ('owner', 'instructor')
        AND apprentice.user_id = exam_attempts.user_id
    )
  );
