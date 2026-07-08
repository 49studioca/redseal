-- Fix saved_words RLS so inserts are allowed for the owning user
DROP POLICY IF EXISTS "saved_words_own" ON saved_words;

CREATE POLICY "saved_words_own" ON saved_words
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
