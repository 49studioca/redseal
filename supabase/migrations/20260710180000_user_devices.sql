-- Track logged-in devices per user (max 2 enforced in application layer)
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Unknown device',
  user_agent TEXT,
  session_id UUID,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, device_token)
);

CREATE INDEX user_devices_user_id_idx ON user_devices(user_id);
CREATE INDEX user_devices_last_seen_idx ON user_devices(user_id, last_seen_at DESC);

ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_devices_select_own" ON user_devices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_devices_insert_own" ON user_devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_devices_update_own" ON user_devices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_devices_delete_own" ON user_devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- Revoke a specific auth session when a device is removed (service role only)
CREATE OR REPLACE FUNCTION public.revoke_user_session(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  IF p_session_id IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM auth.refresh_tokens
  WHERE session_id = p_session_id AND user_id = p_user_id;

  DELETE FROM auth.sessions
  WHERE id = p_session_id AND user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_user_session(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_user_session(UUID, UUID) TO service_role;
