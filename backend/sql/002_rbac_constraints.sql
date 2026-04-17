-- Ejecutar en Supabase SQL Editor despues de 001_create_ingresos.sql.
-- Refuerza integridad de asignaciones de roles por usuario.

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuario_roles_usuario_rol
  ON public.usuario_roles(usuario_id, rol_id);

CREATE INDEX IF NOT EXISTS idx_usuario_roles_usuario_id
  ON public.usuario_roles(usuario_id);

CREATE INDEX IF NOT EXISTS idx_usuario_roles_rol_id
  ON public.usuario_roles(rol_id);
