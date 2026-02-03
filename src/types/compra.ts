// Types para Compra Inteligente

export type CategoriaProducto = 
  | 'general' 
  | 'frescos' 
  | 'carniceria' 
  | 'lacteos' 
  | 'limpieza' 
  | 'otros'

export const CATEGORIAS_PRODUCTO: CategoriaProducto[] = [
  'general',
  'frescos',
  'carniceria',
  'lacteos',
  'limpieza',
  'otros'
]

export const CATEGORIAS_LABELS: Record<CategoriaProducto, string> = {
  general: 'General',
  frescos: 'Frescos',
  carniceria: 'Carniceria',
  lacteos: 'Lacteos',
  limpieza: 'Limpieza',
  otros: 'Otros'
}

export type EstadoLista = 'activa' | 'completada' | 'cancelada'

export interface ListaCompra {
  id: string
  hogar_id: string
  nombre: string
  presupuesto: number | null // céntimos
  estado: EstadoLista
  supermercado: string | null
  created_at: string
  completed_at: string | null
}

export interface ProductoLista {
  id: string
  lista_id: string
  nombre: string
  cantidad: number
  unidad: string
  precio: number | null // céntimos
  comprado: boolean
  categoria: CategoriaProducto
  orden: number
  created_at: string
}

export interface ProductoFrecuente {
  id: string
  hogar_id: string
  nombre: string
  categoria: CategoriaProducto
  uso_count: number
  ultimo_precio: number | null
  created_at: string
}

export interface HistorialCompra {
  id: string
  hogar_id: string
  lista_id: string | null
  fecha: string
  supermercado: string | null
  total: number // céntimos
  num_productos: number | null
  created_at: string
}

// Input types para crear/actualizar
export type ListaCompraInput = Omit<ListaCompra, 'id' | 'hogar_id' | 'created_at' | 'completed_at'>
export type ProductoListaInput = Omit<ProductoLista, 'id' | 'created_at'>
export type ProductoFrecuenteInput = Omit<ProductoFrecuente, 'id' | 'hogar_id' | 'created_at'>

// Helpers
export function centimosToEuros(centimos: number): string {
  return (centimos / 100).toFixed(2).replace('.', ',')
}

export function eurosToCentimos(euros: string | number): number {
  if (typeof euros === 'string') {
    const normalized = euros.replace(',', '.')
    return Math.round(parseFloat(normalized) * 100)
  }
  return Math.round(euros * 100)
}

export function formatPrecio(centimos: number | null): string {
  if (centimos === null) return '-'
  return `${centimosToEuros(centimos)}€`
}
