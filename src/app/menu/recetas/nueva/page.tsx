'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useConfigHogar } from '@/hooks/use-config-hogar'

interface Ingrediente {
  nombre: string
  cantidad: string
}

export default function NuevaRecetaPage() {
  const router = useRouter()
  const { hogarId } = useConfigHogar()
  const supabase = createClient()
  
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tiempoMinutos, setTiempoMinutos] = useState('')
  const [porciones, setPorciones] = useState('2')
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([{ nombre: '', cantidad: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addIngrediente = () => {
    setIngredientes([...ingredientes, { nombre: '', cantidad: '' }])
  }

  const removeIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index))
  }

  const updateIngrediente = (index: number, field: 'nombre' | 'cantidad', value: string) => {
    const updated = [...ingredientes]
    updated[index][field] = value
    setIngredientes(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    if (!hogarId) {
      setError('Error: hogar no configurado. Intenta recargar la página.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Crear receta
      const { data: receta, error: recetaError } = await supabase
        .from('recetas')
        .insert({
          hogar_id: hogarId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          tiempo_minutos: tiempoMinutos ? parseInt(tiempoMinutos) : null,
          porciones: parseInt(porciones) || 2
        })
        .select()
        .single()

      if (recetaError) throw recetaError

      // Insertar ingredientes válidos
      const ingredientesValidos = ingredientes.filter(i => i.nombre.trim())
      if (ingredientesValidos.length > 0) {
        const { error: ingError } = await supabase
          .from('receta_ingredientes')
          .insert(ingredientesValidos.map(ing => ({
            receta_id: receta.id,
            nombre: ing.nombre.trim(),
            cantidad: ing.cantidad.trim() || null,
            categoria: 'general'
          })))

        if (ingError) throw ingError
      }

      router.push('/menu/recetas')
    } catch (err) {
      console.error('Error:', err)
      setError('Error al guardar la receta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2 mb-6">
        <Link href="/menu/recetas" className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[28px] font-bold">Nueva Receta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-2">Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Pasta carbonara"
            className="input w-full"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Instrucciones o notas..."
            rows={3}
            className="input w-full resize-none"
          />
        </div>

        {/* Tiempo y porciones */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tiempo (min)</label>
            <input
              type="number"
              value={tiempoMinutos}
              onChange={(e) => setTiempoMinutos(e.target.value)}
              placeholder="30"
              min="1"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Porciones</label>
            <input
              type="number"
              value={porciones}
              onChange={(e) => setPorciones(e.target.value)}
              placeholder="2"
              min="1"
              className="input w-full"
            />
          </div>
        </div>

        {/* Ingredientes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Ingredientes</label>
            <button
              type="button"
              onClick={addIngrediente}
              className="text-accent text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Añadir
            </button>
          </div>
          
          <div className="space-y-2">
            {ingredientes.map((ing, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ing.nombre}
                  onChange={(e) => updateIngrediente(index, 'nombre', e.target.value)}
                  placeholder="Ingrediente"
                  className="input flex-1"
                />
                <input
                  type="text"
                  value={ing.cantidad}
                  onChange={(e) => updateIngrediente(index, 'cantidad', e.target.value)}
                  placeholder="Cantidad"
                  className="input w-24"
                />
                {ingredientes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngrediente(index)}
                    className="p-2 text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Guardar receta'
          )}
        </button>
      </form>
    </div>
  )
}
