'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, Clock, Users, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useConfigHogar } from '@/hooks/use-config-hogar'

interface Receta {
  id: string
  nombre: string
  descripcion: string | null
  tiempo_minutos: number | null
  porciones: number
  ingredientes?: { id: string; nombre: string; cantidad: string | null }[]
}

export default function RecetasPage() {
  const { hogarId } = useConfigHogar()
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const supabase = createClient()

  const cargarRecetas = useCallback(async () => {
    if (!hogarId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('recetas')
        .select('*, ingredientes:receta_ingredientes(*)')
        .eq('hogar_id', hogarId)
        .order('nombre')

      if (error) throw error
      setRecetas(data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, hogarId])

  useEffect(() => {
    cargarRecetas()
  }, [cargarRecetas])

  const eliminarReceta = async (id: string) => {
    if (!confirm('¿Eliminar esta receta?')) return

    setDeleting(id)
    try {
      const { error } = await supabase.from('recetas').delete().eq('id', id)
      if (error) throw error
      setRecetas(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Error:', err)
      alert('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2 mb-6">
        <Link href="/menu" className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[28px] font-bold">Mis Recetas</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : recetas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)] mb-4">No tienes recetas guardadas</p>
          <Link href="/menu/recetas/nueva" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Crear primera receta
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recetas.map((receta) => (
            <div key={receta.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{receta.nombre}</h3>
                  {receta.descripcion && (
                    <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                      {receta.descripcion}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                    {receta.tiempo_minutos && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {receta.tiempo_minutos} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {receta.porciones} porciones
                    </span>
                  </div>
                  {receta.ingredientes && receta.ingredientes.length > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {receta.ingredientes.length} ingredientes
                    </p>
                  )}
                </div>
                <button
                  onClick={() => eliminarReceta(receta.id)}
                  disabled={deleting === receta.id}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  {deleting === receta.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/menu/recetas/nueva"
        className="fixed bottom-[calc(49px+env(safe-area-inset-bottom)+16px)] right-4 w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-7 h-7" />
      </Link>
    </div>
  )
}
