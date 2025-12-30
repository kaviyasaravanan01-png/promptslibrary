-- Add content_type and video_tutorial_categories fields to prompts
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'prompt';
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS video_tutorial_categories jsonb;
-- content_type: 'prompt' or 'video_tutorial'
-- video_tutorial_categories: JSON array of selected categories/subcategories
