'use client'

import { ArrowLeft, ShoppingBag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useHistorialCompras } from '@/hooks/use-historial-compras'
import { centimosToEuros } from '@/types/compra'

export default function HistorialPage() {
  const { historial, loading, totalMes, totalSemana } = useHistorialCompras()
  
  // Agrupar por mes
  const historialPorMes = historial.reduce((acc, compra) => {
    const fecha = new Date(compra.fecha)
    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
    const mesLabel = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    
    if (!acc[mesKey]) {
      acc[mesKey] = { label: mesLabel, compras: [] }
    }
    acc[mesKey].compras.push(compra)
    
    return acc
  }, {} as Record<string, { label: string; compras: typeof historial }>)
  
  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    })
  }
  
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/compra" className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-[28px] font-bold">Historial</h1>
        </div>
      </div>
      
      {/* Resumen */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-surface rounded-2xl border border-[var(--separator)]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm text-[var(--text-secondary)]">Esta semana</span>
            </div>
            <span className="text-2xl font-bold">{centimosToEuros(totalSemana)}€</span>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-[var(--separator)]">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span className="text-sm text-[var(--text-secondary)]">Este mes</span>
            </div>
            <span className="text-2xl font-bold">{centimosToEuros(totalMes)}€</span>
          </div>
        </div>
      </div>
      
      {/* Loading */}
      {loading && (
        <div className="px-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-[var(--separator)] rounded-xl animate-pulse" />
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && historial.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-[var(--separator)] rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Sin compras registradas</h2>
          <p className="text-[var(--text-secondary)] text-center text-sm">
            Cuando completes una lista de compra, aparecera aqui.
          </p>
        </div>
      )}
      
      {/* Historial por mes */}
      {!loading && Object.entries(historialPorMes).map(([mesKey, { label, compras }]) => (
        <div key={mesKey} className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)] capitalize">
              {label}
            </span>
          </div>
          <div className="bg-surface">
            {compras.map((compra) => (
              <Link
                key={compra.id}
                href={`/compra/${compra.id}`}
                className="flex items-center justify-between p-4 border-b border-[var(--separator)] active:bg-[var(--separator)] transition-colors"
              >
                <div>
                  <div className="font-medium">{formatFecha(compra.fecha)}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {compra.supermercado || 'Compra'}
                    {compra.num_productos && ` - ${compra.num_productos} productos`}
                  </div>
                </div>
                <div className="text-lg font-semibold">
                  {centimosToEuros(compra.total)}€
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
