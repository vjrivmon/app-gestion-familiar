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
      'card bg-accent text-white',
      className
    )}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-white/70 text-sm">Balance de pareja</p>
          {loading ? (
            <div className="h-9 flex items-center">
              <Loader2 className="w-6 h-6 animate-spin text-white/50" />
            </div>
          ) : (
            <p className="text-3xl font-bold">
              {balance.enPaz ? '0,00€' : formatMoney(balance.cantidad)}
            </p>
          )}
        </div>
        <ArrowLeftRight className="w-8 h-8 text-white/50" />
      </div>
      
      {/* Estado del balance */}
      {!loading && (
        <div className="mb-4">
          {balance.enPaz ? (
            <p className="text-white/90 text-base">
              Estáis en paz 🤝
            </p>
          ) : (
            <p className="text-white/90 text-base">
              <span className="font-semibold">{nombreDeudor}</span>
              {' debe '}
              <span className="font-semibold">{formatMoney(balance.cantidad)}</span>
              {' a '}
              <span className="font-semibold">{nombreAcreedor}</span>
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
              'flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm',
              'bg-white/20 active:bg-white/30',
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
              'py-2.5 px-4 rounded-lg font-semibold text-sm',
              'bg-white/20 active:bg-white/30',
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
