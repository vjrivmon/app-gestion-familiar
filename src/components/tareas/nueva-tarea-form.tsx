'use client'

import { useState, useCallback } from 'react'
import { X, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NuevaTareaFormProps {
  onClose: () => void
  onSubmit: (nombre: string, icono: string, frecuenciaDias: number) => Promise<boolean>
}

// Iconos predefinidos para tareas del hogar
const ICONOS_PREDEFINIDOS = [
  '🍳', '🍽️', '🗑️', '🧹', '🪣', '🛁', '🚽', '🧺',
  '👕', '👔', '🧲', '🪟', '🛏️', '🧽', '🛒', '🌱',
  '🐕', '🐈', '💡', '📦', '🔧', '🪴', '🧼', '🚿'
]

// Opciones de frecuencia comunes
const FRECUENCIAS = [
  { value: 1, label: 'Diario' },
  { value: 2, label: 'Cada 2 días' },
  { value: 3, label: 'Cada 3 días' },
  { value: 7, label: 'Semanal' },
  { value: 14, label: 'Quincenal' },
  { value: 30, label: 'Mensual' }
]

/**
 * Formulario para crear nueva tarea del hogar
 */
export function NuevaTareaForm({ onClose, onSubmit }: NuevaTareaFormProps) {
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState('🧹')
  const [frecuencia, setFrecuencia] = useState(7)
  const [frecuenciaCustom, setFrecuenciaCustom] = useState('')
  const [showCustomFrecuencia, setShowCustomFrecuencia] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    
    const finalFrecuencia = showCustomFrecuencia 
      ? parseInt(frecuenciaCustom) || 7
      : frecuencia
    
    if (finalFrecuencia < 1) {
      setError('La frecuencia debe ser al menos 1 día')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    const success = await onSubmit(nombre.trim(), icono, finalFrecuencia)
    
    setSubmitting(false)
    
    if (success) {
      onClose()
    } else {
      setError('Error al crear la tarea')
    }
  }, [nombre, icono, frecuencia, frecuenciaCustom, showCustomFrecuencia, onSubmit, onClose])
  
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
        'max-h-[85vh] overflow-y-auto'
      )}>
        {/* Handle */}
        <div className="flex justify-center">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center pt-2">
          <h2 className="text-xl font-bold">Nueva tarea</h2>
          <button onClick={onClose} className="p-2 -mr-2">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Nombre de la tarea
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Limpiar ventanas"
              className={cn(
                'w-full px-4 py-3 rounded-xl',
                'bg-[var(--background)] border border-gray-200 dark:border-gray-700',
                'text-[17px] placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-accent/50'
              )}
              autoFocus
            />
          </div>
          
          {/* Selector de icono */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Icono
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONOS_PREDEFINIDOS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcono(emoji)}
                  className={cn(
                    'w-11 h-11 rounded-xl text-2xl',
                    'flex items-center justify-center',
                    'transition-all',
                    icono === emoji
                      ? 'bg-accent text-white scale-110 ring-2 ring-accent ring-offset-2'
                      : 'bg-gray-100 dark:bg-gray-800 active:scale-95'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Frecuencia
            </label>
            
            {!showCustomFrecuencia ? (
              <div className="grid grid-cols-3 gap-2">
                {FRECUENCIAS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrecuencia(f.value)}
                    className={cn(
                      'py-2.5 px-3 rounded-xl text-sm font-medium',
                      'transition-all',
                      frecuencia === f.value
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 dark:bg-gray-800 active:scale-95'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={frecuenciaCustom}
                  onChange={(e) => setFrecuenciaCustom(e.target.value)}
                  min="1"
                  max="365"
                  placeholder="7"
                  className={cn(
                    'w-20 px-4 py-3 rounded-xl text-center',
                    'bg-[var(--background)] border border-gray-200 dark:border-gray-700',
                    'text-[17px]',
                    'focus:outline-none focus:ring-2 focus:ring-accent/50'
                  )}
                />
                <span className="text-gray-600">días</span>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setShowCustomFrecuencia(!showCustomFrecuencia)}
              className="text-sm text-accent mt-2"
            >
              {showCustomFrecuencia ? 'Usar frecuencias predefinidas' : 'Personalizar frecuencia'}
            </button>
          </div>
          
          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          {/* Preview */}
          <div className="card p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
              {icono}
            </div>
            <div>
              <p className="font-semibold">{nombre || 'Nueva tarea'}</p>
              <p className="text-sm text-gray-500">
                Cada {showCustomFrecuencia ? (parseInt(frecuenciaCustom) || '?') : frecuencia} días
              </p>
            </div>
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !nombre.trim()}
            className={cn(
              'w-full py-4 rounded-xl font-semibold',
              'bg-accent text-white',
              'active:scale-98 transition-transform',
              'flex items-center justify-center gap-2',
              'disabled:opacity-50'
            )}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Crear tarea
              </>
            )}
          </button>
        </form>
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
