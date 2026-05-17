-- Migración: Inactivos permanentes
-- Elimina la función que borraba miembros inactivos después de 60 días.
-- A partir de ahora los inactivos se conservan indefinidamente en el historial.

drop function if exists public.cleanup_old_inactive_members();
