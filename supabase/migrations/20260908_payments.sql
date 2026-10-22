create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid,
  restaurant_id text,

  subtotal numeric(12,2) not null check (subtotal >= 0),
  promotion_discount numeric(12,2) not null default 0 check (promotion_discount >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  service_fee numeric(12,2) not null default 0 check (service_fee >= 0),
  total numeric(12,2) not null check (total >= 0),

  delivery_option text not null default 'standard',

  status text not null default 'pending',
  payment_status text not null default 'pending',
  payment_method text,

  payment_reference text,

  customer_email text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists customer_id uuid,
  add column if not exists restaurant_id text,
  add column if not exists promotion_discount numeric(12,2) not null default 0,
  add column if not exists delivery_option text not null default 'standard',
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_method text,
  add column if not exists payment_reference text,
  add column if not exists customer_email text,
  add column if not exists updated_at timestamptz not null default now();

update public.orders
set user_id = customer_id
where user_id is null and customer_id is not null;

alter table public.orders
  alter column restaurant_id drop not null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders(id)
    on delete cascade,

  menu_item_id text not null,

  name text not null,
  item_name text,
  description text,

  price numeric(12,2) not null
    check (price >= 0),
  unit_price numeric(12,2),

  quantity integer not null
    check (quantity > 0),

  restaurant_id text not null,
  restaurant_name text not null,

  image text,

  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists name text,
  add column if not exists item_name text,
  add column if not exists description text,
  add column if not exists price numeric(12,2),
  add column if not exists unit_price numeric(12,2),
  add column if not exists restaurant_id text,
  add column if not exists restaurant_name text,
  add column if not exists image text;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  reference text not null unique,

  amount numeric(12,2) not null
    check (amount >= 0),

  currency text not null default 'GHS',

  status text not null default 'pending',

  channel text,

  gateway_response text,

  paid_at timestamptz,

  raw_response jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx
on public.orders(user_id);

create index if not exists orders_payment_reference_idx
on public.orders(payment_reference);

create unique index if not exists orders_payment_reference_unique_idx
on public.orders(payment_reference)
where payment_reference is not null;

create index if not exists order_items_order_id_idx
on public.order_items(order_id);

create index if not exists payments_order_id_idx
on public.payments(order_id);

create index if not exists payments_user_id_idx
on public.payments(user_id);

create index if not exists payments_reference_idx
on public.payments(reference);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id or auth.uid() = customer_id);

drop policy if exists "Users can view their own order items" on public.order_items;
create policy "Users can view their own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or orders.customer_id = auth.uid())
  )
);

drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);