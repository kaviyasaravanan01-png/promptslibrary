-- Add optional SEO fields to prompts
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS seo_title text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS seo_description text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_prompts_seo_title ON prompts USING btree (seo_title);
