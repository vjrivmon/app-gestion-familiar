'use client'

import { ShoppingCart, Plus, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export default function CompraPage() {
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex justify-between items-center pt-2 mb-6">
        <h1 className="text-[28px] font-bold">Lista de Compra</h1>
        <button className="p-2 -mr-2">
          <MoreHorizontal className="w-6 h-6 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 bg-[var(--separator)] rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10 text-[var(--text-muted)]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Sin lista activa</h2>
        <p className="text-[var(--text-secondary)] text-center mb-6">
          Crea una lista de productos y empieza a añadir lo que necesitas comprar.
        </p>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva lista
        </button>
      </div>

      {/* Quick add */}
      <div className="mt-8">
        <h3 className="text-[15px] font-semibold text-[var(--text-secondary)] mb-3">
          Productos frecuentes
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Leche', 'Pan', 'Huevos', 'Tomates', 'Aceite', 'Cebolla'].map(producto => (
            <button 
              key={producto}
              className="px-3 py-2 bg-surface rounded-full text-sm border border-[var(--separator)] active:bg-[var(--separator)] transition-colors"
            >
              + {producto}
            </button>
          ))}
        </div>
      </div>

      {/* History link */}
      <div className="mt-8">
        <Link href="/compra/historial" className="text-accent font-medium">
          Ver historial de compras →
        </Link>
      </div>
    </div>
  )
}
