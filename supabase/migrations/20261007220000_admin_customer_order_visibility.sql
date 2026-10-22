create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins can view customer profiles"
  on public.profiles;
create policy "Admins can view customer profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin() and role = 'customer');

drop policy if exists "Admins can view orders"
  on public.orders;
create policy "Admins can view orders"
  on public.orders
  for select
  to authenticated
  using (public.is_admin());
