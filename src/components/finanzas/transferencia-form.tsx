'use client'

import { useState, useEffect } from 'react'
import { Drawer } from 'vaul'
import { X, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NumericInput } from '@/components/ui/numeric-input'
import { PersonaPicker } from './persona-picker'
import { useTransferencias } from '@/hooks/use-transferencias'
import { useMesActual } from '@/hooks/use-mes-actual'
import { NOMBRES, type Pagador } from '@/types/finanzas'

interface TransferenciaFormProps {
  open: boolean
  onClose: () => void
  // Para preseleccionar origen o destino
  origenFijo?: Pagador
  destinoFijo?: Pagador
  // Callback al crear
  onSuccess?: () => void
}

/**
 * Drawer para crear una transferencia entre cuentas
 */
export function TransferenciaForm({
  open,
  onClose,
  origenFijo,
  destinoFijo,
  onSuccess
}: TransferenciaFormProps) {
  const { mes, año } = useMesActual()
  const { crearTransferencia, error: hookError } = useTransferencias(mes, año)
  
  // Estado del formulario
  const [de, setDe] = useState<Pagador>(origenFijo || 'm1')
  const [a, setA] = useState<Pagador>(destinoFijo || 'conjunta')
  const [importe, setImporte] = useState(0)
  const [concepto, setConcepto] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reset al abrir
  useEffect(() => {
    if (open) {
      setDe(origenFijo || 'm1')
      setA(destinoFijo || 'conjunta')
      setImporte(0)
      setConcepto('')
      setError(null)
    }
  }, [open, origenFijo, destinoFijo])
  
  // Validación
  const isValid = de !== a && importe > 0
  
  // Guardar
  const handleSave = async () => {
    if (!isValid || saving) return
    
    setError(null)
    setSaving(true)
    
    const result = await crearTransferencia(de, a, importe, concepto || 'Transferencia')
    
    setSaving(false)
    
    if (result) {
      onSuccess?.()
      onClose()
    } else {
      setError(hookError || 'Error al crear la transferencia')
    }
  }
  
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-gray-100 dark:bg-black',
          'rounded-t-[12px]',
          'max-h-[90vh]',
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
              <X className="w-6 h-6 text-gray-500" />
            </button>
            
            <h2 className="text-lg font-semibold">Nueva Transferencia</h2>
            
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className={cn(
                'px-4 py-2 -mr-2 rounded-lg font-semibold text-sm',
                'transition-colors duration-150',
                isValid && !saving
                  ? 'text-white bg-accent active:bg-accent/80'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Guardar'
              )}
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Preview de la transferencia */}
            <div className="card py-6 flex items-center justify-center gap-4">
              <div className="text-center">
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2',
                  de === 'm1' ? 'bg-blue-500' : de === 'm2' ? 'bg-pink-500' : 'bg-purple-500'
                )}>
                  {de === 'm1' ? 'V' : de === 'm2' ? 'I' : '∞'}
                </div>
                <p className="font-medium text-sm">{NOMBRES[de]}</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400" />
              
              <div className="text-center">
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2',
                  a === 'm1' ? 'bg-blue-500' : a === 'm2' ? 'bg-pink-500' : 'bg-purple-500'
                )}>
                  {a === 'm1' ? 'V' : a === 'm2' ? 'I' : '∞'}
                </div>
                <p className="font-medium text-sm">{NOMBRES[a]}</p>
              </div>
            </div>
            
            {/* Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Desde
              </label>
              <PersonaPicker
                value={de}
                onChange={setDe}
                includeConjunta={true}
                className="w-full"
              />
            </div>
            
            {/* Hacia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hacia
              </label>
              <PersonaPicker
                value={a}
                onChange={setA}
                includeConjunta={true}
                className="w-full"
              />
              
              {/* Warning si son iguales */}
              {de === a && (
                <p className="text-amber-600 text-sm mt-2">
                  ⚠️ El origen y destino deben ser diferentes
                </p>
              )}
            </div>
            
            {/* Importe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Importe
              </label>
              <NumericInput
                value={importe}
                onChange={setImporte}
                placeholder="0,00"
                autoFocus
              />
            </div>
            
            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Concepto (opcional)
              </label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Transferencia"
                className={cn(
                  'w-full px-4 py-3 rounded-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700',
                  'text-base placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-accent/50'
                )}
              />
            </div>
            
            {/* Nota explicativa */}
            <div className="text-xs text-gray-400 text-center">
              Esta transferencia creará un gasto en {NOMBRES[de]} y un ingreso en {NOMBRES[a]}
            </div>
            
            {/* Safe area */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
