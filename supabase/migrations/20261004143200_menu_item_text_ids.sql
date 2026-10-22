alter table public.menu_items
  drop constraint if exists menu_items_category_id_fkey;

alter table public.order_items
  drop constraint if exists order_items_menu_item_id_fkey;

alter table public.menu_categories
  alter column id type text using id::text;

alter table public.menu_items
  alter column id type text using id::text,
  alter column category_id type text using category_id::text;

alter table public.order_items
  alter column menu_item_id type text using menu_item_id::text;

alter table public.menu_items
  add constraint menu_items_category_id_fkey
  foreign key (category_id)
  references public.menu_categories(id)
  on delete set null;

alter table public.order_items
  add constraint order_items_menu_item_id_fkey
  foreign key (menu_item_id)
  references public.menu_items(id)
  on delete set null;
