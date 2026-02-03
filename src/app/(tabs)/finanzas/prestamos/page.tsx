'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { usePrestamos } from '@/hooks/use-prestamos'
import { PrestamoForm } from '@/components/finanzas/prestamo-form'
import { PrestamoItem, PrestamoItemSkeleton } from '@/components/finanzas/prestamo-item'
import type { Prestamo } from '@/types/finanzas'

type FiltroEstado = 'todos' | 'pendientes' | 'pagados'

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'pagados', label: 'Pagados' },
  { value: 'todos', label: 'Todos' },
]

export default function PrestamosPage() {
  const router = useRouter()
  const [filtro, setFiltro] = useState<FiltroEstado>('pendientes')
  const [showForm, setShowForm] = useState(false)
  
  const {
    prestamos,
    loading,
    crearPrestamo,
    marcarPagado,
    eliminarPrestamo,
    prestamosPendientes,
    prestamosPagados,
    balanceNeto,
    totalPendiente
  } = usePrestamos()
  
  // Préstamos filtrados
  const prestamosFiltrados = useMemo(() => {
    switch (filtro) {
      case 'pendientes':
        return prestamosPendientes
      case 'pagados':
        return prestamosPagados
      default:
        return prestamos
    }
  }, [filtro, prestamos, prestamosPendientes, prestamosPagados])
  
  const handleSave = async (data: Parameters<typeof crearPrestamo>[0]) => {
    await crearPrestamo(data)
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface dark:bg-surface p-4 pt-2 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 -ml-2 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[24px] font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7" />
            Préstamos
          </h1>
        </div>
        
        {/* Filtro por estado */}
        <div className="flex bg-[var(--border)] rounded-[9px] p-[2px]">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={cn(
                'flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all',
                filtro === f.value 
                  ? 'bg-surface text-primary shadow-sm' 
                  : 'text-[var(--text-secondary)]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4">
        {/* Card resumen de balance */}
        <div className={cn(
          'bg-surface dark:bg-surface rounded-xl p-4 mb-4',
          'border-l-4',
          balanceNeto.deudorPersona === null 
            ? 'border-green-500'
            : balanceNeto.deudorPersona === 'm1' 
              ? 'border-blue-500'
              : 'border-pink-500'
        )}>
          <p className="text-sm text-[var(--text-secondary)] mb-1">Balance neto de préstamos</p>
          
          {balanceNeto.deudorPersona === null ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <p className="text-xl font-bold text-green-600">
                Equilibrado
              </p>
            </div>
          ) : (
            <>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatMoney(balanceNeto.cantidad)}
              </p>
              <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
                {balanceNeto.resumen}
              </p>
            </>
          )}
          
          {totalPendiente > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-[var(--text-secondary)]">
                Total en préstamos pendientes: <span className="font-medium">{formatMoney(totalPendiente)}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Loading */}
        {loading && (
          <div className="bg-surface dark:bg-surface rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3].map(i => <PrestamoItemSkeleton key={i} />)}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && prestamosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">💸</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filtro === 'todos' 
                ? 'Sin préstamos registrados' 
                : filtro === 'pendientes'
                  ? 'Sin préstamos pendientes'
                  : 'Sin préstamos pagados'}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {filtro === 'todos' 
                ? 'Registra préstamos entre vosotros para llevar un control'
                : 'No hay préstamos con este estado'}
            </p>
          </div>
        )}
        
        {/* Lista de préstamos */}
        {!loading && prestamosFiltrados.length > 0 && (
          <div className="bg-surface dark:bg-surface rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
            {prestamosFiltrados.map(prestamo => (
              <PrestamoItem
                key={prestamo.id}
                prestamo={prestamo}
                onDelete={() => eliminarPrestamo(prestamo.id)}
                onMarcarPagado={() => marcarPagado(prestamo.id)}
              />
            ))}
          </div>
        )}
        
        {/* Explicación */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>¿Cómo funciona?</strong>
            <br />
            Cuando alguien presta dinero al otro, el balance neto muestra quién debe dinero.
            Marca como "pagado" cuando se devuelva el dinero.
          </p>
        </div>
      </div>
      
      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className={cn(
          'fixed bottom-24 right-4 z-30',
          'w-14 h-14 rounded-full',
          'bg-blue-500 text-white shadow-lg',
          'flex items-center justify-center',
          'active:scale-95 transition-transform'
        )}
        aria-label="Añadir préstamo"
      >
        <Plus className="w-7 h-7" />
      </button>
      
      {/* Formulario */}
      <PrestamoForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />
    </div>
  )
}
