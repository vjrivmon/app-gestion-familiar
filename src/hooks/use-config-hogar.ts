'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ConfigHogar, SaldosIniciales, ConfigCompraPiso, CONFIG_HOGAR_DEFAULT } from '@/types/config'

interface UseConfigHogarReturn {
  config: ConfigHogar | null
  loading: boolean
  error: string | null
  
  // Funciones
  getConfig: () => ConfigHogar
  updateSaldosIniciales: (saldos: SaldosIniciales, fecha?: string) => Promise<boolean>
  updateConfigCompraPiso: (config: ConfigCompraPiso) => Promise<boolean>
  updateNombres: (nombres: { m1: string; m2: string }) => Promise<boolean>
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

const DEFAULT_CONFIG: ConfigHogar = {
  nombres: {
    m1: 'Vicente',
    m2: 'Irene'
  },
  preferencias: {
    moneda: 'EUR',
    primer_dia_semana: 1,
    notificaciones: true
  }
}

export function useConfigHogar(): UseConfigHogarReturn {
  const [config, setConfig] = useState<ConfigHogar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Fetch configuración del hogar
  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('hogares')
        .select('config')
        .eq('id', TEMP_HOGAR_ID)
        .single()
      
      if (fetchError) throw fetchError
      
      // Merge con defaults
      const mergedConfig: ConfigHogar = {
        ...DEFAULT_CONFIG,
        ...(data?.config || {})
      }
      
      setConfig(mergedConfig)
    } catch (err) {
      console.error('Error fetching config:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar configuración')
      // Usar config por defecto en caso de error
      setConfig(DEFAULT_CONFIG)
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  // Cargar al montar
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])
  
  // Helper para actualizar config en BD
  const updateConfig = useCallback(async (updates: Partial<ConfigHogar>): Promise<boolean> => {
    try {
      const newConfig: ConfigHogar = {
        ...DEFAULT_CONFIG,
        ...config,
        ...updates
      }
      
      const { error: updateError } = await supabase
        .from('hogares')
        .update({ config: newConfig })
        .eq('id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      setConfig(newConfig)
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return true
    } catch (err) {
      console.error('Error updating config:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración')
      return false
    }
  }, [supabase, config])
  
  // Getter con valores por defecto
  const getConfig = useCallback((): ConfigHogar => {
    return config || DEFAULT_CONFIG
  }, [config])
  
  // Actualizar saldos iniciales
  const updateSaldosIniciales = useCallback(async (
    saldos: SaldosIniciales, 
    fecha?: string
  ): Promise<boolean> => {
    return updateConfig({
      saldos_iniciales: saldos,
      fecha_saldos_iniciales: fecha || new Date().toISOString().split('T')[0]
    })
  }, [updateConfig])
  
  // Actualizar configuración de compra de piso
  const updateConfigCompraPiso = useCallback(async (
    configPiso: ConfigCompraPiso
  ): Promise<boolean> => {
    return updateConfig({
      compra_piso: configPiso
    })
  }, [updateConfig])
  
  // Actualizar nombres
  const updateNombres = useCallback(async (
    nombres: { m1: string; m2: string }
  ): Promise<boolean> => {
    return updateConfig({
      nombres
    })
  }, [updateConfig])
  
  return {
    config,
    loading,
    error,
    getConfig,
    updateSaldosIniciales,
    updateConfigCompraPiso,
    updateNombres,
    refetch: fetchConfig
  }
}
