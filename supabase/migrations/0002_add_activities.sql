-- Fase 10: agregar columna activities a members
-- Valores válidos del array: 'gimnasio' | 'muay_thai'
-- Un miembro puede tener una o ambas actividades.

alter table public.members
  add column if not exists activities text[] not null default '{gimnasio}';
