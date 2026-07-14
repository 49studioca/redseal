-- Link blog posts to a specific Red Seal trade, or leave null for general
-- Red Seal / all-trades content.
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS trade_slug TEXT,
  ADD COLUMN IF NOT EXISTS trade_name TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_trade_slug
  ON blog_posts (trade_slug)
  WHERE trade_slug IS NOT NULL;
