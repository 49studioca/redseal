-- Link lessons to RSOS exam blocks
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS block_id UUID REFERENCES rsos_blocks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS lessons_block_id_idx ON lessons(block_id);
