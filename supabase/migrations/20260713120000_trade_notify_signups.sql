-- Lead capture for "coming soon" (draft) trades. Visitors leave an email or
-- phone so we can notify them when the trade goes live. Anonymous submissions
-- are allowed; user_id is attached when the visitor is signed in.
CREATE TABLE trade_notify_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_slug TEXT NOT NULL,
  trade_code TEXT NOT NULL,
  trade_name TEXT,
  province TEXT,
  email TEXT,
  phone TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trade_notify_contact_present CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  )
);

CREATE INDEX idx_trade_notify_trade ON trade_notify_signups (trade_slug);
CREATE INDEX idx_trade_notify_created ON trade_notify_signups (created_at DESC);

-- Writes go through the service role (public lead form), which bypasses RLS.
-- Enable RLS so no anonymous client can read the collected contact list.
ALTER TABLE trade_notify_signups ENABLE ROW LEVEL SECURITY;

-- Signed-in users may see the signups tied to their own account.
CREATE POLICY "trade_notify_select_own" ON trade_notify_signups
  FOR SELECT
  USING (auth.uid() = user_id);
