'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Prestamo, Pagador, NOMBRES } from '@/types/finanzas'

type PrestamoInput = Omit<Prestamo, 'id' | 'hogar_id' | 'created_at' | 'pagado' | 'fecha_pago'>

interface BalancePrestamos {
  deudorPersona: Pagador | null  // null si están en equilibrio
  deudorNombre: string
  cantidad: number  // céntimos, siempre positivo
  resumen: string  // "Vicente debe 50€ a Irene" o "Equilibrado"
}

interface UsePrestamosReturn {
  // Estado
  prestamos: Prestamo[]
  loading: boolean
  error: string | null
  
  // CRUD
  crearPrestamo: (data: PrestamoInput) => Promise<Prestamo | null>
  marcarPagado: (id: string) => Promise<boolean>
  eliminarPrestamo: (id: string) => Promise<boolean>
  
  // Filtros
  prestamosPendientes: Prestamo[]
  prestamosPagados: Prestamo[]
  
  // Cálculos
  balanceNeto: BalancePrestamos
  totalPendiente: number
  
  // Refetch
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

const NOMBRES_MAP: Record<Pagador, string> = {
  m1: 'Vicente',
  m2: 'Irene',
  conjunta: 'Conjunta'
}

export function usePrestamos(): UsePrestamosReturn {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Fetch todos los préstamos
  const fetchPrestamos = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('prestamos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .order('fecha', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setPrestamos(data || [])
    } catch (err) {
      console.error('Error fetching prestamos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar préstamos')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  // Cargar al montar
  useEffect(() => {
    fetchPrestamos()
  }, [fetchPrestamos])
  
  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('prestamos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prestamos',
          filter: `hogar_id=eq.${TEMP_HOGAR_ID}`
        },
        (payload) => {
          console.log('Prestamo change:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            const nuevo = payload.new as Prestamo
            setPrestamos(prev => [nuevo, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const actualizado = payload.new as Prestamo
            setPrestamos(prev => prev.map(p => 
              p.id === actualizado.id ? actualizado : p
            ))
          } else if (payload.eventType === 'DELETE') {
            const eliminado = payload.old as { id: string }
            setPrestamos(prev => prev.filter(p => p.id !== eliminado.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
  
  // CRUD: Crear
  const crearPrestamo = useCallback(async (data: PrestamoInput): Promise<Prestamo | null> => {
    // Validación: no puede ser a uno mismo
    if (data.de_quien === data.a_quien) {
      setError('No puedes prestarte dinero a ti mismo')
      return null
    }
    
    try {
      const { data: nuevo, error: insertError } = await supabase
        .from('prestamos')
        .insert({
          ...data,
          hogar_id: TEMP_HOGAR_ID,
          pagado: false
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10)
      
      return nuevo
    } catch (err) {
      console.error('Error creating prestamo:', err)
      setError(err instanceof Error ? err.message : 'Error al crear préstamo')
      return null
    }
  }, [supabase])
  
  // Marcar como pagado
  const marcarPagado = useCallback(async (id: string): Promise<boolean> => {
    try {
      const fechaPago = new Date().toISOString().split('T')[0]
      
      const { error: updateError } = await supabase
        .from('prestamos')
        .update({
          pagado: true,
          fecha_pago: fechaPago
        })
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (updateError) throw updateError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([20, 100, 20])
      
      return true
    } catch (err) {
      console.error('Error marking prestamo as paid:', err)
      setError(err instanceof Error ? err.message : 'Error al marcar como pagado')
      return false
    }
  }, [supabase])
  
  // CRUD: Eliminar
  const eliminarPrestamo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('prestamos')
        .delete()
        .eq('id', id)
        .eq('hogar_id', TEMP_HOGAR_ID)
      
      if (deleteError) throw deleteError
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      return true
    } catch (err) {
      console.error('Error deleting prestamo:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar préstamo')
      return false
    }
  }, [supabase])
  
  // Filtros memoizados
  const prestamosPendientes = useMemo(() => 
    prestamos.filter(p => !p.pagado),
    [prestamos]
  )
  
  const prestamosPagados = useMemo(() => 
    prestamos.filter(p => p.pagado),
    [prestamos]
  )
  
  // Cálculo del balance neto entre la pareja (solo m1 y m2)
  const balanceNeto = useMemo((): BalancePrestamos => {
    // Calcular lo que m1 ha prestado a m2 menos lo que m2 ha prestado a m1
    // Solo préstamos pendientes
    let balanceM1 = 0  // Positivo = m2 debe a m1, Negativo = m1 debe a m2
    
    prestamosPendientes.forEach(p => {
      // Ignorar préstamos que involucren 'conjunta'
      if (p.de_quien === 'conjunta' || p.a_quien === 'conjunta') return
      
      if (p.de_quien === 'm1' && p.a_quien === 'm2') {
        balanceM1 += p.importe  // m2 debe a m1
      } else if (p.de_quien === 'm2' && p.a_quien === 'm1') {
        balanceM1 -= p.importe  // m1 debe a m2
      }
    })
    
    if (balanceM1 === 0) {
      return {
        deudorPersona: null,
        deudorNombre: '',
        cantidad: 0,
        resumen: '✅ Equilibrado'
      }
    }
    
    const deudor: Pagador = balanceM1 > 0 ? 'm2' : 'm1'
    const acreedor: Pagador = balanceM1 > 0 ? 'm1' : 'm2'
    const cantidad = Math.abs(balanceM1)
    
    return {
      deudorPersona: deudor,
      deudorNombre: NOMBRES_MAP[deudor],
      cantidad,
      resumen: `${NOMBRES_MAP[deudor]} debe a ${NOMBRES_MAP[acreedor]}`
    }
  }, [prestamosPendientes])
  
  // Total pendiente
  const totalPendiente = useMemo(() => 
    prestamosPendientes.reduce((sum, p) => sum + p.importe, 0),
    [prestamosPendientes]
  )
  
  return {
    prestamos,
    loading,
    error,
    crearPrestamo,
    marcarPagado,
    eliminarPrestamo,
    prestamosPendientes,
    prestamosPagados,
    balanceNeto,
    totalPendiente,
    refetch: fetchPrestamos
  }
}
