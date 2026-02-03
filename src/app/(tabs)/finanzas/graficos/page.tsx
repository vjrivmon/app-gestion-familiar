'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GraficoEvolucion } from '@/components/graficos/grafico-evolucion'
import { GraficoIngresosGastos } from '@/components/graficos/grafico-ingresos-gastos'
import { GraficoDistribucion } from '@/components/graficos/grafico-distribucion'
import { GraficoBalanceMensual } from '@/components/graficos/grafico-balance-mensual'

type Periodo = '6m' | '12m' | 'año'

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: '6m', label: '6 meses' },
  { id: '12m', label: '12 meses' },
  { id: 'año', label: 'Año actual' },
]

export default function GraficosPage() {
  const router = useRouter()
  const [periodo, setPeriodo] = useState<Periodo>('6m')
  
  // Calcular meses según periodo
  const getMeses = () => {
    if (periodo === '12m') return 12
    if (periodo === 'año') {
      const mesActual = new Date().getMonth() + 1
      return mesActual
    }
    return 6
  }
  
  const meses = getMeses()
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-surface dark:bg-surface shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-accent font-medium -ml-2 px-2 py-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Volver</span>
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center mr-6">
            📊 Análisis Financiero
          </h1>
        </div>
        
        {/* Selector de período */}
        <div className="px-4 pb-3">
          <div className="flex bg-[var(--border)] rounded-[9px] p-[2px]">
            {PERIODOS.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id)}
                className={cn(
                  'flex-1 py-[6px] text-[12px] font-medium rounded-[7px] transition-all',
                  periodo === p.id 
                    ? 'bg-surface text-primary shadow-sm' 
                    : 'text-[var(--text-secondary)]'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Gráfico 1: Evolución Patrimonio (grande) */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Evolución Patrimonio</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Total acumulado por persona
              </p>
            </div>
          </div>
          <GraficoEvolucion meses={meses} altura={280} />
        </div>
        
        {/* Gráfico 2: Ingresos vs Gastos */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Ingresos vs Gastos</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Comparativa mensual
              </p>
            </div>
          </div>
          <GraficoIngresosGastos meses={meses} altura={220} />
        </div>
        
        {/* Gráfico 3: Distribución Gastos */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Distribución de Gastos</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Por categoría este mes
              </p>
            </div>
          </div>
          <GraficoDistribucion altura={280} />
        </div>
        
        {/* Gráfico 4: Balance por Persona */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Ahorro por Persona</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Ingresos - Gastos mensuales
              </p>
            </div>
          </div>
          <GraficoBalanceMensual meses={meses} altura={220} />
        </div>
        
        {/* Nota informativa */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-center">
          <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
            💡 Los gráficos se actualizan automáticamente al añadir transacciones
          </p>
        </div>
      </div>
    </div>
  )
}
