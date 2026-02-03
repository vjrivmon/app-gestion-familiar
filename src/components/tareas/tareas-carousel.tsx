'use client'

import { TareaChip } from './tarea-chip'
import type { TareaConEstado } from '@/hooks/use-tareas'
import { cn } from '@/lib/utils'

interface TareasCarouselProps {
  tareas: TareaConEstado[]
  onComplete: (tareaId: string) => Promise<boolean>
  onViewDetail: (tarea: TareaConEstado) => void
  className?: string
}

/**
 * Carousel horizontal de tareas
 * - Scroll horizontal con snap
 * - Ordenadas por urgencia (overdue > warning > ok)
 */
export function TareasCarousel({
  tareas,
  onComplete,
  onViewDetail,
  className
}: TareasCarouselProps) {
  if (tareas.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center h-[72px]',
        'text-[var(--text-secondary)] text-sm',
        className
      )}>
        No hay tareas configuradas
      </div>
    )
  }
  
  return (
    <div className={cn(
      'relative -mx-4',  // Full bleed para scroll
      className
    )}>
      <div className={cn(
        'flex gap-3 overflow-x-auto px-4 py-1',
        'scrollbar-hide',
        // Snap scroll
        'snap-x snap-mandatory',
        // Hide scrollbar
        '[&::-webkit-scrollbar]:hidden',
        '[-ms-overflow-style:none]',
        '[scrollbar-width:none]'
      )}>
        {tareas.map((tarea) => (
          <div key={tarea.id} className="snap-start">
            <TareaChip
              tarea={tarea}
              onComplete={onComplete}
              onViewDetail={onViewDetail}
            />
          </div>
        ))}
      </div>
      
      {/* Fade indicator derecho */}
      <div className={cn(
        'absolute right-0 top-0 bottom-0 w-8',
        'bg-gradient-to-l from-[var(--background)] to-transparent',
        'pointer-events-none'
      )} />
    </div>
  )
}
