'use client'

import { Plus } from 'lucide-react'
import type { ProductoFrecuente } from '@/types/compra'

interface ProductosFrecuentesProps {
  frecuentes: ProductoFrecuente[]
  onAdd: (nombre: string, categoria: string) => void
  loading?: boolean
}

export function ProductosFrecuentes({ frecuentes, onAdd, loading }: ProductosFrecuentesProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className="h-10 w-20 rounded-full bg-[var(--separator)] animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    )
  }
  
  if (frecuentes.length === 0) {
    return null
  }
  
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-[var(--text-secondary)] mb-3">
        Productos frecuentes
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {frecuentes.map((prod) => (
          <button
            key={prod.id}
            onClick={() => onAdd(prod.nombre, prod.categoria)}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface rounded-full text-sm border border-[var(--separator)] active:bg-[var(--separator)] transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-accent" />
            {prod.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}
