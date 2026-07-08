-- User language preference for AI translations
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en';

-- Shared cache so AI is not called again for the same word + context + language
CREATE TABLE translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'en',
  target_language TEXT NOT NULL,
  context_key TEXT NOT NULL DEFAULT '',
  translation TEXT NOT NULL,
  definition TEXT,
  context_explanation TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (word, source_language, target_language, context_key)
);

CREATE INDEX idx_translation_cache_lookup
  ON translation_cache (word, target_language, context_key);

-- Per-user saved words for review
CREATE TABLE saved_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'en',
  target_language TEXT NOT NULL,
  context_key TEXT NOT NULL DEFAULT '',
  translation TEXT,
  definition TEXT,
  context_explanation TEXT,
  context_snippet TEXT,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, word, target_language, context_key)
);

CREATE INDEX idx_saved_words_user ON saved_words (user_id, created_at DESC);

ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translation_cache_read" ON translation_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "translation_cache_insert" ON translation_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "saved_words_own" ON saved_words
  FOR ALL USING (auth.uid() = user_id);
