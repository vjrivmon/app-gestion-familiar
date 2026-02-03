'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Check, Loader2, Clock, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTareas, type TareaConEstado, type EstadoTarea, formatDiasDesdeUltima } from '@/hooks/use-tareas'
import { TareaDetailSheet } from '@/components/tareas/tarea-detail-sheet'
import { NuevaTareaForm } from '@/components/tareas/nueva-tarea-form'

// Colores de estado para cards
const stateStyles: Record<EstadoTarea, { bg: string; border: string; badge: string }> = {
  overdue: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-500'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-500'
  },
  ok: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-500'
  }
}

/**
 * Página completa de tareas del hogar
 * - Lista de todas las tareas
 * - FAB para añadir
 * - Cards más grandes con info completa
 */
export default function TareasPage() {
  const router = useRouter()
  const { 
    tareas, 
    loading, 
    crearTarea, 
    completarTarea, 
    eliminarTarea,
    crearTareasIniciales 
  } = useTareas()
  
  // Estados del UI
  const [selectedTarea, setSelectedTarea] = useState<TareaConEstado | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  
  // Si no hay tareas, ofrecer crear las iniciales
  const [showInitialSetup, setShowInitialSetup] = useState(false)
  const [creatingInitial, setCreatingInitial] = useState(false)
  
  useEffect(() => {
    if (!loading && tareas.length === 0) {
      setShowInitialSetup(true)
    }
  }, [loading, tareas.length])
  
  const handleCreateInitialTareas = useCallback(async () => {
    setCreatingInitial(true)
    await crearTareasIniciales()
    setCreatingInitial(false)
    setShowInitialSetup(false)
  }, [crearTareasIniciales])
  
  const handleCompleteTarea = useCallback(async (tareaId: string) => {
    setCompletingId(tareaId)
    const success = await completarTarea(tareaId)
    setCompletingId(null)
    return success
  }, [completarTarea])
  
  const handleDeleteTarea = useCallback(async (tareaId: string) => {
    const success = await eliminarTarea(tareaId)
    if (success) {
      setSelectedTarea(null)
    }
    return success
  }, [eliminarTarea])
  
  const handleNewTarea = useCallback(async (
    nombre: string, 
    icono: string, 
    frecuenciaDias: number
  ) => {
    return await crearTarea(nombre, icono, frecuenciaDias)
  }, [crearTarea])
  
  // Agrupar por estado
  const tareasOverdue = tareas.filter(t => t.estado === 'overdue')
  const tareasWarning = tareas.filter(t => t.estado === 'warning')
  const tareasOk = tareas.filter(t => t.estado === 'ok')
  
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--separator)]">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Tareas del Hogar</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : showInitialSetup ? (
          // Setup inicial
          <div className="card p-6 text-center space-y-4">
            <span className="text-5xl"></span>
            <h2 className="text-xl font-bold">¡Configura tu hogar!</h2>
            <p className="text-[var(--text-secondary)]">
              Hemos preparado 12 tareas comunes del hogar para empezar. 
              Puedes añadir o eliminar las que quieras después.
            </p>
            <button
              onClick={handleCreateInitialTareas}
              disabled={creatingInitial}
              className={cn(
                'w-full py-3.5 px-4 rounded-xl font-semibold',
                'bg-accent text-white',
                'flex items-center justify-center gap-2',
                'disabled:opacity-70'
              )}
            >
              {creatingInitial ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Crear tareas iniciales
                </>
              )}
            </button>
            <button
              onClick={() => setShowNewForm(true)}
              className="text-accent font-medium"
            >
              O crear una tarea personalizada
            </button>
          </div>
        ) : (
          <>
            {/* Resumen */}
            <div className="flex gap-3">
              <div className={cn(
                'flex-1 p-3 rounded-xl text-center',
                'bg-red-100 dark:bg-red-900/30'
              )}>
                <p className="text-2xl font-bold text-red-600">{tareasOverdue.length}</p>
                <p className="text-xs text-red-600/70">Atrasadas</p>
              </div>
              <div className={cn(
                'flex-1 p-3 rounded-xl text-center',
                'bg-yellow-100 dark:bg-yellow-900/30'
              )}>
                <p className="text-2xl font-bold text-yellow-600">{tareasWarning.length}</p>
                <p className="text-xs text-yellow-600/70">Próximas</p>
              </div>
              <div className={cn(
                'flex-1 p-3 rounded-xl text-center',
                'bg-green-100 dark:bg-green-900/30'
              )}>
                <p className="text-2xl font-bold text-green-600">{tareasOk.length}</p>
                <p className="text-xs text-green-600/70">Al día</p>
              </div>
            </div>
            
            {/* Lista de tareas */}
            {tareasOverdue.length > 0 && (
              <TareaSection 
                title="Atrasadas" 
                tareas={tareasOverdue}
                completingId={completingId}
                onComplete={handleCompleteTarea}
                onDetail={setSelectedTarea}
              />
            )}
            
            {tareasWarning.length > 0 && (
              <TareaSection 
                title=" Próximas" 
                tareas={tareasWarning}
                completingId={completingId}
                onComplete={handleCompleteTarea}
                onDetail={setSelectedTarea}
              />
            )}
            
            {tareasOk.length > 0 && (
              <TareaSection 
                title=" Al día" 
                tareas={tareasOk}
                completingId={completingId}
                onComplete={handleCompleteTarea}
                onDetail={setSelectedTarea}
              />
            )}
          </>
        )}
      </div>
      
      {/* FAB - Nueva tarea */}
      <button
        onClick={() => setShowNewForm(true)}
        className={cn(
          'fixed bottom-24 right-4 z-20',
          'w-14 h-14 rounded-full',
          'bg-accent text-white shadow-lg',
          'flex items-center justify-center',
          'active:scale-95 transition-transform'
        )}
      >
        <Plus className="w-7 h-7" />
      </button>
      
      {/* Sheet de detalle */}
      {selectedTarea && (
        <TareaDetailSheet
          tarea={selectedTarea}
          onClose={() => setSelectedTarea(null)}
          onComplete={handleCompleteTarea}
          onDelete={handleDeleteTarea}
        />
      )}
      
      {/* Form de nueva tarea */}
      {showNewForm && (
        <NuevaTareaForm
          onClose={() => setShowNewForm(false)}
          onSubmit={handleNewTarea}
        />
      )}
    </div>
  )
}

// Componente de sección de tareas
interface TareaSectionProps {
  title: string
  tareas: TareaConEstado[]
  completingId: string | null
  onComplete: (id: string) => Promise<boolean>
  onDetail: (tarea: TareaConEstado) => void
}

function TareaSection({ 
  title, 
  tareas, 
  completingId, 
  onComplete, 
  onDetail 
}: TareaSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)]">{title}</h3>
      <div className="space-y-2">
        {tareas.map((tarea) => (
          <TareaCard
            key={tarea.id}
            tarea={tarea}
            completing={completingId === tarea.id}
            onComplete={() => onComplete(tarea.id)}
            onDetail={() => onDetail(tarea)}
          />
        ))}
      </div>
    </div>
  )
}

// Card de tarea individual
interface TareaCardProps {
  tarea: TareaConEstado
  completing: boolean
  onComplete: () => void
  onDetail: () => void
}

function TareaCard({ tarea, completing, onComplete, onDetail }: TareaCardProps) {
  const style = stateStyles[tarea.estado]
  const [completed, setCompleted] = useState(false)
  
  const handleComplete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onComplete()
    setCompleted(true)
    setTimeout(() => setCompleted(false), 1500)
  }, [onComplete])
  
  return (
    <div 
      onClick={onDetail}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border-2',
        'cursor-pointer active:scale-[0.99] transition-transform',
        style.bg,
        style.border
      )}
    >
      {/* Icono */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
        'bg-surface dark:bg-surface-elevated'
      )}>
        {tarea.icono}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{tarea.nombre}</p>
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Clock className="w-3.5 h-3.5" />
          <span>Cada {tarea.frecuencia_dias}d</span>
          <span>·</span>
          <span>{formatDiasDesdeUltima(tarea.diasDesdeUltima)}</span>
        </div>
      </div>
      
      {/* Estado badge */}
      <div className={cn(
        'w-3 h-3 rounded-full',
        style.badge
      )} />
      
      {/* Botón completar */}
      <button
        onClick={handleComplete}
        disabled={completing || completed}
        className={cn(
          'w-10 h-10 rounded-full',
          'flex items-center justify-center',
          'transition-all',
          completed 
            ? 'bg-green-500 text-white'
            : 'bg-surface dark:bg-surface-elevated border border-gray-200 dark:border-gray-700',
          'active:scale-95'
        )}
      >
        {completing ? (
          <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
        ) : completed ? (
          <Check className="w-5 h-5" />
        ) : (
          <Check className="w-5 h-5 text-[var(--text-muted)]" />
        )}
      </button>
    </div>
  )
}
