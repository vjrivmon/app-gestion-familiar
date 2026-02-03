'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useConfigHogar } from './use-config-hogar'
import type { Pagador } from '@/types/finanzas'

interface PatrimonioPersona {
  fisico: number   // céntimos
  digital: number  // céntimos
  total: number    // céntimos
}

interface PatrimonioResult {
  m1: PatrimonioPersona
  m2: PatrimonioPersona
  conjunta: PatrimonioPersona
  total: number  // céntimos
}

interface EvolucionMes {
  mes: number
  año: number
  label: string  // "Feb 26"
  patrimonio: PatrimonioResult
}

interface UsePatrimonioReturn {
  // Estado
  patrimonio: PatrimonioResult
  loading: boolean
  error: string | null
  
  // Cálculos
  calcularPatrimonio: (mes: number, año: number) => Promise<PatrimonioResult>
  getEvolucionPatrimonio: (meses: number) => Promise<EvolucionMes[]>
  
  // Refetch
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

const PATRIMONIO_VACIO: PatrimonioPersona = {
  fisico: 0,
  digital: 0,
  total: 0
}

const PATRIMONIO_DEFAULT: PatrimonioResult = {
  m1: { ...PATRIMONIO_VACIO },
  m2: { ...PATRIMONIO_VACIO },
  conjunta: { ...PATRIMONIO_VACIO },
  total: 0
}

/**
 * Hook para calcular patrimonio
 * 
 * Fórmula:
 * Patrimonio = Saldo Inicial + Ingresos - Gastos
 * 
 * Por persona y tipo de dinero (físico/digital)
 */
export function usePatrimonio(): UsePatrimonioReturn {
  const [patrimonio, setPatrimonio] = useState<PatrimonioResult>(PATRIMONIO_DEFAULT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { config, loading: configLoading } = useConfigHogar()
  const supabase = createClient()
  
  // Calcular patrimonio para un mes específico
  const calcularPatrimonio = useCallback(async (
    mes: number, 
    año: number
  ): Promise<PatrimonioResult> => {
    const result: PatrimonioResult = {
      m1: { fisico: 0, digital: 0, total: 0 },
      m2: { fisico: 0, digital: 0, total: 0 },
      conjunta: { fisico: 0, digital: 0, total: 0 },
      total: 0
    }
    
    try {
      // 1. Partir de saldos iniciales
      if (config?.saldos_iniciales) {
        const si = config.saldos_iniciales
        result.m1.fisico = si.m1.efectivo
        result.m1.digital = si.m1.digital
        result.m2.fisico = si.m2.efectivo
        result.m2.digital = si.m2.digital
        result.conjunta.fisico = si.conjunta.efectivo
        result.conjunta.digital = si.conjunta.digital
      }
      
      // Fecha límite: último día del mes solicitado
      const ultimoDia = new Date(año, mes + 1, 0).toISOString().split('T')[0]
      
      // Fecha inicial: desde los saldos iniciales o desde siempre
      const fechaInicial = config?.fecha_saldos_iniciales || '2000-01-01'
      
      // 2. Sumar ingresos desde fecha saldos hasta mes solicitado
      const { data: ingresos, error: ingError } = await supabase
        .from('ingresos')
        .select('importe, destinatario, tipo_dinero')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', fechaInicial)
        .lte('fecha', ultimoDia)
      
      if (ingError) throw ingError
      
      ingresos?.forEach(ing => {
        const persona = ing.destinatario as 'm1' | 'm2' | 'conjunta'
        if (persona && result[persona]) {
          if (ing.tipo_dinero === 'efectivo') {
            result[persona].fisico += ing.importe
          } else {
            result[persona].digital += ing.importe
          }
        }
      })
      
      // 3. Restar gastos desde fecha saldos hasta mes solicitado
      const { data: gastos, error: gasError } = await supabase
        .from('gastos')
        .select('importe, pagador, tipo_dinero')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', fechaInicial)
        .lte('fecha', ultimoDia)
      
      if (gasError) throw gasError
      
      gastos?.forEach(gas => {
        const persona = gas.pagador as 'm1' | 'm2' | 'conjunta'
        if (persona && result[persona]) {
          if (gas.tipo_dinero === 'efectivo') {
            result[persona].fisico -= gas.importe
          } else {
            result[persona].digital -= gas.importe
          }
        }
      })
      
      // 4. Calcular totales
      result.m1.total = result.m1.fisico + result.m1.digital
      result.m2.total = result.m2.fisico + result.m2.digital
      result.conjunta.total = result.conjunta.fisico + result.conjunta.digital
      result.total = result.m1.total + result.m2.total + result.conjunta.total
      
      return result
    } catch (err) {
      console.error('Error calculando patrimonio:', err)
      throw err
    }
  }, [supabase, config])
  
  // Obtener evolución del patrimonio para gráficos
  const getEvolucionPatrimonio = useCallback(async (
    meses: number
  ): Promise<EvolucionMes[]> => {
    const resultado: EvolucionMes[] = []
    const ahora = new Date()
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const mes = fecha.getMonth()
      const año = fecha.getFullYear()
      
      try {
        const patrimonio = await calcularPatrimonio(mes, año)
        resultado.push({
          mes,
          año,
          label: fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
          patrimonio
        })
      } catch {
        // Si falla, usar valores vacíos
        resultado.push({
          mes,
          año,
          label: fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
          patrimonio: PATRIMONIO_DEFAULT
        })
      }
    }
    
    return resultado
  }, [calcularPatrimonio])
  
  // Fetch patrimonio actual
  const fetchPatrimonio = useCallback(async () => {
    if (configLoading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const ahora = new Date()
      const result = await calcularPatrimonio(ahora.getMonth(), ahora.getFullYear())
      setPatrimonio(result)
    } catch (err) {
      console.error('Error fetching patrimonio:', err)
      setError(err instanceof Error ? err.message : 'Error al calcular patrimonio')
      setPatrimonio(PATRIMONIO_DEFAULT)
    } finally {
      setLoading(false)
    }
  }, [calcularPatrimonio, configLoading])
  
  // Cargar al montar y cuando cambie config
  useEffect(() => {
    fetchPatrimonio()
  }, [fetchPatrimonio])
  
  return {
    patrimonio,
    loading: loading || configLoading,
    error,
    calcularPatrimonio,
    getEvolucionPatrimonio,
    refetch: fetchPatrimonio
  }
}
