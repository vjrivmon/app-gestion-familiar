'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProductoFrecuente, CategoriaProducto } from '@/types/compra'

interface UseProductosFrecuentesReturn {
  frecuentes: ProductoFrecuente[]
  loading: boolean
  error: string | null
  addFrecuente: (nombre: string, categoria?: CategoriaProducto) => Promise<boolean>
  incrementarUso: (nombre: string, precio?: number) => Promise<boolean>
  refetch: () => Promise<void>
}

const TEMP_HOGAR_ID = '00000000-0000-0000-0000-000000000001'

export function useProductosFrecuentes(): UseProductosFrecuentesReturn {
  const [frecuentes, setFrecuentes] = useState<ProductoFrecuente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  const fetchFrecuentes = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('productos_frecuentes')
        .select('*')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .order('uso_count', { ascending: false })
        .limit(15)
      
      if (fetchError) throw fetchError
      
      setFrecuentes(data || [])
    } catch (err) {
      console.error('Error fetching frecuentes:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar productos frecuentes')
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  useEffect(() => {
    fetchFrecuentes()
  }, [fetchFrecuentes])
  
  const addFrecuente = useCallback(async (
    nombre: string,
    categoria: CategoriaProducto = 'general'
  ): Promise<boolean> => {
    try {
      const { error: upsertError } = await supabase
        .from('productos_frecuentes')
        .upsert({
          hogar_id: TEMP_HOGAR_ID,
          nombre,
          categoria,
          uso_count: 1
        }, {
          onConflict: 'hogar_id,nombre'
        })
      
      if (upsertError) throw upsertError
      
      await fetchFrecuentes()
      return true
    } catch (err) {
      console.error('Error adding frecuente:', err)
      setError(err instanceof Error ? err.message : 'Error al añadir producto frecuente')
      return false
    }
  }, [supabase, fetchFrecuentes])
  
  const incrementarUso = useCallback(async (
    nombre: string,
    precio?: number
  ): Promise<boolean> => {
    try {
      // Primero obtener el valor actual
      const { data: current } = await supabase
        .from('productos_frecuentes')
        .select('uso_count')
        .eq('hogar_id', TEMP_HOGAR_ID)
        .eq('nombre', nombre)
        .single()
      
      const newCount = (current?.uso_count || 0) + 1
      
      const updates: Record<string, unknown> = { uso_count: newCount }
      if (precio !== undefined) {
        updates.ultimo_precio = precio
      }
      
      const { error: updateError } = await supabase
        .from('productos_frecuentes')
        .update(updates)
        .eq('hogar_id', TEMP_HOGAR_ID)
        .eq('nombre', nombre)
      
      if (updateError) throw updateError
      
      return true
    } catch (err) {
      console.error('Error incrementing uso:', err)
      return false
    }
  }, [supabase])
  
  return {
    frecuentes,
    loading,
    error,
    addFrecuente,
    incrementarUso,
    refetch: fetchFrecuentes
  }
}
