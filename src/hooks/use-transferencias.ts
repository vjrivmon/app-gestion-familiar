'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pagador, Gasto, Ingreso } from '@/types/finanzas'

export interface Transferencia {
  id: string               // transferencia_id compartido
  de: Pagador
  a: Pagador
  importe: number         // céntimos
  concepto: string
  fecha: string           // ISO date
  gastoId: string         // id del gasto origen
  ingresoId: string       // id del ingreso destino
}

interface UseTransferenciasReturn {
  // Estado
  transferencias: Transferencia[]
  loading: boolean
  error: string | null
  
  // Funciones
  crearTransferencia: (
    de: Pagador, 
    a: Pagador, 
    importe: number, 
    concepto: string
  ) => Promise<Transferencia | null>
  
  getTransferenciasMes: (mes: number, año: number) => Promise<Transferencia[]>
  
  // Refetch
  refetch: () => Promise<void>
}

const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001'

export function useTransferencias(mes: number, año: number): UseTransferenciasReturn {
  const [transferencias, setTransferencias] = useState<Transferencia[]>([])
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
  
  // Fetch transferencias del mes
  const fetchTransferencias = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Buscar gastos con categoría 'transferencia' del mes
      // (ya que la categoría se extiende al tipo)
      const { data: gastosTransf, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .not('transferencia_id', 'is', null)
        .gte('fecha', primerDia)
        .lte('fecha', ultimoDia)
        .order('fecha', { ascending: false })
      
      if (fetchError) throw fetchError
      
      // Para cada gasto, buscar el ingreso correspondiente
      const result: Transferencia[] = []
      
      for (const gasto of gastosTransf || []) {
        const { data: ingreso } = await supabase
          .from('ingresos')
          .select('*')
          .eq('transferencia_id', gasto.transferencia_id)
          .single()
        
        if (ingreso) {
          result.push({
            id: gasto.transferencia_id!,
            de: gasto.pagador,
            a: ingreso.destinatario,
            importe: gasto.importe,
            concepto: gasto.concepto,
            fecha: gasto.fecha,
            gastoId: gasto.id,
            ingresoId: ingreso.id
          })
        }
      }
      
      setTransferencias(result)
    } catch (err) {
      console.error('Error fetching transferencias:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar transferencias')
    } finally {
      setLoading(false)
    }
  }, [supabase, primerDia, ultimoDia])
  
  // Cargar al montar y cuando cambie el mes
  useEffect(() => {
    fetchTransferencias()
  }, [fetchTransferencias])
  
  // Crear transferencia
  const crearTransferencia = useCallback(async (
    de: Pagador,
    a: Pagador,
    importe: number,
    concepto: string
  ): Promise<Transferencia | null> => {
    if (de === a) {
      setError('El origen y destino no pueden ser iguales')
      return null
    }
    
    if (importe <= 0) {
      setError('El importe debe ser mayor que 0')
      return null
    }
    
    try {
      // Generar ID único para vincular gasto e ingreso
      const transferenciaId = crypto.randomUUID()
      const fecha = new Date().toISOString().split('T')[0]
      
      // 1. Crear el gasto en el origen
      const { data: gasto, error: gastoError } = await supabase
        .from('gastos')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          concepto: concepto || 'Transferencia',
          importe,
          categoria: 'otros', // Usamos 'otros' ya que 'transferencia' no está en CategoriaGasto
          pagador: de,
          tipo_dinero: 'digital',
          fecha,
          notas: `Transferencia a ${a}`,
          transferencia_id: transferenciaId,
          created_by: TEMP_USER_ID
        })
        .select()
        .single()
      
      if (gastoError) throw gastoError
      
      // 2. Crear el ingreso en el destino
      const { data: ingreso, error: ingresoError } = await supabase
        .from('ingresos')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          concepto: concepto || 'Transferencia',
          importe,
          categoria: 'transferencia',
          destinatario: a,
          tipo_dinero: 'digital',
          es_fijo: false,
          es_proyectado: false,
          fecha,
          notas: `Transferencia desde ${de}`,
          transferencia_id: transferenciaId,
          created_by: TEMP_USER_ID
        })
        .select()
        .single()
      
      if (ingresoError) {
        // Si falla el ingreso, eliminar el gasto creado
        await supabase.from('gastos').delete().eq('id', gasto.id)
        throw ingresoError
      }
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      const nuevaTransferencia: Transferencia = {
        id: transferenciaId,
        de,
        a,
        importe,
        concepto: concepto || 'Transferencia',
        fecha,
        gastoId: gasto.id,
        ingresoId: ingreso.id
      }
      
      // Añadir al estado si está en el mes actual
      if (fecha >= primerDia && fecha <= ultimoDia) {
        setTransferencias(prev => [nuevaTransferencia, ...prev])
      }
      
      return nuevaTransferencia
    } catch (err) {
      console.error('Error creating transferencia:', err)
      setError(err instanceof Error ? err.message : 'Error al crear transferencia')
      return null
    }
  }, [supabase, primerDia, ultimoDia])
  
  // Obtener transferencias de un mes específico
  const getTransferenciasMes = useCallback(async (
    targetMes: number,
    targetAño: number
  ): Promise<Transferencia[]> => {
    const primerDiaTarget = new Date(targetAño, targetMes, 1).toISOString().split('T')[0]
    const ultimoDiaTarget = new Date(targetAño, targetMes + 1, 0).toISOString().split('T')[0]
    
    try {
      const { data: gastosTransf, error: fetchError } = await supabase
        .from('gastos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .not('transferencia_id', 'is', null)
        .gte('fecha', primerDiaTarget)
        .lte('fecha', ultimoDiaTarget)
        .order('fecha', { ascending: false })
      
      if (fetchError) throw fetchError
      
      const result: Transferencia[] = []
      
      for (const gasto of gastosTransf || []) {
        const { data: ingreso } = await supabase
          .from('ingresos')
          .select('*')
          .eq('transferencia_id', gasto.transferencia_id)
          .single()
        
        if (ingreso) {
          result.push({
            id: gasto.transferencia_id!,
            de: gasto.pagador,
            a: ingreso.destinatario,
            importe: gasto.importe,
            concepto: gasto.concepto,
            fecha: gasto.fecha,
            gastoId: gasto.id,
            ingresoId: ingreso.id
          })
        }
      }
      
      return result
    } catch (err) {
      console.error('Error getting transferencias:', err)
      return []
    }
  }, [supabase])
  
  return {
    transferencias,
    loading,
    error,
    crearTransferencia,
    getTransferenciasMes,
    refetch: fetchTransferencias
  }
}
