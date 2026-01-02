-- Migration 013: Add is_featured column to prompts table
-- Add is_featured column with default false
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON prompts(is_featured);

-- Update all existing prompts to is_featured = true
UPDATE prompts SET is_featured = true WHERE is_featured = false;
