'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatMoneyCompact } from '@/lib/utils/money'

// Nombres cortos de los meses
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export interface DatosCategoria {
  nombre: string
  icono?: string
  valores: number[]  // 12 valores, uno por mes, en céntimos
}

export interface GrupoDatos {
  titulo: string
  categorias: DatosCategoria[]
  subtotal?: number[]  // 12 valores para el subtotal del grupo
}

interface TablaAnualProps {
  grupos: GrupoDatos[]
  tipo: 'ingresos' | 'gastos' | 'balance'
  totalAnual?: number[]  // 12 valores para el total general
  className?: string
}

/**
 * Tabla anual con scroll horizontal para móvil
 * Primera columna (categoría) sticky
 * Colores alternados por fila
 */
export function TablaAnual({ grupos, tipo, totalAnual, className }: TablaAnualProps) {
  // Calcular totales por mes si no se proporcionan
  const totales = useMemo(() => {
    if (totalAnual) return totalAnual
    
    const result = new Array(12).fill(0)
    grupos.forEach(grupo => {
      grupo.categorias.forEach(cat => {
        cat.valores.forEach((val, i) => {
          result[i] += val
        })
      })
    })
    return result
  }, [grupos, totalAnual])
  
  // Total del año
  const totalAño = useMemo(() => 
    totales.reduce((sum, val) => sum + val, 0),
    [totales]
  )
  
  return (
    <div className={cn('overflow-x-auto -mx-4', className)}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[var(--border)]">
            {/* Columna sticky de categoria */}
            <th className="sticky left-0 bg-[var(--border)] py-2 px-3 text-left font-semibold min-w-[120px] z-10">
              {tipo === 'ingresos' && 'Ingresos'}
              {tipo === 'gastos' && 'Gastos'}
              {tipo === 'balance' && 'Balance'}
            </th>
            
            {/* Columnas de meses */}
            {MESES_CORTOS.map((mes, i) => (
              <th 
                key={i} 
                className="py-2 px-2 text-center font-medium text-[var(--text-secondary)] min-w-[70px]"
              >
                {mes}
              </th>
            ))}
            
            {/* Columna de total */}
            <th className="py-2 px-3 text-center font-semibold min-w-[80px] bg-[var(--border)]">
              Total
            </th>
          </tr>
        </thead>
        
        <tbody>
          {grupos.map((grupo, grupoIdx) => (
            <>
              {/* Header del grupo */}
              {grupos.length > 1 && (
                <tr
                  key={`grupo-${grupoIdx}`}
                  className="bg-[var(--background)]"
                >
                  <td
                    colSpan={14}
                    className="sticky left-0 bg-[var(--background)] py-2 px-3 font-semibold text-[var(--text-secondary)]"
                  >
                    {grupo.titulo}
                  </td>
                </tr>
              )}
              
              {/* Filas de categorías */}
              {grupo.categorias.map((cat, catIdx) => {
                const totalCat = cat.valores.reduce((sum, val) => sum + val, 0)
                const isEven = catIdx % 2 === 0
                
                return (
                  <tr
                    key={`${grupoIdx}-${catIdx}`}
                    className={cn(
                      isEven ? 'bg-surface' : 'bg-[var(--background)]'
                    )}
                  >
                    {/* Categoria (sticky) */}
                    <td className={cn(
                      'sticky left-0 py-2 px-3 font-medium truncate',
                      isEven ? 'bg-surface' : 'bg-[var(--background)]'
                    )}>
                      <span className="flex items-center gap-1.5">
                        {cat.icono && <span>{cat.icono}</span>}
                        <span className="truncate">{cat.nombre}</span>
                      </span>
                    </td>
                    
                    {/* Valores por mes */}
                    {cat.valores.map((val, mesIdx) => (
                      <td 
                        key={mesIdx}
                        className={cn(
                          'py-2 px-2 text-center tabular-nums',
                          val === 0 && 'text-[var(--text-muted)]',
                          val > 0 && tipo === 'ingresos' && 'text-positive',
                          val > 0 && tipo === 'gastos' && 'text-negative',
                          val > 0 && tipo === 'balance' && 'text-positive',
                          val < 0 && tipo === 'balance' && 'text-negative'
                        )}
                      >
                        {val === 0 ? '-' : formatMoneyCompact(Math.abs(val))}
                      </td>
                    ))}
                    
                    {/* Total categoria */}
                    <td className={cn(
                      'py-2 px-3 text-center tabular-nums font-medium bg-[var(--border)]',
                      totalCat === 0 && 'text-[var(--text-muted)]',
                      totalCat > 0 && tipo === 'ingresos' && 'text-positive',
                      totalCat > 0 && tipo === 'gastos' && 'text-negative',
                      totalCat > 0 && tipo === 'balance' && 'text-positive',
                      totalCat < 0 && tipo === 'balance' && 'text-negative'
                    )}>
                      {totalCat === 0 ? '-' : formatMoneyCompact(Math.abs(totalCat))}
                    </td>
                  </tr>
                )
              })}
              
              {/* Subtotal del grupo (si hay mas de un grupo) */}
              {grupos.length > 1 && grupo.subtotal && (
                <tr className="bg-[var(--border)]/80 border-t border-[var(--separator)]">
                  <td className="sticky left-0 bg-[var(--border)]/80 py-2 px-3 font-semibold">
                    Subtotal {grupo.titulo}
                  </td>
                  
                  {grupo.subtotal.map((val, i) => (
                    <td 
                      key={i}
                      className={cn(
                        'py-2 px-2 text-center tabular-nums font-semibold',
                        val > 0 && tipo === 'ingresos' && 'text-positive',
                        val > 0 && tipo === 'gastos' && 'text-negative'
                      )}
                    >
                      {val === 0 ? '-' : formatMoneyCompact(val)}
                    </td>
                  ))}
                  
                  <td className="py-2 px-3 text-center tabular-nums font-bold bg-[var(--border)]">
                    {formatMoneyCompact(grupo.subtotal.reduce((a, b) => a + b, 0))}
                  </td>
                </tr>
              )}
            </>
          ))}
          
          {/* TOTAL GENERAL */}
          <tr className="bg-accent/10 border-t-2 border-accent/30">
            <td className="sticky left-0 bg-accent/10 py-3 px-3 font-bold text-accent">
              TOTAL
            </td>
            
            {totales.map((val, i) => (
              <td 
                key={i}
                className={cn(
                  'py-3 px-2 text-center tabular-nums font-bold',
                  tipo === 'ingresos' && 'text-positive',
                  tipo === 'gastos' && 'text-negative',
                  tipo === 'balance' && val >= 0 ? 'text-positive' : 'text-negative'
                )}
              >
                {val === 0 ? '-' : formatMoneyCompact(Math.abs(val))}
              </td>
            ))}
            
            <td className={cn(
              'py-3 px-3 text-center tabular-nums font-bold text-lg bg-accent/20',
              tipo === 'ingresos' && 'text-positive',
              tipo === 'gastos' && 'text-negative',
              tipo === 'balance' && totalAño >= 0 ? 'text-positive' : 'text-negative'
            )}>
              {formatMoneyCompact(Math.abs(totalAño))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/**
 * Versión compacta para balance (solo totales)
 */
interface TablaBalanceProps {
  ingresosPorMes: number[]
  gastosPorMes: number[]
  className?: string
}

export function TablaBalance({ ingresosPorMes, gastosPorMes, className }: TablaBalanceProps) {
  const balancePorMes = useMemo(() => 
    ingresosPorMes.map((ing, i) => ing - gastosPorMes[i]),
    [ingresosPorMes, gastosPorMes]
  )
  
  const acumulado = useMemo(() => {
    let acc = 0
    return balancePorMes.map(val => {
      acc += val
      return acc
    })
  }, [balancePorMes])
  
  return (
    <div className={cn('overflow-x-auto -mx-4', className)}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-[var(--border)]">
            <th className="sticky left-0 bg-[var(--border)] py-2 px-3 text-left font-semibold min-w-[100px]">
              Concepto
            </th>
            {MESES_CORTOS.map((mes, i) => (
              <th key={i} className="py-2 px-2 text-center font-medium text-[var(--text-secondary)] min-w-[65px]">
                {mes}
              </th>
            ))}
            <th className="py-2 px-3 text-center font-semibold min-w-[75px] bg-[var(--border)]">
              Total
            </th>
          </tr>
        </thead>
        
        <tbody>
          {/* Ingresos */}
          <tr className="bg-green-50/50">
            <td className="sticky left-0 bg-green-50/50 py-2 px-3 font-medium text-positive">
              Ingresos
            </td>
            {ingresosPorMes.map((val, i) => (
              <td key={i} className="py-2 px-2 text-center tabular-nums text-positive">
                {val === 0 ? '-' : formatMoneyCompact(val)}
              </td>
            ))}
            <td className="py-2 px-3 text-center tabular-nums font-bold text-positive bg-green-100">
              {formatMoneyCompact(ingresosPorMes.reduce((a, b) => a + b, 0))}
            </td>
          </tr>
          
          {/* Gastos */}
          <tr className="bg-red-50/50">
            <td className="sticky left-0 bg-red-50/50 py-2 px-3 font-medium text-negative">
              Gastos
            </td>
            {gastosPorMes.map((val, i) => (
              <td key={i} className="py-2 px-2 text-center tabular-nums text-negative">
                {val === 0 ? '-' : formatMoneyCompact(val)}
              </td>
            ))}
            <td className="py-2 px-3 text-center tabular-nums font-bold text-negative bg-red-100">
              {formatMoneyCompact(gastosPorMes.reduce((a, b) => a + b, 0))}
            </td>
          </tr>
          
          {/* Balance */}
          <tr className="bg-[var(--border)] border-t-2 border-[var(--separator)]">
            <td className="sticky left-0 bg-[var(--border)] py-2 px-3 font-semibold">
              Ahorro
            </td>
            {balancePorMes.map((val, i) => (
              <td
                key={i}
                className={cn(
                  'py-2 px-2 text-center tabular-nums font-medium',
                  val >= 0 ? 'text-positive' : 'text-negative'
                )}
              >
                {val === 0 ? '-' : formatMoneyCompact(Math.abs(val))}
              </td>
            ))}
            <td className={cn(
              'py-2 px-3 text-center tabular-nums font-bold bg-[var(--border)]',
              balancePorMes.reduce((a, b) => a + b, 0) >= 0 ? 'text-positive' : 'text-negative'
            )}>
              {formatMoneyCompact(Math.abs(balancePorMes.reduce((a, b) => a + b, 0)))}
            </td>
          </tr>
          
          {/* Acumulado */}
          <tr className="bg-accent/10">
            <td className="sticky left-0 bg-accent/10 py-2 px-3 font-semibold text-accent">
              Acumulado
            </td>
            {acumulado.map((val, i) => (
              <td 
                key={i} 
                className={cn(
                  'py-2 px-2 text-center tabular-nums font-medium',
                  val >= 0 ? 'text-positive' : 'text-negative'
                )}
              >
                {formatMoneyCompact(Math.abs(val))}
              </td>
            ))}
            <td className={cn(
              'py-2 px-3 text-center tabular-nums font-bold bg-accent/20',
              acumulado[11] >= 0 ? 'text-positive' : 'text-negative'
            )}>
              {formatMoneyCompact(Math.abs(acumulado[11] || 0))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
