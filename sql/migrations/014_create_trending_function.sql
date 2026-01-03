-- Trending content function
-- Computes engagement-based score using favorites, reviews, comments, rating, and recent activity

create or replace function public.get_trending_content(
  p_content_type text,
  p_limit int default 15,
  p_recent_days int default 14
)
returns table (
  id uuid,
  slug text,
  title text,
  description text,
  model text,
  result_urls jsonb,
  is_premium boolean,
  price numeric,
  content_type text,
  tags text[],
  avg_rating numeric,
  review_count int,
  favorite_count int,
  comment_count int,
  recent_activity int,
  trending_score numeric
)
language sql
stable
as $$
with base as (
  select
    p.id,
    p.slug,
    p.title,
    p.description,
    p.model,
    p.result_urls,
    p.is_premium,
    p.price,
    p.content_type,
    p.tags,
    coalesce(r.avg_rating, 0) as avg_rating,
    coalesce(r.review_count, 0) as review_count,
    coalesce(f.favorite_count, 0) as favorite_count,
    coalesce(c.comment_count, 0) as comment_count,
    coalesce(recent.recent_activity, 0) as recent_activity
  from prompts p
  left join (
    select prompt_id, count(*)::int as favorite_count
    from favorites
    group by prompt_id
  ) f on f.prompt_id = p.id
  left join (
    select prompt_id, count(*)::int as review_count, avg(rating)::numeric(10,2) as avg_rating
    from reviews
    group by prompt_id
  ) r on r.prompt_id = p.id
  left join (
    select prompt_id, count(*)::int as comment_count
    from comments
    group by prompt_id
  ) c on c.prompt_id = p.id
  left join (
    select prompt_id, count(*)::int as recent_activity
    from (
      select prompt_id, created_at from favorites
      union all
      select prompt_id, created_at from reviews
      union all
      select prompt_id, created_at from comments
    ) recent_union
    where created_at >= now() - (p_recent_days || ' days')::interval
    group by prompt_id
  ) recent on recent.prompt_id = p.id
  where p.status = 'approved'
    and p.content_type = p_content_type
)
select
  id,
  slug,
  title,
  description,
  model,
  result_urls,
  is_premium,
  price,
  content_type,
  tags,
  avg_rating,
  review_count,
  favorite_count,
  comment_count,
  recent_activity,
  (
    favorite_count * 0.35 +
    review_count * 0.25 +
    comment_count * 0.20 +
    coalesce(avg_rating, 0) * 0.15 +
    recent_activity * 0.40
  ) as trending_score
from base
order by trending_score desc nulls last, recent_activity desc, favorite_count desc
limit greatest(p_limit, 1);
$$;
