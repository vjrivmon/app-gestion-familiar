'use client'

import { useState, useEffect } from 'react'
import { Drawer } from 'vaul'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { NumericInput } from '@/components/ui/numeric-input'
import { GroupedList } from '@/components/ui/grouped-list'
import { PersonaPicker, PersonaAvatar } from './persona-picker'
import type { Pagador, NOMBRES } from '@/types/finanzas'

interface PrestamoFormData {
  de_quien: Pagador
  a_quien: Pagador
  importe: number  // céntimos
  concepto?: string
  fecha: string  // YYYY-MM-DD
}

interface PrestamoFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: PrestamoFormData) => Promise<void>
}

const NOMBRES_MAP: Record<Pagador, string> = {
  m1: 'Vicente',
  m2: 'Irene',
  conjunta: 'Conjunta'
}

export function PrestamoForm({ open, onClose, onSave }: PrestamoFormProps) {
  // Estado del formulario
  const [deQuien, setDeQuien] = useState<Pagador>('m1')
  const [aQuien, setAQuien] = useState<Pagador>('m2')
  const [importe, setImporte] = useState(0)
  const [concepto, setConcepto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  
  const [saving, setSaving] = useState(false)
  
  // Resetear al abrir
  useEffect(() => {
    if (open) {
      setDeQuien('m1')
      setAQuien('m2')
      setImporte(0)
      setConcepto('')
      setFecha(new Date().toISOString().split('T')[0])
    }
  }, [open])
  
  // Validación
  const isValid = importe > 0 && deQuien !== aQuien
  const mismaPersana = deQuien === aQuien
  
  // Guardar
  const handleSave = async () => {
    if (!isValid || saving) return
    
    setSaving(true)
    try {
      await onSave({
        de_quien: deQuien,
        a_quien: aQuien,
        importe,
        concepto: concepto.trim() || undefined,
        fecha
      })
      onClose()
    } catch (err) {
      console.error('Error saving prestamo:', err)
    } finally {
      setSaving(false)
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
          'h-[80vh] max-h-[80vh]',
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
            
            <h2 className="text-lg font-semibold">Nuevo préstamo</h2>
            
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
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Importe destacado */}
            <div className="bg-white dark:bg-surface px-4 py-6 mb-4">
              <label className="block text-sm text-gray-500 mb-2 text-center">
                Importe del préstamo
              </label>
              <div className="flex justify-center">
                <NumericInput
                  value={importe}
                  onChange={setImporte}
                  size="lg"
                  autoFocus
                  className="max-w-[200px] text-center text-2xl font-bold"
                />
              </div>
              {importe > 0 && !mismaPersana && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                  💸 <strong>{NOMBRES_MAP[deQuien]}</strong> presta <strong>{formatMoney(importe)}</strong> a <strong>{NOMBRES_MAP[aQuien]}</strong>
                </p>
              )}
            </div>
            
            {/* Error si misma persona */}
            {mismaPersana && (
              <div className="px-4 mb-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    No puedes prestarte dinero a ti mismo
                  </p>
                </div>
              </div>
            )}
            
            {/* Quién presta */}
            <GroupedList title="¿Quién presta?" className="px-4 mb-4">
              <div className="px-4 py-4">
                <PersonaPicker
                  value={deQuien}
                  onChange={setDeQuien}
                  includeConjunta={false}
                  variant="buttons"
                />
              </div>
            </GroupedList>
            
            {/* Visualización del flujo */}
            <div className="px-4 mb-4">
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <PersonaAvatar persona={deQuien} size="lg" />
                  <p className="text-sm mt-1 font-medium">{NOMBRES_MAP[deQuien]}</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-2xl">→</span>
                  <span className="text-sm text-gray-500">presta</span>
                </div>
                
                <div className="text-center">
                  <PersonaAvatar persona={aQuien} size="lg" />
                  <p className="text-sm mt-1 font-medium">{NOMBRES_MAP[aQuien]}</p>
                </div>
              </div>
            </div>
            
            {/* A quién */}
            <GroupedList title="¿A quién?" className="px-4 mb-4">
              <div className="px-4 py-4">
                <PersonaPicker
                  value={aQuien}
                  onChange={setAQuien}
                  includeConjunta={false}
                  variant="buttons"
                />
              </div>
            </GroupedList>
            
            {/* Detalles opcionales */}
            <GroupedList title="Detalles (opcional)" className="px-4 mb-4">
              {/* Concepto */}
              <div className="px-4 py-3">
                <input
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Motivo del préstamo"
                  className={cn(
                    'w-full bg-transparent text-[17px]',
                    'placeholder:text-gray-400',
                    'focus:outline-none'
                  )}
                />
              </div>
              
              {/* Fecha */}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[17px]">Fecha</span>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className={cn(
                    'bg-transparent text-gray-500 text-[17px]',
                    'focus:outline-none'
                  )}
                />
              </div>
            </GroupedList>
            
            {/* Safe area padding */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
