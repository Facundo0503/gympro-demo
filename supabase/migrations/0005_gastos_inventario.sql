-- Migración: Gestión de Gastos e Inventario
-- Agrega tablas para productos (inventario), ventas de productos y gastos del gimnasio.

-- ============================================================
-- Tabla products (inventario de productos)
-- ============================================================
create table if not exists public.products (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  description     text,
  category        text        not null default 'otro'
                              check (category in ('proteina', 'creatina', 'barra', 'merch', 'otro')),
  purchase_price  numeric     not null default 0,
  sale_price      numeric     not null,
  stock_quantity  integer     not null default 0,
  unit            text        not null default 'unidad'
                              check (unit in ('unidad', 'kg', 'g')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_auth"
  on public.products for select
  using (auth.uid() is not null);

create policy "products_insert_auth"
  on public.products for insert
  with check (auth.uid() is not null);

create policy "products_update_auth"
  on public.products for update
  using (auth.uid() is not null);

create policy "products_delete_auth"
  on public.products for delete
  using (auth.uid() is not null);

-- Reutilizar la función set_updated_at() que ya existe en el schema inicial
create trigger set_updated_at_products
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Tabla product_sales (ventas de productos)
-- ============================================================
create table if not exists public.product_sales (
  id              uuid        primary key default gen_random_uuid(),
  product_id      uuid        not null references public.products(id) on delete restrict,
  quantity        integer     not null default 1 check (quantity > 0),
  unit_price      numeric     not null,
  total_amount    numeric     not null,
  sold_at         timestamptz not null default now(),
  payment_method  text        check (payment_method in ('efectivo', 'transferencia')),
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists product_sales_product_id_idx
  on public.product_sales(product_id);

create index if not exists product_sales_sold_at_idx
  on public.product_sales(sold_at);

alter table public.product_sales enable row level security;

create policy "product_sales_select_auth"
  on public.product_sales for select
  using (auth.uid() is not null);

create policy "product_sales_insert_auth"
  on public.product_sales for insert
  with check (auth.uid() is not null);

create policy "product_sales_update_auth"
  on public.product_sales for update
  using (auth.uid() is not null);

create policy "product_sales_delete_auth"
  on public.product_sales for delete
  using (auth.uid() is not null);

-- Trigger: decrementar stock al registrar una venta
create or replace function public.decrease_product_stock()
returns trigger
language plpgsql
as $$
begin
  update public.products
    set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id;
  return new;
end;
$$;

create trigger trg_decrease_stock
  after insert on public.product_sales
  for each row execute procedure public.decrease_product_stock();

-- ============================================================
-- Tabla expenses (gastos del gimnasio)
-- ============================================================
create table if not exists public.expenses (
  id            uuid        primary key default gen_random_uuid(),
  category      text        not null default 'otro'
                            check (category in ('alquiler', 'servicios', 'equipamiento', 'sueldos', 'marketing', 'otro')),
  description   text        not null,
  amount        numeric     not null check (amount > 0),
  expense_date  date        not null default current_date,
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists expenses_expense_date_idx
  on public.expenses(expense_date);

alter table public.expenses enable row level security;

create policy "expenses_select_auth"
  on public.expenses for select
  using (auth.uid() is not null);

create policy "expenses_insert_auth"
  on public.expenses for insert
  with check (auth.uid() is not null);

create policy "expenses_update_auth"
  on public.expenses for update
  using (auth.uid() is not null);

create policy "expenses_delete_auth"
  on public.expenses for delete
  using (auth.uid() is not null);
