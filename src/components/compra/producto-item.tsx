'use client'

import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'
import { formatPrecio } from '@/types/compra'
import type { ProductoLista } from '@/types/compra'

interface ProductoItemProps {
  producto: ProductoLista
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onPrecioEdit: (id: string) => void
}

export function ProductoItem({ 
  producto, 
  onToggle, 
  onDelete,
  onPrecioEdit 
}: ProductoItemProps) {
  const [swiped, setSwiped] = useState(false)
  const [offset, setOffset] = useState(0)
  
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === 'Left') {
        setOffset(Math.min(Math.abs(e.deltaX), 80))
      }
    },
    onSwipedLeft: () => {
      if (offset > 40) {
        setSwiped(true)
      } else {
        setOffset(0)
      }
    },
    onSwipedRight: () => {
      setSwiped(false)
      setOffset(0)
    },
    trackMouse: false,
    trackTouch: true
  })
  
  const handleDelete = () => {
    onDelete(producto.id)
    setSwiped(false)
    setOffset(0)
  }
  
  return (
    <div className="relative overflow-hidden">
      {/* Delete button background */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-500 transition-all"
        style={{ width: swiped ? 80 : offset }}
      >
        <button
          onClick={handleDelete}
          className="w-20 h-full flex items-center justify-center"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Main content */}
      <div 
        {...handlers}
        className={`
          flex items-center gap-3 p-4 bg-surface border-b border-[var(--separator)]
          transition-transform
          ${producto.comprado ? 'opacity-60' : ''}
        `}
        style={{ 
          transform: `translateX(-${swiped ? 80 : offset}px)` 
        }}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(producto.id)}
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-colors flex-shrink-0
            ${producto.comprado 
              ? 'bg-accent border-accent' 
              : 'border-[var(--text-muted)]'
            }
          `}
        >
          {producto.comprado && (
            <Check className="w-4 h-4 text-white" />
          )}
        </button>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className={`
            text-[17px] block truncate
            ${producto.comprado ? 'line-through text-[var(--text-muted)]' : ''}
          `}>
            {producto.nombre}
          </span>
          {producto.cantidad > 1 && (
            <span className="text-sm text-[var(--text-secondary)]">
              {producto.cantidad} {producto.unidad}
            </span>
          )}
        </div>
        
        {/* Precio */}
        <button
          onClick={() => onPrecioEdit(producto.id)}
          className={`
            text-right min-w-[60px] px-2 py-1 rounded
            ${producto.precio !== null 
              ? 'text-[17px] font-medium' 
              : 'text-sm text-[var(--text-muted)] bg-[var(--separator)]'
            }
          `}
        >
          {producto.precio !== null ? formatPrecio(producto.precio) : 'Precio'}
        </button>
      </div>
    </div>
  )
}
