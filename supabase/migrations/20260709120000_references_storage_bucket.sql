-- Licensed reference PDFs (CEC, NPC, WHMIS) for open-book viewer.
-- PRIVATE: clients never get the full file; the API serves rule-page excerpts only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'references',
  'references',
  false,
  524288000,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove any public-read policy from earlier setups.
DROP POLICY IF EXISTS "references_public_read" ON storage.objects;

-- Service role / backend uploads only (no anon/authenticated direct reads).
DROP POLICY IF EXISTS "references_service_all" ON storage.objects;
CREATE POLICY "references_service_all"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'references')
  WITH CHECK (bucket_id = 'references');
