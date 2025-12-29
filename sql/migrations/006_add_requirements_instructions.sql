-- Add optional requirements and instructions arrays to prompts
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS requirements text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS instructions text[] DEFAULT '{}'::text[];

-- Allow these to be nullable (they default to empty array) and index if needed later
CREATE INDEX IF NOT EXISTS idx_prompts_requirements_gin ON prompts USING GIN (requirements);
CREATE INDEX IF NOT EXISTS idx_prompts_instructions_gin ON prompts USING GIN (instructions);
