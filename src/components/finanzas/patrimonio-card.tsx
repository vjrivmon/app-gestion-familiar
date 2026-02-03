'use client'

import { PiggyBank, Settings, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { usePatrimonio } from '@/hooks/use-patrimonio'
import { useConfigHogar } from '@/hooks/use-config-hogar'
import { getNombrePagador } from '@/types/config'

interface PatrimonioCardProps {
  onConfigClick?: () => void
  className?: string
}

/**
 * Card de patrimonio total
 * - Muestra patrimonio total grande
 * - Tabla con desglose por persona y tipo
 * - Link a configuración de saldos
 */
export function PatrimonioCard({ onConfigClick, className }: PatrimonioCardProps) {
  const { patrimonio, loading } = usePatrimonio()
  const { config } = useConfigHogar()
  
  const nombreM1 = getNombrePagador(config, 'm1')
  const nombreM2 = getNombrePagador(config, 'm2')
  
  const personas = [
    { key: 'm1' as const, nombre: nombreM1, data: patrimonio.m1 },
    { key: 'm2' as const, nombre: nombreM2, data: patrimonio.m2 },
    { key: 'conjunta' as const, nombre: 'Conjunta', data: patrimonio.conjunta }
  ]
  
  // Verificar si hay saldos configurados
  const tieneSaldos = config?.saldos_iniciales !== undefined
  
  return (
    <div className={cn('card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-accent" />
          <span className="font-semibold">Patrimonio Total</span>
        </div>
        {onConfigClick && (
          <button
            onClick={onConfigClick}
            className="p-2 -mr-2 text-gray-400 active:text-gray-600 transition-colors"
            aria-label="Configurar saldos"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Patrimonio total */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <p className={cn(
            'text-3xl font-bold mb-4',
            patrimonio.total >= 0 ? 'text-positive' : 'text-negative'
          )}>
            {formatMoney(patrimonio.total)}
          </p>
          
          {/* Tabla de desglose */}
          <div className="space-y-1">
            {/* Header de tabla */}
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 pb-1 border-b border-gray-100 dark:border-gray-800">
              <span></span>
              <span className="text-center">Físico</span>
              <span className="text-center">Digital</span>
              <span className="text-center">Total</span>
            </div>
            
            {/* Filas */}
            {personas.map(({ key, nombre, data }) => (
              <div 
                key={key}
                className="grid grid-cols-4 gap-2 text-sm py-1.5"
              >
                <span className="font-medium truncate">{nombre}</span>
                <span className={cn(
                  'text-center tabular-nums',
                  data.fisico >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-negative'
                )}>
                  {formatMoney(data.fisico)}
                </span>
                <span className={cn(
                  'text-center tabular-nums',
                  data.digital >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-negative'
                )}>
                  {formatMoney(data.digital)}
                </span>
                <span className={cn(
                  'text-center tabular-nums font-medium',
                  data.total >= 0 ? 'text-positive' : 'text-negative'
                )}>
                  {formatMoney(data.total)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Nota si no hay saldos configurados */}
          {!tieneSaldos && (
            <button
              onClick={onConfigClick}
              className="mt-4 w-full py-2 text-sm text-accent font-medium active:opacity-70"
            >
              Configurar saldos iniciales →
            </button>
          )}
        </>
      )}
    </div>
  )
}
