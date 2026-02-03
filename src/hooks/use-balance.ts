'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pagador, Gasto } from '@/types/finanzas'

interface BalanceResult {
  deudor: Pagador | null
  acreedor: Pagador | null
  cantidad: number  // céntimos
  enPaz: boolean
}

interface UseBalanceReturn {
  // Estado
  balance: BalanceResult
  loading: boolean
  error: string | null
  
  // Cálculos detallados
  gastosPorPersona: Record<'m1' | 'm2', number>
  gastosCompartidos: Gasto[]
  
  // Acciones
  calcularBalance: () => BalanceResult
  liquidarBalance: () => Promise<boolean>
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Hook para calcular el balance de pareja
 * 
 * Lógica:
 * - Los gastos de la cuenta conjunta son compartidos 50/50
 * - Si m1 paga un gasto conjunto, m2 le debe la mitad
 * - Si m2 paga un gasto conjunto, m1 le debe la mitad
 * 
 * El balance es la diferencia entre lo que ha pagado cada uno
 * de gastos que deberían ser compartidos.
 */
export function useBalance(): UseBalanceReturn {
  const [gastosPagados, setGastosPagados] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Obtener gastos donde el pagador pagó algo que beneficia a ambos
  // Esto incluye gastos conjuntos pagados por m1 o m2
  const fetchGastos = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Obtener gastos conjuntos pagados por m1 o m2
      // Estos son gastos que deben dividirse 50/50
      const { data, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        // Gastos de la conjunta pagados por personas individuales
        // O gastos marcados como compartidos
        .in('pagador', ['m1', 'm2'])
        .order('fecha', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setGastosPagados(data || [])
    } catch (err) {
      console.error('Error fetching gastos para balance:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar balance')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])
  
  // Gastos que se consideran compartidos (pagados para la cuenta conjunta)
  // Por ahora: gastos con categoría alquiler, suministros, supermercado, internet_movil
  const gastosCompartidos = useMemo(() => {
    const categoriasCompartidas = ['alquiler', 'suministros', 'supermercado', 'internet_movil', 'suscripciones']
    return gastosPagados.filter(g => 
      categoriasCompartidas.includes(g.categoria) &&
      (g.pagador === 'm1' || g.pagador === 'm2')
    )
  }, [gastosPagados])
  
  // Lo que ha pagado cada uno en gastos compartidos
  const gastosPorPersona = useMemo(() => {
    const result = { m1: 0, m2: 0 }
    gastosCompartidos.forEach(g => {
      if (g.pagador === 'm1' || g.pagador === 'm2') {
        result[g.pagador] += g.importe
      }
    })
    return result
  }, [gastosCompartidos])
  
  // Calcular balance
  const calcularBalance = useCallback((): BalanceResult => {
    const pagadoM1 = gastosPorPersona.m1
    const pagadoM2 = gastosPorPersona.m2
    
    // Cada uno debería haber pagado la mitad del total
    const total = pagadoM1 + pagadoM2
    const mitad = Math.floor(total / 2)
    
    // Diferencia: positivo = m1 ha pagado de más, negativo = m2 ha pagado de más
    const diferencia = pagadoM1 - mitad
    
    if (Math.abs(diferencia) < 100) {  // Menos de 1€ de diferencia = en paz
      return {
        deudor: null,
        acreedor: null,
        cantidad: 0,
        enPaz: true
      }
    }
    
    if (diferencia > 0) {
      // m1 ha pagado de más, m2 le debe
      return {
        deudor: 'm2',
        acreedor: 'm1',
        cantidad: diferencia,
        enPaz: false
      }
    } else {
      // m2 ha pagado de más, m1 le debe
      return {
        deudor: 'm1',
        acreedor: 'm2',
        cantidad: Math.abs(diferencia),
        enPaz: false
      }
    }
  }, [gastosPorPersona])
  
  const balance = useMemo(() => calcularBalance(), [calcularBalance])
  
  // Liquidar balance: crear transferencia que equilibra
  const liquidarBalance = useCallback(async (): Promise<boolean> => {
    if (balance.enPaz || !balance.deudor || !balance.acreedor) {
      return false
    }
    
    try {
      // Crear un ingreso/transferencia que representa el pago de la deuda
      // El deudor "paga" al acreedor
      const fecha = new Date().toISOString().split('T')[0]
      
      // Crear ingreso para el acreedor (recibe el dinero)
      const { error: ingresoError } = await supabase
        .from('ingresos')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          created_by: TEMP_USER_ID,
          concepto: `Liquidación balance ${new Date().toLocaleDateString('es-ES')}`,
          importe: balance.cantidad,
          categoria: 'transferencia',
          destinatario: balance.acreedor,
          tipo_dinero: 'digital',
          es_fijo: false,
          es_proyectado: false,
          fecha,
          notas: `Liquidación automática de balance. ${balance.deudor === 'm1' ? 'Vicente' : 'Irene'} paga a ${balance.acreedor === 'm1' ? 'Vicente' : 'Irene'}`
        })
      
      if (ingresoError) throw ingresoError
      
      // Crear gasto para el deudor (paga el dinero)
      const { error: gastoError } = await supabase
        .from('gastos')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          created_by: TEMP_USER_ID,
          concepto: `Liquidación balance ${new Date().toLocaleDateString('es-ES')}`,
          importe: balance.cantidad,
          categoria: 'otros',
          pagador: balance.deudor,
          tipo_dinero: 'digital',
          fecha,
          notas: `Liquidación automática de balance a ${balance.acreedor === 'm1' ? 'Vicente' : 'Irene'}`
        })
      
      if (gastoError) throw gastoError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      // Refetch para actualizar
      await fetchGastos()
      
      return true
    } catch (err) {
      console.error('Error liquidando balance:', err)
      setError(err instanceof Error ? err.message : 'Error al liquidar balance')
      return false
    }
  }, [supabase, balance, fetchGastos])
  
  return {
    balance,
    loading,
    error,
    gastosPorPersona,
    gastosCompartidos,
    calcularBalance,
    liquidarBalance,
    refetch: fetchGastos
  }
}
