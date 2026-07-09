-- Licensed reference PDFs (CEC, NPC, WHMIS) for open-book viewer
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'references',
  'references',
  true,
  524288000,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "references_public_read" ON storage.objects;
CREATE POLICY "references_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'references');
