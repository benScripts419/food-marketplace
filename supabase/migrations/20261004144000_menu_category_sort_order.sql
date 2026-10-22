do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'menu_categories'
      and column_name = 'display_order'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'menu_categories'
      and column_name = 'sort_order'
  ) then
    alter table public.menu_categories
      rename column display_order to sort_order;
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'menu_categories'
      and column_name = 'sort_order'
  ) then
    alter table public.menu_categories
      add column sort_order integer not null default 0;
  end if;
end;
$$;
