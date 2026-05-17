-- Función que elimina miembros inactivos con más de 30 días de inactividad.
-- Un miembro es "inactivo" cuando due_date < now() - 30 días (según trigger auto_set_inactive).
-- Lo eliminamos cuando lleva otros 30 días más inactivo: due_date < now() - 60 días.
CREATE OR REPLACE FUNCTION cleanup_old_inactive_members()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM members
  WHERE status = 'inactivo'
    AND due_date < now() - interval '60 days';
END;
$$;
