'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { TareaConEstado, EstadoTarea } from '@/hooks/use-tareas'
import { getBadgeText } from '@/hooks/use-tareas'
import { Check, Loader2 } from 'lucide-react'

interface TareaChipProps {
  tarea: TareaConEstado
  onComplete: (tareaId: string) => Promise<boolean>
  onViewDetail: (tarea: TareaConEstado) => void
}

// Colores de fondo según estado
const bgColors: Record<EstadoTarea, string> = {
  overdue: 'bg-red-100 dark:bg-red-900/30',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30',
  ok: 'bg-green-100 dark:bg-green-900/30'
}

// Colores de badge según estado
const badgeColors: Record<EstadoTarea, string> = {
  overdue: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  ok: 'bg-green-500 text-white'
}

// Colores de borde según estado
const borderColors: Record<EstadoTarea, string> = {
  overdue: 'border-red-200 dark:border-red-800',
  warning: 'border-yellow-200 dark:border-yellow-800',
  ok: 'border-green-200 dark:border-green-800'
}

/**
 * Chip compacto para mostrar tarea en scroll horizontal
 * - Tap: completa la tarea con confirmación visual
 * - Long press: abre detalle
 */
export function TareaChip({ tarea, onComplete, onViewDetail }: TareaChipProps) {
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)
  
  const handleTouchStart = useCallback(() => {
    isLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true
      // Haptic feedback para long press
      if (navigator.vibrate) navigator.vibrate(20)
      onViewDetail(tarea)
    }, 500) // 500ms para long press
  }, [tarea, onViewDetail])
  
  const handleTouchEnd = useCallback(async () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    // Si fue long press, no hacer nada más
    if (isLongPress.current) return
    
    // Tap - completar tarea
    if (completing || completed) return
    
    setCompleting(true)
    const success = await onComplete(tarea.id)
    setCompleting(false)
    
    if (success) {
      setCompleted(true)
      // Reset después de mostrar confirmación
      setTimeout(() => setCompleted(false), 1500)
    }
  }, [completing, completed, onComplete, tarea.id])
  
  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])
  
  // Para desktop: click simple
  const handleClick = useCallback(async () => {
    if (completing || completed) return
    
    setCompleting(true)
    const success = await onComplete(tarea.id)
    setCompleting(false)
    
    if (success) {
      setCompleted(true)
      setTimeout(() => setCompleted(false), 1500)
    }
  }, [completing, completed, onComplete, tarea.id])
  
  // Para desktop: doble click = detalle
  const handleDoubleClick = useCallback(() => {
    onViewDetail(tarea)
  }, [tarea, onViewDetail])
  
  const badgeText = getBadgeText(tarea)
  
  return (
    <button
      type="button"
      className={cn(
        // Base
        'relative flex flex-col items-center justify-center',
        'w-[72px] h-[72px] rounded-2xl',
        'border-2 shrink-0',
        'transition-all duration-150',
        'active:scale-95',
        'select-none',
        // Estado
        bgColors[tarea.estado],
        borderColors[tarea.estado],
        // Completado
        completed && 'bg-green-500 border-green-500'
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      disabled={completing}
    >
      {/* Icono o estado de completado */}
      {completed ? (
        <Check className="w-6 h-6 text-white" />
      ) : completing ? (
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      ) : (
        <span className="text-2xl">{tarea.icono}</span>
      )}
      
      {/* Nombre truncado */}
      {!completed && (
        <span className={cn(
          'text-[10px] font-medium mt-1 max-w-[60px] truncate',
          'text-gray-700 dark:text-gray-300'
        )}>
          {tarea.nombre.split(' ')[0]}
        </span>
      )}
      
      {/* Badge de días */}
      {!completed && !completing && (
        <span className={cn(
          'absolute -top-1 -right-1',
          'min-w-[20px] h-5 px-1.5',
          'rounded-full text-[10px] font-bold',
          'flex items-center justify-center',
          badgeColors[tarea.estado]
        )}>
          {badgeText}
        </span>
      )}
    </button>
  )
}
