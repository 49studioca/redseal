-- Break RLS recursion: org_members self-references and admin policies query profiles
-- (which triggers instructor policies that join org_members again).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_instructor(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'instructor')
  );
$$;

CREATE OR REPLACE FUNCTION public.shares_org_with_instructor(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM org_members instructor
    JOIN org_members apprentice ON instructor.org_id = apprentice.org_id
    WHERE instructor.user_id = auth.uid()
      AND instructor.role IN ('owner', 'instructor')
      AND apprentice.user_id = p_user_id
  );
$$;

DROP POLICY IF EXISTS "org_members_read" ON org_members;
CREATE POLICY "org_members_read" ON org_members FOR SELECT
  USING (auth.uid() = user_id OR is_org_instructor(org_id));

DROP POLICY IF EXISTS "orgs_read_member" ON organizations;
CREATE POLICY "orgs_read_member" ON organizations FOR SELECT
  USING (is_org_member(id));

DROP POLICY IF EXISTS "instructor_read_profiles" ON profiles;
CREATE POLICY "instructor_read_profiles" ON profiles FOR SELECT
  USING (auth.uid() = id OR shares_org_with_instructor(id));

DROP POLICY IF EXISTS "instructor_read_mastery" ON subtask_mastery;
CREATE POLICY "instructor_read_mastery" ON subtask_mastery FOR SELECT
  USING (auth.uid() = user_id OR shares_org_with_instructor(user_id));

DROP POLICY IF EXISTS "instructor_read_exams" ON exam_attempts;
CREATE POLICY "instructor_read_exams" ON exam_attempts FOR SELECT
  USING (auth.uid() = user_id OR shares_org_with_instructor(user_id));

DROP POLICY IF EXISTS "admin_all_lessons" ON lessons;
CREATE POLICY "admin_all_lessons" ON lessons FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_all_questions" ON questions;
CREATE POLICY "admin_all_questions" ON questions FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_all_flashcards" ON flashcards;
CREATE POLICY "admin_all_flashcards" ON flashcards FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_generation_jobs" ON generation_jobs;
CREATE POLICY "admin_generation_jobs" ON generation_jobs FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_trade_profiles" ON trade_generation_profiles;
CREATE POLICY "admin_trade_profiles" ON trade_generation_profiles FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_reference_docs" ON reference_docs;
CREATE POLICY "admin_reference_docs" ON reference_docs FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_reference_chunks" ON reference_chunks;
CREATE POLICY "admin_reference_chunks" ON reference_chunks FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_reports" ON question_reports;
CREATE POLICY "admin_reports" ON question_reports FOR ALL USING (is_admin());
