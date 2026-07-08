-- Fix block_mastery RLS so inserts are allowed for the owning user
DROP POLICY IF EXISTS "block_mastery_own" ON block_mastery;

CREATE POLICY "block_mastery_own" ON block_mastery
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
