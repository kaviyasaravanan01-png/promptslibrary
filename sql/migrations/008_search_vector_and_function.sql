-- Create a tsvector index for full-text search and a helper RPC
-- Add a functional index on concatenated searchable fields
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_prompts_search_vector') THEN
    CREATE INDEX idx_prompts_search_vector ON prompts USING GIN (
      to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(prompt_text,''))
    );
  END IF;
END $$;

-- RPC to perform full-text search with simple ranking; returns prompts
CREATE OR REPLACE FUNCTION search_prompts(p_query text, p_limit integer DEFAULT 24, p_offset integer DEFAULT 0)
RETURNS SETOF prompts AS $$
  -- Split query into keywords, require all to match (AND logic)
  WITH keywords AS (
    SELECT unnest(string_to_array(trim(p_query), ' ')) AS kw
    WHERE p_query IS NOT NULL AND trim(p_query) <> ''
  )
  SELECT p.* FROM prompts p
  WHERE p.status = 'approved'
    AND (
      (p_query IS NULL OR trim(p_query) = '')
      OR NOT EXISTS (SELECT 1 FROM keywords) -- no keywords, match all
      OR (
        SELECT bool_and(
          (
            to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce(p.prompt_text,'')) @@ plainto_tsquery('english', kw)
            OR coalesce(p.title,'') ILIKE '%' || kw || '%'
            OR coalesce(p.description,'') ILIKE '%' || kw || '%'
            OR coalesce(p.prompt_text,'') ILIKE '%' || kw || '%'
          )
        ) FROM keywords
      )
    )
  ORDER BY
    CASE
      WHEN (p_query IS NULL OR trim(p_query) = '') THEN 0.0
      ELSE ts_rank(to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce(p.prompt_text,'')), plainto_tsquery('english', p_query))
    END DESC,
    p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE SQL STABLE;
