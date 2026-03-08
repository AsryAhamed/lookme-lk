-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- ENUMS
create type order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

create type size_type as enum ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'custom');

-- CATEGORIES
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

insert into categories (name, slug, sort_order) values
  ('Salwar Kameez', 'salwar-kameez', 1),
  ('Kurtis',        'kurtis',        2),
  ('Lehengas',      'lehengas',      3),
  ('Anarkali Suits','anarkali',      4),
  ('Churidar Sets', 'churidar',      5),
  ('Festive Wear',  'festive',       6),
  ('Bridal',        'bridal',        7);

-- PRODUCTS
create table products (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text not null unique,
  description     text,
  category_id     uuid references categories(id) on delete set null,
  price           numeric(10,2) not null,
  compare_price   numeric(10,2),
  cost_price      numeric(10,2),
  sku             text unique,
  stock_qty       int default 0,
  low_stock_alert int default 5,
  sizes           size_type[] default '{}',
  colors          text[] default '{}',
  images          text[] default '{}',
  is_featured     boolean default false,
  is_new_arrival  boolean default false,
  is_active       boolean default true,
  tags            text[] default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- AUTO UPDATE updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- CUSTOMERS
create table customers (
  id           uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name    text not null,
  email        text,
  phone        text not null unique,
  address      text,
  city         text,
  district     text,
  notes        text,
  total_orders int default 0,
  total_spent  numeric(12,2) default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger customers_updated_at
  before update on customers
  for each row execute function set_updated_at();

-- ORDERS
create table orders (
  id                uuid primary key default uuid_generate_v4(),
  order_number      text not null unique,
  customer_id       uuid references customers(id) on delete set null,
  status            order_status default 'pending',
  subtotal          numeric(10,2) not null,
  delivery_fee      numeric(10,2) default 350,
  discount_amount   numeric(10,2) default 0,
  total             numeric(10,2) not null,
  delivery_address  text,
  delivery_city     text,
  delivery_district text,
  notes             text,
  admin_notes       text,
  source            text default 'website',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create sequence order_number_seq start 1;

create or replace function generate_order_number()
returns trigger as $$
begin
  new.order_number = 'LM-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('order_number_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger orders_number
  before insert on orders
  for each row execute function generate_order_number();

-- ORDER ITEMS
create table order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_name text not null,
  product_sku  text,
  size         size_type,
  color        text,
  quantity     int not null default 1,
  unit_price   numeric(10,2) not null,
  total_price  numeric(10,2) generated always as (quantity * unit_price) stored,
  image_url    text,
  created_at   timestamptz default now()
);

-- BANNERS
create table banners (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  subtitle    text,
  image_url   text not null,
  link_url    text,
  button_text text default 'Shop Now',
  sort_order  int default 0,
  is_active   boolean default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz default now()
);

-- ADMIN USERS
create table admin_users (
  id           uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade unique,
  full_name    text not null,
  role         text default 'admin',
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table categories   enable row level security;
alter table products     enable row level security;
alter table customers    enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;
alter table banners      enable row level security;
alter table admin_users  enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users
    where auth_user_id = auth.uid() and is_active = true
  );
$$ language sql security definer;

create policy "categories_public_read"  on categories  for select using (true);
create policy "categories_admin_write"  on categories  for all    using (is_admin());
create policy "products_public_read"    on products    for select using (is_active = true);
create policy "products_admin_all"      on products    for all    using (is_admin());
create policy "banners_public_read"     on banners     for select using (is_active = true);
create policy "banners_admin_all"       on banners     for all    using (is_admin());
create policy "customers_admin_all"     on customers   for all    using (is_admin());
create policy "orders_admin_all"        on orders      for all    using (is_admin());
create policy "order_items_admin_all"   on order_items for all    using (is_admin());
create policy "admin_users_self_read"   on admin_users for select using (auth_user_id = auth.uid());
create policy "admin_users_admin_all"   on admin_users for all    using (is_admin());

-- PLACE ORDER RPC (public checkout)
create or replace function place_order(
  p_customer_name     text,
  p_customer_phone    text,
  p_customer_email    text default null,
  p_delivery_address  text default null,
  p_delivery_city     text default null,
  p_delivery_district text default null,
  p_notes             text default null,
  p_items             jsonb default '[]'
)
returns uuid
language plpgsql security definer
as $$
declare
  v_customer_id uuid;
  v_order_id    uuid;
  v_subtotal    numeric := 0;
  v_item        jsonb;
begin
  insert into customers (full_name, phone, email, address, city, district)
  values (p_customer_name, p_customer_phone, p_customer_email,
          p_delivery_address, p_delivery_city, p_delivery_district)
  on conflict (phone) do update
    set full_name = excluded.full_name, updated_at = now()
  returning id into v_customer_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_subtotal := v_subtotal + (v_item->>'unit_price')::numeric * (v_item->>'quantity')::int;
  end loop;

  insert into orders (customer_id, subtotal, total, delivery_address,
                      delivery_city, delivery_district, notes, source)
  values (v_customer_id, v_subtotal, v_subtotal + 350,
          p_delivery_address, p_delivery_city, p_delivery_district, p_notes, 'website')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into order_items (order_id, product_id, product_name, product_sku,
                              size, color, quantity, unit_price, image_url)
    values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      v_item->>'product_sku',
      (v_item->>'size')::size_type,
      v_item->>'color',
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      v_item->>'image_url'
    );
  end loop;

  update customers
  set total_orders = total_orders + 1,
      total_spent  = total_spent + v_subtotal
  where id = v_customer_id;

  return v_order_id;
end;
$$;

-- SAMPLE DATA
insert into products (name, slug, description, price, compare_price, stock_qty, sizes, is_featured, is_new_arrival, tags)
values
(
  'Embroidered Maroon Salwar Set', 'embroidered-maroon-salwar',
  'Stunning embroidered maroon salwar kameez with dupatta. Perfect for festive occasions.',
  6500, 8000, 15, array['S','M','L','XL']::size_type[], true, true, array['embroidered','festive']
),
(
  'Silk Emerald Kurti', 'silk-emerald-kurti',
  'Elegant silk kurti in deep emerald green. Suitable for casual and semi-formal wear.',
  3200, null, 25, array['S','M','L','XL','XXL']::size_type[], true, true, array['silk','casual']
),
(
  'Bridal Red Lehenga', 'bridal-red-lehenga',
  'Gorgeous bridal lehenga in rich red with gold zari work.',
  18500, null, 5, array['S','M','L','XL']::size_type[], true, false, array['bridal','wedding']
),
(
  'Golden Anarkali Set', 'golden-anarkali-set',
  'Floor-length golden anarkali suit with heavy embroidery.',
  9800, 12000, 10, array['S','M','L','XL']::size_type[], false, false, array['anarkali','festive']
);