-- メール確認なしでログインできるようにする
-- Supabase Dashboard の SQL Editor で実行してください。
-- あわせて Authentication > Providers > Email で Confirm email をオフにしてください。
-- オフにしないと確認メールは送られ続けます。

update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmed_at = coalesce(confirmed_at, now())
where email_confirmed_at is null;

create or replace function public.auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  update auth.users
  set
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    confirmed_at = coalesce(confirmed_at, now())
  where id = new.id
    and email_confirmed_at is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_auto_confirm on auth.users;

create trigger on_auth_user_created_auto_confirm
after insert on auth.users
for each row
execute function public.auto_confirm_email();
