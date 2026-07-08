-- Fix flashcard_reviews RLS so inserts are allowed for the owning user
DROP POLICY IF EXISTS "flashcard_reviews_own" ON flashcard_reviews;

CREATE POLICY "flashcard_reviews_own" ON flashcard_reviews
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
