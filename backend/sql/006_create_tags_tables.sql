-- Migration 006: Create tags (etiquetas) and movement tags (movimiento_etiquetas) tables
CREATE TABLE IF NOT EXISTS etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movimiento_etiquetas (
  movimiento_id UUID NOT NULL REFERENCES movimientos(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  PRIMARY KEY (movimiento_id, etiqueta_id)
);
