-- Migration 004: Unificar esquema de Compra Inteligente
-- Resuelve conflicto entre 001 (ENUM) y 003 (TEXT)
-- Fecha: 2026-02-06

-- =============================================
-- PASO 1: Cambiar estado de ENUM a TEXT
-- =============================================

-- Añadir columna temporal TEXT
ALTER TABLE listas_compra 
ADD COLUMN IF NOT EXISTS estado_temp TEXT;

-- Migrar valores existentes (mapear ENUM a nuevos valores)
UPDATE listas_compra SET estado_temp = 
  CASE 
    WHEN estado::text = 'borrador' THEN 'activa'
    WHEN estado::text = 'en_compra' THEN 'activa'
    WHEN estado::text = 'finalizada' THEN 'completada'
    ELSE 'activa'
  END
WHERE estado_temp IS NULL;

-- Eliminar columna vieja y constraint
ALTER TABLE listas_compra DROP COLUMN IF EXISTS estado;

-- Renombrar temporal a estado
ALTER TABLE listas_compra RENAME COLUMN estado_temp TO estado;

-- Añadir constraint CHECK
ALTER TABLE listas_compra 
ADD CONSTRAINT listas_compra_estado_check 
CHECK (estado IN ('activa', 'completada', 'cancelada'));

-- Valor por defecto
ALTER TABLE listas_compra 
ALTER COLUMN estado SET DEFAULT 'activa';

-- =============================================
-- PASO 2: Añadir columnas faltantes en listas_compra
-- =============================================

-- completed_at (de 003)
ALTER TABLE listas_compra 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Asegurar que created_by existe (de 001)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listas_compra' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE listas_compra ADD COLUMN created_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- Asegurar que total_gastado existe (de 001)
ALTER TABLE listas_compra 
ADD COLUMN IF NOT EXISTS total_gastado INTEGER DEFAULT 0;

-- =============================================
-- PASO 3: Unificar productos_lista
-- =============================================

-- cantidad como TEXT (más flexible: "2", "500g", "1 docena")
-- Si es INTEGER, convertir a TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'productos_lista' 
      AND column_name = 'cantidad' 
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE productos_lista ALTER COLUMN cantidad TYPE TEXT USING cantidad::TEXT;
  END IF;
END $$;

-- Añadir unidad si no existe (para compatibilidad con 003)
ALTER TABLE productos_lista 
ADD COLUMN IF NOT EXISTS unidad TEXT DEFAULT 'ud';

-- Añadir categoria si era ENUM, convertir a TEXT
DO $$
BEGIN
  -- Si categoria es ENUM, convertir a TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    JOIN information_schema.element_types e ON 
      c.table_name = e.object_name AND c.column_name = e.collection_type_identifier
    WHERE c.table_name = 'productos_lista' AND c.column_name = 'categoria'
  ) THEN
    ALTER TABLE productos_lista ALTER COLUMN categoria TYPE TEXT USING categoria::TEXT;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignorar si ya es TEXT
END $$;

-- =============================================
-- PASO 4: Crear tablas de 003 si no existen
-- =============================================

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
  total INTEGER NOT NULL DEFAULT 0,
  num_productos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PASO 5: Indexes y RLS
-- =============================================

-- Indexes (IF NOT EXISTS para evitar errores)
CREATE INDEX IF NOT EXISTS idx_listas_compra_hogar ON listas_compra(hogar_id);
CREATE INDEX IF NOT EXISTS idx_listas_compra_estado ON listas_compra(estado);
CREATE INDEX IF NOT EXISTS idx_productos_lista_lista ON productos_lista(lista_id);
CREATE INDEX IF NOT EXISTS idx_productos_frecuentes_hogar ON productos_frecuentes(hogar_id);
CREATE INDEX IF NOT EXISTS idx_historial_compras_hogar ON historial_compras(hogar_id);
CREATE INDEX IF NOT EXISTS idx_historial_compras_fecha ON historial_compras(fecha);

-- RLS
ALTER TABLE productos_frecuentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_compras ENABLE ROW LEVEL SECURITY;

-- Policies (DROP primero para evitar duplicados)
DROP POLICY IF EXISTS "productos_frecuentes_policy" ON productos_frecuentes;
DROP POLICY IF EXISTS "historial_compras_policy" ON historial_compras;

CREATE POLICY "productos_frecuentes_policy" ON productos_frecuentes
  FOR ALL USING (hogar_id = get_my_hogar_id());
CREATE POLICY "historial_compras_policy" ON historial_compras
  FOR ALL USING (hogar_id = get_my_hogar_id());

-- =============================================
-- PASO 6: Limpiar tipos ENUM obsoletos
-- =============================================

-- Intentar eliminar ENUM si ya no se usa
DROP TYPE IF EXISTS estado_lista CASCADE;
DROP TYPE IF EXISTS categoria_producto CASCADE;

-- =============================================
-- Verificación final
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Migration 004 completada. Esquema unificado.';
  RAISE NOTICE 'listas_compra.estado ahora es TEXT con valores: activa, completada, cancelada';
END $$;
