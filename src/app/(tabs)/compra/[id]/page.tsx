'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, ShoppingBag, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { centimosToEuros, formatPrecio } from '@/types/compra'
import type { ListaCompra, ProductoLista, HistorialCompra } from '@/types/compra'

export default function DetalleCompraPage() {
  const params = useParams()
  const id = params.id as string
  
  const [historial, setHistorial] = useState<HistorialCompra | null>(null)
  const [lista, setLista] = useState<ListaCompra | null>(null)
  const [productos, setProductos] = useState<ProductoLista[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Fetch historial
      const { data: hist } = await supabase
        .from('historial_compras')
        .select('*')
        .eq('id', id)
        .single()
      
      if (hist) {
        setHistorial(hist)
        
        // Fetch lista y productos si existe
        if (hist.lista_id) {
          const { data: listaData } = await supabase
            .from('listas_compra')
            .select('*')
            .eq('id', hist.lista_id)
            .single()
          
          if (listaData) {
            setLista(listaData)
          }
          
          const { data: prods } = await supabase
            .from('productos_lista')
            .select('*')
            .eq('lista_id', hist.lista_id)
            .eq('comprado', true)
            .order('orden', { ascending: true })
          
          if (prods) {
            setProductos(prods)
          }
        }
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [id, supabase])
  
  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  
  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center gap-3 pt-2 mb-6">
          <div className="w-10 h-10 bg-[var(--separator)] rounded animate-pulse" />
          <div className="h-8 w-40 bg-[var(--separator)] rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[var(--separator)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  if (!historial) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center gap-3 pt-2 mb-6">
          <Link href="/compra/historial" className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-[28px] font-bold">No encontrado</h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          Esta compra no existe o ha sido eliminada.
        </p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/compra/historial" className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-[28px] font-bold">Detalle compra</h1>
        </div>
      </div>
      
      {/* Info card */}
      <div className="px-4 mb-6">
        <div className="p-4 bg-surface rounded-2xl border border-[var(--separator)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">{centimosToEuros(historial.total)}€</div>
              <div className="text-sm text-[var(--text-secondary)]">
                {historial.num_productos} productos
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{formatFecha(historial.fecha)}</span>
            </div>
            {historial.supermercado && (
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <MapPin className="w-4 h-4" />
                <span>{historial.supermercado}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Productos */}
      {productos.length > 0 && (
        <div>
          <div className="px-4 mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Productos comprados
            </span>
          </div>
          <div className="bg-surface">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="flex items-center justify-between p-4 border-b border-[var(--separator)]"
              >
                <div>
                  <div className="font-medium">{producto.nombre}</div>
                  {producto.cantidad > 1 && (
                    <div className="text-sm text-[var(--text-secondary)]">
                      {producto.cantidad} {producto.unidad}
                    </div>
                  )}
                </div>
                <div className="text-[17px] font-medium">
                  {formatPrecio(producto.precio)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {productos.length === 0 && (
        <div className="px-4">
          <p className="text-[var(--text-secondary)] text-sm">
            No hay detalles disponibles para esta compra.
          </p>
        </div>
      )}
    </div>
  )
}
