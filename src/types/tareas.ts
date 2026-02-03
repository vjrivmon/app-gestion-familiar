// =============================================
// App de Pus - Tipos de Tareas del Hogar
// =============================================

export interface TareaHogar {
  id: string
  hogar_id: string
  nombre: string
  icono: string
  frecuencia_dias: number
  ultima_vez?: string  // ISO timestamp
  orden: number
  created_at: string
}

export interface TareaHistorial {
  id: string
  tarea_id: string
  completada_por: string  // UUID del profile
  completada_at: string  // ISO timestamp
}

// Con relaciones expandidas
export interface TareaConHistorial extends TareaHogar {
  historial?: TareaHistorial[]
  dias_desde_ultima?: number
  necesita_hacer?: boolean
}

// Tareas iniciales (para referencia en el frontend)
export const TAREAS_INICIALES: { nombre: string; icono: string; frecuencia_dias: number }[] = [
  { nombre: 'Fregar platos', icono: '🍽️', frecuencia_dias: 1 },
  { nombre: 'Barrer/aspirar', icono: '🧹', frecuencia_dias: 3 },
  { nombre: 'Fregar suelo', icono: '🪣', frecuencia_dias: 7 },
  { nombre: 'Limpiar baño', icono: '🚽', frecuencia_dias: 7 },
  { nombre: 'Limpiar cocina', icono: '🧽', frecuencia_dias: 3 },
  { nombre: 'Hacer camas', icono: '🛏️', frecuencia_dias: 1 },
  { nombre: 'Sacar basura', icono: '🗑️', frecuencia_dias: 2 },
  { nombre: 'Poner lavadora', icono: '🧺', frecuencia_dias: 3 },
  { nombre: 'Tender ropa', icono: '👕', frecuencia_dias: 3 },
  { nombre: 'Planchar', icono: '👔', frecuencia_dias: 7 },
  { nombre: 'Compra semanal', icono: '🛒', frecuencia_dias: 7 },
  { nombre: 'Regar plantas', icono: '🌱', frecuencia_dias: 3 },
]

// Helper para calcular urgencia de una tarea
export function calcularUrgenciaTarea(tarea: TareaHogar): {
  diasDesdeUltima: number | null
  necesitaHacer: boolean
  porcentajeUrgencia: number  // 0-100+
} {
  if (!tarea.ultima_vez) {
    return {
      diasDesdeUltima: null,
      necesitaHacer: true,
      porcentajeUrgencia: 100
    }
  }

  const ahora = new Date()
  const ultimaVez = new Date(tarea.ultima_vez)
  const diasDesdeUltima = Math.floor((ahora.getTime() - ultimaVez.getTime()) / (1000 * 60 * 60 * 24))
  const porcentajeUrgencia = Math.round((diasDesdeUltima / tarea.frecuencia_dias) * 100)

  return {
    diasDesdeUltima,
    necesitaHacer: diasDesdeUltima >= tarea.frecuencia_dias,
    porcentajeUrgencia
  }
}

// Colores de urgencia
export function getColorUrgencia(porcentaje: number): string {
  if (porcentaje >= 100) return 'text-red-500'
  if (porcentaje >= 75) return 'text-orange-500'
  if (porcentaje >= 50) return 'text-yellow-500'
  return 'text-green-500'
}

export function getBgColorUrgencia(porcentaje: number): string {
  if (porcentaje >= 100) return 'bg-red-100'
  if (porcentaje >= 75) return 'bg-orange-100'
  if (porcentaje >= 50) return 'bg-yellow-100'
  return 'bg-green-100'
}
