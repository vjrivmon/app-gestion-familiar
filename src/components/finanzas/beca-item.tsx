'use client'

import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Trash2, CircleDollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { PersonaBadge } from './persona-picker'
import type { Beca, EstadoBeca, NOMBRES } from '@/types/finanzas'

interface BecaItemProps {
  beca: Beca
  onEdit: () => void
  onDelete: () => void
  onCobrar: () => void
}

const ESTADO_CONFIG: Record<EstadoBeca, { emoji: string; label: string; color: string }> = {
  pendiente: { emoji: '', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  mensual: { emoji: '', label: 'Mensual', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  cobrada: { emoji: '', label: 'Cobrada', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

/**
 * Item de beca con swipe to delete y botón de cobrar
 */
export function BecaItem({ beca, onEdit, onDelete, onCobrar }: BecaItemProps) {
  const [swiped, setSwiped] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const estadoConfig = ESTADO_CONFIG[beca.estado]
  const esCobrable = beca.estado !== 'cobrada'
  
  // Formato de fecha de cobro
  const fechaCobroFormateada = beca.fecha_cobro 
    ? new Date(beca.fecha_cobro).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : null
  
  // Handlers de swipe
  const handlers = useSwipeable({
    onSwipedLeft: () => setSwiped(true),
    onSwipedRight: () => setSwiped(false),
    trackMouse: false,
    trackTouch: true,
    delta: 40,
    preventScrollOnSwipe: true
  })
  
  const handleDelete = async () => {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10])
    setDeleting(true)
    await onDelete()
  }
  
  const handleClick = () => {
    if (swiped) {
      setSwiped(false)
    } else {
      onEdit()
    }
  }
  
  const handleCobrar = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.vibrate) navigator.vibrate(20)
    onCobrar()
  }
  
  return (
    <div className="relative overflow-hidden">
      {/* Delete button (revealed on swipe) */}
      <div 
        className={cn(
          'absolute right-0 top-0 bottom-0 w-20',
          'bg-red-500 flex items-center justify-center',
          'transition-transform duration-200',
          swiped ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full h-full flex items-center justify-center"
          aria-label="Eliminar"
        >
          <Trash2 className="w-6 h-6 text-white" />
        </button>
      </div>
      
      {/* Main content */}
      <div
        {...handlers}
        onClick={handleClick}
        className={cn(
          'relative bg-surface dark:bg-surface',
          'flex items-center gap-3 px-4 min-h-[72px] py-3',
          'active:bg-gray-50 dark:active:bg-gray-800',
          'transition-all duration-200',
          swiped && '-translate-x-20',
          deleting && 'opacity-50'
        )}
      >
        {/* Icono */}
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xl"></span>
        </div>
        
        {/* Contenido central */}
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-medium truncate">
            {beca.concepto}
          </p>
          
          {/* Badges */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Estado badge */}
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              estadoConfig.color
            )}>
              {estadoConfig.emoji} {estadoConfig.label}
            </span>
            
            {/* Pagos */}
            {beca.num_pagos > 1 && (
              <span className="text-xs text-[var(--text-secondary)]">
                {beca.num_pagos} pagos
              </span>
            )}
            
            {/* Fecha de cobro */}
            {fechaCobroFormateada && (
              <span className="text-xs text-[var(--text-secondary)]">
                Cobrada {fechaCobroFormateada}
              </span>
            )}
          </div>
        </div>
        
        {/* Derecha: importe y botón cobrar */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Botón cobrar rápido */}
          {esCobrable && (
            <button
              onClick={handleCobrar}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-green-500 text-white',
                'active:bg-green-600 transition-colors'
              )}
            >
              <CircleDollarSign className="w-4 h-4 inline mr-1" />
              Cobrar
            </button>
          )}
          
          {/* Importe */}
          <div className="text-right min-w-[70px]">
            <p className="text-[17px] font-semibold tabular-nums text-positive">
              {formatMoney(beca.importe)}
            </p>
            <PersonaBadge persona={beca.persona} size="sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton de loading
 */
export function BecaItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface dark:bg-surface animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[var(--border)] dark:bg-surface" />
      <div className="flex-1">
        <div className="h-4 bg-[var(--border)] dark:bg-surface rounded w-2/3 mb-2" />
        <div className="h-3 bg-[var(--border)] dark:bg-surface rounded w-1/3" />
      </div>
      <div className="h-4 bg-[var(--border)] dark:bg-surface rounded w-16" />
    </div>
  )
}
