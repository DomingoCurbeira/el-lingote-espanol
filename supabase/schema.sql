-- ==============================================================================
-- SCHEMA EL LINGOTE ESPAÑOL - SUPABASE (CON SEGURIDAD RLS, AUTH Y RASTREO)
-- ==============================================================================

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 2. Tabla de Pedidos (orders)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_phone text not null,
  people_count integer not null default 4,
  pickup_date date not null,
  pickup_time text not null,
  subtotal numeric(10, 2) not null default 0.00,
  total numeric(10, 2) not null default 0.00,
  status text not null default 'pending' check (status in ('pending', 'deposit_paid', 'fully_paid', 'in_production', 'ready', 'delivered', 'cancelled')),
  has_paella boolean not null default false,
  notes text default ''
);

-- 3. Tabla de Ítems del Pedido (order_items)
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null default 0.00,
  total_price numeric(10, 2) not null default 0.00
);

-- 4. Índices para consultas de disponibilidad y rastreo
create index if not exists idx_orders_pickup_date on public.orders(pickup_date);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_customer_phone on public.orders(customer_phone);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- 5. Vista de Ocupación por Franja Horaria (slots_occupancy)
create or replace view public.slots_occupancy as
select 
  pickup_date,
  pickup_time,
  count(*) as total_orders,
  count(*) filter (where has_paella = true) as paella_orders
from public.orders
where status not in ('cancelled')
group by pickup_date, pickup_time;

-- 6. HABILITAR SEGURIDAD RLS (ROW LEVEL SECURITY)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Limpiar políticas anteriores
drop policy if exists "Público puede crear pedidos" on public.orders;
drop policy if exists "Público puede insertar items" on public.order_items;
drop policy if exists "Público puede leer fechas y horas para disponibilidad" on public.orders;
drop policy if exists "Solo autenticados pueden ver items de pedidos" on public.order_items;
drop policy if exists "Solo administradores autenticados pueden actualizar pedidos" on public.orders;

-- 6.1 INSERCIÓN PÚBLICA
create policy "Público puede crear pedidos" on public.orders
  for insert with check (true);

create policy "Público puede insertar items" on public.order_items
  for insert with check (true);

-- 6.2 LECTURA PÚBLICA DE DISPONIBILIDAD Y RASTREO
create policy "Público puede leer pedidos para rastreo y disponibilidad" on public.orders
  for select using (true);

create policy "Público puede leer items de pedido para rastreo" on public.order_items
  for select using (true);

-- 6.3 ACTUALIZACIÓN Y ELIMINACIÓN: Solo usuarios AUTENTICADOS (Supabase Auth)
create policy "Solo administradores autenticados pueden actualizar pedidos" on public.orders
  for update using (auth.role() = 'authenticated');

create policy "Solo administradores autenticados pueden eliminar pedidos" on public.orders
  for delete using (auth.role() = 'authenticated');
