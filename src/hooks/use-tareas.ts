'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TareaHogar, TareaHistorial, TAREAS_INICIALES } from '@/types/tareas'
import { calcularUrgenciaTarea } from '@/types/tareas'

// Estado de urgencia de una tarea
export type EstadoTarea = 'overdue' | 'warning' | 'ok'

export interface TareaConEstado extends TareaHogar {
  estado: EstadoTarea
  diasDesdeUltima: number | null
  porcentajeUrgencia: number
}

interface UseTareasReturn {
  tareas: TareaConEstado[]
  loading: boolean
  error: string | null
  
  // CRUD
  getTareas: () => Promise<TareaConEstado[]>
  crearTarea: (nombre: string, icono: string, frecuencia_dias: number) => Promise<boolean>
  completarTarea: (tareaId: string) => Promise<boolean>
  eliminarTarea: (tareaId: string) => Promise<boolean>
  
  // Historial
  getHistorial: (tareaId: string, limit?: number) => Promise<TareaHistorial[]>
  
  // Inicialización
  crearTareasIniciales: () => Promise<boolean>
  
  refetch: () => Promise<TareaConEstado[]>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

// Tareas iniciales para nuevos hogares
const TAREAS_INICIALES_DATA: { nombre: string; icono: string; frecuencia_dias: number }[] = [
  { nombre: 'Fregar platos', icono: '•', frecuencia_dias: 1 },
  { nombre: 'Barrer/aspirar', icono: '•', frecuencia_dias: 3 },
  { nombre: 'Fregar suelo', icono: '•', frecuencia_dias: 7 },
  { nombre: 'Limpiar baño', icono: '•', frecuencia_dias: 7 },
  { nombre: 'Limpiar cocina', icono: '•', frecuencia_dias: 3 },
  { nombre: 'Hacer camas', icono: '•', frecuencia_dias: 1 },
  { nombre: 'Sacar basura', icono: '•', frecuencia_dias: 2 },
  { nombre: 'Poner lavadora', icono: '•', frecuencia_dias: 3 },
  { nombre: 'Tender ropa', icono: '•', frecuencia_dias: 3 },
  { nombre: 'Planchar', icono: '•', frecuencia_dias: 7 },
  { nombre: 'Compra semanal', icono: '•', frecuencia_dias: 7 },
  { nombre: 'Regar plantas', icono: '•', frecuencia_dias: 3 },
]

/**
 * Calcula el estado de urgencia de una tarea
 * - overdue: diasDesdeUltima > frecuencia_dias (rojo)
 * - warning: diasDesdeUltima >= frecuencia_dias - 1 (amarillo)
 * - ok: else (verde)
 */
function calcularEstado(tarea: TareaHogar): EstadoTarea {
  const { diasDesdeUltima, porcentajeUrgencia } = calcularUrgenciaTarea(tarea)
  
  // Si nunca se ha hecho, es overdue
  if (diasDesdeUltima === null) return 'overdue'
  
  // Si han pasado más días que la frecuencia
  if (diasDesdeUltima > tarea.frecuencia_dias) return 'overdue'
  
  // Si estamos a 1 día o menos de la frecuencia
  if (diasDesdeUltima >= tarea.frecuencia_dias - 1) return 'warning'
  
  return 'ok'
}

/**
 * Añade estado calculado a una tarea
 */
function enriquecerTarea(tarea: TareaHogar): TareaConEstado {
  const { diasDesdeUltima, porcentajeUrgencia } = calcularUrgenciaTarea(tarea)
  return {
    ...tarea,
    estado: calcularEstado(tarea),
    diasDesdeUltima,
    porcentajeUrgencia
  }
}

/**
 * Ordena tareas por urgencia (overdue primero, luego warning, luego ok)
 */
function ordenarPorUrgencia(tareas: TareaConEstado[]): TareaConEstado[] {
  const prioridad: Record<EstadoTarea, number> = {
    overdue: 0,
    warning: 1,
    ok: 2
  }
  
  return [...tareas].sort((a, b) => {
    // Primero por estado
    const diffEstado = prioridad[a.estado] - prioridad[b.estado]
    if (diffEstado !== 0) return diffEstado
    
    // Dentro del mismo estado, por porcentaje de urgencia (mayor primero)
    return b.porcentajeUrgencia - a.porcentajeUrgencia
  })
}

export function useTareas(): UseTareasReturn {
  const [tareas, setTareas] = useState<TareaConEstado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Fetch tareas del hogar
  const fetchTareas = useCallback(async (): Promise<TareaConEstado[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('tareas_hogar')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .order('orden', { ascending: true })
      
      if (fetchError) throw fetchError
      
      const tareasEnriquecidas = (data || []).map(enriquecerTarea)
      const tareasOrdenadas = ordenarPorUrgencia(tareasEnriquecidas)
      
      setTareas(tareasOrdenadas)
      return tareasOrdenadas
    } catch (err) {
      console.error('Error fetching tareas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar tareas')
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  // Cargar al montar
  useEffect(() => {
    fetchTareas()
  }, [fetchTareas])
  
  // Crear nueva tarea
  const crearTarea = useCallback(async (
    nombre: string,
    icono: string,
    frecuencia_dias: number
  ): Promise<boolean> => {
    try {
      const maxOrden = tareas.length > 0 
        ? Math.max(...tareas.map(t => t.orden)) 
        : 0
      
      const { error: insertError } = await supabase
        .from('tareas_hogar')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          nombre,
          icono,
          frecuencia_dias,
          orden: maxOrden + 1
        })
      
      if (insertError) throw insertError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      await fetchTareas()
      return true
    } catch (err) {
      console.error('Error creating tarea:', err)
      setError(err instanceof Error ? err.message : 'Error al crear tarea')
      return false
    }
  }, [supabase, tareas, fetchTareas])
  
  // Completar tarea
  const completarTarea = useCallback(async (tareaId: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString()
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'
      
      // Actualizar ultima_vez en la tarea
      const { error: updateError } = await supabase
        .from('tareas_hogar')
        .update({ ultima_vez: now })
        .eq('id', tareaId)
      
      if (updateError) throw updateError
      
      // Crear registro en historial
      const { error: historialError } = await supabase
        .from('tareas_historial')
        .insert({
          tarea_id: tareaId,
          completada_por: userId,
          completada_at: now
        })
      
      if (historialError) {
        console.warn('Error creating historial (table might not exist):', historialError)
        // No es crítico, continuamos
      }
      
      // Haptic feedback - patrón de éxito
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      await fetchTareas()
      return true
    } catch (err) {
      console.error('Error completing tarea:', err)
      setError(err instanceof Error ? err.message : 'Error al completar tarea')
      return false
    }
  }, [supabase, fetchTareas])
  
  // Eliminar tarea
  const eliminarTarea = useCallback(async (tareaId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('tareas_hogar')
        .delete()
        .eq('id', tareaId)
      
      if (deleteError) throw deleteError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      await fetchTareas()
      return true
    } catch (err) {
      console.error('Error deleting tarea:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar tarea')
      return false
    }
  }, [supabase, fetchTareas])
  
  // Obtener historial de una tarea
  const getHistorial = useCallback(async (
    tareaId: string,
    limit: number = 10
  ): Promise<TareaHistorial[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tareas_historial')
        .select('*')
        .eq('tarea_id', tareaId)
        .order('completada_at', { ascending: false })
        .limit(limit)
      
      if (fetchError) {
        console.warn('Error fetching historial (table might not exist):', fetchError)
        return []
      }
      
      return data || []
    } catch (err) {
      console.error('Error fetching historial:', err)
      return []
    }
  }, [supabase])
  
  // Crear las 12 tareas iniciales para un nuevo hogar
  const crearTareasIniciales = useCallback(async (): Promise<boolean> => {
    try {
      // Verificar si ya hay tareas
      const { data: existing } = await supabase
        .from('tareas_hogar')
        .select('id')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .limit(1)
      
      if (existing && existing.length > 0) {
        console.log('Ya existen tareas para este hogar')
        return true
      }
      
      // Crear las tareas iniciales
      const tareasToInsert = TAREAS_INICIALES_DATA.map((t, index) => ({
        hogar_id: TEMP_HOGAR_ID,
        nombre: t.nombre,
        icono: t.icono,
        frecuencia_dias: t.frecuencia_dias,
        orden: index + 1
      }))
      
      const { error: insertError } = await supabase
        .from('tareas_hogar')
        .insert(tareasToInsert)
      
      if (insertError) throw insertError
      
      await fetchTareas()
      return true
    } catch (err) {
      console.error('Error creating tareas iniciales:', err)
      setError(err instanceof Error ? err.message : 'Error al crear tareas iniciales')
      return false
    }
  }, [supabase, fetchTareas])
  
  return {
    tareas,
    loading,
    error,
    getTareas: fetchTareas,
    crearTarea,
    completarTarea,
    eliminarTarea,
    getHistorial,
    crearTareasIniciales,
    refetch: fetchTareas
  }
}

/**
 * Helper para formatear días desde última vez
 */
export function formatDiasDesdeUltima(dias: number | null): string {
  if (dias === null) return 'Nunca'
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  return `${dias}d`
}

/**
 * Helper para obtener texto de badge
 */
export function getBadgeText(tarea: TareaConEstado): string {
  if (tarea.diasDesdeUltima === null) return '!'
  if (tarea.diasDesdeUltima === 0) return '✓'
  if (tarea.estado === 'overdue') return `${tarea.diasDesdeUltima}d!`
  return `${tarea.diasDesdeUltima}d`
}
