-- Migration: Compra Inteligente
-- Fecha: 2026-02-03

-- Listas de compra
CREATE TABLE IF NOT EXISTS listas_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID REFERENCES hogares(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Lista de compra',
  presupuesto INTEGER, -- céntimos
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'cancelada')),
  supermercado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Productos en lista
CREATE TABLE IF NOT EXISTS productos_lista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id UUID REFERENCES listas_compra(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  unidad TEXT DEFAULT 'ud',
  precio INTEGER, -- céntimos, NULL si no escaneado aún
  comprado BOOLEAN DEFAULT FALSE,
  categoria TEXT DEFAULT 'general',
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos frecuentes
CREATE TABLE IF NOT EXISTS productos_frecuentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID REFERENCES hogares(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria TEXT DEFAULT 'general',
  uso_count INTEGER DEFAULT 1,
  ultimo_precio INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hogar_id, nombre)
);

-- Historial de compras
CREATE TABLE IF NOT EXISTS historial_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID REFERENCES hogares(id) ON DELETE CASCADE,
  lista_id UUID REFERENCES listas_compra(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  supermercado TEXT,
  total INTEGER NOT NULL, -- céntimos
  num_productos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_listas_compra_hogar ON listas_compra(hogar_id);
CREATE INDEX IF NOT EXISTS idx_listas_compra_estado ON listas_compra(estado);
CREATE INDEX IF NOT EXISTS idx_productos_lista_lista ON productos_lista(lista_id);
CREATE INDEX IF NOT EXISTS idx_productos_frecuentes_hogar ON productos_frecuentes(hogar_id);
CREATE INDEX IF NOT EXISTS idx_historial_compras_hogar ON historial_compras(hogar_id);
CREATE INDEX IF NOT EXISTS idx_historial_compras_fecha ON historial_compras(fecha);

-- RLS
ALTER TABLE listas_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_lista ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_frecuentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listas_compra_policy" ON listas_compra
  FOR ALL USING (hogar_id = get_my_hogar_id());
CREATE POLICY "productos_lista_policy" ON productos_lista
  FOR ALL USING (lista_id IN (SELECT id FROM listas_compra WHERE hogar_id = get_my_hogar_id()));
CREATE POLICY "productos_frecuentes_policy" ON productos_frecuentes
  FOR ALL USING (hogar_id = get_my_hogar_id());
CREATE POLICY "historial_compras_policy" ON historial_compras
  FOR ALL USING (hogar_id = get_my_hogar_id());
