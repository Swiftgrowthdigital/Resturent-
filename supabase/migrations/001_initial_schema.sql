-- Restaurant QR Ordering System: initial production schema and image storage.
-- This file is safe to run directly in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '',
  image text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  status boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_key unique (name)
);

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  image text not null default '',
  veg boolean not null default true,
  bestseller boolean not null default false,
  todays_special boolean not null default false,
  combo boolean not null default false,
  out_of_stock boolean not null default false,
  available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint foods_category_name_key unique (category_id, name)
);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint seats_name_key unique (name)
);

create index if not exists categories_active_sort_order_idx on public.categories (sort_order, name) where status = true;
create index if not exists foods_category_id_idx on public.foods (category_id);
create index if not exists foods_available_idx on public.foods (category_id, name) where available = true and out_of_stock = false;
create index if not exists seats_active_name_idx on public.seats (name) where active = true;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists set_foods_updated_at on public.foods;
create trigger set_foods_updated_at before update on public.foods for each row execute function public.set_updated_at();
drop trigger if exists set_seats_updated_at on public.seats;
create trigger set_seats_updated_at before update on public.seats for each row execute function public.set_updated_at();

-- The application currently uses MongoDB for ordering data. Keep these tables private
-- until a deliberate data-source migration is made; the service role bypasses RLS.
alter table public.categories enable row level security;
alter table public.foods enable row level security;
alter table public.seats enable row level security;

insert into public.categories (name, sort_order)
values
  ('Pizza', 1), ('Burger', 2), ('Pasta', 3), ('Maggi', 4), ('French Fries', 5), ('Softy', 6)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.seats (name)
select 'Seat ' || generate_series
from generate_series(1, 20)
on conflict (name) do nothing;

-- Public delivery is required for menu/category image URLs. Uploads remain server mediated.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-images',
  'restaurant-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read restaurant images" on storage.objects;
create policy "Public read restaurant images"
on storage.objects for select to public
using (bucket_id = 'restaurant-images');

drop policy if exists "Authenticated upload restaurant images" on storage.objects;
create policy "Authenticated upload restaurant images"
on storage.objects for insert to authenticated
with check (bucket_id = 'restaurant-images');

drop policy if exists "Authenticated update restaurant images" on storage.objects;
create policy "Authenticated update restaurant images"
on storage.objects for update to authenticated
using (bucket_id = 'restaurant-images')
with check (bucket_id = 'restaurant-images');

drop policy if exists "Authenticated delete restaurant images" on storage.objects;
create policy "Authenticated delete restaurant images"
on storage.objects for delete to authenticated
using (bucket_id = 'restaurant-images');
