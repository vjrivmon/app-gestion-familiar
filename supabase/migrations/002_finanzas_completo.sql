-- =============================================
-- App de Pus - Phase 2: Finanzas Completo
-- Migration 002
-- =============================================

-- ENUMs adicionales
CREATE TYPE estado_beca AS ENUM ('pendiente', 'mensual', 'cobrada');

-- =============================================
-- BECAS (Becas y Ayudas)
-- =============================================
CREATE TABLE becas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  importe INTEGER NOT NULL,  -- céntimos
  persona pagador NOT NULL,
  estado estado_beca NOT NULL DEFAULT 'pendiente',
  num_pagos INTEGER NOT NULL DEFAULT 1,
  fecha_cobro DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_becas_hogar ON becas(hogar_id);

-- =============================================
-- PRÉSTAMOS (Préstamos internos entre miembros)
-- =============================================
CREATE TABLE prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  de_quien pagador NOT NULL,
  a_quien pagador NOT NULL,
  importe INTEGER NOT NULL,  -- céntimos
  concepto TEXT,
  pagado BOOLEAN NOT NULL DEFAULT false,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_pago DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prestamos_hogar ON prestamos(hogar_id);
CREATE INDEX idx_prestamos_pagado ON prestamos(pagado);

-- =============================================
-- METAS DE AHORRO
-- =============================================
CREATE TABLE metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  objetivo INTEGER NOT NULL,  -- céntimos
  actual INTEGER NOT NULL DEFAULT 0,  -- céntimos
  color TEXT NOT NULL DEFAULT '#7D8B74',
  fecha_limite DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_metas_hogar ON metas(hogar_id);

-- =============================================
-- TAREAS DEL HOGAR
-- =============================================
CREATE TABLE tareas_hogar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT '🏠',
  frecuencia_dias INTEGER NOT NULL DEFAULT 7,
  ultima_vez TIMESTAMPTZ,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tareas_hogar ON tareas_hogar(hogar_id);

-- =============================================
-- HISTORIAL DE TAREAS
-- =============================================
CREATE TABLE tareas_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id UUID NOT NULL REFERENCES tareas_hogar(id) ON DELETE CASCADE,
  completada_por UUID NOT NULL REFERENCES profiles(id),
  completada_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tareas_historial_tarea ON tareas_historial(tarea_id);
CREATE INDEX idx_tareas_historial_fecha ON tareas_historial(completada_at DESC);

-- =============================================
-- MODIFICAR INGRESOS
-- =============================================
-- Añadir relación con becas
ALTER TABLE ingresos ADD COLUMN beca_id UUID REFERENCES becas(id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on new tables
ALTER TABLE becas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas_hogar ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas_historial ENABLE ROW LEVEL SECURITY;

-- Policies for becas
CREATE POLICY "Members can access becas" ON becas
  FOR ALL USING (hogar_id = get_my_hogar_id());

-- Policies for prestamos
CREATE POLICY "Members can access prestamos" ON prestamos
  FOR ALL USING (hogar_id = get_my_hogar_id());

-- Policies for metas
CREATE POLICY "Members can access metas" ON metas
  FOR ALL USING (hogar_id = get_my_hogar_id());

-- Policies for tareas_hogar
CREATE POLICY "Members can access tareas_hogar" ON tareas_hogar
  FOR ALL USING (hogar_id = get_my_hogar_id());

-- Policies for tareas_historial
CREATE POLICY "Members can access tareas_historial" ON tareas_historial
  FOR ALL USING (tarea_id IN (SELECT id FROM tareas_hogar WHERE hogar_id = get_my_hogar_id()));

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE becas;
ALTER PUBLICATION supabase_realtime ADD TABLE prestamos;
ALTER PUBLICATION supabase_realtime ADD TABLE metas;
ALTER PUBLICATION supabase_realtime ADD TABLE tareas_hogar;

-- =============================================
-- FUNCIÓN: Crear tareas iniciales para un hogar
-- (Llamar después de crear un hogar)
-- =============================================
CREATE OR REPLACE FUNCTION crear_tareas_iniciales(p_hogar_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO tareas_hogar (hogar_id, nombre, icono, frecuencia_dias, orden) VALUES
    (p_hogar_id, 'Fregar platos', '🍽️', 1, 1),
    (p_hogar_id, 'Barrer/aspirar', '🧹', 3, 2),
    (p_hogar_id, 'Fregar suelo', '🪣', 7, 3),
    (p_hogar_id, 'Limpiar baño', '🚽', 7, 4),
    (p_hogar_id, 'Limpiar cocina', '🧽', 3, 5),
    (p_hogar_id, 'Hacer camas', '🛏️', 1, 6),
    (p_hogar_id, 'Sacar basura', '🗑️', 2, 7),
    (p_hogar_id, 'Poner lavadora', '🧺', 3, 8),
    (p_hogar_id, 'Tender ropa', '👕', 3, 9),
    (p_hogar_id, 'Planchar', '👔', 7, 10),
    (p_hogar_id, 'Compra semanal', '🛒', 7, 11),
    (p_hogar_id, 'Regar plantas', '🌱', 3, 12);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
