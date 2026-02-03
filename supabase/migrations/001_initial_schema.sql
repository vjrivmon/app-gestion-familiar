-- =============================================
-- App de Pus - Initial Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- ENUMs
CREATE TYPE estado_lista AS ENUM ('borrador', 'en_compra', 'finalizada');
CREATE TYPE categoria_producto AS ENUM (
  'general', 'frescos', 'carniceria', 'pescaderia', 
  'lacteos', 'panaderia', 'limpieza', 'otros'
);
CREATE TYPE tipo_comida AS ENUM ('comida', 'cena');
CREATE TYPE categoria_gasto AS ENUM (
  'alquiler', 'suministros', 'internet_movil', 'supermercado',
  'transporte', 'ocio', 'ropa', 'salud', 'suscripciones', 'ia', 'otros'
);
CREATE TYPE categoria_ingreso AS ENUM (
  'nomina', 'pagas_extra', 'freelance', 'becas', 'efectivo', 'otros', 'transferencia'
);
CREATE TYPE tipo_dinero AS ENUM ('efectivo', 'digital');
CREATE TYPE pagador AS ENUM ('m1', 'm2', 'conjunta');

-- =============================================
-- PROFILES (linked to auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  avatar_url TEXT,
  hogar_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- HOGARES (shared household between 2 users)
-- =============================================
CREATE TABLE hogares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL DEFAULT 'Mi Hogar',
  codigo_invitacion TEXT UNIQUE,
  codigo_expira_at TIMESTAMPTZ,
  miembro_1_id UUID REFERENCES profiles(id),
  miembro_2_id UUID REFERENCES profiles(id),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LISTAS DE COMPRA
-- =============================================
CREATE TABLE listas_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  nombre TEXT NOT NULL DEFAULT '',
  presupuesto INTEGER NOT NULL DEFAULT 0,  -- céntimos
  supermercado TEXT,
  estado estado_lista NOT NULL DEFAULT 'borrador',
  total_gastado INTEGER NOT NULL DEFAULT 0,  -- céntimos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listas_hogar ON listas_compra(hogar_id);
CREATE INDEX idx_listas_estado ON listas_compra(estado);

-- =============================================
-- PRODUCTOS EN LISTA
-- =============================================
CREATE TABLE productos_lista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id UUID NOT NULL REFERENCES listas_compra(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cantidad TEXT DEFAULT '1',
  categoria categoria_producto NOT NULL DEFAULT 'general',
  comprado BOOLEAN NOT NULL DEFAULT false,
  precio INTEGER,  -- céntimos (null = no comprado aún)
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_productos_lista ON productos_lista(lista_id);

-- =============================================
-- COMPRAS FINALIZADAS (historial)
-- =============================================
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  lista_id UUID REFERENCES listas_compra(id),
  supermercado TEXT NOT NULL,
  total INTEGER NOT NULL,  -- céntimos
  presupuesto INTEGER,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE compra_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria categoria_producto,
  precio INTEGER NOT NULL,  -- céntimos
  cantidad TEXT DEFAULT '1'
);

-- =============================================
-- MENÚ SEMANAL
-- =============================================
CREATE TABLE menus_semanales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  semana_inicio DATE NOT NULL,  -- Monday of the week
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hogar_id, semana_inicio)
);

CREATE TABLE menu_dias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus_semanales(id) ON DELETE CASCADE,
  dia DATE NOT NULL,
  tipo tipo_comida NOT NULL,
  receta_id UUID,  -- NULL = sin planificar
  notas TEXT,
  UNIQUE(menu_id, dia, tipo)
);

-- =============================================
-- RECETAS
-- =============================================
CREATE TABLE recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tiempo_minutos INTEGER,
  porciones INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE receta_ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cantidad TEXT,
  categoria categoria_producto DEFAULT 'general'
);

-- Foreign key for menu_dias -> recetas
ALTER TABLE menu_dias ADD FOREIGN KEY (receta_id) REFERENCES recetas(id);

-- =============================================
-- GASTOS
-- =============================================
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  importe INTEGER NOT NULL,  -- céntimos
  categoria categoria_gasto NOT NULL,
  pagador pagador NOT NULL,
  tipo_dinero tipo_dinero NOT NULL DEFAULT 'digital',
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  transferencia_id UUID,  -- if this is part of a transfer
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gastos_hogar ON gastos(hogar_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha DESC);
CREATE INDEX idx_gastos_categoria ON gastos(categoria);

-- =============================================
-- INGRESOS
-- =============================================
CREATE TABLE ingresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  importe INTEGER NOT NULL,  -- céntimos
  categoria categoria_ingreso NOT NULL,
  destinatario pagador NOT NULL,
  tipo_dinero tipo_dinero NOT NULL DEFAULT 'digital',
  es_fijo BOOLEAN NOT NULL DEFAULT false,
  es_proyectado BOOLEAN NOT NULL DEFAULT false,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  transferencia_id UUID,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ingresos_hogar ON ingresos(hogar_id);
CREATE INDEX idx_ingresos_fecha ON ingresos(fecha DESC);

-- =============================================
-- PRODUCTOS FRECUENTES
-- =============================================
CREATE TABLE productos_frecuentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hogar_id UUID NOT NULL REFERENCES hogares(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  categoria categoria_producto DEFAULT 'general',
  uso_count INTEGER NOT NULL DEFAULT 1,
  ultimo_uso TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hogar_id, nombre)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hogares ENABLE ROW LEVEL SECURITY;
ALTER TABLE listas_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_lista ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus_semanales ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_dias ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_frecuentes ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Helper function: get user's hogar_id
CREATE OR REPLACE FUNCTION get_my_hogar_id()
RETURNS UUID AS $$
  SELECT hogar_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Hogares: members can access their hogar
CREATE POLICY "Members can view their hogar" ON hogares
  FOR SELECT USING (id = get_my_hogar_id());
CREATE POLICY "Members can update their hogar" ON hogares
  FOR UPDATE USING (id = get_my_hogar_id());
CREATE POLICY "Users can create hogar" ON hogares
  FOR INSERT WITH CHECK (true);

-- All hogar-linked tables: use same pattern
CREATE POLICY "Members can access listas" ON listas_compra
  FOR ALL USING (hogar_id = get_my_hogar_id());

CREATE POLICY "Members can access productos_lista" ON productos_lista
  FOR ALL USING (lista_id IN (SELECT id FROM listas_compra WHERE hogar_id = get_my_hogar_id()));

CREATE POLICY "Members can access compras" ON compras
  FOR ALL USING (hogar_id = get_my_hogar_id());

CREATE POLICY "Members can access compra_items" ON compra_items
  FOR ALL USING (compra_id IN (SELECT id FROM compras WHERE hogar_id = get_my_hogar_id()));

CREATE POLICY "Members can access menus" ON menus_semanales
  FOR ALL USING (hogar_id = get_my_hogar_id());

CREATE POLICY "Members can access menu_dias" ON menu_dias
  FOR ALL USING (menu_id IN (SELECT id FROM menus_semanales WHERE hogar_id = get_my_hogar_id()));

CREATE POLICY "Members can access recetas" ON recetas
  FOR ALL USING (hogar_id = get_my_hogar_id());

CREATE POLICY "Members can access receta_ingredientes" ON receta_ingredientes
  FOR ALL USING (receta_id IN (SELECT id FROM recetas WHERE hogar_id = get_my_hogar_id()));

CREATE POLICY "Members can access gastos" ON gastos
  FOR ALL USING (hogar_id = get_my_hogar_id());

CREATE POLICY "Members can access ingresos" ON ingresos
  FOR ALL USING (hogar_id = get_my_hogar_id());

CREATE POLICY "Members can access productos_frecuentes" ON productos_frecuentes
  FOR ALL USING (hogar_id = get_my_hogar_id());

-- =============================================
-- REALTIME
-- =============================================
-- Enable realtime for collaborative tables
ALTER PUBLICATION supabase_realtime ADD TABLE listas_compra;
ALTER PUBLICATION supabase_realtime ADD TABLE productos_lista;
ALTER PUBLICATION supabase_realtime ADD TABLE menus_semanales;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_dias;
ALTER PUBLICATION supabase_realtime ADD TABLE gastos;
ALTER PUBLICATION supabase_realtime ADD TABLE ingresos;
