-- Supabase / Postgres schema for Prompt Library Marketplace

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists profiles (
  id uuid primary key,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Prompts
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  model text,
  result_urls jsonb,
  is_premium boolean default false,
  price integer default 0,
  prompt_text text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Purchases
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  provider text,
  provider_order_id text,
  provider_payment_id text,
  amount integer not null,
  currency text default 'INR',
  status text default 'pending',
  metadata jsonb,
  created_at timestamptz default now(),
  unique (user_id, prompt_id)
);

-- Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references prompts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Favorites
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, prompt_id)
);

-- Indexes
create index if not exists idx_prompts_slug on prompts(slug);
create index if not exists idx_purchases_user on purchases(user_id);
create index if not exists idx_comments_prompt on comments(prompt_id);

-- Enable RLS where appropriate (to be configured in Supabase SQL policies UI or below)
-- Note: Supabase GUI often manages RLS policy creation; use the following as starting point.

alter table prompts enable row level security;
alter table purchases enable row level security;
alter table comments enable row level security;
alter table favorites enable row level security;

create policy allow_insert_own_purchase on purchases for insert with check (user_id = auth.uid());
create policy select_own_purchases on purchases for select using (user_id = auth.uid());

create policy insert_comments_auth on comments for insert with check (user_id = auth.uid());
create policy select_comments_public on comments for select using (true);
create policy update_own_comment on comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy delete_own_comment on comments for delete using (user_id = auth.uid());

create policy favorites_owner_select on favorites for select using (user_id = auth.uid());
create policy favorites_insert_own on favorites for insert with check (user_id = auth.uid());
create policy favorites_delete_own on favorites for delete using (user_id = auth.uid());

alter table profiles enable row level security;
create policy profiles_upsert_own on profiles for insert with check (id = auth.uid());
create policy profiles_update_own on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_select_public on profiles for select using (true);

-- Recommended pattern: create a `public_prompts` view that excludes `prompt_text`, and use server endpoints to return `prompt_text` only after verifying purchases.
create policy public_select_prompts on prompts for select using (true);
create policy prompts_update_owner on prompts for update using (created_by = auth.uid()) with check (created_by = auth.uid());

-- Note: Column-level protections are best enforced by server endpoints and views. Use the `supabase` service role for webhook and server-side writes.

-- Example policy templates (adjust as needed):
-- Purchases: allow insert if user_id = auth.uid()
-- create policy "allow_insert_own_purchase" on purchases for insert with check (user_id = auth.uid());
-- create policy "select_purchases_own" on purchases for select using (user_id = auth.uid());

-- Comments: allow insert/update/delete only by comment owner
-- create policy "insert_comments_auth" on comments for insert with check (user_id = auth.uid());
-- create policy "select_comments_public" on comments for select using (true);
-- create policy "delete_own_comment" on comments for delete using (user_id = auth.uid());

-- Favorites: allow only owner selects/inserts/deletes
-- create policy "favorites_owner_select" on favorites for select using (user_id = auth.uid());

-- Note: For secure control of `prompt_text`, use server-side endpoints to decide what to return.
