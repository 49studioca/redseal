-- Track per-user word translation lookups for free-tier limits
CREATE TABLE translation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  context_key TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, word, target_language, context_key)
);

CREATE INDEX idx_translation_usage_user ON translation_usage (user_id);

ALTER TABLE translation_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translation_usage_own" ON translation_usage
  FOR ALL USING (auth.uid() = user_id);
