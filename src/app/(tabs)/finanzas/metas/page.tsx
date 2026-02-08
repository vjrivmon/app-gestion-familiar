'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useMetas } from '@/hooks/use-metas'
import { MetaForm } from '@/components/finanzas/meta-form'
import { MetaCard, MetaCardSkeleton, MetasEmptyState } from '@/components/finanzas/meta-card'
import { AporteMetaForm } from '@/components/finanzas/aporte-meta-form'
import type { Meta } from '@/types/finanzas'

export default function MetasPage() {
  const router = useRouter()
  
  const [showForm, setShowForm] = useState(false)
  const [editingMeta, setEditingMeta] = useState<Meta | undefined>()
  const [aportandoMeta, setAportandoMeta] = useState<Meta | null>(null)
  
  const {
    metas,
    loading,
    crearMeta,
    actualizarMeta,
    eliminarMeta,
    aportarAMeta,
    totalObjetivos,
    totalAhorrado,
    progresoGlobal
  } = useMetas()
  
  const handleSaveMeta = async (data: Parameters<typeof crearMeta>[0]) => {
    if (editingMeta) {
      await actualizarMeta(editingMeta.id, data)
    } else {
      await crearMeta(data)
    }
  }
  
  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta)
    setShowForm(true)
  }
  
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMeta(undefined)
  }
  
  const handleAportar = async (cantidad: number) => {
    if (aportandoMeta) {
      await aportarAMeta(aportandoMeta.id, cantidad)
    }
  }
  
  const handleEliminar = async (meta: Meta) => {
    // Confirmación simple
    if (window.confirm(`¿Eliminar la meta "${meta.nombre}"?`)) {
      await eliminarMeta(meta.id)
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface p-4 pt-2 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 -ml-2 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[24px] font-bold flex items-center gap-2">
            <Target className="w-7 h-7" />
            Metas de Ahorro
          </h1>
        </div>
      </div>
      
      <div className="p-4">
        {/* Resumen global (solo si hay metas) */}
        {metas.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 mb-4 text-white">
            <p className="text-sm opacity-90 mb-1">Progreso global</p>
            
            {/* Barra de progreso */}
            <div className="h-3 bg-surface/20 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-surface rounded-full transition-all duration-500"
                style={{ width: `${progresoGlobal}%` }}
              />
            </div>
            
            <div className="flex justify-between items-baseline">
              <p className="text-lg font-bold">
                {formatMoney(totalAhorrado)} <span className="text-sm font-normal opacity-75">/ {formatMoney(totalObjetivos)}</span>
              </p>
              <p className="text-2xl font-bold">
                {progresoGlobal}%
              </p>
            </div>
          </div>
        )}
        
        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map(i => <MetaCardSkeleton key={i} />)}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && metas.length === 0 && (
          <MetasEmptyState onCrear={() => setShowForm(true)} />
        )}
        
        {/* Grid de metas */}
        {!loading && metas.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {metas.map(meta => (
              <MetaCard
                key={meta.id}
                meta={meta}
                onAportar={() => setAportandoMeta(meta)}
                onEditar={() => handleEdit(meta)}
                onEliminar={() => handleEliminar(meta)}
              />
            ))}
          </div>
        )}
        
        {/* Tips */}
        {metas.length > 0 && metas.length < 3 && (
          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-purple-700">
              <strong>Consejo:</strong> Divide grandes objetivos en metas más pequeñas.
              Es más motivador ver progresos frecuentes.
            </p>
          </div>
        )}
      </div>
      
      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className={cn(
          'fixed bottom-24 right-4 z-30',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-neu-sm',
          'flex items-center justify-center',
          'active:scale-95 transition-transform'
        )}
        aria-label="Añadir meta"
      >
        <Plus className="w-7 h-7" />
      </button>
      
      {/* Formulario de meta */}
      <MetaForm
        open={showForm}
        onClose={handleCloseForm}
        meta={editingMeta}
        onSave={handleSaveMeta}
      />
      
      {/* Formulario de aporte */}
      <AporteMetaForm
        open={!!aportandoMeta}
        onClose={() => setAportandoMeta(null)}
        meta={aportandoMeta}
        onAportar={handleAportar}
      />
    </div>
  )
}
