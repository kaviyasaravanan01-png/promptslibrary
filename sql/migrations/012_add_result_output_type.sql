-- Migration: Add result_output_type to prompts table
-- This tracks the primary output type for a prompt (what the user expects to get)
-- For 'prompt' content_type: can be 'image', 'text', 'video', 'code', 'design', 'other'
-- For 'video_tutorial' content_type: always 'video'

ALTER TABLE prompts ADD COLUMN IF NOT EXISTS result_output_type text DEFAULT 'image';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_result_output_type ON prompts(result_output_type);

-- Add check constraint to ensure valid values
ALTER TABLE prompts ADD CONSTRAINT valid_result_output_type 
  CHECK (result_output_type IN ('image', 'text', 'video', 'code', 'design', 'other'));
