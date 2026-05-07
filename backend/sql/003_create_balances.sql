-- Ejecutar en Supabase SQL Editor despues de 002_rbac_constraints.sql.
-- Crea la tabla de balances para almacenar ingreso, egreso y ahorro por período.

CREATE TABLE IF NOT EXISTS public.balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  ingreso numeric NOT NULL DEFAULT 0,
  egreso numeric NOT NULL DEFAULT 0,
  ahorro numeric NOT NULL DEFAULT 0,
  creado_en timestamp without time zone DEFAULT now(),
  actualizado_en timestamp without time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_balances_usuario_id
  ON public.balances(usuario_id);
