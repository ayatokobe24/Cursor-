-- TODOアプリ用テーブル。本人の行だけ読み書きできる。

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade
);

create index todos_user_id_idx on public.todos (user_id);

alter table public.todos enable row level security;
alter table public.todos force row level security;

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

revoke all on table public.todos from anon, public;
grant select, insert, update, delete on table public.todos to authenticated;
