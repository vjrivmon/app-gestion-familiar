'use client'

import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { PersonaAvatar } from './persona-picker'
import type { Prestamo, Pagador } from '@/types/finanzas'

interface PrestamoItemProps {
  prestamo: Prestamo
  onDelete: () => void
  onMarcarPagado: () => void
}

const NOMBRES_MAP: Record<Pagador, string> = {
  m1: 'Vicente',
  m2: 'Irene',
  conjunta: 'Conjunta'
}

/**
 * Item de préstamo con swipe to delete y botón de marcar pagado
 */
export function PrestamoItem({ prestamo, onDelete, onMarcarPagado }: PrestamoItemProps) {
  const [swiped, setSwiped] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [marking, setMarking] = useState(false)
  
  // Formato de fecha
  const fechaFormateada = new Date(prestamo.fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
  
  const fechaPagoFormateada = prestamo.fecha_pago 
    ? new Date(prestamo.fecha_pago).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
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
  
  const handleMarcarPagado = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.vibrate) navigator.vibrate(20)
    setMarking(true)
    await onMarcarPagado()
    setMarking(false)
  }
  
  const handleClick = () => {
    if (swiped) {
      setSwiped(false)
    }
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
        {/* Avatares con flecha */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <PersonaAvatar persona={prestamo.de_quien} size="md" />
          <span className="text-[var(--text-muted)] text-sm">→</span>
          <PersonaAvatar persona={prestamo.a_quien} size="md" />
        </div>
        
        {/* Contenido central */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium">
            <span className="text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              {NOMBRES_MAP[prestamo.de_quien]} prestó a {NOMBRES_MAP[prestamo.a_quien]}
            </span>
          </p>
          
          {/* Concepto y badges */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Estado badge */}
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              prestamo.pagado 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            )}>
              {prestamo.pagado ? ' Pagado' : ' Pendiente'}
            </span>
            
            {/* Fecha */}
            <span className="text-xs text-[var(--text-secondary)]">
              {fechaFormateada}
            </span>
            
            {/* Fecha de pago */}
            {fechaPagoFormateada && (
              <span className="text-xs text-[var(--text-secondary)]">
                • Pagado {fechaPagoFormateada}
              </span>
            )}
          </div>
          
          {/* Concepto si existe */}
          {prestamo.concepto && (
            <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
              {prestamo.concepto}
            </p>
          )}
        </div>
        
        {/* Derecha: importe y botón pagar */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Botón marcar pagado */}
          {!prestamo.pagado && (
            <button
              onClick={handleMarcarPagado}
              disabled={marking}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-green-500 text-white',
                'active:bg-green-600 transition-colors',
                'disabled:opacity-50'
              )}
            >
              <Check className="w-4 h-4 inline mr-1" />
              Pagado
            </button>
          )}
          
          {/* Importe */}
          <div className="text-right min-w-[60px]">
            <p className={cn(
              'text-[17px] font-semibold tabular-nums',
              prestamo.pagado ? 'text-[var(--text-muted)] line-through' : 'text-accent'
            )}>
              {formatMoney(prestamo.importe)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton de loading
 */
export function PrestamoItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface dark:bg-surface animate-pulse">
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-[var(--border)] dark:bg-surface" />
        <div className="w-4 h-4 bg-[var(--border)] dark:bg-surface rounded" />
        <div className="w-8 h-8 rounded-full bg-[var(--border)] dark:bg-surface" />
      </div>
      <div className="flex-1">
        <div className="h-4 bg-[var(--border)] dark:bg-surface rounded w-3/4 mb-2" />
        <div className="h-3 bg-[var(--border)] dark:bg-surface rounded w-1/3" />
      </div>
      <div className="h-4 bg-[var(--border)] dark:bg-surface rounded w-16" />
    </div>
  )
}
