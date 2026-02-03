'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { Drawer } from 'vaul'
import { CATEGORIAS_PRODUCTO, CATEGORIAS_LABELS } from '@/types/compra'
import type { CategoriaProducto } from '@/types/compra'

interface AddProductoFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (nombre: string, cantidad: number, categoria: CategoriaProducto) => void
}

export function AddProductoForm({ open, onClose, onSubmit }: AddProductoFormProps) {
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [categoria, setCategoria] = useState<CategoriaProducto>('general')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    
    onSubmit(nombre.trim(), cantidad, categoria)
    
    // Reset form
    setNombre('')
    setCantidad(1)
    setCategoria('general')
    onClose()
  }
  
  const incrementCantidad = () => setCantidad(c => c + 1)
  const decrementCantidad = () => setCantidad(c => Math.max(1, c - 1))
  
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-[20px] outline-none">
          <div className="p-4">
            {/* Handle */}
            <div className="w-12 h-1 bg-[var(--separator)] rounded-full mx-auto mb-4" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Añadir producto</h2>
              <button onClick={onClose} className="p-2 -mr-2">
                <X className="w-6 h-6 text-[var(--text-muted)]" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Producto
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del producto"
                  className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--separator)] text-[17px]"
                  autoFocus
                />
              </div>
              
              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={decrementCantidad}
                    className="w-12 h-12 rounded-xl bg-[var(--separator)] flex items-center justify-center active:bg-[var(--text-muted)] transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-semibold min-w-[40px] text-center">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={incrementCantidad}
                    className="w-12 h-12 rounded-xl bg-[var(--separator)] flex items-center justify-center active:bg-[var(--text-muted)] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS_PRODUCTO.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoria(cat)}
                      className={`
                        px-3 py-2 rounded-full text-sm transition-colors
                        ${categoria === cat
                          ? 'bg-accent text-white'
                          : 'bg-[var(--separator)] text-[var(--text-primary)]'
                        }
                      `}
                    >
                      {CATEGORIAS_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Submit */}
              <button
                type="submit"
                disabled={!nombre.trim()}
                className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-[17px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Añadir a la lista
              </button>
            </form>
          </div>
          
          {/* Safe area bottom */}
          <div className="h-8" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
