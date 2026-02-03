'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Gasto, Ingreso } from '@/types/finanzas'
import { useConfigHogar } from '@/hooks/use-config-hogar'

interface AportacionesMes {
  m1: number      // céntimos
  m2: number      // céntimos
  otros: number   // céntimos (transferencias sin origen claro)
}

interface EvolucionMes {
  mes: number
  año: number
  nombreMes: string
  saldo: number           // céntimos - saldo al final del mes
  ingresos: number        // céntimos - ingresos del mes
  gastos: number          // céntimos - gastos del mes
  aportaciones: number    // céntimos - total aportaciones
}

interface UseCuentaConjuntaReturn {
  // Estado
  loading: boolean
  error: string | null
  
  // Saldo
  saldoConjunta: number           // céntimos
  saldoEfectivo: number           // céntimos  
  saldoDigital: number            // céntimos
  
  // Datos del mes
  ingresosMes: Ingreso[]
  gastosMes: Gasto[]
  
  // Funciones
  getSaldoConjunta: () => number
  getAportacionesMes: (mes: number, año: number) => Promise<AportacionesMes>
  getEvolucionConjunta: (meses: number) => Promise<EvolucionMes[]>
  
  // Refetch
  refetch: () => Promise<void>
}

const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

const NOMBRES_MES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

export function useCuentaConjunta(mes: number, año: number): UseCuentaConjuntaReturn {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Datos históricos para cálculos
  const [todosIngresos, setTodosIngresos] = useState<Ingreso[]>([])
  const [todosGastos, setTodosGastos] = useState<Gasto[]>([])
  
  const { config } = useConfigHogar()
  const supabase = createClient()
  
  // Rango de fechas del mes actual
  const primerDiaMes = useMemo(() => {
    const d = new Date(año, mes, 1)
    return d.toISOString().split('T')[0]
  }, [mes, año])
  
  const ultimoDiaMes = useMemo(() => {
    const d = new Date(año, mes + 1, 0)
    return d.toISOString().split('T')[0]
  }, [mes, año])
  
  // Fetch todos los datos de la cuenta conjunta
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch todos los ingresos a la cuenta conjunta
      const { data: ingresosData, error: ingresosError } = await supabase
        .from('ingresos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .eq('destinatario', 'conjunta')
        .order('fecha', { ascending: false })
      
      if (ingresosError) throw ingresosError
      
      // Fetch todos los gastos de la cuenta conjunta
      const { data: gastosData, error: gastosError } = await supabase
        .from('gastos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .eq('pagador', 'conjunta')
        .order('fecha', { ascending: false })
      
      if (gastosError) throw gastosError
      
      setTodosIngresos(ingresosData || [])
      setTodosGastos(gastosData || [])
    } catch (err) {
      console.error('Error fetching cuenta conjunta:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar cuenta conjunta')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  // Cargar al montar
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  // Saldo inicial de la cuenta conjunta
  const saldoInicial = useMemo(() => {
    if (!config?.saldos_iniciales?.conjunta) return 0
    return (
      config.saldos_iniciales.conjunta.efectivo + 
      config.saldos_iniciales.conjunta.digital
    )
  }, [config])
  
  const saldoInicialEfectivo = useMemo(() => {
    return config?.saldos_iniciales?.conjunta?.efectivo || 0
  }, [config])
  
  const saldoInicialDigital = useMemo(() => {
    return config?.saldos_iniciales?.conjunta?.digital || 0
  }, [config])
  
  // Fecha de saldos iniciales
  const fechaSaldosIniciales = useMemo(() => {
    return config?.fecha_saldos_iniciales || '1970-01-01'
  }, [config])
  
  // Total ingresos desde fecha inicial
  const totalIngresos = useMemo(() => {
    return todosIngresos
      .filter(i => i.fecha >= fechaSaldosIniciales)
      .reduce((sum, i) => sum + i.importe, 0)
  }, [todosIngresos, fechaSaldosIniciales])
  
  // Total gastos desde fecha inicial
  const totalGastos = useMemo(() => {
    return todosGastos
      .filter(g => g.fecha >= fechaSaldosIniciales)
      .reduce((sum, g) => sum + g.importe, 0)
  }, [todosGastos, fechaSaldosIniciales])
  
  // Saldo actual
  const saldoConjunta = useMemo(() => {
    return saldoInicial + totalIngresos - totalGastos
  }, [saldoInicial, totalIngresos, totalGastos])
  
  // Saldos por tipo (efectivo vs digital)
  const saldoEfectivo = useMemo(() => {
    const ingresosEfectivo = todosIngresos
      .filter(i => i.fecha >= fechaSaldosIniciales && i.tipo_dinero === 'efectivo')
      .reduce((sum, i) => sum + i.importe, 0)
    
    const gastosEfectivo = todosGastos
      .filter(g => g.fecha >= fechaSaldosIniciales && g.tipo_dinero === 'efectivo')
      .reduce((sum, g) => sum + g.importe, 0)
    
    return saldoInicialEfectivo + ingresosEfectivo - gastosEfectivo
  }, [todosIngresos, todosGastos, saldoInicialEfectivo, fechaSaldosIniciales])
  
  const saldoDigital = useMemo(() => {
    const ingresosDigital = todosIngresos
      .filter(i => i.fecha >= fechaSaldosIniciales && i.tipo_dinero === 'digital')
      .reduce((sum, i) => sum + i.importe, 0)
    
    const gastosDigital = todosGastos
      .filter(g => g.fecha >= fechaSaldosIniciales && g.tipo_dinero === 'digital')
      .reduce((sum, g) => sum + g.importe, 0)
    
    return saldoInicialDigital + ingresosDigital - gastosDigital
  }, [todosIngresos, todosGastos, saldoInicialDigital, fechaSaldosIniciales])
  
  // Ingresos del mes actual
  const ingresosMes = useMemo(() => {
    return todosIngresos.filter(
      i => i.fecha >= primerDiaMes && i.fecha <= ultimoDiaMes
    )
  }, [todosIngresos, primerDiaMes, ultimoDiaMes])
  
  // Gastos del mes actual
  const gastosMes = useMemo(() => {
    return todosGastos.filter(
      g => g.fecha >= primerDiaMes && g.fecha <= ultimoDiaMes
    )
  }, [todosGastos, primerDiaMes, ultimoDiaMes])
  
  // Getter del saldo
  const getSaldoConjunta = useCallback(() => {
    return saldoConjunta
  }, [saldoConjunta])
  
  // Obtener aportaciones de un mes específico
  const getAportacionesMes = useCallback(async (
    targetMes: number, 
    targetAño: number
  ): Promise<AportacionesMes> => {
    const primerDia = new Date(targetAño, targetMes, 1).toISOString().split('T')[0]
    const ultimoDia = new Date(targetAño, targetMes + 1, 0).toISOString().split('T')[0]
    
    try {
      // Buscar transferencias a conjunta (ingresos con categoria='transferencia')
      const { data: transferencias, error } = await supabase
        .from('ingresos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .eq('destinatario', 'conjunta')
        .eq('categoria', 'transferencia')
        .gte('fecha', primerDia)
        .lte('fecha', ultimoDia)
      
      if (error) throw error
      
      // Agrupar por origen (el concepto debería indicar de quién viene)
      // También podríamos usar transferencia_id para buscar el gasto origen
      const result: AportacionesMes = { m1: 0, m2: 0, otros: 0 }
      
      for (const t of transferencias || []) {
        // Si tiene transferencia_id, buscar el gasto original
        if (t.transferencia_id) {
          const { data: gastoOrigen } = await supabase
            .from('gastos')
            .select('pagador')
            .eq('transferencia_id', t.transferencia_id)
            .single()
          
          if (gastoOrigen?.pagador === 'm1') {
            result.m1 += t.importe
          } else if (gastoOrigen?.pagador === 'm2') {
            result.m2 += t.importe
          } else {
            result.otros += t.importe
          }
        } else {
          // Sin transferencia_id, clasificar como otros
          result.otros += t.importe
        }
      }
      
      return result
    } catch (err) {
      console.error('Error getting aportaciones:', err)
      return { m1: 0, m2: 0, otros: 0 }
    }
  }, [supabase])
  
  // Obtener evolución de los últimos N meses
  const getEvolucionConjunta = useCallback(async (
    numMeses: number
  ): Promise<EvolucionMes[]> => {
    const resultado: EvolucionMes[] = []
    let saldoAcumulado = saldoInicial
    
    // Calcular desde la fecha de saldos iniciales
    const fechaInicio = new Date(fechaSaldosIniciales)
    const mesInicio = fechaInicio.getMonth()
    const añoInicio = fechaInicio.getFullYear()
    
    // Fecha actual
    const ahora = new Date()
    const mesActual = ahora.getMonth()
    const añoActual = ahora.getFullYear()
    
    // Iterar desde inicio hasta ahora
    let m = mesInicio
    let a = añoInicio
    
    while (a < añoActual || (a === añoActual && m <= mesActual)) {
      const primerDia = new Date(a, m, 1).toISOString().split('T')[0]
      const ultimoDia = new Date(a, m + 1, 0).toISOString().split('T')[0]
      
      // Calcular ingresos y gastos del mes
      const ingresosMesCalc = todosIngresos
        .filter(i => i.fecha >= primerDia && i.fecha <= ultimoDia)
        .reduce((sum, i) => sum + i.importe, 0)
      
      const gastosMesCalc = todosGastos
        .filter(g => g.fecha >= primerDia && g.fecha <= ultimoDia)
        .reduce((sum, g) => sum + g.importe, 0)
      
      // Aportaciones (transferencias a conjunta)
      const aportacionesMes = todosIngresos
        .filter(i => 
          i.fecha >= primerDia && 
          i.fecha <= ultimoDia && 
          i.categoria === 'transferencia'
        )
        .reduce((sum, i) => sum + i.importe, 0)
      
      saldoAcumulado = saldoAcumulado + ingresosMesCalc - gastosMesCalc
      
      resultado.push({
        mes: m,
        año: a,
        nombreMes: NOMBRES_MES[m],
        saldo: saldoAcumulado,
        ingresos: ingresosMesCalc,
        gastos: gastosMesCalc,
        aportaciones: aportacionesMes
      })
      
      // Siguiente mes
      m++
      if (m > 11) {
        m = 0
        a++
      }
    }
    
    // Devolver solo los últimos N meses
    return resultado.slice(-numMeses)
  }, [todosIngresos, todosGastos, saldoInicial, fechaSaldosIniciales])
  
  return {
    loading,
    error,
    saldoConjunta,
    saldoEfectivo,
    saldoDigital,
    ingresosMes,
    gastosMes,
    getSaldoConjunta,
    getAportacionesMes,
    getEvolucionConjunta,
    refetch: fetchData
  }
}
