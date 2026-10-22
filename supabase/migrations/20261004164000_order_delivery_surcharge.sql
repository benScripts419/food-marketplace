alter table public.orders
  add column if not exists rider_payout_fee numeric(12,2);

update public.orders
set rider_payout_fee = delivery_fee
where rider_payout_fee is null;

alter table public.orders
  alter column rider_payout_fee set not null;

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
    current_order.rider_payout_fee,
    round(current_order.rider_payout_fee * 0.90, 2),
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
