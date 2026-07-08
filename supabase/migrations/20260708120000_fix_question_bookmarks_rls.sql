-- Fix question_bookmarks RLS so inserts are allowed for the owning user
DROP POLICY IF EXISTS "bookmarks_own" ON question_bookmarks;

CREATE POLICY "bookmarks_own" ON question_bookmarks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
