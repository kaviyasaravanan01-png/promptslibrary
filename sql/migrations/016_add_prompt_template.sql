-- Add prompt_template column to prompts table
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS prompt_template TEXT;

COMMENT ON COLUMN prompts.prompt_template IS 'Optional template for the prompt, may contain [VARIABLES] for templating';
