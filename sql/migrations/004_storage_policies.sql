-- Policies to allow authenticated users to upload/read/delete objects in the `results` bucket
-- Drop existing policies if present to make this migration idempotent
drop policy if exists storage_objects_insert_results on storage.objects;
drop policy if exists storage_objects_select_results on storage.objects;
drop policy if exists storage_objects_delete_results on storage.objects;

-- Allow authenticated users to insert objects into the 'results' bucket (owner must match auth.uid())
create policy storage_objects_insert_results
  on storage.objects
  for insert
  with check (
    bucket_id = 'results' AND auth.role() = 'authenticated' AND owner = auth.uid()
  );

-- Allow anonymous (public) reads and authenticated users to select objects in 'results'
create policy storage_objects_select_results
  on storage.objects
  for select
  using (
    bucket_id = 'results' AND (
      auth.role() = 'anon' OR (auth.role() = 'authenticated' AND (owner = auth.uid() OR owner IS NULL))
    )
  );

-- Allow authenticated owners to delete their own objects in 'results'
create policy storage_objects_delete_results
  on storage.objects
  for delete
  using (
    bucket_id = 'results' AND auth.role() = 'authenticated' AND owner = auth.uid()
  );

-- Note: Supabase Console also exposes bucket-level policies. These SQL policies target the underlying storage.objects table.
