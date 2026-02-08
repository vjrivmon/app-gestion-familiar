'use client'

import { TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useIngresos } from '@/hooks/use-ingresos'
import { useGastos } from '@/hooks/use-gastos'
import { useConfigHogar } from '@/hooks/use-config-hogar'
import { getNombrePagador } from '@/types/config'

interface ResumenMesCardProps {
  mes: number
  año: number
  nombreMes: string
  className?: string
}

/**
 * Card con resumen del mes actual
 * - Ingresos totales vs Gastos totales
 * - Ahorro/Pérdida del mes
 * - Desglose por persona (mini)
 */
export function ResumenMesCard({ mes, año, nombreMes, className }: ResumenMesCardProps) {
  const { totalMes: totalIngresos, porPersona: ingresosPorPersona, loading: loadingIngresos } = useIngresos(mes, año)
  const { totalMes: totalGastos, porPersona: gastosPorPersona, loading: loadingGastos } = useGastos(mes, año)
  const { config } = useConfigHogar()
  
  const loading = loadingIngresos || loadingGastos
  const balance = totalIngresos - totalGastos
  const esPositivo = balance >= 0
  
  const nombreM1 = getNombrePagador(config, 'm1')
  const nombreM2 = getNombrePagador(config, 'm2')
  
  // Balance por persona (ingresos - gastos)
  const balanceM1 = (ingresosPorPersona?.m1 || 0) - (gastosPorPersona?.m1 || 0)
  const balanceM2 = (ingresosPorPersona?.m2 || 0) - (gastosPorPersona?.m2 || 0)
  
  return (
    <div className={cn('card', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-5 h-5 text-accent" />
        <span className="font-semibold">Resumen {nombreMes}</span>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : (
        <>
          {/* Ingresos vs Gastos */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-1 text-[var(--text-secondary)] text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-positive" />
                Ingresos
              </div>
              <p className="text-lg font-bold text-positive">
                +{formatMoney(totalIngresos)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[var(--text-secondary)] text-xs mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-negative" />
                Gastos
              </div>
              <p className="text-lg font-bold text-negative">
                -{formatMoney(totalGastos)}
              </p>
            </div>
          </div>
          
          {/* Balance del mes */}
          <div className={cn(
            'py-3 px-4 rounded-lg mb-3',
            esPositivo 
              ? 'bg-positive/10' 
              : 'bg-negative/10'
          )}>
            <p className="text-sm text-[var(--text-secondary)] mb-0.5">
              {esPositivo ? 'Ahorrado este mes' : 'Perdida este mes'}
            </p>
            <p className={cn(
              'text-2xl font-bold',
              esPositivo ? 'text-positive' : 'text-negative'
            )}>
              {esPositivo ? '+' : ''}{formatMoney(balance)}
            </p>
          </div>
          
          {/* Desglose por persona (mini) */}
          <div className="flex gap-4 text-sm">
            <div className="flex-1">
              <span className="text-[var(--text-secondary)]">{nombreM1}:</span>
              <span className={cn(
                'ml-1 font-medium',
                balanceM1 >= 0 ? 'text-positive' : 'text-negative'
              )}>
                {balanceM1 >= 0 ? '+' : ''}{formatMoney(balanceM1)}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-[var(--text-secondary)]">{nombreM2}:</span>
              <span className={cn(
                'ml-1 font-medium',
                balanceM2 >= 0 ? 'text-positive' : 'text-negative'
              )}>
                {balanceM2 >= 0 ? '+' : ''}{formatMoney(balanceM2)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
