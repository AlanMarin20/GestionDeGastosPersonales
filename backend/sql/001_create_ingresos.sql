-- Ejecutar en Supabase SQL Editor para habilitar el modulo de ingresos del backend.
CREATE TABLE IF NOT EXISTS public.ingresos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id),
  categoria_id integer REFERENCES public.categorias(id),
  monto numeric NOT NULL,
  fuente character varying,
  descripcion text,
  fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
  creado_en timestamp without time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_id
  ON public.ingresos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_ingresos_categoria_id
  ON public.ingresos(categoria_id);
