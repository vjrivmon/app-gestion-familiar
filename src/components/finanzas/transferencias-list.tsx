'use client'

import { ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TransferenciaItem } from './transferencia-item'
import type { Transferencia } from '@/hooks/use-transferencias'

interface TransferenciasListProps {
  transferencias: Transferencia[]
  loading?: boolean
  emptyMessage?: string
  onItemClick?: (transferencia: Transferencia) => void
  className?: string
}

/**
 * Lista de transferencias del mes con empty state
 */
export function TransferenciasList({
  transferencias,
  loading = false,
  emptyMessage = 'No hay transferencias este mes',
  onItemClick,
  className
}: TransferenciasListProps) {
  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-full bg-[var(--border)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                <div className="h-3 bg-[var(--border)] rounded w-1/2" />
              </div>
              <div className="h-4 bg-[var(--border)] rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Empty state
  if (transferencias.length === 0) {
    return (
      <div className={cn(
        'card py-8 flex flex-col items-center justify-center text-center',
        className
      )}>
        <div className="w-14 h-14 rounded-full bg-[var(--border)] flex items-center justify-center mb-3">
          <ArrowLeftRight className="w-7 h-7 text-[var(--text-muted)]" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm">{emptyMessage}</p>
      </div>
    )
  }
  
  // Lista
  return (
    <div className={cn('space-y-2', className)}>
      {transferencias.map(transferencia => (
        <TransferenciaItem
          key={transferencia.id}
          transferencia={transferencia}
          onClick={onItemClick ? () => onItemClick(transferencia) : undefined}
        />
      ))}
    </div>
  )
}

/**
 * Resumen de transferencias (para cards pequeñas)
 */
interface TransferenciasResumenProps {
  total: number
  count: number
  className?: string
}

export function TransferenciasResumen({ 
  total, 
  count,
  className 
}: TransferenciasResumenProps) {
  return (
    <div className={cn(
      'flex items-center justify-between text-sm',
      className
    )}>
      <span className="text-[var(--text-secondary)]">
        {count} {count === 1 ? 'transferencia' : 'transferencias'}
      </span>
      <span className="font-medium">
        {(total / 100).toLocaleString('es-ES', {
          style: 'currency',
          currency: 'EUR'
        })}
      </span>
    </div>
  )
}
