-- Seed categories, subcategories and sub-sub-categories
-- Categories list
insert into categories (name, slug) values
('models','models'),
('Art','art'),
('Logos','logos'),
('Graphic','graphic'),
('Productivity','productivity'),
('Marketing','marketing'),
('Photography','photography'),
('Games','games')
on conflict (slug) do nothing;

-- Models subcategories (many entries)
with m as (select id from categories where slug='models')
insert into subcategories (category_id, name, slug)
select m.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from m, (
  values
  ('ChatGPT Image prompts'),('Claude prompts'),('DALL·E prompts'),('DeepSeek prompts'),('FLUX prompts'),('Gemini prompts'),('Gemini Image prompts'),('ChatGPT prompts'),('Grok prompts'),('Grok Image prompts'),('Hailuo AI prompts'),('Hunyuan prompts'),('Ideogram prompts'),('Imagen prompts'),('KLING AI prompts'),('Leonardo Ai prompt'),('Llama prompts'),('Midjourney prompts'),('Midjourney Video prompts'),('Qwen Image prompts'),('Recraft prompts'),('Seedance prompts'),('Seedream prompts'),('Sora prompts'),('Stable Diffusion prompts'),('Veo prompts'),('Wan prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- Art subcategories
with c as (select id from categories where slug='art')
insert into subcategories (category_id, name, slug)
select c.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from c, (
  values ('Anime prompts'),('Cartoon prompts'),('Painting prompts'),('Illustration prompts'),('Unique Styles prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- Logos subcategories
with c as (select id from categories where slug='logos')
insert into subcategories (category_id, name, slug)
select c.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from c, (
  values ('Logo prompts'),('Icon prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- Graphic subcategories
with c as (select id from categories where slug='graphic')
insert into subcategories (category_id, name, slug)
select c.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from c, (
  values ('Pattern prompts'),('Product Design prompts'),('Profile Picture prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- Productivity
with c as (select id from categories where slug='productivity')
insert into subcategories (category_id, name, slug)
select c.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from c, (
  values ('Productivity prompts'),('Writing prompts'),('Coding prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- Marketing
with c as (select id from categories where slug='marketing')
insert into subcategories (category_id, name, slug)
select c.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from c, (
  values ('Marketing prompts'),('Business prompts'),('Social Media prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- Photography
with c as (select id from categories where slug='photography')
insert into subcategories (category_id, name, slug)
select c.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from c, (
  values ('Photography prompts'),('Photography Style prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- Games
with c as (select id from categories where slug='games')
insert into subcategories (category_id, name, slug)
select c.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from c, (
  values ('3D prompts'),('Fun & Games prompts'),('Video Game Art prompts')
) as v(name)
on conflict (category_id, slug) do nothing;

-- For brevity insert a representative set of sub-sub categories for a few key subcategories
-- Example for 'ChatGPT Image prompts' subcategory
with s as (select sub.id from subcategories sub join categories c on c.id=sub.category_id where c.slug='models' and sub.slug='chatgpt-image-prompts')
insert into subsubcategories (subcategory_id, name, slug)
select s.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from s, (
  values ('3D'),('Abstract'),('Accessory'),('Animal'),('Anime'),('Art'),('Avatar'),('Architecture'),('Cartoon'),('Celebrity'),('Clothing'),('Clip Art'),('Cute'),('Cyberpunk'),('Drawing'),('Drink'),('Fantasy'),('Fashion'),('Food'),('Future'),('Gaming'),('Glass'),('Graphic Design'),('Holiday'),('Icon'),('Ink'),('Interior'),('Illustration'),('Jewelry'),('Landscape'),('Logo'),('Mockup'),('Monogram'),('Monster'),('Nature'),('Pattern'),('Painting'),('People'),('Photographic'),('Pixel Art'),('Poster'),('Product'),('Psychedelic'),('Retro'),('Scary'),('Space'),('Steampunk'),('Statue'),('Sticker'),('Unique Style'),('Synthwave'),('Texture'),('Vehicle'),('Wallpaper')
) as v(name)
on conflict (subcategory_id, slug) do nothing;

-- Example for 'Claude prompts' subcategory
with s as (select sub.id from subcategories sub join categories c on c.id=sub.category_id where c.slug='models' and sub.slug='claude-prompts')
insert into subsubcategories (subcategory_id, name, slug)
select s.id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from s, (
  values ('Ads'),('Business'),('Chatbot'),('Coach'),('Conversion'),('Code'),('Copy'),('Email'),('Fashion'),('Fix'),('Finance'),('Fun'),('Funny'),('Food'),('Generation'),('Games'),('Health'),('Ideas'),('Language'),('Marketing'),('Music'),('Plan'),('Prompts'),('SEO'),('Social'),('Sport'),('Summarise'),('Study'),('Translate'),('Travel'),('Writing')
) as v(name)
on conflict (subcategory_id, slug) do nothing;

-- You can expand other sub-sub categories similarly following the user's mapping. This seed provides core structure.

-- Bulk insert image-style sub-subcategories for many image-capable model subcategories
with image_vals as (
  select * from (values
    ('3D'),('Abstract'),('Accessory'),('Animal'),('Anime'),('Art'),('Avatar'),('Architecture'),('Cartoon'),('Celebrity'),('Clothing'),('Clip Art'),('Cute'),('Cyberpunk'),('Drawing'),('Drink'),('Fantasy'),('Fashion'),('Food'),('Future'),('Gaming'),('Glass'),('Graphic Design'),('Holiday'),('Icon'),('Ink'),('Interior'),('Illustration'),('Jewelry'),('Landscape'),('Logo'),('Mockup'),('Monogram'),('Monster'),('Nature'),('Pattern'),('Painting'),('People'),('Photographic'),('Pixel Art'),('Poster'),('Product'),('Psychedelic'),('Retro'),('Scary'),('Space'),('Steampunk'),('Statue'),('Sticker'),('Unique Style'),('Synthwave'),('Texture'),('Vehicle'),('Wallpaper')
  ) as t(name)
), targets as (
  select sub.id as sub_id from subcategories sub join categories c on c.id = sub.category_id
  where c.slug = 'models' and sub.name in (
    'ChatGPT Image prompts','DALL·E prompts','Gemini Image prompts','Midjourney prompts','Midjourney Video prompts','Qwen Image prompts','Ideogram prompts','Leonardo Ai prompt','Stable Diffusion prompts','Veo prompts','Wan prompts','Recraft prompts','Seedance prompts','Seedream prompts','Sora prompts','FLUX prompts'
  )
)
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets t cross join image_vals v
on conflict (subcategory_id, slug) do nothing;

-- Bulk insert text-style/topic sub-subcategories for conversational/assistant model subcategories
with text_vals as (
  select * from (values
    ('Ads'),('Business'),('Chatbot'),('Coach'),('Conversion'),('Code'),('Copy'),('Email'),('Fashion'),('Fix'),('Finance'),('Fun'),('Funny'),('Food'),('Generation'),('Games'),('Health'),('Ideas'),('Language'),('Marketing'),('Music'),('Plan'),('Prompts'),('SEO'),('Social'),('Sport'),('Summarise'),('Study'),('Translate'),('Travel'),('Writing')
  ) as t(name)
), targets2 as (
  select sub.id as sub_id from subcategories sub join categories c on c.id = sub.category_id
  where c.slug = 'models' and sub.name in (
    'Claude prompts','ChatGPT prompts','Grok prompts','DeepSeek prompts','Gemini prompts','Hunyuan prompts','Grok Image prompts'
  )
)
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets2 t cross join text_vals v
on conflict (subcategory_id, slug) do nothing;

-- Additional specific sub-subcategory groups per user request
with vals_pattern as (select * from (values ('Animals'),('Food'),('Nature'),('Painted'),('Unique Styled')) as t(name)),
     targets_pattern as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='graphic' and sub.name = 'Pattern prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_pattern t cross join vals_pattern v
on conflict (subcategory_id, slug) do nothing;

with vals_product as (select * from (values ('Book Covers'),('Cards'),('Coloring Books'),('Laser Engraving'),('Posters'),('Stickers'),('T-Shirt Prints'),('Tattoos'),('UX/UI')) as t(name)),
     targets_product as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='graphic' and sub.name = 'Product Design prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_product t cross join vals_product v
on conflict (subcategory_id, slug) do nothing;

with vals_profile as (select * from (values ('3D'),('Animals'),('Anime'),('Fantasy'),('Futuristic'),('People')) as t(name)),
     targets_profile as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='graphic' and sub.name = 'Profile Picture prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_profile t cross join vals_profile v
on conflict (subcategory_id, slug) do nothing;

with vals_logo as (select * from (values ('3D'),('Animal'),('Business & Startup'),('Cartoon'),('Cute'),('Food'),('Lettered'),('Hand-drawn'),('Minimalist'),('Modern'),('Painted'),('Styled')) as t(name)),
     targets_logo as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='logos' and sub.name = 'Logo prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_logo t cross join vals_logo v
on conflict (subcategory_id, slug) do nothing;

with vals_icon as (select * from (values ('3D'),('Animal'),('Clipart'),('Cute'),('Flat Graphic'),('Pixel Art'),('Styled'),('UI'),('Video Games')) as t(name)),
     targets_icon as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='logos' and sub.name = 'Icon prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_icon t cross join vals_icon v
on conflict (subcategory_id, slug) do nothing;

with vals_marketing as (select * from (values ('Ad Writing'),('Copy Writing'),('SEO')) as t(name)),
     targets_marketing as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='marketing' and sub.name = 'Marketing prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_marketing t cross join vals_marketing v
on conflict (subcategory_id, slug) do nothing;

with vals_business as (select * from (values ('Finance'),('Real Estate')) as t(name)),
     targets_business as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='marketing' and sub.name = 'Business prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_business t cross join vals_business v
on conflict (subcategory_id, slug) do nothing;

with vals_social as (select * from (values ('Etsy'),('Instagram'),('Twitter'),('YouTube')) as t(name)),
     targets_social as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='marketing' and sub.name = 'Social Media prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_social t cross join vals_social v
on conflict (subcategory_id, slug) do nothing;

with vals_coding as (select * from (values ('Python')) as t(name)),
     targets_coding as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='productivity' and sub.name = 'Coding prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_coding t cross join vals_coding v
on conflict (subcategory_id, slug) do nothing;

with vals_prod as (select * from (values ('Coaching'),('Food & Diet'),('Health & Fitness'),('Personal Finance'),('Idea Generation'),('Meditation'),('Planning'),('Studying'),('Travel')) as t(name)),
     targets_prod as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='productivity' and sub.name = 'Productivity prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_prod t cross join vals_prod v
on conflict (subcategory_id, slug) do nothing;

with vals_writing as (select * from (values ('Email'),('Translation & Language'),('Music & Lyrics'),('Summarisation')) as t(name)),
     targets_writing as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='productivity' and sub.name = 'Writing prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_writing t cross join vals_writing v
on conflict (subcategory_id, slug) do nothing;

with vals_phot as (select * from (values ('Accessories'),('Animals'),('Buildings'),('Clothing'),('Food'),('Jewelry'),('Landscape'),('Nature'),('People'),('Product'),('Space'),('Vehicles')) as t(name)),
     targets_phot as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='photography' and sub.name = 'Photography prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_phot t cross join vals_phot v
on conflict (subcategory_id, slug) do nothing;

with vals_photstyle as (select * from (values ('Cinematic'),('Retro')) as t(name)),
     targets_photstyle as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='photography' and sub.name = 'Photography Style prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_photstyle t cross join vals_photstyle v
on conflict (subcategory_id, slug) do nothing;

with vals_3d as (select * from (values ('Animals'),('Buildings'),('Icons'),('Landscapes'),('People'),('Vehicles')) as t(name)),
     targets_3d as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='games' and sub.name = '3D prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_3d t cross join vals_3d v
on conflict (subcategory_id, slug) do nothing;

with vals_fun as (select * from (values ('Joke & Comedy'),('Text Based Games')) as t(name)),
     targets_fun as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='games' and sub.name = 'Fun & Games prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_fun t cross join vals_fun v
on conflict (subcategory_id, slug) do nothing;

with vals_vga as (select * from (values ('Fantasy Game Art'),('Game Maps')) as t(name)),
     targets_vga as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='games' and sub.name = 'Video Game Art prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_vga t cross join vals_vga v
on conflict (subcategory_id, slug) do nothing;

-- User-requested additions for Art subcategories
with vals_anime as (select * from (values ('People'),('Fantasy'),('Landscapes')) as t(name)),
     targets_anime as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='art' and sub.name = 'Anime prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_anime t cross join vals_anime v
on conflict (subcategory_id, slug) do nothing;

with vals_cartoon as (select * from (values ('Animals'),('Food'),('People'),('Vehicles')) as t(name)),
     targets_cartoon as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='art' and sub.name = 'Cartoon prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_cartoon t cross join vals_cartoon v
on conflict (subcategory_id, slug) do nothing;

with vals_painting as (select * from (values ('Animals'),('Nature'),('People'),('Landscape')) as t(name)),
     targets_painting as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='art' and sub.name = 'Painting prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_painting t cross join vals_painting v
on conflict (subcategory_id, slug) do nothing;

with vals_illustration as (select * from (values ('Animals'),('Food & Drink'),('Nature')) as t(name)),
     targets_illustration as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='art' and sub.name = 'Illustration prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_illustration t cross join vals_illustration v
on conflict (subcategory_id, slug) do nothing;

with vals_unique as (select * from (values ('Futuristic'),('Psychedelic'),('Pixel Art'),('Scary'),('Synthwave')) as t(name)),
     targets_unique as (select sub.id as sub_id from subcategories sub join categories c on c.id=sub.category_id where c.slug='art' and sub.name = 'Unique Styles prompts')
insert into subsubcategories (subcategory_id, name, slug)
select t.sub_id, v.name, lower(regexp_replace(v.name, '\\s+','-','g')) from targets_unique t cross join vals_unique v
on conflict (subcategory_id, slug) do nothing;

