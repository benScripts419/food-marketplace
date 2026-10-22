alter table public.orders
  add column if not exists cancellation_reason text,
  add column if not exists refund_status text,
  add column if not exists refund_reference text;

create index if not exists orders_unavailable_refunds_idx
  on public.orders(refund_status)
  where cancellation_reason = 'unavailable';
