-- Create the storage bucket for winner proofs
insert into storage.buckets (id, name, public) 
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Set up RLS for the proofs bucket
create policy "Anyone can upload proofs"
  on storage.objects for insert
  with check (bucket_id = 'proofs');

create policy "Anyone can view proofs"
  on storage.objects for select
  using (bucket_id = 'proofs');

create policy "Users can update their own proofs"
  on storage.objects for update
  using (bucket_id = 'proofs' and auth.uid() = owner);

create policy "Users can delete their own proofs"
  on storage.objects for delete
  using (bucket_id = 'proofs' and auth.uid() = owner);
