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
 * - Quién debe a quién
 * - Botón liquidar si hay deuda
 * - Link a detalle
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
      // Reset después de 2 segundos
      setTimeout(() => setLiquidado(false), 2000)
    }
  }
  
  // Nombres de los participantes
  const nombreDeudor = balance.deudor ? getNombrePagador(config, balance.deudor) : ''
  const nombreAcreedor = balance.acreedor ? getNombrePagador(config, balance.acreedor) : ''
  
  return (
    <div className={cn(
      'card bg-surface border border-[var(--border)]',
      className
    )}>
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
              {balance.enPaz ? '0,00€' : formatMoney(balance.cantidad)}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      {/* Estado del balance */}
      {!loading && (
        <div className="mb-4">
          {balance.enPaz ? (
            <p className="text-[var(--text-secondary)]">
              Estáis en paz 
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
      <div className="flex gap-2">
        {/* Botón Liquidar */}
        {!balance.enPaz && !loading && (
          <button
            onClick={handleLiquidar}
            disabled={liquidando || liquidado}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm',
              'bg-primary text-white',
              'active:bg-primary-dark',
              'transition-all duration-150',
              'flex items-center justify-center gap-2',
              'disabled:opacity-70'
            )}
          >
            {liquidando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Liquidando...
              </>
            ) : liquidado ? (
              <>
                <Check className="w-4 h-4" />
                ¡Liquidado!
              </>
            ) : (
              'Liquidar'
            )}
          </button>
        )}
        
        {/* Botón Detalle */}
        {onDetailClick && (
          <button
            onClick={onDetailClick}
            className={cn(
              'py-2.5 px-4 rounded-xl font-semibold text-sm',
              'bg-primary/10 text-primary',
              'active:bg-primary/20',
              'transition-all duration-150',
              'flex items-center gap-1',
              balance.enPaz && 'flex-1 justify-center'
            )}
          >
            Detalle
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
