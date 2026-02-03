'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { 
  ListaCompra, 
  ProductoLista, 
  CategoriaProducto 
} from '@/types/compra'

interface UseListaCompraReturn {
  // Estado
  listaActiva: ListaCompra | null
  productos: ProductoLista[]
  loading: boolean
  error: string | null
  
  // CRUD Lista
  crearLista: (nombre: string, presupuesto?: number, supermercado?: string) => Promise<ListaCompra | null>
  completarLista: () => Promise<boolean>
  cancelarLista: () => Promise<boolean>
  
  // CRUD Productos
  addProducto: (nombre: string, cantidad?: number, categoria?: CategoriaProducto) => Promise<ProductoLista | null>
  updateProducto: (id: string, changes: Partial<ProductoLista>) => Promise<boolean>
  toggleComprado: (id: string, precio?: number) => Promise<boolean>
  deleteProducto: (id: string) => Promise<boolean>
  
  // Cálculos
  calcularTotal: () => number
  productosComprados: ProductoLista[]
  productosPendientes: ProductoLista[]
  
  // Refetch
  refetch: () => Promise<void>
}

const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

export function useListaCompra(): UseListaCompraReturn {
  const [listaActiva, setListaActiva] = useState<ListaCompra | null>(null)
  const [productos, setProductos] = useState<ProductoLista[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  // Fetch lista activa y sus productos
  const fetchListaActiva = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Buscar lista activa
      const { data: listas, error: listaError } = await supabase
        .from('listas_compra')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .eq('estado', 'activa')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (listaError) throw listaError
      
      const lista = listas?.[0] || null
      setListaActiva(lista)
      
      // Si hay lista, cargar productos
      if (lista) {
        const { data: prods, error: prodsError } = await supabase
          .from('productos_lista')
          .select('*')
          .eq('lista_id', lista.id)
          .order('orden', { ascending: true })
          .order('created_at', { ascending: true })
        
        if (prodsError) throw prodsError
        setProductos(prods || [])
      } else {
        setProductos([])
      }
    } catch (err) {
      console.error('Error fetching lista:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar lista')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  useEffect(() => {
    fetchListaActiva()
  }, [fetchListaActiva])
  
  // Realtime para productos
  useEffect(() => {
    if (!listaActiva) return
    
    const channel = supabase
      .channel('productos-lista-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'productos_lista',
          filter: `lista_id=eq.${listaActiva.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProductos(prev => [...prev, payload.new as ProductoLista])
          } else if (payload.eventType === 'UPDATE') {
            setProductos(prev => prev.map(p => 
              p.id === (payload.new as ProductoLista).id ? payload.new as ProductoLista : p
            ))
          } else if (payload.eventType === 'DELETE') {
            setProductos(prev => prev.filter(p => p.id !== (payload.old as { id: string }).id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, listaActiva?.id])
  
  // Crear nueva lista
  const crearLista = useCallback(async (
    nombre: string, 
    presupuesto?: number,
    supermercado?: string
  ): Promise<ListaCompra | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('listas_compra')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          nombre,
          presupuesto: presupuesto || null,
          supermercado: supermercado || null,
          estado: 'activa'
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      setListaActiva(data)
      setProductos([])
      
      if (navigator.vibrate) navigator.vibrate(10)
      
      return data
    } catch (err) {
      console.error('Error creating lista:', err)
      setError(err instanceof Error ? err.message : 'Error al crear lista')
      return null
    }
  }, [supabase])
  
  // Completar lista (guardar en historial)
  const completarLista = useCallback(async (): Promise<boolean> => {
    if (!listaActiva) return false
    
    try {
      const total = productos
        .filter(p => p.comprado && p.precio !== null)
        .reduce((sum, p) => sum + (p.precio || 0), 0)
      
      const numProductos = productos.filter(p => p.comprado).length
      
      // Guardar en historial
      const { error: histError } = await supabase
        .from('historial_compras')
        .insert({
          hogar_id: TEMP_HOGAR_ID,
          lista_id: listaActiva.id,
          supermercado: listaActiva.supermercado,
          total,
          num_productos: numProductos
        })
      
      if (histError) throw histError
      
      // Actualizar productos frecuentes
      for (const prod of productos.filter(p => p.comprado)) {
        // Primero intentar obtener si ya existe
        const { data: existing } = await supabase
          .from('productos_frecuentes')
          .select('id, uso_count')
          .eq('hogar_id', TEMP_HOGAR_ID)
          .eq('nombre', prod.nombre)
          .single()
        
        if (existing) {
          // Actualizar incrementando uso_count
          await supabase
            .from('productos_frecuentes')
            .update({ 
              uso_count: existing.uso_count + 1,
              ultimo_precio: prod.precio 
            })
            .eq('id', existing.id)
        } else {
          // Insertar nuevo
          await supabase
            .from('productos_frecuentes')
            .insert({
              hogar_id: TEMP_HOGAR_ID,
              nombre: prod.nombre,
              categoria: prod.categoria,
              uso_count: 1,
              ultimo_precio: prod.precio
            })
        }
      }
      
      // Marcar lista como completada
      const { error: updateError } = await supabase
        .from('listas_compra')
        .update({ 
          estado: 'completada',
          completed_at: new Date().toISOString()
        })
        .eq('id', listaActiva.id)
      
      if (updateError) throw updateError
      
      setListaActiva(null)
      setProductos([])
      
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      return true
    } catch (err) {
      console.error('Error completing lista:', err)
      setError(err instanceof Error ? err.message : 'Error al completar lista')
      return false
    }
  }, [supabase, listaActiva, productos])
  
  // Cancelar lista
  const cancelarLista = useCallback(async (): Promise<boolean> => {
    if (!listaActiva) return false
    
    try {
      const { error: updateError } = await supabase
        .from('listas_compra')
        .update({ estado: 'cancelada' })
        .eq('id', listaActiva.id)
      
      if (updateError) throw updateError
      
      setListaActiva(null)
      setProductos([])
      
      return true
    } catch (err) {
      console.error('Error canceling lista:', err)
      setError(err instanceof Error ? err.message : 'Error al cancelar lista')
      return false
    }
  }, [supabase, listaActiva])
  
  // Añadir producto
  const addProducto = useCallback(async (
    nombre: string,
    cantidad: number = 1,
    categoria: CategoriaProducto = 'general'
  ): Promise<ProductoLista | null> => {
    if (!listaActiva) return null
    
    try {
      const maxOrden = productos.length > 0 
        ? Math.max(...productos.map(p => p.orden)) + 1 
        : 0
      
      const { data, error: insertError } = await supabase
        .from('productos_lista')
        .insert({
          lista_id: listaActiva.id,
          nombre,
          cantidad,
          categoria,
          orden: maxOrden
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      if (navigator.vibrate) navigator.vibrate(10)
      
      return data
    } catch (err) {
      console.error('Error adding producto:', err)
      setError(err instanceof Error ? err.message : 'Error al añadir producto')
      return null
    }
  }, [supabase, listaActiva, productos])
  
  // Actualizar producto
  const updateProducto = useCallback(async (
    id: string,
    changes: Partial<ProductoLista>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('productos_lista')
        .update(changes)
        .eq('id', id)
      
      if (updateError) throw updateError
      
      return true
    } catch (err) {
      console.error('Error updating producto:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar producto')
      return false
    }
  }, [supabase])
  
  // Toggle comprado
  const toggleComprado = useCallback(async (
    id: string,
    precio?: number
  ): Promise<boolean> => {
    const producto = productos.find(p => p.id === id)
    if (!producto) return false
    
    const newComprado = !producto.comprado
    
    try {
      const updates: Partial<ProductoLista> = { comprado: newComprado }
      if (precio !== undefined) {
        updates.precio = precio
      }
      
      const { error: updateError } = await supabase
        .from('productos_lista')
        .update(updates)
        .eq('id', id)
      
      if (updateError) throw updateError
      
      if (navigator.vibrate) navigator.vibrate(10)
      
      return true
    } catch (err) {
      console.error('Error toggling producto:', err)
      setError(err instanceof Error ? err.message : 'Error al marcar producto')
      return false
    }
  }, [supabase, productos])
  
  // Eliminar producto
  const deleteProducto = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('productos_lista')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      if (navigator.vibrate) navigator.vibrate([10, 50, 10])
      
      return true
    } catch (err) {
      console.error('Error deleting producto:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar producto')
      return false
    }
  }, [supabase])
  
  // Cálculos
  const calcularTotal = useCallback(() => {
    return productos
      .filter(p => p.comprado && p.precio !== null)
      .reduce((sum, p) => sum + (p.precio || 0), 0)
  }, [productos])
  
  const productosComprados = useMemo(() => 
    productos.filter(p => p.comprado),
    [productos]
  )
  
  const productosPendientes = useMemo(() => 
    productos.filter(p => !p.comprado),
    [productos]
  )
  
  return {
    listaActiva,
    productos,
    loading,
    error,
    crearLista,
    completarLista,
    cancelarLista,
    addProducto,
    updateProducto,
    toggleComprado,
    deleteProducto,
    calcularTotal,
    productosComprados,
    productosPendientes,
    refetch: fetchListaActiva
  }
}
