alter table public.orders
  add column if not exists customer_address text,
  add column if not exists customer_latitude double precision,
  add column if not exists customer_longitude double precision;

create table if not exists public.order_rider_locations (
  order_id uuid primary key references public.orders(id) on delete cascade,
  rider_id uuid not null references auth.users(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  updated_at timestamptz not null default now()
);

create index if not exists order_rider_locations_rider_id_idx
  on public.order_rider_locations(rider_id);

alter table public.order_rider_locations enable row level security;

revoke all on public.order_rider_locations from public, anon;
grant select, insert, update on public.order_rider_locations to authenticated;

drop policy if exists "Active delivery participants can read rider locations"
  on public.order_rider_locations;
create policy "Active delivery participants can read rider locations"
  on public.order_rider_locations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.status::text in ('picked_up', 'on_the_way')
        and (
          o.rider_id = auth.uid()
          or o.user_id = auth.uid()
          or o.customer_id = auth.uid()
        )
    )
  );

drop policy if exists "Riders can publish their active delivery location"
  on public.order_rider_locations;
create policy "Riders can publish their active delivery location"
  on public.order_rider_locations
  for insert
  to authenticated
  with check (
    rider_id = auth.uid()
    and exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.rider_id = auth.uid()
        and o.status::text in ('picked_up', 'on_the_way')
    )
  );

drop policy if exists "Riders can update their active delivery location"
  on public.order_rider_locations;
create policy "Riders can update their active delivery location"
  on public.order_rider_locations
  for update
  to authenticated
  using (
    rider_id = auth.uid()
    and exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.rider_id = auth.uid()
        and o.status::text in ('picked_up', 'on_the_way')
    )
  )
  with check (
    rider_id = auth.uid()
    and exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.rider_id = auth.uid()
        and o.status::text in ('picked_up', 'on_the_way')
    )
  );

create or replace function public.clear_inactive_order_rider_location()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rider_id is null
    or new.status::text not in ('picked_up', 'on_the_way')
    or old.rider_id is distinct from new.rider_id then
    delete from public.order_rider_locations
    where order_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists clear_inactive_order_rider_location
  on public.orders;
create trigger clear_inactive_order_rider_location
  after update of status, rider_id on public.orders
  for each row
  execute function public.clear_inactive_order_rider_location();

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'orders'
    ) then
      alter publication supabase_realtime add table public.orders;
    end if;
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'order_rider_locations'
    ) then
      alter publication supabase_realtime
        add table public.order_rider_locations;
    end if;
  end if;
end;
$$;
