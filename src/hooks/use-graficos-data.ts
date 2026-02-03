'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useConfigHogar } from './use-config-hogar'
import type { Pagador, CategoriaGasto } from '@/types/finanzas'

// TODO: Obtener hogar_id del contexto de autenticación
const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

// Nombres de meses cortos
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Colores para gráficos
export const COLORES_GRAFICO = {
  total: 'hsl(var(--accent))',  // accent
  vicente: '#3b82f6',  // blue-500
  irene: '#ec4899',    // pink-500
  conjunta: '#a855f7', // purple-500
  positivo: '#22c55e', // green-500
  negativo: '#ef4444', // red-500
  // Colores para categorías
  categorias: [
    '#3b82f6', // blue
    '#ec4899', // pink
    '#f59e0b', // amber
    '#22c55e', // green
    '#8b5cf6', // violet
    '#6b7280', // gray (otros)
  ]
}

// Tipos para datos de gráficos
export interface DatoEvolucion {
  mes: string
  total: number
  vicente: number
  irene: number
  conjunta: number
}

export interface DatoIngresosGastos {
  mes: string
  ingresos: number
  gastos: number
}

export interface DatoDistribucion {
  categoria: string
  nombre: string
  icono: string
  valor: number
  porcentaje: number
  color: string
}

export interface DatoBalanceMensual {
  mes: string
  vicente: number
  irene: number
}

/**
 * Hook para preparar datos para gráficos con Recharts
 */
export function useGraficosData() {
  const { config } = useConfigHogar()
  const supabase = createClient()
  
  /**
   * Obtener evolución del patrimonio para los últimos N meses
   */
  const getEvolucionPatrimonio = useCallback(async (
    meses: number = 6
  ): Promise<DatoEvolucion[]> => {
    const resultado: DatoEvolucion[] = []
    const ahora = new Date()
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const mes = fecha.getMonth()
      const año = fecha.getFullYear()
      const ultimoDia = new Date(año, mes + 1, 0).toISOString().split('T')[0]
      const fechaInicial = config?.fecha_saldos_iniciales || '2000-01-01'
      
      // Inicializar con saldos iniciales
      const patrimonio = {
        m1: { fisico: 0, digital: 0 },
        m2: { fisico: 0, digital: 0 },
        conjunta: { fisico: 0, digital: 0 }
      }
      
      if (config?.saldos_iniciales) {
        const si = config.saldos_iniciales
        patrimonio.m1 = { fisico: si.m1.efectivo, digital: si.m1.digital }
        patrimonio.m2 = { fisico: si.m2.efectivo, digital: si.m2.digital }
        patrimonio.conjunta = { fisico: si.conjunta.efectivo, digital: si.conjunta.digital }
      }
      
      try {
        // Sumar ingresos
        const { data: ingresos } = await supabase
          .from('ingresos')
          .select('importe, destinatario, tipo_dinero')
          .eq('hogar_id', TEMP_HOGAR_ID)
          .gte('fecha', fechaInicial)
          .lte('fecha', ultimoDia)
        
        ingresos?.forEach(ing => {
          const persona = ing.destinatario as keyof typeof patrimonio
          if (patrimonio[persona]) {
            if (ing.tipo_dinero === 'efectivo') {
              patrimonio[persona].fisico += ing.importe
            } else {
              patrimonio[persona].digital += ing.importe
            }
          }
        })
        
        // Restar gastos
        const { data: gastos } = await supabase
          .from('gastos')
          .select('importe, pagador, tipo_dinero')
          .eq('hogar_id', TEMP_HOGAR_ID)
          .gte('fecha', fechaInicial)
          .lte('fecha', ultimoDia)
        
        gastos?.forEach(gas => {
          const persona = gas.pagador as keyof typeof patrimonio
          if (patrimonio[persona]) {
            if (gas.tipo_dinero === 'efectivo') {
              patrimonio[persona].fisico -= gas.importe
            } else {
              patrimonio[persona].digital -= gas.importe
            }
          }
        })
        
        // Calcular totales (en euros, no céntimos)
        const vicente = (patrimonio.m1.fisico + patrimonio.m1.digital) / 100
        const irene = (patrimonio.m2.fisico + patrimonio.m2.digital) / 100
        const conjunta = (patrimonio.conjunta.fisico + patrimonio.conjunta.digital) / 100
        
        resultado.push({
          mes: MESES_CORTOS[mes],
          total: vicente + irene + conjunta,
          vicente,
          irene,
          conjunta
        })
      } catch (err) {
        console.error('Error en getEvolucionPatrimonio:', err)
        resultado.push({
          mes: MESES_CORTOS[mes],
          total: 0,
          vicente: 0,
          irene: 0,
          conjunta: 0
        })
      }
    }
    
    return resultado
  }, [supabase, config])
  
  /**
   * Obtener ingresos vs gastos por mes
   */
  const getIngresosVsGastos = useCallback(async (
    meses: number = 6
  ): Promise<DatoIngresosGastos[]> => {
    const resultado: DatoIngresosGastos[] = []
    const ahora = new Date()
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const mes = fecha.getMonth()
      const año = fecha.getFullYear()
      const primerDia = new Date(año, mes, 1).toISOString().split('T')[0]
      const ultimoDia = new Date(año, mes + 1, 0).toISOString().split('T')[0]
      
      try {
        // Ingresos del mes
        const { data: ingresos } = await supabase
          .from('ingresos')
          .select('importe')
          .eq('hogar_id', TEMP_HOGAR_ID)
          .gte('fecha', primerDia)
          .lte('fecha', ultimoDia)
        
        const totalIngresos = ingresos?.reduce((sum, i) => sum + i.importe, 0) || 0
        
        // Gastos del mes
        const { data: gastos } = await supabase
          .from('gastos')
          .select('importe')
          .eq('hogar_id', TEMP_HOGAR_ID)
          .gte('fecha', primerDia)
          .lte('fecha', ultimoDia)
        
        const totalGastos = gastos?.reduce((sum, g) => sum + g.importe, 0) || 0
        
        resultado.push({
          mes: MESES_CORTOS[mes],
          ingresos: totalIngresos / 100,  // Convertir a euros
          gastos: totalGastos / 100
        })
      } catch (err) {
        console.error('Error en getIngresosVsGastos:', err)
        resultado.push({
          mes: MESES_CORTOS[mes],
          ingresos: 0,
          gastos: 0
        })
      }
    }
    
    return resultado
  }, [supabase])
  
  /**
   * Obtener distribución de gastos por categoría
   */
  const getDistribucionGastos = useCallback(async (
    mes?: number,
    año?: number
  ): Promise<DatoDistribucion[]> => {
    const ahora = new Date()
    const mesTarget = mes ?? ahora.getMonth()
    const añoTarget = año ?? ahora.getFullYear()
    
    const primerDia = new Date(añoTarget, mesTarget, 1).toISOString().split('T')[0]
    const ultimoDia = new Date(añoTarget, mesTarget + 1, 0).toISOString().split('T')[0]
    
    const CATEGORIAS_INFO: Record<CategoriaGasto, { nombre: string; icono: string }> = {
      alquiler: { nombre: 'Alquiler', icono: '•' },
      suministros: { nombre: 'Suministros', icono: '•' },
      internet_movil: { nombre: 'Internet/Móvil', icono: '•' },
      supermercado: { nombre: 'Supermercado', icono: '•' },
      transporte: { nombre: 'Transporte', icono: '•' },
      ocio: { nombre: 'Ocio', icono: '•' },
      ropa: { nombre: 'Ropa', icono: '•' },
      salud: { nombre: 'Salud', icono: '•' },
      suscripciones: { nombre: 'Suscripciones', icono: '•' },
      ia: { nombre: 'IA', icono: '•' },
      otros: { nombre: 'Otros', icono: '•' }
    }
    
    try {
      const { data: gastos } = await supabase
        .from('gastos')
        .select('importe, categoria')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .gte('fecha', primerDia)
        .lte('fecha', ultimoDia)
      
      if (!gastos || gastos.length === 0) {
        return []
      }
      
      // Agrupar por categoría
      const porCategoria: Record<string, number> = {}
      let total = 0
      
      gastos.forEach(g => {
        const cat = g.categoria as CategoriaGasto
        porCategoria[cat] = (porCategoria[cat] || 0) + g.importe
        total += g.importe
      })
      
      // Ordenar por valor y tomar top 5 + otros
      const ordenado = Object.entries(porCategoria)
        .map(([cat, valor]) => ({ cat, valor }))
        .sort((a, b) => b.valor - a.valor)
      
      const resultado: DatoDistribucion[] = []
      let sumOtros = 0
      
      ordenado.forEach((item, index) => {
        const cat = item.cat as CategoriaGasto
        const info = CATEGORIAS_INFO[cat] || { nombre: cat, icono: '•' }
        
        if (index < 5) {
          resultado.push({
            categoria: cat,
            nombre: info.nombre,
            icono: info.icono,
            valor: item.valor / 100,
            porcentaje: total > 0 ? Math.round((item.valor / total) * 100) : 0,
            color: COLORES_GRAFICO.categorias[index]
          })
        } else {
          sumOtros += item.valor
        }
      })
      
      // Añadir "Otros" si hay
      if (sumOtros > 0) {
        resultado.push({
          categoria: 'otros_agrupado',
          nombre: 'Otros',
          icono: '•',
          valor: sumOtros / 100,
          porcentaje: total > 0 ? Math.round((sumOtros / total) * 100) : 0,
          color: COLORES_GRAFICO.categorias[5]
        })
      }
      
      return resultado
    } catch (err) {
      console.error('Error en getDistribucionGastos:', err)
      return []
    }
  }, [supabase])
  
  /**
   * Obtener balance mensual por persona
   */
  const getBalanceMensual = useCallback(async (
    meses: number = 6
  ): Promise<DatoBalanceMensual[]> => {
    const resultado: DatoBalanceMensual[] = []
    const ahora = new Date()
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const mes = fecha.getMonth()
      const año = fecha.getFullYear()
      const primerDia = new Date(año, mes, 1).toISOString().split('T')[0]
      const ultimoDia = new Date(año, mes + 1, 0).toISOString().split('T')[0]
      
      try {
        // Ingresos por persona
        const { data: ingresos } = await supabase
          .from('ingresos')
          .select('importe, destinatario')
          .eq('hogar_id', TEMP_HOGAR_ID)
          .gte('fecha', primerDia)
          .lte('fecha', ultimoDia)
          .in('destinatario', ['m1', 'm2'])
        
        const ingresosPorPersona = { m1: 0, m2: 0 }
        ingresos?.forEach(i => {
          const dest = i.destinatario as 'm1' | 'm2'
          ingresosPorPersona[dest] += i.importe
        })
        
        // Gastos por persona
        const { data: gastos } = await supabase
          .from('gastos')
          .select('importe, pagador')
          .eq('hogar_id', TEMP_HOGAR_ID)
          .gte('fecha', primerDia)
          .lte('fecha', ultimoDia)
          .in('pagador', ['m1', 'm2'])
        
        const gastosPorPersona = { m1: 0, m2: 0 }
        gastos?.forEach(g => {
          const pag = g.pagador as 'm1' | 'm2'
          gastosPorPersona[pag] += g.importe
        })
        
        resultado.push({
          mes: MESES_CORTOS[mes],
          vicente: (ingresosPorPersona.m1 - gastosPorPersona.m1) / 100,
          irene: (ingresosPorPersona.m2 - gastosPorPersona.m2) / 100
        })
      } catch (err) {
        console.error('Error en getBalanceMensual:', err)
        resultado.push({
          mes: MESES_CORTOS[mes],
          vicente: 0,
          irene: 0
        })
      }
    }
    
    return resultado
  }, [supabase])
  
  return {
    getEvolucionPatrimonio,
    getIngresosVsGastos,
    getDistribucionGastos,
    getBalanceMensual,
    colores: COLORES_GRAFICO
  }
}
