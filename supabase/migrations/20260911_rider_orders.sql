-- Add rider assignment to orders
alter table public.orders
add column if not exists rider_id uuid references auth.users(id);

-- Index for rider order lookups
create index if not exists orders_rider_id_idx
on public.orders(rider_id);

-- Index for pending orders
create index if not exists orders_status_idx
on public.orders(status);