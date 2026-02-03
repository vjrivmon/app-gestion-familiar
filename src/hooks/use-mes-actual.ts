'use client'

import { useState, useCallback, useMemo } from 'react'

interface UseMesActualReturn {
  // Estado
  mes: number       // 0-11
  año: number
  fecha: Date       // Primer día del mes
  
  // Navegación
  mesAnterior: () => void
  mesSiguiente: () => void
  irAMesActual: () => void
  irAMes: (mes: number, año: number) => void
  
  // Helpers
  esActual: boolean
  esFuturo: boolean
  esPasado: boolean
  
  // Formato
  nombreMes: string           // "Febrero"
  nombreMesCorto: string      // "Feb"
  mesAño: string              // "Febrero 2026"
  mesAñoCorto: string         // "Feb 2026"
  
  // Rango de fechas
  primerDia: Date
  ultimoDia: Date
  primerDiaISO: string        // "2026-02-01"
  ultimoDiaISO: string        // "2026-02-28"
}

export function useMesActual(inicial?: Date): UseMesActualReturn {
  const ahora = new Date()
  const [fecha, setFecha] = useState(() => {
    const init = inicial || ahora
    return new Date(init.getFullYear(), init.getMonth(), 1)
  })

  const mes = fecha.getMonth()
  const año = fecha.getFullYear()

  // Navegación
  const mesAnterior = useCallback(() => {
    setFecha(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [])

  const mesSiguiente = useCallback(() => {
    setFecha(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [])

  const irAMesActual = useCallback(() => {
    setFecha(new Date(ahora.getFullYear(), ahora.getMonth(), 1))
  }, [ahora])

  const irAMes = useCallback((nuevoMes: number, nuevoAño: number) => {
    setFecha(new Date(nuevoAño, nuevoMes, 1))
  }, [])

  // Comparaciones
  const mesActual = ahora.getMonth()
  const añoActual = ahora.getFullYear()
  
  const esActual = mes === mesActual && año === añoActual
  const esFuturo = año > añoActual || (año === añoActual && mes > mesActual)
  const esPasado = año < añoActual || (año === añoActual && mes < mesActual)

  // Nombres
  const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' })
  const nombreMesCorto = fecha.toLocaleDateString('es-ES', { month: 'short' })
  const mesAño = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const mesAñoCorto = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })

  // Capitalizar primera letra
  const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  // Rango de fechas
  const primerDia = useMemo(() => new Date(año, mes, 1), [año, mes])
  const ultimoDia = useMemo(() => new Date(año, mes + 1, 0), [año, mes])

  const formatISO = (d: Date) => d.toISOString().split('T')[0]

  return {
    mes,
    año,
    fecha,
    
    mesAnterior,
    mesSiguiente,
    irAMesActual,
    irAMes,
    
    esActual,
    esFuturo,
    esPasado,
    
    nombreMes: capitalizar(nombreMes),
    nombreMesCorto: capitalizar(nombreMesCorto),
    mesAño: capitalizar(mesAño),
    mesAñoCorto: capitalizar(mesAñoCorto),
    
    primerDia,
    ultimoDia,
    primerDiaISO: formatISO(primerDia),
    ultimoDiaISO: formatISO(ultimoDia),
  }
}
