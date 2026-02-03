'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePatrimonio } from './use-patrimonio'
import type { 
  ConfigCalculadoraPiso, 
  CalculoPiso,
  CONFIG_DEFAULT,
  GASTOS_NOTARIA_REGISTRO_GESTORIA,
  GASTOS_TASACION,
  IVA_OBRA_NUEVA,
  AJD_VALENCIA,
  ITP_MENOR_35_VALENCIA,
  ITP_NORMAL
} from '@/types/calculadora-piso'

// Re-exportar constantes para uso interno
const NOTARIA = 180000  // 1800€
const TASACION = 40000  // 400€
const IVA = 0.10
const AJD = 0.015
const ITP_35 = 0.06
const ITP = 0.10

const DEFAULT_CONFIG: ConfigCalculadoraPiso = {
  precio_vivienda: 0,
  tipo_vivienda: 'segunda_mano',
  es_menor_35: true,
  porcentaje_financiacion: 80,
  tin_anual: 2.5,
  plazo_años: 30,
  ingresos_netos_mes: 0,
  muebles_reformas: 500000,
  colchon_emergencia: 300000,
  ahorro_mensual_estimado: 0
}

interface UseCalculadoraPisoReturn {
  // Estado
  config: ConfigCalculadoraPiso
  calculo: CalculoPiso
  loading: boolean
  saving: boolean
  error: string | null
  
  // Patrimonio
  patrimonioDisponible: number
  patrimonioM1: number
  patrimonioM2: number
  patrimonioConjunta: number
  
  // Acciones
  updateConfig: (updates: Partial<ConfigCalculadoraPiso>) => void
  saveConfig: () => Promise<boolean>
  resetConfig: () => void
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Calcula la cuota mensual de hipoteca usando la fórmula francesa
 * C = P × [i(1+i)^n] / [(1+i)^n - 1]
 * @param principal - Importe de la hipoteca (céntimos)
 * @param tinAnual - TIN anual en porcentaje (ej: 2.5)
 * @param plazoAños - Plazo en años
 * @returns Cuota mensual en céntimos
 */
function calcularCuotaMensual(
  principal: number, 
  tinAnual: number, 
  plazoAños: number
): number {
  if (principal <= 0 || tinAnual <= 0 || plazoAños <= 0) return 0
  
  const P = principal  // Ya en céntimos
  const i = (tinAnual / 100) / 12  // TIN mensual como decimal
  const n = plazoAños * 12  // Número de cuotas
  
  // Fórmula francesa
  const factor = Math.pow(1 + i, n)
  const cuota = P * (i * factor) / (factor - 1)
  
  return Math.round(cuota)
}

/**
 * Hook para la calculadora de compra de piso
 */
export function useCalculadoraPiso(): UseCalculadoraPisoReturn {
  const [config, setConfig] = useState<ConfigCalculadoraPiso>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { patrimonio } = usePatrimonio()
  const supabase = createClient()
  
  // Cargar configuración guardada
  useEffect(() => {
    async function loadConfig() {
      setLoading(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('hogares')
          .select('config')
          .eq('id', TEMP_HOGAR_ID)
          .single()
        
        if (fetchError) throw fetchError
        
        if (data?.config?.calculadora_piso) {
          setConfig(prev => ({
            ...DEFAULT_CONFIG,
            ...data.config.calculadora_piso
          }))
        }
      } catch (err) {
        console.error('Error loading calculadora config:', err)
        // No establecer error, usar defaults
      } finally {
        setLoading(false)
      }
    }
    
    loadConfig()
  }, [supabase])
  
  // Actualizar config (solo en memoria)
  const updateConfig = useCallback((updates: Partial<ConfigCalculadoraPiso>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])
  
  // Guardar config en BD
  const saveConfig = useCallback(async (): Promise<boolean> => {
    setSaving(true)
    setError(null)
    
    try {
      // Primero obtener la config actual
      const { data: currentData, error: fetchError } = await supabase
        .from('hogares')
        .select('config')
        .eq('id', TEMP_HOGAR_ID)
        .single()
      
      if (fetchError) throw fetchError
      
      // Merge con la config existente
      const newConfig = {
        ...(currentData?.config || {}),
        calculadora_piso: config
      }
      
      const { error: updateError } = await supabase
        .from('hogares')
        .update({ config: newConfig })
        .eq('id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return true
    } catch (err) {
      console.error('Error saving calculadora config:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar')
      return false
    } finally {
      setSaving(false)
    }
  }, [supabase, config])
  
  // Reset a defaults
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG)
  }, [])
  
  // Cálculos memoizados
  const calculo = useMemo((): CalculoPiso => {
    const {
      precio_vivienda,
      tipo_vivienda,
      es_menor_35,
      porcentaje_financiacion,
      tin_anual,
      plazo_años,
      ingresos_netos_mes,
      muebles_reformas,
      colchon_emergencia,
      ahorro_mensual_estimado
    } = config
    
    // Impuestos
    let impuesto_itp = 0
    let impuesto_iva = 0
    let impuesto_ajd = 0
    
    if (tipo_vivienda === 'obra_nueva') {
      impuesto_iva = Math.round(precio_vivienda * IVA)
      impuesto_ajd = Math.round(precio_vivienda * AJD)
    } else {
      const tipoItp = es_menor_35 ? ITP_35 : ITP
      impuesto_itp = Math.round(precio_vivienda * tipoItp)
    }
    
    const total_impuestos = impuesto_itp + impuesto_iva + impuesto_ajd
    
    // Gastos compra
    const gastos_notaria = NOTARIA
    const gastos_tasacion = TASACION
    const total_gastos_compra = total_impuestos + gastos_notaria + gastos_tasacion
    
    // Hipoteca
    const importe_hipoteca = Math.round(precio_vivienda * (porcentaje_financiacion / 100))
    const entrada = precio_vivienda - importe_hipoteca
    
    // Cuota mensual (fórmula francesa)
    const cuota_mensual = calcularCuotaMensual(importe_hipoteca, tin_anual, plazo_años)
    
    // Total intereses = (cuota_mensual × meses) - importe_hipoteca
    const total_intereses = (cuota_mensual * plazo_años * 12) - importe_hipoteca
    
    // Ratio de endeudamiento
    let ratio_endeudamiento = 0
    let estado_ratio: 'ok' | 'ajustado' | 'riesgo' = 'ok'
    
    if (ingresos_netos_mes > 0 && cuota_mensual > 0) {
      ratio_endeudamiento = (cuota_mensual / ingresos_netos_mes) * 100
      
      if (ratio_endeudamiento <= 30) {
        estado_ratio = 'ok'
      } else if (ratio_endeudamiento <= 35) {
        estado_ratio = 'ajustado'
      } else {
        estado_ratio = 'riesgo'
      }
    }
    
    // Total necesario
    const total_necesario = entrada + total_gastos_compra + muebles_reformas + colchon_emergencia
    
    // Disponible (patrimonio total)
    const disponible = patrimonio.total
    
    // Falta
    const falta = total_necesario - disponible
    
    // Meses necesarios y fecha estimada
    let meses_necesarios = 0
    let fecha_estimada: string | null = null
    
    if (falta > 0 && ahorro_mensual_estimado > 0) {
      meses_necesarios = Math.ceil(falta / ahorro_mensual_estimado)
      
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() + meses_necesarios)
      fecha_estimada = fecha.toISOString().split('T')[0]
    } else if (falta <= 0) {
      meses_necesarios = 0
      fecha_estimada = new Date().toISOString().split('T')[0]
    }
    
    return {
      impuesto_itp,
      impuesto_iva,
      impuesto_ajd,
      total_impuestos,
      gastos_notaria,
      gastos_tasacion,
      total_gastos_compra,
      importe_hipoteca,
      entrada,
      cuota_mensual,
      total_intereses,
      ratio_endeudamiento,
      estado_ratio,
      total_necesario,
      disponible,
      falta,
      meses_necesarios,
      fecha_estimada
    }
  }, [config, patrimonio.total])
  
  return {
    config,
    calculo,
    loading,
    saving,
    error,
    patrimonioDisponible: patrimonio.total,
    patrimonioM1: patrimonio.m1.total,
    patrimonioM2: patrimonio.m2.total,
    patrimonioConjunta: patrimonio.conjunta.total,
    updateConfig,
    saveConfig,
    resetConfig
  }
}
