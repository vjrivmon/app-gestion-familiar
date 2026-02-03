'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useGraficosData, COLORES_GRAFICO, type DatoIngresosGastos } from '@/hooks/use-graficos-data'

interface GraficoIngresosGastosProps {
  meses?: number
  altura?: number
  mostrarLeyenda?: boolean
  className?: string
}

/**
 * Gráfico de barras comparativo de Ingresos vs Gastos
 */
export function GraficoIngresosGastos({
  meses = 6,
  altura = 220,
  mostrarLeyenda = true,
  className
}: GraficoIngresosGastosProps) {
  const { getIngresosVsGastos } = useGraficosData()
  const [datos, setDatos] = useState<DatoIngresosGastos[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setLoading(true)
    getIngresosVsGastos(meses)
      .then(setDatos)
      .finally(() => setLoading(false))
  }, [getIngresosVsGastos, meses])
  
  if (loading) {
    return (
      <div 
        className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)}
        style={{ height: altura }}
      />
    )
  }
  
  if (datos.length === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center text-gray-400', className)}
        style={{ height: altura }}
      >
        Sin datos
      </div>
    )
  }
  
  return (
    <div className={cn('w-full', className)} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={datos} 
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barCategoryGap="20%"
        >
          <XAxis 
            dataKey="mes" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            width={40}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface, #fff)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 8 }}
            formatter={(value: number, name: string) => [
              formatMoney(value * 100),
              name === 'ingresos' ? 'Ingresos' : 'Gastos'
            ]}
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          />
          
          {mostrarLeyenda && (
            <Legend 
              iconType="rect"
              iconSize={10}
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
              formatter={(value) => value === 'ingresos' ? 'Ingresos' : 'Gastos'}
            />
          )}
          
          <Bar 
            dataKey="ingresos" 
            fill={COLORES_GRAFICO.positivo}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar 
            dataKey="gastos" 
            fill={COLORES_GRAFICO.negativo}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
