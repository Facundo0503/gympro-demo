-- Fase: importación de datos reales
-- Agrega member_number, dni a members y payment_method a payment_history

alter table public.members
  add column if not exists member_number integer unique,
  add column if not exists dni          text;

alter table public.payment_history
  add column if not exists payment_method text
    check (payment_method in ('efectivo', 'transferencia'));
