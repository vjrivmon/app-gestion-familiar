'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { 
  CATEGORIAS_INGRESO, 
  CATEGORIAS_GASTO,
  type CategoriaIngreso,
  type CategoriaGasto 
} from '@/types/finanzas'

type Tipo = 'ingreso' | 'gasto'
type Categoria = CategoriaIngreso | CategoriaGasto

interface CategoriaPickerProps {
  tipo: Tipo
  value: Categoria
  onChange: (categoria: Categoria) => void
  className?: string
}

/**
 * Selector de categoría con sheet/dropdown
 * Muestra icono + nombre de la categoría seleccionada
 */
export function CategoriaPicker({
  tipo,
  value,
  onChange,
  className
}: CategoriaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const categorias = tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO
  const categoriaActual = categorias.find(c => c.value === value) || categorias[0]

  const handleSelect = (categoria: Categoria) => {
    onChange(categoria)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'bg-gray-100 dark:bg-gray-800 rounded-lg',
          'active:bg-gray-200 dark:active:bg-gray-700',
          'transition-colors duration-75',
          className
        )}
      >
        <span className="text-xl">{categoriaActual.icon}</span>
        <span className="text-[15px]">{categoriaActual.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
      </button>

      {/* Sheet/Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sheet */}
          <div className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-white dark:bg-surface',
            'rounded-t-[12px] shadow-xl',
            'max-h-[70vh] overflow-auto',
            'pb-[env(safe-area-inset-bottom)]',
            // Animación
            'animate-in slide-in-from-bottom duration-200'
          )}>
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-9 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-center">
                {tipo === 'ingreso' ? 'Tipo de ingreso' : 'Categoría de gasto'}
              </h2>
            </div>
            
            {/* Lista */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {categorias.map((categoria) => (
                <button
                  key={categoria.value}
                  type="button"
                  onClick={() => handleSelect(categoria.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'active:bg-gray-100 dark:active:bg-gray-800',
                    'transition-colors duration-75'
                  )}
                >
                  <span className="text-2xl w-8 text-center">{categoria.icon}</span>
                  <span className="flex-1 text-left text-[17px]">{categoria.label}</span>
                  {value === categoria.value && (
                    <Check className="w-5 h-5 text-accent" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Padding extra para safe area */}
            <div className="h-4" />
          </div>
        </>
      )}
    </>
  )
}

/**
 * Versión compacta (solo icono)
 */
interface CategoriaIconProps {
  tipo: Tipo
  value: Categoria
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function CategoriaIcon({
  tipo,
  value,
  size = 'md',
  showLabel = false,
  className
}: CategoriaIconProps) {
  const categorias = tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO
  const categoria = categorias.find(c => c.value === value) || categorias[0]

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className={sizeClasses[size]}>{categoria.icon}</span>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {categoria.label}
        </span>
      )}
    </span>
  )
}
