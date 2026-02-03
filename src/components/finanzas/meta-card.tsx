'use client'

import { Pencil, Trash2, Plus, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import type { Meta } from '@/types/finanzas'

interface MetaCardProps {
  meta: Meta
  onAportar: () => void
  onEditar: () => void
  onEliminar: () => void
}

/**
 * Card visual para meta de ahorro
 */
export function MetaCard({ meta, onAportar, onEditar, onEliminar }: MetaCardProps) {
  const progreso = meta.objetivo > 0 
    ? Math.min(100, Math.round((meta.actual / meta.objetivo) * 100))
    : 0
  
  const completada = progreso >= 100
  
  // Cálculo de días restantes
  let diasRestantes: number | null = null
  let vencida = false
  
  if (meta.fecha_limite) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const limite = new Date(meta.fecha_limite)
    limite.setHours(0, 0, 0, 0)
    
    const diff = limite.getTime() - hoy.getTime()
    diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24))
    vencida = diasRestantes < 0
  }
  
  return (
    <div 
      className={cn(
        'bg-white dark:bg-surface rounded-xl p-4 shadow-sm',
        'border-l-4 transition-all',
        completada && 'ring-2 ring-green-500/30'
      )}
      style={{ borderLeftColor: meta.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate flex items-center gap-2">
            {meta.nombre}
            {completada && (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </h3>
          
          {/* Días restantes */}
          {diasRestantes !== null && !completada && (
            <p className={cn(
              'text-sm flex items-center gap-1 mt-0.5',
              vencida ? 'text-red-500' : diasRestantes <= 7 ? 'text-orange-500' : 'text-gray-500'
            )}>
              <Clock className="w-3.5 h-3.5" />
              {vencida 
                ? `Vencida hace ${Math.abs(diasRestantes)} días`
                : diasRestantes === 0 
                  ? 'Vence hoy'
                  : diasRestantes === 1
                    ? 'Vence mañana'
                    : `${diasRestantes} días restantes`
              }
            </p>
          )}
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 relative"
            style={{ 
              backgroundColor: meta.color, 
              width: `${progreso}%` 
            }}
          >
            {/* Efecto brillante si completada */}
            {completada && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
          </div>
        </div>
      </div>
      
      {/* Importes y porcentaje */}
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-lg font-bold">
          {formatMoney(meta.actual)} <span className="text-gray-400 font-normal text-sm">/ {formatMoney(meta.objetivo)}</span>
        </p>
        <span 
          className="text-lg font-bold"
          style={{ color: meta.color }}
        >
          {progreso}%
        </span>
      </div>
      
      {/* Faltan X€ */}
      {!completada && (
        <p className="text-sm text-gray-500 mb-4">
          Faltan <span className="font-medium">{formatMoney(Math.max(0, meta.objetivo - meta.actual))}</span> para completar
        </p>
      )}
      
      {completada && (
        <p className="text-sm text-green-600 dark:text-green-400 mb-4 font-medium">
          🎉 ¡Meta completada!
        </p>
      )}
      
      {/* Botones de acción */}
      <div className="flex gap-2">
        {/* Botón Aportar (principal) */}
        <button
          onClick={onAportar}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-lg font-medium text-sm',
            'flex items-center justify-center gap-2',
            'transition-colors',
            completada
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              : 'text-white',
          )}
          style={{ backgroundColor: completada ? undefined : meta.color }}
        >
          <Plus className="w-4 h-4" />
          Aportar
        </button>
        
        {/* Botón Editar */}
        <button
          onClick={onEditar}
          className={cn(
            'py-2.5 px-3 rounded-lg',
            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
            'active:bg-gray-200 dark:active:bg-gray-700',
            'transition-colors'
          )}
          aria-label="Editar meta"
        >
          <Pencil className="w-4 h-4" />
        </button>
        
        {/* Botón Eliminar */}
        <button
          onClick={onEliminar}
          className={cn(
            'py-2.5 px-3 rounded-lg',
            'bg-red-50 dark:bg-red-900/20 text-red-500',
            'active:bg-red-100 dark:active:bg-red-900/40',
            'transition-colors'
          )}
          aria-label="Eliminar meta"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Skeleton de loading
 */
export function MetaCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface rounded-xl p-4 shadow-sm border-l-4 border-gray-200 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
      <div className="flex justify-between mb-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Empty state cuando no hay metas
 */
export function MetasEmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
        <span className="text-4xl">🎯</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">
        ¡Empieza a ahorrar!
      </h3>
      <p className="text-gray-500 mb-6 max-w-xs mx-auto">
        Crea tu primera meta de ahorro y ve tu progreso crecer poco a poco.
      </p>
      <button
        onClick={onCrear}
        className={cn(
          'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
          'bg-accent text-white font-medium',
          'active:bg-accent/80 transition-colors'
        )}
      >
        <Plus className="w-5 h-5" />
        Crear mi primera meta
      </button>
    </div>
  )
}
