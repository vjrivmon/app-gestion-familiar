'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useListaCompra } from '@/hooks/use-lista-compra'
import { eurosToCentimos } from '@/types/compra'

export default function NuevaListaPage() {
  const router = useRouter()
  const { crearLista } = useListaCompra()
  
  const [nombre, setNombre] = useState('Lista de compra')
  const [presupuesto, setPresupuesto] = useState('')
  const [supermercado, setSupermercado] = useState('')
  const [creating, setCreating] = useState(false)
  
  const supermercadosSugeridos = [
    'Mercadona',
    'Lidl',
    'Carrefour',
    'Aldi',
    'Dia',
    'Consum',
    'Eroski',
    'Otro'
  ]
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    
    setCreating(true)
    
    const presupuestoCentimos = presupuesto 
      ? eurosToCentimos(presupuesto) 
      : undefined
    
    const lista = await crearLista(
      nombre.trim(),
      presupuestoCentimos,
      supermercado || undefined
    )
    
    if (lista) {
      router.push('/compra')
    }
    
    setCreating(false)
  }
  
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2 mb-6">
        <Link href="/compra" className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[28px] font-bold">Nueva lista</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Nombre de la lista
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Lista de compra"
            className="w-full p-4 rounded-xl bg-surface border border-[var(--separator)] text-[17px]"
          />
        </div>
        
        {/* Presupuesto */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Presupuesto (opcional)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              placeholder="0,00"
              className="w-full p-4 pr-12 rounded-xl bg-surface border border-[var(--separator)] text-[17px]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[17px] text-[var(--text-muted)]">
              €
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Veras el progreso mientras compras
          </p>
        </div>
        
        {/* Supermercado */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Supermercado (opcional)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {supermercadosSugeridos.map((super_) => (
              <button
                key={super_}
                type="button"
                onClick={() => setSupermercado(super_ === 'Otro' ? '' : super_)}
                className={`
                  px-3 py-2 rounded-full text-sm transition-colors
                  ${supermercado === super_
                    ? 'bg-accent text-white'
                    : 'bg-[var(--separator)] text-[var(--text-primary)]'
                  }
                `}
              >
                {super_}
              </button>
            ))}
          </div>
          {(supermercado === '' || !supermercadosSugeridos.includes(supermercado)) && (
            <input
              type="text"
              value={supermercado}
              onChange={(e) => setSupermercado(e.target.value)}
              placeholder="Nombre del supermercado"
              className="w-full p-4 rounded-xl bg-surface border border-[var(--separator)] text-[17px]"
            />
          )}
        </div>
        
        {/* Submit */}
        <button
          type="submit"
          disabled={!nombre.trim() || creating}
          className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-[17px] disabled:opacity-50"
        >
          {creating ? 'Creando...' : 'Crear lista'}
        </button>
      </form>
    </div>
  )
}
