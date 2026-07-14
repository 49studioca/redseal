-- Semantic retrieval over reference_chunks for RAG-grounded content generation.
-- Called by the content generator to pull the most relevant code/reference
-- excerpts for a given RSOS block/task before writing lessons and questions.
CREATE OR REPLACE FUNCTION match_reference_chunks(
  query_embedding extensions.vector(1536),
  match_count INT DEFAULT 8,
  filter_doc_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  doc_id UUID,
  rule_number TEXT,
  section_title TEXT,
  content TEXT,
  page_number INT,
  code_version TEXT,
  similarity DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT
    rc.id,
    rc.doc_id,
    rc.rule_number,
    rc.section_title,
    rc.content,
    rc.page_number,
    rc.code_version,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM reference_chunks rc
  WHERE rc.embedding IS NOT NULL
    AND (filter_doc_ids IS NULL OR rc.doc_id = ANY (filter_doc_ids))
  ORDER BY rc.embedding <=> query_embedding
  LIMIT GREATEST(match_count, 1);
$$;

GRANT EXECUTE ON FUNCTION match_reference_chunks(extensions.vector, INT, UUID[])
  TO service_role, authenticated;
