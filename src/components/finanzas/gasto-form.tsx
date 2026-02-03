'use client'

import { useState, useEffect } from 'react'
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { NumericInput } from '@/components/ui/numeric-input'
import { GroupedList, GroupedListCell } from '@/components/ui/grouped-list'
import { CategoriaPicker } from './categoria-picker'
import { PersonaPicker } from './persona-picker'
import type { 
  Gasto, 
  Pagador, 
  TipoDinero, 
  CategoriaGasto 
} from '@/types/finanzas'

interface GastoFormData {
  concepto: string
  importe: number  // céntimos
  categoria: CategoriaGasto
  pagador: Pagador
  tipo_dinero: TipoDinero
  fecha: string  // YYYY-MM-DD
  notas: string
}

interface GastoFormProps {
  open: boolean
  onClose: () => void
  gasto?: Gasto  // Si se pasa, es modo edición
  onSave: (data: GastoFormData) => Promise<void>
}

const TIPO_DINERO_OPTIONS = [
  { value: 'efectivo' as TipoDinero, label: 'Efectivo', emoji: '💵' },
  { value: 'digital' as TipoDinero, label: 'Digital', emoji: '💳' }
]

export function GastoForm({ open, onClose, gasto, onSave }: GastoFormProps) {
  const isEditing = !!gasto
  
  // Estado del formulario
  const [importe, setImporte] = useState(0)
  const [concepto, setConcepto] = useState('')
  const [categoria, setCategoria] = useState<CategoriaGasto>('supermercado')
  const [pagador, setPagador] = useState<Pagador>('m1')
  const [tipoDinero, setTipoDinero] = useState<TipoDinero>('digital')
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState('')
  
  const [saving, setSaving] = useState(false)
  
  // Resetear al abrir/cerrar o cambiar gasto
  useEffect(() => {
    if (open) {
      if (gasto) {
        // Modo edición: cargar datos
        setImporte(gasto.importe)
        setConcepto(gasto.concepto)
        setCategoria(gasto.categoria)
        setPagador(gasto.pagador)
        setTipoDinero(gasto.tipo_dinero)
        setFecha(gasto.fecha)
        setNotas(gasto.notas || '')
      } else {
        // Modo creación: valores por defecto
        setImporte(0)
        setConcepto('')
        setCategoria('supermercado')
        setPagador('m1')
        setTipoDinero('digital')
        setFecha(new Date().toISOString().split('T')[0])
        setNotas('')
      }
    }
  }, [open, gasto])
  
  // Validación
  const isValid = importe > 0 && concepto.trim() !== ''
  
  // Guardar
  const handleSave = async () => {
    if (!isValid || saving) return
    
    setSaving(true)
    try {
      await onSave({
        concepto: concepto.trim(),
        importe,
        categoria,
        pagador,
        tipo_dinero: tipoDinero,
        fecha,
        notas: notas.trim()
      })
      onClose()
    } catch (err) {
      console.error('Error saving gasto:', err)
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
          'h-[95vh] max-h-[95vh]',
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
            
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Editar gasto' : 'Nuevo gasto'}
            </h2>
            
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
                Importe
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
              {importe > 0 && (
                <p className="text-center text-sm text-negative mt-2 font-medium">
                  -{formatMoney(importe)}
                </p>
              )}
            </div>
            
            {/* Detalles */}
            <GroupedList title="Detalles" className="px-4 mb-4">
              {/* Concepto */}
              <div className="px-4 py-3">
                <input
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Concepto"
                  className={cn(
                    'w-full bg-transparent text-[17px]',
                    'placeholder:text-gray-400',
                    'focus:outline-none'
                  )}
                />
              </div>
              
              {/* Categoría */}
              <GroupedListCell 
                label="Categoría"
                value={
                  <CategoriaPicker
                    tipo="gasto"
                    value={categoria}
                    onChange={(c) => setCategoria(c as CategoriaGasto)}
                  />
                }
              />
              
              {/* Pagador */}
              <div className="px-4 py-3">
                <label className="block text-sm text-gray-500 mb-2">
                  Pagador
                </label>
                <PersonaPicker
                  value={pagador}
                  onChange={setPagador}
                  variant="buttons"
                />
              </div>
            </GroupedList>
            
            {/* Tipo de dinero */}
            <GroupedList title="Tipo de dinero" className="px-4 mb-4">
              <div className="px-4 py-3">
                <SegmentedControl
                  options={TIPO_DINERO_OPTIONS}
                  value={tipoDinero}
                  onChange={setTipoDinero}
                />
              </div>
            </GroupedList>
            
            {/* Fecha y notas */}
            <GroupedList title="Otros" className="px-4 mb-8">
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
              
              <div className="px-4 py-3">
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Notas (opcional)"
                  rows={2}
                  className={cn(
                    'w-full bg-transparent text-[17px]',
                    'placeholder:text-gray-400',
                    'focus:outline-none resize-none'
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

// Segmented Control interno
interface SegmentedControlProps<T> {
  options: { value: T; label: string; emoji?: string }[]
  value: T
  onChange: (value: T) => void
}

function SegmentedControl<T>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex bg-gray-200/70 dark:bg-gray-800 rounded-lg p-[3px]">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium',
            'transition-all duration-150',
            value === option.value
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {option.emoji && <span className="mr-1">{option.emoji}</span>}
          {option.label}
        </button>
      ))}
    </div>
  )
}
