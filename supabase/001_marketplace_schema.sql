create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'rider', 'restaurant_staff', 'admin');
create type public.order_status as enum (
  'pending', 'confirmed', 'preparing', 'ready',
  'picked_up', 'on_the_way', 'delivered', 'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurants (
  id text primary key,
  name text not null,
  description text,
  image_url text,
  address text not null,
  latitude double precision,
  longitude double precision,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  delivery_minutes text not null default '20-30 min',
  delivery_fee numeric(10,2) not null default 0,
  has_offer boolean not null default false,
  cuisine text not null default '',
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.restaurant_staff (
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (restaurant_id, user_id)
);

create table public.menu_categories (
  id text primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create table public.menu_items (
  id text primary key,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  category_id text not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  address text not null,
  latitude double precision,
  longitude double precision,
  is_default boolean not null default false
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  restaurant_id text not null references public.restaurants(id),
  delivery_address_id uuid references public.customer_addresses(id),
  status public.order_status not null default 'pending',
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  service_fee numeric(10,2) not null default 0 check (service_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text references public.menu_items(id),
  item_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  rider_id uuid references public.profiles(id),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.rider_locations (
  id bigint generated always as identity primary key,
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  rider_id uuid not null references public.profiles(id),
  latitude double precision not null,
  longitude double precision not null,
  recorded_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_staff enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.deliveries enable row level security;
alter table public.rider_locations enable row level security;

create policy "Public can read open restaurants"
on public.restaurants for select using (is_open = true);

create policy "Public can read available menu categories"
on public.menu_categories for select using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.is_open = true
  )
);

create policy "Public can read available menu items"
on public.menu_items for select using (
  is_available = true and exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.is_open = true
  )
);

create policy "Users can read their profile"
on public.profiles for select using (id = auth.uid());

create policy "Users can update their profile"
on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Users can manage their addresses"
on public.customer_addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Customers can read their orders"
on public.orders for select using (customer_id = auth.uid());

create policy "Customers can read their order items"
on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.customer_id = auth.uid()
  )
);

create policy "Riders can read assigned deliveries"
on public.deliveries for select using (rider_id = auth.uid());

create policy "Riders can update assigned deliveries"
on public.deliveries for update using (rider_id = auth.uid()) with check (rider_id = auth.uid());

create policy "Riders can write assigned locations"
on public.rider_locations for all using (rider_id = auth.uid()) with check (rider_id = auth.uid());

insert into public.restaurants
  (id, name, address, rating, review_count, delivery_minutes, delivery_fee, has_offer, cuisine)
values
  ('1', 'Kwayisibea Hotel', 'Akropong, Ghana', 4.6, 238, '20-30 min', 10, true, 'Local • African • Grills'),
  ('2', 'Concept', 'Akropong, Ghana', 4.5, 125, '25-35 min', 15, false, 'Pizza • Fast Food'),
  ('3', 'Roll''d Up Shawarma', 'Akropong, Ghana', 4.4, 210, '20-30 min', 8, true, 'Shawarma'),
  ('7', 'Bloom Bakes', 'Akropong, Ghana', 4.3, 164, '30-40 min', 12, false, 'Chicken • Grills'),
  ('8', 'Brackers Inn', 'Akropong, Ghana', 4.7, 96, '30-40 min', 15, false, 'Sushi • Japanese')
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  rating = excluded.rating,
  review_count = excluded.review_count,
  delivery_minutes = excluded.delivery_minutes,
  delivery_fee = excluded.delivery_fee,
  has_offer = excluded.has_offer,
  cuisine = excluded.cuisine;
