// =============================================
// App de Pus - Tipos de Finanzas
// =============================================

// Enums
export type Pagador = 'm1' | 'm2' | 'conjunta'
export type TipoDinero = 'efectivo' | 'digital'
export type CategoriaIngreso = 'nomina' | 'pagas_extra' | 'freelance' | 'becas' | 'efectivo' | 'otros' | 'transferencia'
export type CategoriaGasto = 'alquiler' | 'suministros' | 'internet_movil' | 'supermercado' | 'transporte' | 'ocio' | 'ropa' | 'salud' | 'suscripciones' | 'ia' | 'otros'
export type EstadoBeca = 'pendiente' | 'mensual' | 'cobrada'

// Interfaces
export interface Ingreso {
  id: string
  hogar_id: string
  concepto: string
  importe: number  // céntimos
  categoria: CategoriaIngreso
  destinatario: Pagador
  tipo_dinero: TipoDinero
  es_fijo: boolean
  es_proyectado: boolean
  fecha: string  // ISO date
  notas?: string
  transferencia_id?: string
  beca_id?: string
  created_by: string
  created_at: string
}

export interface Gasto {
  id: string
  hogar_id: string
  concepto: string
  importe: number  // céntimos
  categoria: CategoriaGasto
  pagador: Pagador
  tipo_dinero: TipoDinero
  fecha: string  // ISO date
  notas?: string
  transferencia_id?: string
  created_by: string
  created_at: string
}

export interface Beca {
  id: string
  hogar_id: string
  concepto: string
  importe: number  // céntimos
  persona: Pagador
  estado: EstadoBeca
  num_pagos: number
  fecha_cobro?: string  // ISO date
  created_at: string
}

export interface Prestamo {
  id: string
  hogar_id: string
  de_quien: Pagador
  a_quien: Pagador
  importe: number  // céntimos
  concepto?: string
  pagado: boolean
  fecha: string  // ISO date
  fecha_pago?: string  // ISO date
  created_at: string
}

export interface Meta {
  id: string
  hogar_id: string
  nombre: string
  objetivo: number  // céntimos
  actual: number  // céntimos
  color: string
  fecha_limite?: string  // ISO date
  created_at: string
}

// Helpers
export const NOMBRES: Record<Pagador, string> = {
  m1: 'Vicente',
  m2: 'Irene',
  conjunta: 'Conjunta'
}

export const PAGADORES: Pagador[] = ['m1', 'm2', 'conjunta']
export const PAGADORES_INDIVIDUALES: Pagador[] = ['m1', 'm2']

// Categorías de Ingreso con iconos
export const CATEGORIAS_INGRESO: { value: CategoriaIngreso; label: string; icon: string }[] = [
  { value: 'nomina', label: 'Nómina', icon: '💰' },
  { value: 'pagas_extra', label: 'Pagas Extra', icon: '🎁' },
  { value: 'freelance', label: 'Freelance', icon: '💻' },
  { value: 'becas', label: 'Becas/Ayudas', icon: '🎓' },
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🔄' },
  { value: 'otros', label: 'Otros', icon: '📝' },
]

// Categorías de Gasto con iconos
export const CATEGORIAS_GASTO: { value: CategoriaGasto; label: string; icon: string }[] = [
  { value: 'alquiler', label: 'Alquiler', icon: '🏠' },
  { value: 'suministros', label: 'Suministros', icon: '💡' },
  { value: 'internet_movil', label: 'Internet/Móvil', icon: '📱' },
  { value: 'supermercado', label: 'Supermercado', icon: '🛒' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'ocio', label: 'Ocio', icon: '🎬' },
  { value: 'ropa', label: 'Ropa', icon: '👕' },
  { value: 'salud', label: 'Salud', icon: '💊' },
  { value: 'suscripciones', label: 'Suscripciones', icon: '📺' },
  { value: 'ia', label: 'IA', icon: '🤖' },
  { value: 'otros', label: 'Otros', icon: '📝' },
]

// Helper para obtener info de categoría
export function getCategoriaIngreso(value: CategoriaIngreso) {
  return CATEGORIAS_INGRESO.find(c => c.value === value) || CATEGORIAS_INGRESO[CATEGORIAS_INGRESO.length - 1]
}

export function getCategoriaGasto(value: CategoriaGasto) {
  return CATEGORIAS_GASTO.find(c => c.value === value) || CATEGORIAS_GASTO[CATEGORIAS_GASTO.length - 1]
}
