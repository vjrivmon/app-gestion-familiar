'use client'

import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { CategoriaIcon } from './categoria-picker'
import type { Ingreso, Gasto } from '@/types/finanzas'

type TransaccionTipo = 'ingreso' | 'gasto'

interface TransaccionItemProps {
  tipo: TransaccionTipo
  data: Ingreso | Gasto
  onEdit: () => void
  onDelete: () => void
}

/**
 * Item de transacción con swipe to delete
 * Muestra icono, concepto, importe y badges
 */
export function TransaccionItem({ tipo, data, onEdit, onDelete }: TransaccionItemProps) {
  const [swiped, setSwiped] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const isIngreso = tipo === 'ingreso'
  const ingreso = isIngreso ? (data as Ingreso) : null
  const gasto = !isIngreso ? (data as Gasto) : null
  
  // Formato de fecha: "03 feb"
  const fechaFormateada = new Date(data.fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
  
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
    // Haptic feedback
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
          'flex items-center gap-3 px-4 min-h-[64px] py-3',
          'active:bg-gray-50 dark:active:bg-gray-800',
          'transition-all duration-200',
          swiped && '-translate-x-20',
          deleting && 'opacity-50'
        )}
      >
        {/* Icono categoría */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isIngreso ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        )}>
          <CategoriaIcon
            tipo={tipo}
            value={data.categoria}
            size="md"
          />
        </div>
        
        {/* Contenido central */}
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-medium truncate">
            {data.concepto}
          </p>
          
          {/* Badges */}
          <div className="flex items-center gap-2 mt-0.5">
            {/* Tipo dinero badge */}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              data.tipo_dinero === 'efectivo' 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            )}>
              {data.tipo_dinero === 'efectivo' ? '' : ''}
            </span>
            
            {/* Es fijo badge (solo ingresos) */}
            {ingreso?.es_fijo && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                Fijo
              </span>
            )}
            
            {/* Fecha */}
            <span className="text-xs text-[var(--text-secondary)]">
              {fechaFormateada}
            </span>
          </div>
        </div>
        
        {/* Importe */}
        <div className="flex-shrink-0 text-right">
          <p className={cn(
            'text-[17px] font-semibold tabular-nums',
            isIngreso ? 'text-positive' : 'text-negative'
          )}>
            {isIngreso ? '+' : '-'}{formatMoney(data.importe)}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton de loading
 */
export function TransaccionItemSkeleton() {
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
