-- Curated YouTube videos per RSOS block with post-video comprehension questions.

CREATE TABLE block_learning_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  block_id UUID NOT NULL REFERENCES rsos_blocks(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  channel_hint TEXT,
  search_query TEXT,
  topic_label TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  review_status review_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (block_id, youtube_id)
);

CREATE INDEX block_learning_videos_trade_block_idx
  ON block_learning_videos (trade_id, block_id, sort_order);

CREATE TABLE block_video_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES block_learning_videos(id) ON DELETE CASCADE,
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX block_video_questions_video_idx
  ON block_video_questions (video_id, sort_order);

CREATE TABLE block_video_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES block_learning_videos(id) ON DELETE CASCADE,
  questions_attempted INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, video_id)
);

CREATE TRIGGER block_learning_videos_updated_at
  BEFORE UPDATE ON block_learning_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER block_video_progress_updated_at
  BEFORE UPDATE ON block_video_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE block_learning_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_video_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_learning_videos_public_read" ON block_learning_videos
  FOR SELECT USING (review_status = 'approved');

CREATE POLICY "block_video_questions_public_read" ON block_video_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM block_learning_videos v
      WHERE v.id = video_id AND v.review_status = 'approved'
    )
  );

CREATE POLICY "block_video_progress_own" ON block_video_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_block_learning_videos" ON block_learning_videos
  FOR ALL USING (is_admin());

CREATE POLICY "admin_block_video_questions" ON block_video_questions
  FOR ALL USING (is_admin());
