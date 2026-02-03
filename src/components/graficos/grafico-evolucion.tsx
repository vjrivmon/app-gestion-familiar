'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useGraficosData, COLORES_GRAFICO, type DatoEvolucion } from '@/hooks/use-graficos-data'

interface GraficoEvolucionProps {
  meses?: number
  altura?: number
  mostrarLeyenda?: boolean
  className?: string
  mini?: boolean
}

/**
 * Gráfico de evolución del patrimonio
 * AreaChart con líneas para total, Vicente, Irene y Conjunta
 */
export function GraficoEvolucion({
  meses = 6,
  altura = 250,
  mostrarLeyenda = true,
  className,
  mini = false
}: GraficoEvolucionProps) {
  const { getEvolucionPatrimonio } = useGraficosData()
  const [datos, setDatos] = useState<DatoEvolucion[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setLoading(true)
    getEvolucionPatrimonio(meses)
      .then(setDatos)
      .finally(() => setLoading(false))
  }, [getEvolucionPatrimonio, meses])
  
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
  
  // Versión mini (solo total)
  if (mini) {
    return (
      <div className={cn('w-full', className)} style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORES_GRAFICO.total} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORES_GRAFICO.total} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="total"
              stroke={COLORES_GRAFICO.total}
              fill="url(#colorTotal)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  return (
    <div className={cn('w-full', className)} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={datos} 
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotalFull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORES_GRAFICO.total} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={COLORES_GRAFICO.total} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
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
              name === 'total' ? 'Total' : 
              name === 'vicente' ? 'Vicente' :
              name === 'irene' ? 'Irene' : 'Conjunta'
            ]}
          />
          
          {mostrarLeyenda && (
            <Legend 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
              formatter={(value) => 
                value === 'total' ? 'Total' : 
                value === 'vicente' ? 'Vicente' :
                value === 'irene' ? 'Irene' : 'Conjunta'
              }
            />
          )}
          
          {/* Áreas apiladas */}
          <Area
            type="monotone"
            dataKey="conjunta"
            stackId="1"
            stroke={COLORES_GRAFICO.conjunta}
            fill={COLORES_GRAFICO.conjunta}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="irene"
            stackId="1"
            stroke={COLORES_GRAFICO.irene}
            fill={COLORES_GRAFICO.irene}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="vicente"
            stackId="1"
            stroke={COLORES_GRAFICO.vicente}
            fill={COLORES_GRAFICO.vicente}
            fillOpacity={0.6}
          />
          
          {/* Línea total encima */}
          <Area
            type="monotone"
            dataKey="total"
            stroke={COLORES_GRAFICO.total}
            fill="url(#colorTotalFull)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
