-- Preserve the RSOS task behind each generated question so learning progress
-- can be diagnosed below the broad block level.
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS chapter_task_code TEXT;

CREATE INDEX IF NOT EXISTS questions_trade_block_task_idx
  ON questions (trade_id, block_id, chapter_task_code);

CREATE TABLE IF NOT EXISTS task_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  block_id UUID NOT NULL REFERENCES rsos_blocks(id) ON DELETE CASCADE,
  chapter_task_code TEXT NOT NULL,
  mastery_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  questions_attempted INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  mistake_patterns JSONB NOT NULL DEFAULT '[]',
  UNIQUE(user_id, trade_id, block_id, chapter_task_code)
);

CREATE INDEX IF NOT EXISTS task_mastery_user_trade_idx
  ON task_mastery (user_id, trade_id, chapter_task_code);

ALTER TABLE task_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_mastery_own" ON task_mastery;
CREATE POLICY "task_mastery_own" ON task_mastery
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
