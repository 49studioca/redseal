-- Per-task lessons within an RSOS block (e.g. 442A Block B → B-7 … B-15)
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS chapter_task_code TEXT;

CREATE INDEX IF NOT EXISTS lessons_block_task_idx
  ON lessons (block_id, chapter_task_code);
