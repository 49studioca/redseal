CREATE TABLE block_media_overrides (
  media_key TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  video_youtube_id TEXT,
  video_title TEXT,
  image_src TEXT,
  image_alt TEXT,
  image_caption TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (media_key, media_type),
  CONSTRAINT block_media_overrides_video_fields CHECK (
    media_type <> 'video'
    OR (video_youtube_id IS NOT NULL AND video_title IS NOT NULL)
  ),
  CONSTRAINT block_media_overrides_image_fields CHECK (
    media_type <> 'image'
    OR (image_src IS NOT NULL AND image_alt IS NOT NULL)
  )
);

CREATE INDEX block_media_overrides_media_key_idx ON block_media_overrides (media_key);

ALTER TABLE block_media_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_media_overrides_read" ON block_media_overrides
  FOR SELECT USING (true);

CREATE POLICY "admin_block_media_overrides" ON block_media_overrides
  FOR ALL USING (is_admin());
