-- Migration: Add video tutorial categories and subcategories, and add type column to categories

-- 1. Add 'type' column to categories (either 'prompt' or 'video_tutorial')
ALTER TABLE categories ADD COLUMN type TEXT NOT NULL DEFAULT 'prompt';

-- 2. Insert video tutorial categories and subcategories
-- Platforms


-- Platforms
WITH ins AS (
	INSERT INTO categories (name, slug, type) VALUES ('Platforms', 'platforms', 'video_tutorial') RETURNING id
)
INSERT INTO subcategories (category_id, name, slug)
SELECT id, name, slug FROM ins, (VALUES
	('Instagram Reels', 'instagram-reels'),
	('YouTube Shorts', 'youtube-shorts'),
	('YouTube Long-Form', 'youtube-long-form'),
	('TikTok', 'tiktok'),
	('Facebook Reels', 'facebook-reels'),
	('Pinterest Video Pins', 'pinterest-video-pins')
) AS v(name, slug);


-- Editing Tools (Mobile Apps)
WITH ins AS (
	INSERT INTO categories (name, slug, type) VALUES ('Editing Tools (Mobile Apps)', 'editing-tools-mobile-apps', 'video_tutorial') RETURNING id
)
INSERT INTO subcategories (category_id, name, slug)
SELECT id, name, slug FROM ins, (VALUES
	('CapCut', 'capcut'),
	('VN Video Editor', 'vn-video-editor'),
	('InShot', 'inshot'),
	('KineMaster', 'kinemaster'),
	('Alight Motion', 'alight-motion'),
	('LumaFusion', 'lumafusion')
) AS v(name, slug);


-- Editing Tools (Desktop Software)
WITH ins AS (
	INSERT INTO categories (name, slug, type) VALUES ('Editing Tools (Desktop Software)', 'editing-tools-desktop-software', 'video_tutorial') RETURNING id
)
INSERT INTO subcategories (category_id, name, slug)
SELECT id, name, slug FROM ins, (VALUES
	('Adobe Premiere Pro', 'adobe-premiere-pro'),
	('Final Cut Pro', 'final-cut-pro'),
	('DaVinci Resolve', 'davinci-resolve'),
	('After Effects', 'after-effects')
) AS v(name, slug);


-- Video Styles
WITH ins AS (
	INSERT INTO categories (name, slug, type) VALUES ('Video Styles', 'video-styles', 'video_tutorial') RETURNING id
)
INSERT INTO subcategories (category_id, name, slug)
SELECT id, name, slug FROM ins, (VALUES
	('Talking Head Videos', 'talking-head-videos'),
	('Faceless Videos', 'faceless-videos'),
	('AI Voiceover Videos', 'ai-voiceover-videos'),
	('Text to Video', 'text-to-video'),
	('Slideshow Videos', 'slideshow-videos'),
	('Green Screen Videos', 'green-screen-videos'),
	('Split Screen Videos', 'split-screen-videos'),
	('Before & After Videos', 'before-after-videos'),
	('Cinematic Reels', 'cinematic-reels'),
	('Vlog Style Videos', 'vlog-style-videos'),
	('Storytelling Reels', 'storytelling-reels'),
	('Motivational Clips', 'motivational-clips'),
	('Quote Reels', 'quote-reels'),
	('Podcast Clips', 'podcast-clips'),
	('Compilation Videos', 'compilation-videos')
) AS v(name, slug);

-- 3. Existing categories remain as type 'prompt'
-- 4. No subsubcategories for video tutorial categories
