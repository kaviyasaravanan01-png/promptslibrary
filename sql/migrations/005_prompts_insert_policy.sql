-- Allow authenticated users to insert prompts where created_by matches their auth.uid()
drop policy if exists insert_own_prompts on prompts;

create policy insert_own_prompts
  on prompts
  for insert
  with check (created_by = auth.uid());

-- If you still want to restrict updates/deletes to owners, ensure these policies exist (they may already be in init.sql):
-- create policy prompts_update_owner on prompts for update using (created_by = auth.uid()) with check (created_by = auth.uid());
-- create policy prompts_delete_owner on prompts for delete using (created_by = auth.uid());
