-- Migration: Add reviews table and trusted tag to prompts

-- 1. Add 'trusted' boolean column to prompts
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS trusted boolean DEFAULT false;

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating numeric(2,1) CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (prompt_id, user_id)
);

-- 3. Only allow reviews from users who purchased the prompt (enforced in API, not DB)
-- 4. Add index for fast lookup
CREATE INDEX IF NOT EXISTS idx_reviews_prompt_id ON reviews(prompt_id);

-- 5. Add function to get average rating and review count for a prompt
CREATE OR REPLACE FUNCTION get_prompt_review_stats(p_prompt_id uuid)
RETURNS TABLE(avg_rating numeric, review_count integer) AS $$
  SELECT COALESCE(AVG(rating),0), COUNT(*) FROM reviews WHERE prompt_id = p_prompt_id;
$$ LANGUAGE SQL STABLE;
