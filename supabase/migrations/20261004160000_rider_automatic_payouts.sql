alter table public.orders
  add column if not exists delivered_at timestamptz;

create table public.rider_payout_accounts (
  rider_id uuid primary key references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('mtn', 'telecel', 'at')),
  account_name text not null,
  phone_number text not null,
  recipient_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rider_payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  rider_id uuid not null references public.profiles(id) on delete restrict,
  delivery_fee numeric(12,2) not null check (delivery_fee >= 0),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'GHS',
  recipient_code text not null,
  transfer_reference text not null unique,
  transfer_code text,
  status text not null check (
    status in ('processing', 'queued', 'success', 'failed', 'reversed')
  ),
  gateway_response text,
  raw_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rider_payouts_rider_created_idx
  on public.rider_payouts(rider_id, created_at desc);

alter table public.rider_payout_accounts enable row level security;
alter table public.rider_payouts enable row level security;

create policy "Riders can view their own payout account"
  on public.rider_payout_accounts
  for select
  to authenticated
  using (rider_id = auth.uid());

create policy "Riders can view their own payouts"
  on public.rider_payouts
  for select
  to authenticated
  using (rider_id = auth.uid());

grant select on public.rider_payout_accounts to authenticated;
grant select on public.rider_payouts to authenticated;

create policy "Riders can view paid delivery orders"
  on public.orders
  for select
  to authenticated
  using (
    payment_status::text = 'paid'
    and status::text in (
      'pending',
      'confirmed',
      'ready',
      'picked_up',
      'on_the_way',
      'delivered'
    )
    and (
      rider_id = auth.uid()
      or (
        rider_id is null
        and exists (
          select 1
          from public.profiles
          where id = auth.uid()
            and role = 'rider'
        )
      )
    )
  );

create policy "Riders can view items for available deliveries"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where id = order_items.order_id
        and payment_status::text = 'paid'
        and status::text in (
          'pending',
          'confirmed',
          'ready',
          'picked_up',
          'on_the_way',
          'delivered'
        )
        and (
          rider_id = auth.uid()
          or (
            rider_id is null
            and exists (
              select 1
              from public.profiles
              where id = auth.uid()
                and role = 'rider'
            )
          )
        )
    )
  );

create policy "Riders can accept paid delivery orders"
  on public.orders
  for update
  to authenticated
  using (
    rider_id is null
    and payment_status::text = 'paid'
    and status::text in ('pending', 'confirmed', 'ready')
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'rider'
    )
  )
  with check (
    rider_id = auth.uid()
    and payment_status::text = 'paid'
    and status::text = 'picked_up'
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'rider'
    )
  );

create or replace function public.complete_rider_delivery(p_order_id uuid)
returns table (
  payout_id uuid,
  payout_amount numeric,
  payout_status text,
  payout_transfer_reference text,
  payout_recipient_code text,
  payout_created boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders%rowtype;
  payout_account public.rider_payout_accounts%rowtype;
  existing_payout public.rider_payouts%rowtype;
  created_payout public.rider_payouts%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into current_order
  from public.orders
  where id = p_order_id
  for update;

  if not found or current_order.rider_id is distinct from auth.uid() then
    raise exception 'Delivery not found for this rider.';
  end if;

  select *
  into existing_payout
  from public.rider_payouts
  where order_id = p_order_id;

  if found then
    return query
    select existing_payout.id,
      existing_payout.amount,
      existing_payout.status,
      existing_payout.transfer_reference,
      existing_payout.recipient_code,
      false;
    return;
  end if;

  if current_order.status not in ('picked_up', 'on_the_way') then
    raise exception 'Order must be picked up before it can be completed.';
  end if;

  if current_order.payment_status::text <> 'paid' then
    raise exception 'Order payment must be confirmed before delivery completion.';
  end if;

  select *
  into payout_account
  from public.rider_payout_accounts
  where rider_id = auth.uid();

  if not found then
    raise exception 'Set up a Mobile Money payout method before completing this delivery.';
  end if;

  insert into public.rider_payouts (
    order_id,
    rider_id,
    delivery_fee,
    amount,
    recipient_code,
    transfer_reference,
    status
  )
  values (
    current_order.id,
    auth.uid(),
    current_order.delivery_fee,
    round(current_order.delivery_fee * 0.90, 2),
    payout_account.recipient_code,
    'AKRO-RIDER-' || replace(current_order.id::text, '-', ''),
    'processing'
  )
  returning * into created_payout;

  update public.orders
  set status = 'delivered',
      delivered_at = now(),
      updated_at = now()
  where id = current_order.id;

  return query
  select created_payout.id,
    created_payout.amount,
    created_payout.status,
    created_payout.transfer_reference,
    created_payout.recipient_code,
    true;
end;
$$;

revoke all on function public.complete_rider_delivery(uuid) from public;
grant execute on function public.complete_rider_delivery(uuid) to authenticated;
