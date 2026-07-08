-- Province-specific content variants (NULL = national Red Seal baseline)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS province TEXT;

CREATE INDEX IF NOT EXISTS lessons_trade_province_idx
  ON lessons (trade_id, province);

CREATE INDEX IF NOT EXISTS questions_trade_province_idx
  ON questions (trade_id, province);

CREATE INDEX IF NOT EXISTS flashcards_trade_province_idx
  ON flashcards (trade_id, province);
