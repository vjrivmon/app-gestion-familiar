'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Check, Trash2, Loader2, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TareaConEstado, EstadoTarea } from '@/hooks/use-tareas'
import type { TareaHistorial } from '@/types/tareas'
import { formatDiasDesdeUltima } from '@/hooks/use-tareas'
import { useTareas } from '@/hooks/use-tareas'

interface TareaDetailSheetProps {
  tarea: TareaConEstado | null
  onClose: () => void
  onComplete: (tareaId: string) => Promise<boolean>
  onDelete: (tareaId: string) => Promise<boolean>
}

// Colores según estado
const stateColors: Record<EstadoTarea, { bg: string; text: string; label: string }> = {
  overdue: { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    text: 'text-red-600 dark:text-red-400',
    label: 'Atrasada'
  },
  warning: { 
    bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
    text: 'text-yellow-600 dark:text-yellow-400',
    label: 'Próxima'
  },
  ok: { 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    text: 'text-green-600 dark:text-green-400',
    label: 'Al día'
  }
}

/**
 * Sheet modal con detalle de tarea
 * - Historial de completaciones
 * - Botones de acción
 */
export function TareaDetailSheet({ 
  tarea, 
  onClose, 
  onComplete, 
  onDelete 
}: TareaDetailSheetProps) {
  const { getHistorial } = useTareas()
  const [historial, setHistorial] = useState<TareaHistorial[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  
  // Cargar historial cuando se abre el sheet
  useEffect(() => {
    if (!tarea) return
    
    const loadHistorial = async () => {
      setLoadingHistorial(true)
      const data = await getHistorial(tarea.id, 5)
      setHistorial(data)
      setLoadingHistorial(false)
    }
    
    loadHistorial()
  }, [tarea, getHistorial])
  
  const handleComplete = useCallback(async () => {
    if (!tarea || completing) return
    
    setCompleting(true)
    const success = await onComplete(tarea.id)
    setCompleting(false)
    
    if (success) {
      // Cerrar después de completar
      setTimeout(onClose, 500)
    }
  }, [tarea, completing, onComplete, onClose])
  
  const handleDelete = useCallback(async () => {
    if (!tarea || deleting) return
    
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    
    setDeleting(true)
    const success = await onDelete(tarea.id)
    setDeleting(false)
    
    if (success) {
      onClose()
    }
  }, [tarea, deleting, confirmDelete, onDelete, onClose])
  
  if (!tarea) return null
  
  const stateStyle = stateColors[tarea.estado]
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-[var(--surface)] rounded-t-3xl',
        'p-4 pb-8 space-y-4',
        'animate-slideUp',
        'max-h-[80vh] overflow-y-auto'
      )}>
        {/* Handle */}
        <div className="flex justify-center">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
        
        {/* Header con icono grande */}
        <div className="flex items-center gap-4 pt-2">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            stateStyle.bg
          )}>
            <span className="text-4xl">{tarea.icono}</span>
          </div>
          
          <div>
            <h2 className="text-xl font-bold">{tarea.nombre}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-sm font-medium px-2 py-0.5 rounded-full',
                stateStyle.bg,
                stateStyle.text
              )}>
                {stateStyle.label}
              </span>
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Frecuencia</span>
            </div>
            <p className="font-semibold">Cada {tarea.frecuencia_dias} días</p>
          </div>
          
          <div className="card p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Última vez</span>
            </div>
            <p className="font-semibold">
              {formatDiasDesdeUltima(tarea.diasDesdeUltima)}
            </p>
          </div>
        </div>
        
        {/* Historial */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Últimas veces completada
          </h3>
          
          {loadingHistorial ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : historial.length === 0 ? (
            <p className="text-gray-400 text-sm py-3">
              Aún no se ha completado esta tarea
            </p>
          ) : (
            <div className="space-y-2">
              {historial.map((h) => (
                <div 
                  key={h.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(h.completada_at).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleComplete}
            disabled={completing}
            className={cn(
              'flex-1 py-3.5 px-4 rounded-xl font-semibold',
              'bg-accent text-white',
              'active:scale-98 transition-transform',
              'flex items-center justify-center gap-2',
              'disabled:opacity-70'
            )}
          >
            {completing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Marcar como hecha
              </>
            )}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={cn(
              'py-3.5 px-4 rounded-xl font-semibold',
              confirmDelete 
                ? 'bg-red-500 text-white' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-600',
              'active:scale-98 transition-all',
              'flex items-center justify-center',
              'disabled:opacity-70'
            )}
          >
            {deleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {confirmDelete && (
          <p className="text-center text-sm text-red-500">
            Toca de nuevo para confirmar eliminación
          </p>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
