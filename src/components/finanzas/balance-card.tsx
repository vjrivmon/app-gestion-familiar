'use client'

import { useState } from 'react'
import { ArrowLeftRight, Check, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useBalance } from '@/hooks/use-balance'
import { useConfigHogar } from '@/hooks/use-config-hogar'
import { getNombrePagador } from '@/types/config'

interface BalanceCardProps {
  onDetailClick?: () => void
  className?: string
}

/**
 * Card principal mostrando el balance de pareja
 * Estilo neumórfico pastel
 */
export function BalanceCard({ onDetailClick, className }: BalanceCardProps) {
  const { balance, loading, liquidarBalance } = useBalance()
  const { config } = useConfigHogar()
  const [liquidando, setLiquidando] = useState(false)
  const [liquidado, setLiquidado] = useState(false)

  const handleLiquidar = async () => {
    if (liquidando || balance.enPaz) return

    setLiquidando(true)
    const success = await liquidarBalance()
    setLiquidando(false)

    if (success) {
      setLiquidado(true)
      setTimeout(() => setLiquidado(false), 2000)
    }
  }

  const nombreDeudor = balance.deudor ? getNombrePagador(config, balance.deudor) : ''
  const nombreAcreedor = balance.acreedor ? getNombrePagador(config, balance.acreedor) : ''

  return (
    <div className={cn('card', className)}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[var(--text-secondary)] text-sm">Balance de pareja</p>
          {loading ? (
            <div className="h-9 flex items-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-primary">
              {balance.enPaz ? '0,00 EUR' : formatMoney(balance.cantidad)}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, var(--primary-light), var(--primary))',
            boxShadow: 'var(--shadow-neu-sm)'
          }}
        >
          <ArrowLeftRight className="w-5 h-5 text-[var(--text-inverse)]" />
        </div>
      </div>

      {/* Estado del balance */}
      {!loading && (
        <div className="mb-4">
          {balance.enPaz ? (
            <p className="text-[var(--text-secondary)]">
              Estais en paz
            </p>
          ) : (
            <p className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{nombreDeudor}</span>
              {' debe '}
              <span className="font-semibold text-primary">{formatMoney(balance.cantidad)}</span>
              {' a '}
              <span className="font-semibold text-[var(--text-primary)]">{nombreAcreedor}</span>
            </p>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        {/* Boton Liquidar */}
        {!balance.enPaz && !loading && (
          <button
            onClick={handleLiquidar}
            disabled={liquidando || liquidado}
            className={cn(
              'flex-1 py-3 px-4 rounded-full font-semibold text-sm',
              'transition-all duration-150',
              'flex items-center justify-center gap-2',
              'disabled:opacity-70',
              'active:scale-98'
            )}
            style={{
              background: 'linear-gradient(145deg, var(--primary), var(--primary-dark))',
              color: 'var(--text-inverse)',
              boxShadow: 'var(--shadow-neu-sm)'
            }}
          >
            {liquidando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Liquidando...
              </>
            ) : liquidado ? (
              <>
                <Check className="w-4 h-4" />
                Liquidado!
              </>
            ) : (
              'Liquidar'
            )}
          </button>
        )}

        {/* Boton Detalle */}
        {onDetailClick && (
          <button
            onClick={onDetailClick}
            className={cn(
              'py-3 px-4 rounded-full font-semibold text-sm',
              'transition-all duration-150',
              'flex items-center gap-1',
              'active:scale-98',
              balance.enPaz && 'flex-1 justify-center'
            )}
            style={{
              background: 'var(--background)',
              color: 'var(--primary)',
              boxShadow: 'var(--shadow-neu-sm)'
            }}
          >
            Detalle
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
