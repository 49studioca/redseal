-- Blog / content-marketing system.
-- Rich text authored in the admin via TipTap (stored as sanitized HTML plus the
-- original TipTap JSON document), with full SEO metadata for 2026 search + AI
-- answer engines. Public reads are limited to published posts; all writes go
-- through the service role / admins.
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  -- Rendered, sanitized HTML used for public display.
  content_html TEXT NOT NULL DEFAULT '',
  -- Original TipTap ProseMirror document for lossless re-editing.
  content_json JSONB,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  -- SEO / SERP / AI answer-engine metadata.
  seo_title TEXT,
  seo_description TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  -- Optional trade scope: null = general Red Seal content for all trades.
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  trade_slug TEXT,
  trade_name TEXT,
  canonical_url TEXT,
  og_image_url TEXT,
  -- Optional FAQ block powers FAQPage structured data.
  faq JSONB NOT NULL DEFAULT '[]',
  author_name TEXT NOT NULL DEFAULT 'RedSealGuide Team',
  reading_minutes INT NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status_published ON blog_posts (status, published_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX idx_blog_posts_trade_slug ON blog_posts (trade_slug) WHERE trade_slug IS NOT NULL;

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) may read published posts.
CREATE POLICY "blog_posts_public_read_published" ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admins can read every post (drafts included).
CREATE POLICY "blog_posts_admin_read_all" ON blog_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- Admins can insert, update, and delete posts.
CREATE POLICY "blog_posts_admin_insert" ON blog_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "blog_posts_admin_update" ON blog_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "blog_posts_admin_delete" ON blog_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );
