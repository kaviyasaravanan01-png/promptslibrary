-- Add status column to prompts to track pending/approved/rejected
alter table prompts add column if not exists status text default 'approved';

-- Index for status
create index if not exists idx_prompts_status on prompts(status);
