-- Migración inicial — MK Gym Manager
-- Sistema de gestión de cuotas para un solo admin (single-tenant).

create extension if not exists "uuid-ossp";

-- ============================================================
-- Tabla members
-- ============================================================
create table if not exists public.members (
  id              uuid        primary key default gen_random_uuid(),
  first_name      text        not null,
  last_name       text        not null,
  age             integer,
  whatsapp        text,
  start_date      date        not null,
  months_attended integer     not null default 0,
  monthly_fee     numeric     not null,
  due_date        date        not null,
  status          text        not null default 'al_dia'
                              check (status in ('al_dia', 'proximo_vencer', 'vencido', 'inactivo')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.members enable row level security;

create policy "members_select_auth"
  on public.members for select
  using (auth.uid() is not null);

create policy "members_insert_auth"
  on public.members for insert
  with check (auth.uid() is not null);

create policy "members_update_auth"
  on public.members for update
  using (auth.uid() is not null);

create policy "members_delete_auth"
  on public.members for delete
  using (auth.uid() is not null);

-- ============================================================
-- Tabla payment_history
-- ============================================================
create table if not exists public.payment_history (
  id         uuid        primary key default gen_random_uuid(),
  member_id  uuid        not null references public.members(id) on delete cascade,
  amount     numeric     not null,
  paid_at    timestamptz not null default now(),
  notes      text
);

create index if not exists payment_history_member_id_idx
  on public.payment_history(member_id);

alter table public.payment_history enable row level security;

create policy "payment_history_select_auth"
  on public.payment_history for select
  using (auth.uid() is not null);

create policy "payment_history_insert_auth"
  on public.payment_history for insert
  with check (auth.uid() is not null);

create policy "payment_history_update_auth"
  on public.payment_history for update
  using (auth.uid() is not null);

create policy "payment_history_delete_auth"
  on public.payment_history for delete
  using (auth.uid() is not null);

-- ============================================================
-- Tabla whatsapp_messages
-- ============================================================
create table if not exists public.whatsapp_messages (
  id           uuid        primary key default gen_random_uuid(),
  member_id    uuid        not null references public.members(id) on delete cascade,
  message_type text        not null check (message_type in ('reminder', 'overdue')),
  message_body text        not null,
  sent_at      timestamptz not null default now()
);

create index if not exists whatsapp_messages_member_id_idx
  on public.whatsapp_messages(member_id);

alter table public.whatsapp_messages enable row level security;

create policy "whatsapp_messages_select_auth"
  on public.whatsapp_messages for select
  using (auth.uid() is not null);

create policy "whatsapp_messages_insert_auth"
  on public.whatsapp_messages for insert
  with check (auth.uid() is not null);

create policy "whatsapp_messages_update_auth"
  on public.whatsapp_messages for update
  using (auth.uid() is not null);

create policy "whatsapp_messages_delete_auth"
  on public.whatsapp_messages for delete
  using (auth.uid() is not null);

-- ============================================================
-- Trigger: auto-actualizar updated_at en members
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_members
  before update on public.members
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Trigger: auto-inactivar si due_date > 30 días vencido
-- ============================================================
create or replace function public.auto_set_inactive()
returns trigger
language plpgsql
as $$
begin
  if new.due_date < (current_date - interval '30 days')
     and new.status <> 'inactivo' then
    new.status := 'inactivo';
  end if;
  return new;
end;
$$;

create trigger check_inactive_status
  before update on public.members
  for each row execute procedure public.auto_set_inactive();

-- ============================================================
-- Función helper: recalcular status de todos los members
-- Llamar periódicamente o desde la app al cargar el dashboard.
-- ============================================================
create or replace function public.refresh_member_statuses()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Pasar a inactivo: vencido hace más de 30 días
  update public.members
  set status = 'inactivo'
  where due_date < (current_date - interval '30 days')
    and status <> 'inactivo';

  -- Pasar a vencido: due_date pasó pero menos de 30 días
  update public.members
  set status = 'vencido'
  where due_date < current_date
    and due_date >= (current_date - interval '30 days')
    and status not in ('inactivo', 'vencido');

  -- Pasar a proximo_vencer: vence en los próximos 5 días
  update public.members
  set status = 'proximo_vencer'
  where due_date >= current_date
    and due_date <= (current_date + interval '5 days')
    and status not in ('inactivo', 'proximo_vencer');

  -- Pasar a al_dia: vence en más de 5 días
  update public.members
  set status = 'al_dia'
  where due_date > (current_date + interval '5 days')
    and status not in ('inactivo', 'al_dia');
end;
$$;
