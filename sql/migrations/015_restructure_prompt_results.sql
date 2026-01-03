-- Migration: 015_restructure_prompt_results
-- Add prompt_template column and restructure result storage
-- Results now store: {id, name, type, prompt, url/path, is_public_link}

ALTER TABLE prompts ADD COLUMN IF NOT EXISTS prompt_template TEXT;

-- Create a new results table for normalized storage
CREATE TABLE IF NOT EXISTS prompt_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'result_video', 'tutorial_video', 'video_link')),
  prompt_description TEXT,
  url TEXT NOT NULL,
  is_public_link BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_results_prompt_id ON prompt_results(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_results_type ON prompt_results(type);
CREATE INDEX IF NOT EXISTS idx_prompt_results_display_order ON prompt_results(display_order);

-- Add RLS policies
ALTER TABLE prompt_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read prompt results"
  ON prompt_results FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own prompt results"
  ON prompt_results FOR INSERT
  WITH CHECK (
    prompt_id IN (
      SELECT id FROM prompts WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own prompt results"
  ON prompt_results FOR UPDATE
  USING (prompt_id IN (SELECT id FROM prompts WHERE created_by = auth.uid()))
  WITH CHECK (prompt_id IN (SELECT id FROM prompts WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete their own prompt results"
  ON prompt_results FOR DELETE
  USING (prompt_id IN (SELECT id FROM prompts WHERE created_by = auth.uid()));

-- Optional: Create a view that returns results in a nested JSONB structure for backward compatibility
CREATE OR REPLACE VIEW prompt_results_nested AS
SELECT 
  p.id,
  p.slug,
  p.title,
  p.prompt_template,
  p.result_urls,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', pr.id,
        'name', pr.name,
        'type', pr.type,
        'prompt', pr.prompt_description,
        'url', pr.url,
        'is_public_link', pr.is_public_link,
        'display_order', pr.display_order
      ) ORDER BY pr.display_order
    ) FILTER (WHERE pr.id IS NOT NULL),
    '[]'::jsonb
  ) AS results
FROM prompts p
LEFT JOIN prompt_results pr ON pr.prompt_id = p.id
GROUP BY p.id, p.slug, p.title, p.prompt_template, p.result_urls;
