'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, MoreHorizontal, History, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useListaCompra } from '@/hooks/use-lista-compra'
import { useProductosFrecuentes } from '@/hooks/use-productos-frecuentes'
import { 
  ProductoItem, 
  AddProductoForm, 
  PresupuestoBar, 
  ProductosFrecuentes,
  ScannerPrecio
} from '@/components/compra'
import type { CategoriaProducto } from '@/types/compra'

export default function CompraPage() {
  const {
    listaActiva,
    productos,
    loading,
    productosPendientes,
    productosComprados,
    addProducto,
    toggleComprado,
    deleteProducto,
    updateProducto,
    calcularTotal,
    completarLista
  } = useListaCompra()
  
  const { frecuentes, loading: loadingFrecuentes } = useProductosFrecuentes()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [selectedProductoId, setSelectedProductoId] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [completing, setCompleting] = useState(false)
  
  const selectedProducto = productos.find(p => p.id === selectedProductoId)
  
  const handleAddProducto = async (nombre: string, cantidad: number, categoria: CategoriaProducto) => {
    await addProducto(nombre, cantidad, categoria)
  }
  
  const handleToggle = async (id: string) => {
    const producto = productos.find(p => p.id === id)
    if (!producto) return
    
    if (!producto.comprado) {
      // Al marcar como comprado, mostrar scanner de precio
      setSelectedProductoId(id)
      setShowScanner(true)
    } else {
      // Si ya está comprado, simplemente desmarcar
      await toggleComprado(id)
    }
  }
  
  const handlePrecioConfirm = async (precio: number) => {
    if (selectedProductoId) {
      await updateProducto(selectedProductoId, { precio, comprado: true })
    }
    setShowScanner(false)
    setSelectedProductoId(null)
  }
  
  const handlePrecioEdit = (id: string) => {
    setSelectedProductoId(id)
    setShowScanner(true)
  }
  
  const handleAddFrecuente = async (nombre: string, categoria: string) => {
    await addProducto(nombre, 1, categoria as CategoriaProducto)
  }
  
  const handleCompletarLista = async () => {
    setCompleting(true)
    await completarLista()
    setCompleting(false)
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex justify-between items-center pt-2 mb-6">
          <div className="h-8 w-40 bg-[var(--separator)] rounded animate-pulse" />
          <div className="h-8 w-8 bg-[var(--separator)] rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[var(--separator)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  // Empty state - no active list
  if (!listaActiva) {
    return (
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex justify-between items-center pt-2 mb-6">
          <h1 className="text-[28px] font-bold">Lista de Compra</h1>
          <Link href="/compra/historial" className="p-2 -mr-2">
            <History className="w-6 h-6 text-[var(--text-muted)]" />
          </Link>
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
          <Link 
            href="/compra/nueva"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva lista
          </Link>
        </div>

        {/* Productos frecuentes */}
        {frecuentes.length > 0 && (
          <div className="mt-8">
            <ProductosFrecuentes 
              frecuentes={frecuentes} 
              onAdd={handleAddFrecuente}
              loading={loadingFrecuentes}
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Crea una lista primero para añadir productos
            </p>
          </div>
        )}

        {/* History link */}
        <div className="mt-8">
          <Link href="/compra/historial" className="text-accent font-medium">
            Ver historial de compras
          </Link>
        </div>
      </div>
    )
  }
  
  // Active list
  const total = calcularTotal()
  const hayComprados = productosComprados.length > 0
  
  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)] px-4 pt-6 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-bold">{listaActiva.nombre}</h1>
            {listaActiva.supermercado && (
              <p className="text-sm text-[var(--text-secondary)]">
                {listaActiva.supermercado}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 -mr-2"
          >
            <MoreHorizontal className="w-6 h-6 text-[var(--text-muted)]" />
          </button>
        </div>
        
        {/* Options dropdown */}
        {showOptions && (
          <div className="absolute right-4 top-16 bg-surface rounded-xl shadow-lg border border-[var(--separator)] overflow-hidden z-20">
            <Link 
              href="/compra/historial"
              className="block px-4 py-3 hover:bg-[var(--separator)] transition-colors"
              onClick={() => setShowOptions(false)}
            >
              Ver historial
            </Link>
            <Link 
              href="/compra/nueva"
              className="block px-4 py-3 hover:bg-[var(--separator)] transition-colors"
              onClick={() => setShowOptions(false)}
            >
              Nueva lista
            </Link>
          </div>
        )}
      </div>
      
      {/* Presupuesto bar */}
      {listaActiva.presupuesto && (
        <div className="px-4 mb-4">
          <PresupuestoBar 
            gastado={total} 
            presupuesto={listaActiva.presupuesto} 
          />
        </div>
      )}
      
      {/* Productos pendientes */}
      {productosPendientes.length > 0 && (
        <div className="mb-4">
          <div className="px-4 mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Pendientes ({productosPendientes.length})
            </span>
          </div>
          <div className="bg-surface">
            {productosPendientes.map((producto) => (
              <ProductoItem
                key={producto.id}
                producto={producto}
                onToggle={handleToggle}
                onDelete={deleteProducto}
                onPrecioEdit={handlePrecioEdit}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Productos comprados */}
      {productosComprados.length > 0 && (
        <div className="mb-4">
          <div className="px-4 mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Comprados ({productosComprados.length})
            </span>
          </div>
          <div className="bg-surface">
            {productosComprados.map((producto) => (
              <ProductoItem
                key={producto.id}
                producto={producto}
                onToggle={handleToggle}
                onDelete={deleteProducto}
                onPrecioEdit={handlePrecioEdit}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty products state */}
      {productos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-[var(--text-secondary)] text-center mb-4">
            La lista esta vacia. Añade productos para empezar.
          </p>
        </div>
      )}
      
      {/* Productos frecuentes */}
      <div className="px-4 mt-6">
        <ProductosFrecuentes 
          frecuentes={frecuentes} 
          onAdd={handleAddFrecuente}
          loading={loadingFrecuentes}
        />
      </div>
      
      {/* Bottom actions */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pt-8">
        {hayComprados && (
          <button
            onClick={handleCompletarLista}
            disabled={completing}
            className="w-full py-4 rounded-xl bg-green-500 text-white font-semibold text-[17px] flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            {completing ? 'Finalizando...' : 'Finalizar compra'}
          </button>
        )}
      </div>
      
      {/* FAB */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>
      
      {/* Add producto form */}
      <AddProductoForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddProducto}
      />
      
      {/* Scanner precio */}
      <ScannerPrecio
        open={showScanner}
        onClose={() => {
          setShowScanner(false)
          setSelectedProductoId(null)
        }}
        onConfirm={handlePrecioConfirm}
        productoNombre={selectedProducto?.nombre}
      />
    </div>
  )
}
