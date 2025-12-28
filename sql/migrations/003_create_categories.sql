-- Create categories, subcategories and sub_subcategories tables
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz default now()
);

create table if not exists subsubcategories (
  id uuid primary key default gen_random_uuid(),
  subcategory_id uuid references subcategories(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz default now()
);

-- Join table to map prompts to chosen category path (category -> sub -> subsub)
create table if not exists prompt_categories (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references prompts(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  subsub_id uuid references subsubcategories(id) on delete cascade,
  created_at timestamptz default now(),
  unique(prompt_id, category_id, subcategory_id, subsub_id)
);

create index if not exists idx_categories_name on categories(name);
create index if not exists idx_subcategories_name on subcategories(name);
create index if not exists idx_subsub_name on subsubcategories(name);

-- ensure uniqueness used by seed ON CONFLICT clauses
create unique index if not exists uq_subcategories_category_slug on subcategories(category_id, slug);
create unique index if not exists uq_subsub_subcategory_slug on subsubcategories(subcategory_id, slug);

