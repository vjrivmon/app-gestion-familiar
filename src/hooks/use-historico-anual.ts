'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Ingreso, Gasto, Pagador, CategoriaIngreso, CategoriaGasto } from '@/types/finanzas'
import type { GrupoDatos, DatosCategoria } from '@/components/finanzas/tabla-anual'

interface DatosMes {
  mes: number
  ingresos: Ingreso[]
  gastos: Gasto[]
  totalIngresos: number
  totalGastos: number
  balance: number
}

interface DatosAnuales {
  año: number
  meses: DatosMes[]
  
  // Totales por mes (12 valores)
  ingresosPorMes: number[]
  gastosPorMes: number[]
  balancePorMes: number[]
  
  // Desglose por categoría y mes
  ingresosPorCategoria: Record<CategoriaIngreso, number[]>
  gastosPorCategoria: Record<CategoriaGasto, number[]>
  
  // Desglose por persona y mes
  ingresosPorPersona: Record<Pagador, number[]>
  gastosPorPersona: Record<Pagador, number[]>
  
  // Totales anuales
  totalIngresos: number
  totalGastos: number
  balance: number
}

interface UseHistoricoAnualReturn {
  datos: DatosAnuales | null
  loading: boolean
  error: string | null
  
  // Datos formateados para TablaAnual
  gruposIngresos: GrupoDatos[]
  gruposGastos: GrupoDatos[]
  
  // Año actual y navegación
  año: number
  setAño: (año: number) => void
  añoActual: number
  
  refetch: () => Promise<void>
}

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

const CATEGORIAS_INGRESO_INFO: Record<CategoriaIngreso, { nombre: string; icono: string }> = {
  nomina: { nombre: 'Nómina', icono: '💰' },
  pagas_extra: { nombre: 'Pagas Extra', icono: '🎁' },
  freelance: { nombre: 'Freelance', icono: '💻' },
  becas: { nombre: 'Becas/Ayudas', icono: '🎓' },
  efectivo: { nombre: 'Efectivo', icono: '💵' },
  transferencia: { nombre: 'Transferencia', icono: '🔄' },
  otros: { nombre: 'Otros', icono: '📝' }
}

const CATEGORIAS_GASTO_INFO: Record<CategoriaGasto, { nombre: string; icono: string }> = {
  alquiler: { nombre: 'Alquiler', icono: '🏠' },
  suministros: { nombre: 'Suministros', icono: '💡' },
  internet_movil: { nombre: 'Internet/Móvil', icono: '📱' },
  supermercado: { nombre: 'Supermercado', icono: '🛒' },
  transporte: { nombre: 'Transporte', icono: '🚗' },
  ocio: { nombre: 'Ocio', icono: '🎬' },
  ropa: { nombre: 'Ropa', icono: '👕' },
  salud: { nombre: 'Salud', icono: '💊' },
  suscripciones: { nombre: 'Suscripciones', icono: '📺' },
  ia: { nombre: 'IA', icono: '🤖' },
  otros: { nombre: 'Otros', icono: '📝' }
}

/**
 * Hook para obtener datos históricos de un año completo
 */
export function useHistoricoAnual(): UseHistoricoAnualReturn {
  const añoActual = new Date().getFullYear()
  const [año, setAño] = useState(añoActual)
  const [datos, setDatos] = useState<DatosAnuales | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Fetch datos del año
  const fetchDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const primerDia = `${año}-01-01`
      const ultimoDia = `${año}-12-31`
      
      // Fetch ingresos del año
      const { data: ingresos, error: ingError } = await supabase
        .from('ingresos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', primerDia)
        .lte('fecha', ultimoDia)
        .order('fecha', { ascending: true })
      
      if (ingError) throw ingError
      
      // Fetch gastos del año
      const { data: gastos, error: gasError } = await supabase
        .from('gastos')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', primerDia)
        .lte('fecha', ultimoDia)
        .order('fecha', { ascending: true })
      
      if (gasError) throw gasError
      
      // Procesar datos por mes
      const meses: DatosMes[] = []
      const ingresosPorMes: number[] = new Array(12).fill(0)
      const gastosPorMes: number[] = new Array(12).fill(0)
      
      // Inicializar categorías
      const ingresosPorCategoria: Record<CategoriaIngreso, number[]> = {
        nomina: new Array(12).fill(0),
        pagas_extra: new Array(12).fill(0),
        freelance: new Array(12).fill(0),
        becas: new Array(12).fill(0),
        efectivo: new Array(12).fill(0),
        transferencia: new Array(12).fill(0),
        otros: new Array(12).fill(0)
      }
      
      const gastosPorCategoria: Record<CategoriaGasto, number[]> = {
        alquiler: new Array(12).fill(0),
        suministros: new Array(12).fill(0),
        internet_movil: new Array(12).fill(0),
        supermercado: new Array(12).fill(0),
        transporte: new Array(12).fill(0),
        ocio: new Array(12).fill(0),
        ropa: new Array(12).fill(0),
        salud: new Array(12).fill(0),
        suscripciones: new Array(12).fill(0),
        ia: new Array(12).fill(0),
        otros: new Array(12).fill(0)
      }
      
      // Inicializar por persona
      const ingresosPorPersona: Record<Pagador, number[]> = {
        m1: new Array(12).fill(0),
        m2: new Array(12).fill(0),
        conjunta: new Array(12).fill(0)
      }
      
      const gastosPorPersona: Record<Pagador, number[]> = {
        m1: new Array(12).fill(0),
        m2: new Array(12).fill(0),
        conjunta: new Array(12).fill(0)
      }
      
      // Procesar ingresos
      ingresos?.forEach(ing => {
        const mes = new Date(ing.fecha).getMonth()
        ingresosPorMes[mes] += ing.importe
        const catIng = ing.categoria as CategoriaIngreso
        const destIng = ing.destinatario as Pagador
        if (ingresosPorCategoria[catIng]) {
          ingresosPorCategoria[catIng][mes] += ing.importe
        }
        if (ingresosPorPersona[destIng]) {
          ingresosPorPersona[destIng][mes] += ing.importe
        }
      })
      
      // Procesar gastos
      gastos?.forEach(gas => {
        const mes = new Date(gas.fecha).getMonth()
        gastosPorMes[mes] += gas.importe
        const catGas = gas.categoria as CategoriaGasto
        const pagGas = gas.pagador as Pagador
        if (gastosPorCategoria[catGas]) {
          gastosPorCategoria[catGas][mes] += gas.importe
        }
        if (gastosPorPersona[pagGas]) {
          gastosPorPersona[pagGas][mes] += gas.importe
        }
      })
      
      // Calcular balances
      const balancePorMes = ingresosPorMes.map((ing, i) => ing - gastosPorMes[i])
      
      // Crear datos por mes
      for (let m = 0; m < 12; m++) {
        const mesIngresos = ingresos?.filter(i => new Date(i.fecha).getMonth() === m) || []
        const mesGastos = gastos?.filter(g => new Date(g.fecha).getMonth() === m) || []
        
        meses.push({
          mes: m,
          ingresos: mesIngresos,
          gastos: mesGastos,
          totalIngresos: ingresosPorMes[m],
          totalGastos: gastosPorMes[m],
          balance: balancePorMes[m]
        })
      }
      
      // Totales anuales
      const totalIngresos = ingresosPorMes.reduce((a, b) => a + b, 0)
      const totalGastos = gastosPorMes.reduce((a, b) => a + b, 0)
      
      setDatos({
        año,
        meses,
        ingresosPorMes,
        gastosPorMes,
        balancePorMes,
        ingresosPorCategoria,
        gastosPorCategoria,
        ingresosPorPersona,
        gastosPorPersona,
        totalIngresos,
        totalGastos,
        balance: totalIngresos - totalGastos
      })
    } catch (err) {
      console.error('Error fetching historico:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar histórico')
    } finally {
      setLoading(false)
    }
  }, [supabase, año])
  
  // Cargar al montar y cuando cambie el año
  useEffect(() => {
    fetchDatos()
  }, [fetchDatos])
  
  // Formatear datos para TablaAnual - Ingresos
  const gruposIngresos = useMemo((): GrupoDatos[] => {
    if (!datos) return []
    
    // Agrupar por persona
    const grupos: GrupoDatos[] = ['m1', 'm2', 'conjunta'].map(persona => {
      const p = persona as Pagador
      const nombre = p === 'm1' ? 'Vicente' : p === 'm2' ? 'Irene' : 'Conjunta'
      
      // Filtrar categorías que tienen datos para esta persona
      const categorias: DatosCategoria[] = Object.entries(datos.ingresosPorCategoria)
        .map(([cat, valores]) => {
          // Necesitamos calcular por persona Y categoría
          // Por ahora usamos la categoría general
          return {
            nombre: CATEGORIAS_INGRESO_INFO[cat as CategoriaIngreso].nombre,
            icono: CATEGORIAS_INGRESO_INFO[cat as CategoriaIngreso].icono,
            valores
          }
        })
        .filter(cat => cat.valores.some(v => v > 0))
      
      return {
        titulo: nombre,
        categorias,
        subtotal: datos.ingresosPorPersona[p]
      }
    }).filter(g => g.categorias.length > 0 || g.subtotal?.some(v => v > 0))
    
    // Si no hay grupos con datos, mostrar todas las categorías
    if (grupos.length === 0) {
      return [{
        titulo: 'Todas las categorías',
        categorias: Object.entries(CATEGORIAS_INGRESO_INFO).map(([cat, info]) => ({
          nombre: info.nombre,
          icono: info.icono,
          valores: datos.ingresosPorCategoria[cat as CategoriaIngreso]
        }))
      }]
    }
    
    return grupos
  }, [datos])
  
  // Formatear datos para TablaAnual - Gastos
  const gruposGastos = useMemo((): GrupoDatos[] => {
    if (!datos) return []
    
    // Mostrar todas las categorías de gasto que tienen datos
    const categorias: DatosCategoria[] = Object.entries(CATEGORIAS_GASTO_INFO)
      .map(([cat, info]) => ({
        nombre: info.nombre,
        icono: info.icono,
        valores: datos.gastosPorCategoria[cat as CategoriaGasto]
      }))
      .filter(cat => cat.valores.some(v => v > 0))
    
    // Si no hay datos, mostrar estructura vacía
    if (categorias.length === 0) {
      return [{
        titulo: 'Gastos',
        categorias: Object.entries(CATEGORIAS_GASTO_INFO).map(([cat, info]) => ({
          nombre: info.nombre,
          icono: info.icono,
          valores: new Array(12).fill(0)
        }))
      }]
    }
    
    return [{
      titulo: 'Gastos',
      categorias
    }]
  }, [datos])
  
  return {
    datos,
    loading,
    error,
    gruposIngresos,
    gruposGastos,
    año,
    setAño,
    añoActual,
    refetch: fetchDatos
  }
}
