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
 * Card de patrimonio total - estilo neumórfico
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

  const tieneSaldos = config?.saldos_iniciales !== undefined

  return (
    <div className={cn('card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, var(--secondary-light), var(--secondary))',
              boxShadow: 'var(--shadow-neu-sm)'
            }}
          >
            <PiggyBank className="w-4 h-4 text-[var(--text-inverse)]" />
          </div>
          <span className="font-semibold">Patrimonio Total</span>
        </div>
        {onConfigClick && (
          <button
            onClick={onConfigClick}
            className="p-2 -mr-2 text-[var(--text-muted)] active:text-[var(--text-secondary)] transition-colors rounded-full"
            aria-label="Configurar saldos"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Patrimonio total */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
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
          <div
            className="rounded-neu-md p-3"
            style={{
              background: 'var(--background)',
              boxShadow: 'var(--shadow-neu-inset-sm)'
            }}
          >
            {/* Header de tabla */}
            <div className="grid grid-cols-4 gap-2 text-xs text-[var(--text-secondary)] pb-2 border-b border-[var(--separator)]">
              <span></span>
              <span className="text-center">Fisico</span>
              <span className="text-center">Digital</span>
              <span className="text-center">Total</span>
            </div>

            {/* Filas */}
            {personas.map(({ key, nombre, data }) => (
              <div
                key={key}
                className="grid grid-cols-4 gap-2 text-sm py-2"
              >
                <span className="font-medium truncate">{nombre}</span>
                <span className={cn(
                  'text-center tabular-nums',
                  data.fisico >= 0 ? 'text-[var(--text-secondary)]' : 'text-negative'
                )}>
                  {formatMoney(data.fisico)}
                </span>
                <span className={cn(
                  'text-center tabular-nums',
                  data.digital >= 0 ? 'text-[var(--text-secondary)]' : 'text-negative'
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
              className="mt-4 w-full py-2 text-sm text-primary font-medium active:opacity-70 rounded-full"
              style={{
                background: 'var(--background)',
                boxShadow: 'var(--shadow-neu-sm)'
              }}
            >
              Configurar saldos iniciales
            </button>
          )}
        </>
      )}
    </div>
  )
}
