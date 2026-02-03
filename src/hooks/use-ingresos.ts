'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { 
  Ingreso, 
  Pagador, 
  TipoDinero, 
  CategoriaIngreso 
} from '@/types/finanzas'

type IngresoInput = Omit<Ingreso, 'id' | 'hogar_id' | 'created_by' | 'created_at'>

interface UseIngresosReturn {
  // Estado
  ingresos: Ingreso[]
  loading: boolean
  error: string | null
  
  // CRUD
  crearIngreso: (data: IngresoInput) => Promise<Ingreso | null>
  actualizarIngreso: (id: string, data: Partial<IngresoInput>) => Promise<boolean>
  eliminarIngreso: (id: string) => Promise<boolean>
  
  // Cálculos
  totalMes: number
  totalFisico: number
  totalDigital: number
  porCategoria: Record<CategoriaIngreso, number>
  porPersona: Record<Pagador, number>
  ingresosFijos: number
  ingresosVariables: number
  
  // Refetch
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001'

export function useIngresos(mes: number, año: number): UseIngresosReturn {
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Rango de fechas del mes
  const primerDia = useMemo(() => {
    const d = new Date(año, mes, 1)
    return d.toISOString().split('T')[0]
  }, [mes, año])
  
  const ultimoDia = useMemo(() => {
    const d = new Date(año, mes + 1, 0)
    return d.toISOString().split('T')[0]
  }, [mes, año])
  
  // Fetch ingresos del mes
  const fetchIngresos = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('ingresos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', primerDia)
        .lte('fecha', ultimoDia)
        .order('fecha', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setIngresos(data || [])
    } catch (err) {
      console.error('Error fetching ingresos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar ingresos')
    } finally {
      setLoading(false)
    }
  }, [supabase, primerDia, ultimoDia])
  
  // Cargar al montar y cuando cambie el mes
  useEffect(() => {
    fetchIngresos()
  }, [fetchIngresos])
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('ingresos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ingresos',
          filter: `hogar_id=eq.${TEMP_HOGAR_ID}`
        },
        (payload) => {
          console.log('Ingreso change:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            const nuevo = payload.new as Ingreso
            // Solo añadir si está en el mes actual
            if (nuevo.fecha >= primerDia && nuevo.fecha <= ultimoDia) {
              setIngresos(prev => [nuevo, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const actualizado = payload.new as Ingreso
            setIngresos(prev => prev.map(i => 
              i.id === actualizado.id ? actualizado : i
            ))
          } else if (payload.eventType === 'DELETE') {
            const eliminado = payload.old as { id: string }
            setIngresos(prev => prev.filter(i => i.id !== eliminado.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, primerDia, ultimoDia])
  
  // CRUD: Crear
  const crearIngreso = useCallback(async (data: IngresoInput): Promise<Ingreso | null> => {
    try {
      const { data: nuevo, error: insertError } = await supabase
        .from('ingresos')
        .insert({
          ...data,
          hogar_id: TEMP_HOGAR_ID,
          created_by: TEMP_USER_ID
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return nuevo
    } catch (err) {
      console.error('Error creating ingreso:', err)
      setError(err instanceof Error ? err.message : 'Error al crear ingreso')
      return null
    }
  }, [supabase])
  
  // CRUD: Actualizar
  const actualizarIngreso = useCallback(async (
    id: string, 
    data: Partial<IngresoInput>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('ingresos')
        .update(data)
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return true
    } catch (err) {
      console.error('Error updating ingreso:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar ingreso')
      return false
    }
  }, [supabase])
  
  // CRUD: Eliminar
  const eliminarIngreso = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('ingresos')
        .delete()
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (deleteError) throw deleteError
      
      // Haptic feedback (más largo para delete)
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      return true
    } catch (err) {
      console.error('Error deleting ingreso:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar ingreso')
      return false
    }
  }, [supabase])
  
  // Cálculos memoizados
  const totalMes = useMemo(() => 
    ingresos.reduce((sum, i) => sum + i.importe, 0),
    [ingresos]
  )
  
  const totalFisico = useMemo(() => 
    ingresos
      .filter(i => i.tipo_dinero === 'efectivo')
      .reduce((sum, i) => sum + i.importe, 0),
    [ingresos]
  )
  
  const totalDigital = useMemo(() => 
    ingresos
      .filter(i => i.tipo_dinero === 'digital')
      .reduce((sum, i) => sum + i.importe, 0),
    [ingresos]
  )
  
  const porCategoria = useMemo(() => {
    const result: Record<CategoriaIngreso, number> = {
      nomina: 0,
      pagas_extra: 0,
      freelance: 0,
      becas: 0,
      efectivo: 0,
      transferencia: 0,
      otros: 0
    }
    
    ingresos.forEach(i => {
      result[i.categoria] += i.importe
    })
    
    return result
  }, [ingresos])
  
  const porPersona = useMemo(() => {
    const result: Record<Pagador, number> = {
      m1: 0,
      m2: 0,
      conjunta: 0
    }
    
    ingresos.forEach(i => {
      result[i.destinatario] += i.importe
    })
    
    return result
  }, [ingresos])
  
  const ingresosFijos = useMemo(() => 
    ingresos
      .filter(i => i.es_fijo)
      .reduce((sum, i) => sum + i.importe, 0),
    [ingresos]
  )
  
  const ingresosVariables = useMemo(() => 
    ingresos
      .filter(i => !i.es_fijo)
      .reduce((sum, i) => sum + i.importe, 0),
    [ingresos]
  )
  
  return {
    ingresos,
    loading,
    error,
    crearIngreso,
    actualizarIngreso,
    eliminarIngreso,
    totalMes,
    totalFisico,
    totalDigital,
    porCategoria,
    porPersona,
    ingresosFijos,
    ingresosVariables,
    refetch: fetchIngresos
  }
}
