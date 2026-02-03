'use client'

import { useState, useEffect } from 'react'
import { Drawer } from 'vaul'
import { X, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { NumericInput } from '@/components/ui/numeric-input'
import type { Meta } from '@/types/finanzas'

interface AporteMetaFormProps {
  open: boolean
  onClose: () => void
  meta: Meta | null
  onAportar: (cantidad: number) => Promise<void>
}

export function AporteMetaForm({ open, onClose, meta, onAportar }: AporteMetaFormProps) {
  const [cantidad, setCantidad] = useState(0)
  const [saving, setSaving] = useState(false)
  
  // Resetear al abrir
  useEffect(() => {
    if (open) {
      setCantidad(0)
    }
  }, [open])
  
  if (!meta) return null
  
  // Cálculos de preview
  const nuevoTotal = meta.actual + cantidad
  const nuevoProgreso = meta.objetivo > 0 
    ? Math.min(100, Math.round((nuevoTotal / meta.objetivo) * 100))
    : 0
  const progresoActual = meta.objetivo > 0 
    ? Math.min(100, Math.round((meta.actual / meta.objetivo) * 100))
    : 0
  const incremento = nuevoProgreso - progresoActual
  const completaraLaMeta = nuevoTotal >= meta.objetivo && meta.actual < meta.objetivo
  
  // Validación
  const isValid = cantidad > 0
  
  // Guardar
  const handleSave = async () => {
    if (!isValid || saving) return
    
    setSaving(true)
    try {
      await onAportar(cantidad)
      onClose()
    } catch (err) {
      console.error('Error aportando a meta:', err)
    } finally {
      setSaving(false)
    }
  }
  
  // Atajos de cantidades comunes
  const ATAJOS = [1000, 2500, 5000, 10000, 25000, 50000]  // En céntimos
  
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background',
          'rounded-t-[12px]',
          'max-h-[70vh]',
          'flex flex-col',
          'outline-none'
        )}>
          {/* Handle */}
          <div className="flex justify-center py-3 flex-shrink-0">
            <div className="w-9 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-10 h-10 -ml-2 flex items-center justify-center"
            >
              <X className="w-6 h-6 text-[var(--text-secondary)]" />
            </button>
            
            <h2 className="text-lg font-semibold">
              Aportar a "{meta.nombre}"
            </h2>
            
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className={cn(
                'px-4 py-2 -mr-2 rounded-lg font-semibold text-sm',
                'transition-colors duration-150',
                isValid && !saving
                  ? 'text-white bg-accent active:bg-accent/80'
                  : 'text-[var(--text-muted)] bg-[var(--border)] cursor-not-allowed'
              )}
            >
              {saving ? 'Guardando...' : 'Aportar'}
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Input de cantidad */}
            <div className="bg-surface dark:bg-surface rounded-xl p-4 mb-4">
              <label className="block text-sm text-[var(--text-secondary)] mb-2 text-center">
                Cantidad a aportar
              </label>
              <NumericInput
                value={cantidad}
                onChange={setCantidad}
                size="lg"
                autoFocus
                className="text-2xl font-bold text-center"
              />
              
              {/* Atajos */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {ATAJOS.map((atajo) => (
                  <button
                    key={atajo}
                    type="button"
                    onClick={() => setCantidad(atajo)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium',
                      'border border-gray-200 dark:border-gray-700',
                      'active:bg-[var(--border)] dark:active:bg-gray-800',
                      cantidad === atajo && 'bg-accent/10 border-accent text-accent'
                    )}
                  >
                    +{formatMoney(atajo, false)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Preview del progreso */}
            {cantidad > 0 && (
              <div 
                className="bg-surface dark:bg-surface rounded-xl p-4 border-l-4"
                style={{ borderLeftColor: meta.color }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5" style={{ color: meta.color }} />
                  <span className="font-medium">Nuevo progreso</span>
                </div>
                
                {/* Barra de progreso comparativa */}
                <div className="h-4 bg-[var(--border)] dark:bg-surface rounded-full overflow-hidden mb-3 relative">
                  {/* Progreso actual (más oscuro) */}
                  <div 
                    className="absolute h-full rounded-full opacity-50"
                    style={{ 
                      backgroundColor: meta.color, 
                      width: `${progresoActual}%` 
                    }}
                  />
                  {/* Nuevo progreso (más claro) */}
                  <div 
                    className="absolute h-full rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: meta.color, 
                      width: `${nuevoProgreso}%` 
                    }}
                  />
                </div>
                
                {/* Números */}
                <div className="flex justify-between text-sm">
                  <span>
                    <span className="text-[var(--text-secondary)]">{formatMoney(meta.actual)}</span>
                    {' → '}
                    <span className="font-semibold">{formatMoney(nuevoTotal)}</span>
                  </span>
                  <span>
                    <span className="text-[var(--text-secondary)]">{progresoActual}%</span>
                    {' → '}
                    <span className="font-semibold" style={{ color: meta.color }}>
                      {nuevoProgreso}%
                    </span>
                    {incremento > 0 && (
                      <span className="text-green-500 ml-1">(+{incremento}%)</span>
                    )}
                  </span>
                </div>
                
                {/* Mensaje si completa la meta */}
                {completaraLaMeta && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-700 dark:text-green-300 text-sm font-medium text-center">
                      🎉 ¡Este aporte completará tu meta!
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Safe area padding */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
