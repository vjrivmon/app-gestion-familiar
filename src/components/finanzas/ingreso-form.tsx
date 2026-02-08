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
  Ingreso,
  Pagador,
  TipoDinero,
  CategoriaIngreso
} from '@/types/finanzas'

interface IngresoFormData {
  concepto: string
  importe: number
  categoria: CategoriaIngreso
  destinatario: Pagador
  tipo_dinero: TipoDinero
  es_fijo: boolean
  es_proyectado: boolean
  fecha: string
  notas: string
}

interface IngresoFormProps {
  open: boolean
  onClose: () => void
  ingreso?: Ingreso
  onSave: (data: IngresoFormData) => Promise<void>
}

const TIPO_DINERO_OPTIONS = [
  { value: 'efectivo' as TipoDinero, label: 'Efectivo', emoji: '' },
  { value: 'digital' as TipoDinero, label: 'Digital', emoji: '' }
]

const TIPO_INGRESO_OPTIONS = [
  { value: false, label: 'Variable' },
  { value: true, label: 'Fijo' }
]

export function IngresoForm({ open, onClose, ingreso, onSave }: IngresoFormProps) {
  const isEditing = !!ingreso

  const [importe, setImporte] = useState(0)
  const [concepto, setConcepto] = useState('')
  const [categoria, setCategoria] = useState<CategoriaIngreso>('nomina')
  const [destinatario, setDestinatario] = useState<Pagador>('m1')
  const [tipoDinero, setTipoDinero] = useState<TipoDinero>('digital')
  const [esFijo, setEsFijo] = useState(false)
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState('')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (ingreso) {
        setImporte(ingreso.importe)
        setConcepto(ingreso.concepto)
        setCategoria(ingreso.categoria)
        setDestinatario(ingreso.destinatario)
        setTipoDinero(ingreso.tipo_dinero)
        setEsFijo(ingreso.es_fijo)
        setFecha(ingreso.fecha)
        setNotas(ingreso.notas || '')
      } else {
        setImporte(0)
        setConcepto('')
        setCategoria('nomina')
        setDestinatario('m1')
        setTipoDinero('digital')
        setEsFijo(false)
        setFecha(new Date().toISOString().split('T')[0])
        setNotas('')
      }
    }
  }, [open, ingreso])

  const isValid = importe > 0 && concepto.trim() !== ''

  const handleSave = async () => {
    if (!isValid || saving) return

    setSaving(true)
    try {
      await onSave({
        concepto: concepto.trim(),
        importe,
        categoria,
        destinatario,
        tipo_dinero: tipoDinero,
        es_fijo: esFijo,
        es_proyectado: false,
        fecha,
        notas: notas.trim()
      })
      onClose()
    } catch (err) {
      console.error('Error saving ingreso:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'rounded-t-neu-xl',
            'h-[95vh] max-h-[95vh]',
            'flex flex-col',
            'outline-none'
          )}
          style={{ background: 'var(--background)' }}
        >
          {/* Handle */}
          <div className="flex justify-center py-4 flex-shrink-0">
            <div
              className="w-12 h-1.5 rounded-full"
              style={{
                background: 'var(--background)',
                boxShadow: 'var(--shadow-neu-inset-sm)'
              }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:scale-95 transition-transform"
            >
              <X className="w-6 h-6 text-[var(--text-secondary)]" />
            </button>

            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {isEditing ? 'Editar ingreso' : 'Nuevo ingreso'}
            </h2>

            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className={cn(
                'px-5 py-2 -mr-2 rounded-full font-semibold text-sm',
                'transition-all duration-150',
                'active:scale-95'
              )}
              style={{
                background: isValid && !saving
                  ? 'linear-gradient(145deg, var(--positive), var(--positive-dark))'
                  : 'var(--background)',
                color: isValid && !saving ? 'var(--text-inverse)' : 'var(--text-muted)',
                boxShadow: isValid && !saving ? 'var(--shadow-neu-sm)' : 'var(--shadow-neu-inset-sm)',
                cursor: isValid && !saving ? 'pointer' : 'not-allowed'
              }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Importe destacado */}
            <div
              className="mx-4 mb-4 p-6 rounded-neu-lg"
              style={{
                background: 'var(--background)',
                boxShadow: 'var(--shadow-neu-md)'
              }}
            >
              <label className="block text-sm text-[var(--text-secondary)] mb-2 text-center">
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
                <p className="text-center text-sm text-positive mt-2 font-medium">
                  +{formatMoney(importe)}
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
                    'placeholder:text-[var(--text-muted)]',
                    'focus:outline-none'
                  )}
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              {/* Categoria */}
              <GroupedListCell
                label="Categoria"
                value={
                  <CategoriaPicker
                    tipo="ingreso"
                    value={categoria}
                    onChange={(c) => setCategoria(c as CategoriaIngreso)}
                  />
                }
              />

              {/* Destinatario */}
              <div className="px-4 py-3">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Destinatario
                </label>
                <PersonaPicker
                  value={destinatario}
                  onChange={setDestinatario}
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

            {/* Tipo de ingreso */}
            <GroupedList title="Tipo de ingreso" className="px-4 mb-4">
              <div className="px-4 py-3">
                <SegmentedControl
                  options={TIPO_INGRESO_OPTIONS}
                  value={esFijo}
                  onChange={setEsFijo}
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
                    'bg-transparent text-[var(--text-secondary)] text-[17px]',
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
                    'placeholder:text-[var(--text-muted)]',
                    'focus:outline-none resize-none'
                  )}
                  style={{ color: 'var(--text-primary)' }}
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

// Segmented Control neumórfico
interface SegmentedControlProps<T> {
  options: { value: T; label: string; emoji?: string }[]
  value: T
  onChange: (value: T) => void
}

function SegmentedControl<T>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div
      className="flex rounded-full p-1"
      style={{
        background: 'var(--background)',
        boxShadow: 'var(--shadow-neu-inset-sm)'
      }}
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 py-2 px-3 rounded-full text-sm font-medium',
            'transition-all duration-150'
          )}
          style={{
            background: value === option.value
              ? 'linear-gradient(145deg, var(--primary), var(--primary-dark))'
              : 'transparent',
            color: value === option.value ? 'var(--text-inverse)' : 'var(--text-secondary)',
            boxShadow: value === option.value ? 'var(--shadow-neu-sm)' : 'none'
          }}
        >
          {option.emoji && <span className="mr-1">{option.emoji}</span>}
          {option.label}
        </button>
      ))}
    </div>
  )
}
