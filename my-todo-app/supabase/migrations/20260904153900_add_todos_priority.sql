-- todos に優先度を追加。1=低、2=中、3=高。

alter table public.todos
  add column priority integer not null default 1;

alter table public.todos
  add constraint todos_priority_check
  check (priority in (1, 2, 3));

comment on column public.todos.priority is '1=低、2=中、3=高';
