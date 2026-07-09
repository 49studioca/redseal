CREATE TABLE lesson_media_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  block_index INT NOT NULL CHECK (block_index >= 0),
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_src TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX lesson_media_reports_lesson_id_idx ON lesson_media_reports (lesson_id);
CREATE INDEX lesson_media_reports_status_idx ON lesson_media_reports (status);

ALTER TABLE lesson_media_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_media_reports_insert" ON lesson_media_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lesson_media_reports_own_read" ON lesson_media_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_lesson_media_reports" ON lesson_media_reports
  FOR ALL USING (is_admin());
