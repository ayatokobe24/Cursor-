-- ログイン中の本人だけが todos を読み書きできるようにする
-- （未ログインの anon は拒否、authenticated は auth.uid() = user_id の行のみ）
-- 適用は 20260903_todos_rls.sql と同じ内容です。

alter table public.todos
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists todos_user_id_idx on public.todos (user_id);

alter table public.todos enable row level security;
alter table public.todos force row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'todos'
  loop
    execute format('drop policy if exists %I on public.todos', pol.policyname);
  end loop;
end $$;

create policy "todos_select_own"
  on public.todos
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "todos_insert_own"
  on public.todos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "todos_update_own"
  on public.todos
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "todos_delete_own"
  on public.todos
  for delete
  to authenticated
  using (auth.uid() = user_id);

revoke all on table public.todos from anon;
grant select, insert, update, delete on table public.todos to authenticated;
