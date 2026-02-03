'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Beca, EstadoBeca, Pagador } from '@/types/finanzas'

type BecaInput = Omit<Beca, 'id' | 'hogar_id' | 'created_at'>

interface UseBecasReturn {
  // Estado
  becas: Beca[]
  loading: boolean
  error: string | null
  
  // CRUD
  crearBeca: (data: BecaInput) => Promise<Beca | null>
  actualizarBeca: (id: string, data: Partial<BecaInput>) => Promise<boolean>
  eliminarBeca: (id: string) => Promise<boolean>
  cobrarBeca: (beca: Beca) => Promise<boolean>
  
  // Filtros
  filtrarPorEstado: (estado: EstadoBeca | 'todas') => Beca[]
  agruparPorPersona: (becas: Beca[]) => Record<Pagador, Beca[]>
  
  // Cálculos
  totalPendiente: number
  totalMensual: number
  totalPorPersona: Record<Pagador, number>
  
  // Refetch
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001'

export function useBecas(): UseBecasReturn {
  const [becas, setBecas] = useState<Beca[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Fetch todas las becas
  const fetchBecas = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('becas')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setBecas(data || [])
    } catch (err) {
      console.error('Error fetching becas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar becas')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  // Cargar al montar
  useEffect(() => {
    fetchBecas()
  }, [fetchBecas])
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('becas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'becas',
          filter: `hogar_id=eq.${TEMP_HOGAR_ID}`
        },
        (payload) => {
          console.log('Beca change:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            const nueva = payload.new as Beca
            setBecas(prev => [nueva, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const actualizada = payload.new as Beca
            setBecas(prev => prev.map(b => 
              b.id === actualizada.id ? actualizada : b
            ))
          } else if (payload.eventType === 'DELETE') {
            const eliminada = payload.old as { id: string }
            setBecas(prev => prev.filter(b => b.id !== eliminada.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
  
  // CRUD: Crear
  const crearBeca = useCallback(async (data: BecaInput): Promise<Beca | null> => {
    try {
      const { data: nueva, error: insertError } = await supabase
        .from('becas')
        .insert({
          ...data,
          hogar_id: TEMP_HOGAR_ID
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return nueva
    } catch (err) {
      console.error('Error creating beca:', err)
      setError(err instanceof Error ? err.message : 'Error al crear beca')
      return null
    }
  }, [supabase])
  
  // CRUD: Actualizar
  const actualizarBeca = useCallback(async (
    id: string, 
    data: Partial<BecaInput>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('becas')
        .update(data)
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return true
    } catch (err) {
      console.error('Error updating beca:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar beca')
      return false
    }
  }, [supabase])
  
  // CRUD: Eliminar
  const eliminarBeca = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('becas')
        .delete()
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (deleteError) throw deleteError
      
      // Haptic feedback (más largo para delete)
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      return true
    } catch (err) {
      console.error('Error deleting beca:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar beca')
      return false
    }
  }, [supabase])
  
  // Cobrar beca: marca como cobrada y crea ingreso automático
  const cobrarBeca = useCallback(async (beca: Beca): Promise<boolean> => {
    try {
      const fechaCobro = new Date().toISOString().split('T')[0]
      
      // 1. Actualizar beca a estado 'cobrada'
      const { error: updateError } = await supabase
        .from('becas')
        .update({
          estado: 'cobrada',
          fecha_cobro: fechaCobro
        })
        .eq('id', beca.id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // 2. Crear ingreso automático vinculado a la beca
      const { error: ingresoError } = await supabase
        .from('ingresos')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          concepto: `Beca: ${beca.concepto}`,
          importe: beca.importe,
          categoria: 'becas',
          destinatario: beca.persona,
          tipo_dinero: 'digital',
          es_fijo: false,
          es_proyectado: false,
          fecha: fechaCobro,
          notas: `Cobro automático de beca`,
          beca_id: beca.id,
          created_by: TEMP_USER_ID
        })
      
      if (ingresoError) throw ingresoError
      
      // Haptic feedback especial para cobro
      if (navigator.vibrate) navigator.vibrate([20, 100, 20])
      
      return true
    } catch (err) {
      console.error('Error cobrando beca:', err)
      setError(err instanceof Error ? err.message : 'Error al cobrar beca')
      return false
    }
  }, [supabase])
  
  // Filtrar por estado
  const filtrarPorEstado = useCallback((estado: EstadoBeca | 'todas'): Beca[] => {
    if (estado === 'todas') return becas
    return becas.filter(b => b.estado === estado)
  }, [becas])
  
  // Agrupar por persona
  const agruparPorPersona = useCallback((becasList: Beca[]): Record<Pagador, Beca[]> => {
    const result: Record<Pagador, Beca[]> = {
      m1: [],
      m2: [],
      conjunta: []
    }
    
    becasList.forEach(b => {
      result[b.persona].push(b)
    })
    
    return result
  }, [])
  
  // Cálculos memoizados
  const totalPendiente = useMemo(() => 
    becas
      .filter(b => b.estado === 'pendiente')
      .reduce((sum, b) => sum + b.importe, 0),
    [becas]
  )
  
  const totalMensual = useMemo(() => 
    becas
      .filter(b => b.estado === 'mensual')
      .reduce((sum, b) => sum + b.importe, 0),
    [becas]
  )
  
  const totalPorPersona = useMemo(() => {
    const result: Record<Pagador, number> = {
      m1: 0,
      m2: 0,
      conjunta: 0
    }
    
    becas.forEach(b => {
      if (b.estado !== 'cobrada') {
        result[b.persona] += b.importe
      }
    })
    
    return result
  }, [becas])
  
  return {
    becas,
    loading,
    error,
    crearBeca,
    actualizarBeca,
    eliminarBeca,
    cobrarBeca,
    filtrarPorEstado,
    agruparPorPersona,
    totalPendiente,
    totalMensual,
    totalPorPersona,
    refetch: fetchBecas
  }
}
