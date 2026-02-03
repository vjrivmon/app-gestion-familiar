'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HistorialCompra } from '@/types/compra'

interface UseHistorialComprasReturn {
  historial: HistorialCompra[]
  loading: boolean
  error: string | null
  totalMes: number
  totalSemana: number
  getByDateRange: (desde: string, hasta: string) => Promise<HistorialCompra[]>
  refetch: () => Promise<void>
}

const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

export function useHistorialCompras(): UseHistorialComprasReturn {
  const [historial, setHistorial] = useState<HistorialCompra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('historial_compras')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .order('fecha', { ascending: false })
        .limit(50)
      
      if (fetchError) throw fetchError
      
      setHistorial(data || [])
    } catch (err) {
      console.error('Error fetching historial:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  useEffect(() => {
    fetchHistorial()
  }, [fetchHistorial])
  
  // Total del mes actual
  const totalMes = useMemo(() => {
    const now = new Date()
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString().split('T')[0]
    
    return historial
      .filter(h => h.fecha >= primerDiaMes)
      .reduce((sum, h) => sum + h.total, 0)
  }, [historial])
  
  // Total de la última semana
  const totalSemana = useMemo(() => {
    const now = new Date()
    const hace7dias = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    return historial
      .filter(h => h.fecha >= hace7dias)
      .reduce((sum, h) => sum + h.total, 0)
  }, [historial])
  
  // Obtener por rango de fechas
  const getByDateRange = useCallback(async (
    desde: string,
    hasta: string
  ): Promise<HistorialCompra[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('historial_compras')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', desde)
        .lte('fecha', hasta)
        .order('fecha', { ascending: false })
      
      if (fetchError) throw fetchError
      
      return data || []
    } catch (err) {
      console.error('Error fetching by date range:', err)
      return []
    }
  }, [supabase])
  
  return {
    historial,
    loading,
    error,
    totalMes,
    totalSemana,
    getByDateRange,
    refetch: fetchHistorial
  }
}
