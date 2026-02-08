'use client'

import { useState, useEffect } from 'react'
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { NumericInput } from '@/components/ui/numeric-input'
import { GroupedList, GroupedListCell } from '@/components/ui/grouped-list'
import { PersonaPicker } from './persona-picker'
import type { Beca, Pagador, EstadoBeca } from '@/types/finanzas'

interface BecaFormData {
  concepto: string
  importe: number  // céntimos
  persona: Pagador
  estado: EstadoBeca
  num_pagos: number
  fecha_cobro?: string  // YYYY-MM-DD
}

interface BecaFormProps {
  open: boolean
  onClose: () => void
  beca?: Beca  // Si se pasa, es modo edición
  onSave: (data: BecaFormData) => Promise<void>
}

const ESTADOS: { value: EstadoBeca; label: string; emoji: string }[] = [
  { value: 'pendiente', label: 'Pendiente', emoji: '' },
  { value: 'mensual', label: 'Mensual', emoji: '' },
  { value: 'cobrada', label: 'Cobrada', emoji: '' },
]

export function BecaForm({ open, onClose, beca, onSave }: BecaFormProps) {
  const isEditing = !!beca
  
  // Estado del formulario
  const [concepto, setConcepto] = useState('')
  const [importe, setImporte] = useState(0)
  const [persona, setPersona] = useState<Pagador>('m1')
  const [estado, setEstado] = useState<EstadoBeca>('pendiente')
  const [numPagos, setNumPagos] = useState(1)
  const [fechaCobro, setFechaCobro] = useState('')
  
  const [saving, setSaving] = useState(false)
  
  // Resetear al abrir/cerrar o cambiar beca
  useEffect(() => {
    if (open) {
      if (beca) {
        // Modo edición: cargar datos
        setConcepto(beca.concepto)
        setImporte(beca.importe)
        setPersona(beca.persona)
        setEstado(beca.estado)
        setNumPagos(beca.num_pagos)
        setFechaCobro(beca.fecha_cobro || '')
      } else {
        // Modo creación: valores por defecto
        setConcepto('')
        setImporte(0)
        setPersona('m1')
        setEstado('pendiente')
        setNumPagos(1)
        setFechaCobro('')
      }
    }
  }, [open, beca])
  
  // Validación
  const isValid = importe > 0 && concepto.trim() !== '' && numPagos > 0
  
  // Guardar
  const handleSave = async () => {
    if (!isValid || saving) return
    
    setSaving(true)
    try {
      await onSave({
        concepto: concepto.trim(),
        importe,
        persona,
        estado,
        num_pagos: numPagos,
        fecha_cobro: estado === 'cobrada' ? (fechaCobro || new Date().toISOString().split('T')[0]) : undefined
      })
      onClose()
    } catch (err) {
      console.error('Error saving beca:', err)
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
            'h-[85vh] max-h-[85vh]',
            'flex flex-col',
            'outline-none'
          )}
          style={{ background: 'var(--background)' }}
        >
          {/* Handle */}
          <div className="flex justify-center py-3 flex-shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-[var(--neu-shadow-dark)]/20"
                 style={{ boxShadow: 'inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 2px var(--neu-shadow-light)' }} />
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
              {isEditing ? 'Editar beca' : 'Nueva beca'}
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
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Importe destacado */}
            <div className="bg-surface px-4 py-6 mb-4">
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
                   {formatMoney(importe)}
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
                  placeholder="Nombre de la beca o ayuda"
                  className={cn(
                    'w-full bg-transparent text-[17px]',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:outline-none'
                  )}
                />
              </div>
              
              {/* Persona */}
              <div className="px-4 py-3">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Destinatario
                </label>
                <PersonaPicker
                  value={persona}
                  onChange={setPersona}
                  includeConjunta={false}
                  variant="segmented"
                />
              </div>
              
              {/* Número de pagos */}
              <GroupedListCell 
                label="Número de pagos"
                value={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumPagos(Math.max(1, numPagos - 1))}
                      className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{numPagos}</span>
                    <button
                      type="button"
                      onClick={() => setNumPagos(numPagos + 1)}
                      className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                }
              />
            </GroupedList>
            
            {/* Estado */}
            <GroupedList title="Estado" className="px-4 mb-4">
              <div className="px-4 py-3">
                <div className="flex bg-[var(--border)] rounded-lg p-[3px]">
                  {ESTADOS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEstado(opt.value)}
                      className={cn(
                        'flex-1 py-2 px-2 rounded-md text-sm font-medium',
                        'transition-all duration-150',
                        estado === opt.value
                          ? 'bg-surface text-primary shadow-sm'
                          : 'text-[var(--text-secondary)]'
                      )}
                    >
                      <span className="mr-1">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Fecha de cobro (solo si está cobrada) */}
              {estado === 'cobrada' && (
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[17px]">Fecha de cobro</span>
                  <input
                    type="date"
                    value={fechaCobro || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFechaCobro(e.target.value)}
                    className={cn(
                      'bg-transparent text-[var(--text-secondary)] text-[17px]',
                      'focus:outline-none'
                    )}
                  />
                </div>
              )}
            </GroupedList>
            
            {/* Resumen */}
            {importe > 0 && numPagos > 1 && (
              <div className="px-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-700">
                    Total esperado: <strong>{formatMoney(importe * numPagos)}</strong>
                    <br />
                    ({numPagos} pagos de {formatMoney(importe)})
                  </p>
                </div>
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
