-- Seed sample profile and prompt

-- Replace with your own profile id if needed
INSERT INTO profiles (id, full_name, avatar_url)
VALUES ('11111111-1111-1111-1111-111111111111', 'Seed Admin', 'https://rdjkjtrgicxhjvwuofmy.supabase.co/storage/v1/object/public/results/amazon_digital_signature.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prompts (slug, title, description, model, result_urls, is_premium, price, prompt_text, created_by)
VALUES (
  'sample-prompt',
  'Sample Prompt — MidJourney',
  'A seeded sample prompt showcasing an image result',
  'midjourney-v5',
  '[{"type":"image","url":"https://rdjkjtrgicxhjvwuofmy.supabase.co/storage/v1/object/public/results/amazon_digital_signature.jpg"}]'::jsonb,
  true,
  1000,
  'Write a creative prompt that instructs MidJourney to make a dramatic product photo with neon reflections.',
  '11111111-1111-1111-1111-111111111111'
);

-- Non-premium prompt (GPT-4)
INSERT INTO prompts (slug, title, description, model, result_urls, is_premium, price, prompt_text, created_by)
VALUES (
  'gpt4-product-description',
  'Ecommerce Product Description — GPT-4',
  'Free example: generate an ecommerce product description',
  'gpt-4',
  '[]'::jsonb,
  false,
  0,
  'Write a compelling product description for a high-end wireless headphone targeted at audiophiles.',
  '11111111-1111-1111-1111-111111111111'
);

-- Free ChatGPT prompt
INSERT INTO prompts (slug, title, description, model, result_urls, is_premium, price, prompt_text, created_by)
VALUES (
  'chatgpt-creative-idea',
  'Creative Writing Prompt — ChatGPT',
  'Free creative writing prompt for story starters',
  'chatgpt',
  '[]'::jsonb,
  false,
  0,
  'Write the opening scene of a sci-fi short story where the protagonist discovers a hidden city beneath the ocean.',
  '11111111-1111-1111-1111-111111111111'
);

-- link sample prompts to categories (example: associate sample-prompt with models->midjourney prompts->3D)
with p as (select id from prompts where slug='sample-prompt'),
     c as (select id from categories where slug='models'),
     s as (select id from subcategories where category_id = (select id from categories where slug='models') and slug = 'midjourney-prompts'),
     ss as (select id from subsubcategories where subcategory_id = (select id from subcategories where slug='midjourney-prompts') and slug = '3d')
insert into prompt_categories (prompt_id, category_id, subcategory_id, subsub_id)
select p.id, c.id, s.id, ss.id from p, c, s, ss
on conflict do nothing;

with p2 as (select id from prompts where slug='gpt4-product-description'),
   c2 as (select id from categories where slug='models'),
  s2 as (select id from subcategories where category_id = (select id from categories where slug='models') and slug = 'chatgpt-prompts')
insert into prompt_categories (prompt_id, category_id, subcategory_id)
select p2.id, c2.id, s2.id from p2, c2, s2
on conflict do nothing;

with p3 as (select id from prompts where slug='chatgpt-creative-idea'),
     c3 as (select id from categories where slug='models'),
     s3 as (select id from subcategories where category_id = (select id from categories where slug='models') and slug = 'chatgpt-prompts')
insert into prompt_categories (prompt_id, category_id, subcategory_id)
select p3.id, c3.id, s3.id from p3, c3, s3
on conflict do nothing;
