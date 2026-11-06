drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
on public.orders
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update order items" on public.order_items;
create policy "Admins can update order items"
on public.order_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete order items" on public.order_items;
create policy "Admins can delete order items"
on public.order_items
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update restaurant payouts" on public.restaurant_payouts;
create policy "Admins can update restaurant payouts"
on public.restaurant_payouts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete restaurant payouts" on public.restaurant_payouts;
create policy "Admins can delete restaurant payouts"
on public.restaurant_payouts
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update order assignments" on public.order_assignments;
create policy "Admins can update order assignments"
on public.order_assignments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete order assignments" on public.order_assignments;
create policy "Admins can delete order assignments"
on public.order_assignments
for delete
to authenticated
using (public.is_admin());
