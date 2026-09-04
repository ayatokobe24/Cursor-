-- 開発用シード。RLS を一時的に無効化し、仮ユーザーに紐づく todos を入れる。

alter table public.todos no force row level security;
alter table public.todos disable row level security;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'dev@example.com',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb
)
on conflict (id) do nothing;

insert into public.todos (title, completed, user_id) values
  ('牛乳を買う', false, '11111111-1111-1111-1111-111111111111'),
  ('週次レポートを提出する', true, '11111111-1111-1111-1111-111111111111'),
  ('部屋の掃除をする', false, '11111111-1111-1111-1111-111111111111'),
  ('30分ランニングする', true, '11111111-1111-1111-1111-111111111111'),
  ('図書館に本を返す', false, '11111111-1111-1111-1111-111111111111');
