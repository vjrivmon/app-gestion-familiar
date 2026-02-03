'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Meta } from '@/types/finanzas'

type MetaInput = Omit<Meta, 'id' | 'hogar_id' | 'created_at' | 'actual'>

interface UseMetasReturn {
  // Estado
  metas: Meta[]
  loading: boolean
  error: string | null
  
  // CRUD
  crearMeta: (data: MetaInput) => Promise<Meta | null>
  actualizarMeta: (id: string, data: Partial<MetaInput>) => Promise<boolean>
  eliminarMeta: (id: string) => Promise<boolean>
  aportarAMeta: (metaId: string, cantidad: number) => Promise<boolean>
  
  // Cálculos
  totalObjetivos: number
  totalAhorrado: number
  progresoGlobal: number  // 0-100
  
  // Refetch
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

export function useMetas(): UseMetasReturn {
  const [metas, setMetas] = useState<Meta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Fetch todas las metas
  const fetchMetas = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('metas')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setMetas(data || [])
    } catch (err) {
      console.error('Error fetching metas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar metas')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  // Cargar al montar
  useEffect(() => {
    fetchMetas()
  }, [fetchMetas])
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('metas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metas',
          filter: `hogar_id=eq.${TEMP_HOGAR_ID}`
        },
        (payload) => {
          console.log('Meta change:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            const nueva = payload.new as Meta
            setMetas(prev => [nueva, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const actualizada = payload.new as Meta
            setMetas(prev => prev.map(m => 
              m.id === actualizada.id ? actualizada : m
            ))
          } else if (payload.eventType === 'DELETE') {
            const eliminada = payload.old as { id: string }
            setMetas(prev => prev.filter(m => m.id !== eliminada.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
  
  // CRUD: Crear
  const crearMeta = useCallback(async (data: MetaInput): Promise<Meta | null> => {
    try {
      const { data: nueva, error: insertError } = await supabase
        .from('metas')
        .insert({
          ...data,
          hogar_id: TEMP_HOGAR_ID,
          actual: 0  // Empezamos en 0
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return nueva
    } catch (err) {
      console.error('Error creating meta:', err)
      setError(err instanceof Error ? err.message : 'Error al crear meta')
      return null
    }
  }, [supabase])
  
  // CRUD: Actualizar
  const actualizarMeta = useCallback(async (
    id: string, 
    data: Partial<MetaInput>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('metas')
        .update(data)
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return true
    } catch (err) {
      console.error('Error updating meta:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar meta')
      return false
    }
  }, [supabase])
  
  // CRUD: Eliminar
  const eliminarMeta = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('metas')
        .delete()
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (deleteError) throw deleteError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      return true
    } catch (err) {
      console.error('Error deleting meta:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar meta')
      return false
    }
  }, [supabase])
  
  // Aportar a meta
  const aportarAMeta = useCallback(async (metaId: string, cantidad: number): Promise<boolean> => {
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor que 0')
      return false
    }
    
    try {
      // Obtener el valor actual
      const meta = metas.find(m => m.id === metaId)
      if (!meta) {
        setError('Meta no encontrada')
        return false
      }
      
      const nuevoActual = meta.actual + cantidad
      
      // Validar que no supere el objetivo (opcional, permitimos sobrepasar)
      // if (nuevoActual > meta.objetivo) {
      //   nuevoActual = meta.objetivo
      // }
      
      const { error: updateError } = await supabase
        .from('metas')
        .update({ actual: nuevoActual })
        .eq('id', metaId)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // Haptic feedback especial para aporte
      const progreso = (nuevoActual / meta.objetivo) * 100
      if (progreso >= 100) {
        // Meta completada - feedback especial
        if (navigator.vibrate) navigator.vibrate([20, 50, 20, 50, 40])
      } else {
        if (navigator.vibrate) navigator.vibrate([15, 50, 15])
      }
      
      return true
    } catch (err) {
      console.error('Error aportando a meta:', err)
      setError(err instanceof Error ? err.message : 'Error al aportar a meta')
      return false
    }
  }, [supabase, metas])
  
  // Cálculos memoizados
  const totalObjetivos = useMemo(() => 
    metas.reduce((sum, m) => sum + m.objetivo, 0),
    [metas]
  )
  
  const totalAhorrado = useMemo(() => 
    metas.reduce((sum, m) => sum + m.actual, 0),
    [metas]
  )
  
  const progresoGlobal = useMemo(() => {
    if (totalObjetivos === 0) return 0
    return Math.min(100, Math.round((totalAhorrado / totalObjetivos) * 100))
  }, [totalObjetivos, totalAhorrado])
  
  return {
    metas,
    loading,
    error,
    crearMeta,
    actualizarMeta,
    eliminarMeta,
    aportarAMeta,
    totalObjetivos,
    totalAhorrado,
    progresoGlobal,
    refetch: fetchMetas
  }
}
