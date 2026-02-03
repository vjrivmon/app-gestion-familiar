'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { 
  Gasto, 
  Pagador, 
  TipoDinero, 
  CategoriaGasto 
} from '@/types/finanzas'

type GastoInput = Omit<Gasto, 'id' | 'hogar_id' | 'created_by' | 'created_at'>

interface UseGastosReturn {
  // Estado
  gastos: Gasto[]
  loading: boolean
  error: string | null
  
  // CRUD
  crearGasto: (data: GastoInput) => Promise<Gasto | null>
  actualizarGasto: (id: string, data: Partial<GastoInput>) => Promise<boolean>
  eliminarGasto: (id: string) => Promise<boolean>
  
  // Cálculos
  totalMes: number
  totalFisico: number
  totalDigital: number
  porCategoria: Record<CategoriaGasto, number>
  porPersona: Record<Pagador, number>
  
  // Refetch
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001'

export function useGastos(mes: number, año: number): UseGastosReturn {
  const [gastos, setGastos] = useState<Gasto[]>([])
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
  
  // Fetch gastos del mes
  const fetchGastos = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', primerDia)
        .lte('fecha', ultimoDia)
        .order('fecha', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setGastos(data || [])
    } catch (err) {
      console.error('Error fetching gastos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }, [supabase, primerDia, ultimoDia])
  
  // Cargar al montar y cuando cambie el mes
  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('gastos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gastos',
          filter: `hogar_id=eq.${TEMP_HOGAR_ID}`
        },
        (payload) => {
          console.log('Gasto change:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            const nuevo = payload.new as Gasto
            // Solo añadir si está en el mes actual
            if (nuevo.fecha >= primerDia && nuevo.fecha <= ultimoDia) {
              setGastos(prev => [nuevo, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const actualizado = payload.new as Gasto
            setGastos(prev => prev.map(g => 
              g.id === actualizado.id ? actualizado : g
            ))
          } else if (payload.eventType === 'DELETE') {
            const eliminado = payload.old as { id: string }
            setGastos(prev => prev.filter(g => g.id !== eliminado.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, primerDia, ultimoDia])
  
  // CRUD: Crear
  const crearGasto = useCallback(async (data: GastoInput): Promise<Gasto | null> => {
    try {
      const { data: nuevo, error: insertError } = await supabase
        .from('gastos')
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
      console.error('Error creating gasto:', err)
      setError(err instanceof Error ? err.message : 'Error al crear gasto')
      return null
    }
  }, [supabase])
  
  // CRUD: Actualizar
  const actualizarGasto = useCallback(async (
    id: string, 
    data: Partial<GastoInput>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('gastos')
        .update(data)
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return true
    } catch (err) {
      console.error('Error updating gasto:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar gasto')
      return false
    }
  }, [supabase])
  
  // CRUD: Eliminar
  const eliminarGasto = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (deleteError) throw deleteError
      
      // Haptic feedback (más largo para delete)
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      return true
    } catch (err) {
      console.error('Error deleting gasto:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar gasto')
      return false
    }
  }, [supabase])
  
  // Cálculos memoizados
  const totalMes = useMemo(() => 
    gastos.reduce((sum, g) => sum + g.importe, 0),
    [gastos]
  )
  
  const totalFisico = useMemo(() => 
    gastos
      .filter(g => g.tipo_dinero === 'efectivo')
      .reduce((sum, g) => sum + g.importe, 0),
    [gastos]
  )
  
  const totalDigital = useMemo(() => 
    gastos
      .filter(g => g.tipo_dinero === 'digital')
      .reduce((sum, g) => sum + g.importe, 0),
    [gastos]
  )
  
  const porCategoria = useMemo(() => {
    const result: Record<CategoriaGasto, number> = {
      alquiler: 0,
      suministros: 0,
      internet_movil: 0,
      supermercado: 0,
      transporte: 0,
      ocio: 0,
      ropa: 0,
      salud: 0,
      suscripciones: 0,
      ia: 0,
      otros: 0
    }
    
    gastos.forEach(g => {
      result[g.categoria] += g.importe
    })
    
    return result
  }, [gastos])
  
  const porPersona = useMemo(() => {
    const result: Record<Pagador, number> = {
      m1: 0,
      m2: 0,
      conjunta: 0
    }
    
    gastos.forEach(g => {
      result[g.pagador] += g.importe
    })
    
    return result
  }, [gastos])
  
  return {
    gastos,
    loading,
    error,
    crearGasto,
    actualizarGasto,
    eliminarGasto,
    totalMes,
    totalFisico,
    totalDigital,
    porCategoria,
    porPersona,
    refetch: fetchGastos
  }
}
