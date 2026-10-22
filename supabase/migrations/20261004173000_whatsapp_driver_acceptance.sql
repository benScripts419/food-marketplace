create unique index if not exists order_assignments_one_open_offer_per_order_idx
  on public.order_assignments(order_id)
  where status in ('offered', 'accepted');

create or replace function public.normalize_driver_whatsapp(p_phone text)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  with normalized as (
    select regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') as digits
  )
  select case
    when length(digits) = 10 and left(digits, 1) = '0'
      then '233' || substr(digits, 2)
    else digits
  end
  from normalized;
$$;

create or replace function public.create_driver_order_offer(
  p_order_id uuid,
  p_driver_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders%rowtype;
  selected_driver public.drivers%rowtype;
  assignment_id uuid;
begin
  select *
  into current_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;
  if current_order.payment_status::text <> 'paid' then
    raise exception 'Only paid orders can be offered to a driver.';
  end if;
  if current_order.rider_id is not null then
    raise exception 'This order is already assigned to a rider.';
  end if;
  if current_order.status::text not in (
    'pending',
    'confirmed',
    'preparing',
    'ready'
  ) then
    raise exception 'This order is not waiting for a driver.';
  end if;
  if exists (
    select 1
    from public.order_assignments
    where order_id = p_order_id
      and status in ('offered', 'accepted')
  ) then
    raise exception 'This order already has an active driver offer.';
  end if;

  select *
  into selected_driver
  from public.drivers
  where id = p_driver_id
  for share;

  if not found or not selected_driver.is_active then
    raise exception 'Selected driver is not active.';
  end if;

  insert into public.order_assignments (order_id, driver_id, status)
  values (p_order_id, p_driver_id, 'offered')
  returning id into assignment_id;

  return assignment_id;
end;
$$;

create or replace function public.respond_to_driver_order_offer(
  p_assignment_id uuid,
  p_driver_phone text,
  p_response text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_assignment public.order_assignments%rowtype;
  current_order public.orders%rowtype;
  stored_phone text;
begin
  if p_response not in ('accept', 'decline') then
    return 'unavailable';
  end if;

  select *
  into current_assignment
  from public.order_assignments
  where id = p_assignment_id
  for update;

  if not found then
    return 'unavailable';
  end if;

  select phone
  into stored_phone
  from public.drivers
  where id = current_assignment.driver_id;

  if not found or public.normalize_driver_whatsapp(stored_phone)
    <> public.normalize_driver_whatsapp(p_driver_phone) then
    return 'unavailable';
  end if;

  select *
  into current_order
  from public.orders
  where id = current_assignment.order_id
  for update;

  if not found then
    return 'unavailable';
  end if;

  if current_assignment.status = 'accepted' and p_response = 'accept' then
    return 'accepted';
  end if;
  if current_assignment.status = 'declined' and p_response = 'decline' then
    return 'declined';
  end if;
  if current_assignment.status <> 'offered'
    or current_order.payment_status::text <> 'paid'
    or current_order.status::text not in ('pending', 'confirmed', 'preparing', 'ready')
    or current_order.rider_id is not null then
    return 'unavailable';
  end if;

  if p_response = 'decline' then
    update public.order_assignments
    set status = 'declined',
        responded_at = now()
    where id = p_assignment_id
      and status = 'offered';

    return 'declined';
  end if;

  update public.order_assignments
  set status = 'accepted',
      responded_at = now()
  where id = p_assignment_id
    and status = 'offered';

  if not found then
    return 'unavailable';
  end if;

  update public.orders
  set status = 'accepted',
      updated_at = now()
  where id = current_order.id
    and payment_status::text = 'paid'
    and rider_id is null;

  if not found then
    update public.order_assignments
    set status = 'expired'
    where id = p_assignment_id
      and status = 'accepted';
    return 'unavailable';
  end if;

  return 'accepted';
end;
$$;

revoke all on function public.normalize_driver_whatsapp(text) from public;
revoke all on function public.create_driver_order_offer(uuid, uuid) from public;
revoke all on function public.respond_to_driver_order_offer(uuid, text, text) from public;
grant execute on function public.create_driver_order_offer(uuid, uuid) to service_role;
grant execute on function public.respond_to_driver_order_offer(uuid, text, text) to service_role;
