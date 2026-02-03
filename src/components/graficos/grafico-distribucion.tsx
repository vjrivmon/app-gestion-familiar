'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useGraficosData, type DatoDistribucion } from '@/hooks/use-graficos-data'

interface GraficoDistribucionProps {
  mes?: number
  año?: number
  altura?: number
  className?: string
}

/**
 * Gráfico circular de distribución de gastos por categoría
 */
export function GraficoDistribucion({
  mes,
  año,
  altura = 280,
  className
}: GraficoDistribucionProps) {
  const { getDistribucionGastos } = useGraficosData()
  const [datos, setDatos] = useState<DatoDistribucion[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setLoading(true)
    getDistribucionGastos(mes, año)
      .then(setDatos)
      .finally(() => setLoading(false))
  }, [getDistribucionGastos, mes, año])
  
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
        className={cn('flex items-center justify-center text-gray-400 flex-col gap-2', className)}
        style={{ height: altura }}
      >
        <span className="text-4xl">📊</span>
        <span>Sin gastos este mes</span>
      </div>
    )
  }
  
  // Total para mostrar en centro
  const total = datos.reduce((sum, d) => sum + d.valor, 0)
  
  // Renderizado personalizado de etiquetas
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
  }) => {
    if (percent < 0.08) return null // No mostrar si es muy pequeño
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
  
  return (
    <div className={cn('w-full', className)} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={datos}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="valor"
            nameKey="nombre"
            labelLine={false}
            label={renderCustomLabel}
          >
            {datos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface, #fff)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '12px'
            }}
            formatter={(value: number, name: string, props) => {
              const payload = props?.payload as DatoDistribucion | undefined
              return [
                <span key="value">
                  {payload?.icono || ''} {formatMoney(value * 100)} ({payload?.porcentaje || 0}%)
                </span>,
                name
              ]
            }}
          />
          
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            formatter={(value, entry) => {
              const item = datos.find(d => d.nombre === value)
              return item ? `${item.icono} ${value}` : value
            }}
          />
          
          {/* Texto central */}
          <text
            x="50%"
            y="42%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-500 dark:fill-gray-400"
            fontSize={11}
          >
            Total
          </text>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-900 dark:fill-white"
            fontSize={16}
            fontWeight={700}
          >
            {formatMoney(total * 100)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
