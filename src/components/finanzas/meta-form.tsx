'use client'

import { useState, useEffect } from 'react'
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { NumericInput } from '@/components/ui/numeric-input'
import { GroupedList, GroupedListCell } from '@/components/ui/grouped-list'
import type { Meta } from '@/types/finanzas'

interface MetaFormData {
  nombre: string
  objetivo: number  // céntimos
  color: string
  fecha_limite?: string  // YYYY-MM-DD
}

interface MetaFormProps {
  open: boolean
  onClose: () => void
  meta?: Meta  // Si se pasa, es modo edición
  onSave: (data: MetaFormData) => Promise<void>
}

const COLORES: { value: string; label: string; class: string }[] = [
  { value: '#3B82F6', label: 'Azul', class: 'bg-blue-500' },
  { value: '#10B981', label: 'Verde', class: 'bg-green-500' },
  { value: '#8B5CF6', label: 'Púrpura', class: 'bg-purple-500' },
  { value: '#F59E0B', label: 'Naranja', class: 'bg-amber-500' },
  { value: '#EF4444', label: 'Rojo', class: 'bg-red-500' },
  { value: '#EC4899', label: 'Rosa', class: 'bg-pink-500' },
  { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#6B7280', label: 'Gris', class: 'bg-gray-500' },
]

export function MetaForm({ open, onClose, meta, onSave }: MetaFormProps) {
  const isEditing = !!meta
  
  // Estado del formulario
  const [nombre, setNombre] = useState('')
  const [objetivo, setObjetivo] = useState(0)
  const [color, setColor] = useState('#3B82F6')
  const [fechaLimite, setFechaLimite] = useState('')
  const [usarFechaLimite, setUsarFechaLimite] = useState(false)
  
  const [saving, setSaving] = useState(false)
  
  // Resetear al abrir/cerrar o cambiar meta
  useEffect(() => {
    if (open) {
      if (meta) {
        // Modo edición: cargar datos
        setNombre(meta.nombre)
        setObjetivo(meta.objetivo)
        setColor(meta.color)
        setFechaLimite(meta.fecha_limite || '')
        setUsarFechaLimite(!!meta.fecha_limite)
      } else {
        // Modo creación: valores por defecto
        setNombre('')
        setObjetivo(0)
        setColor('#3B82F6')
        setFechaLimite('')
        setUsarFechaLimite(false)
      }
    }
  }, [open, meta])
  
  // Validación
  const isValid = objetivo > 0 && nombre.trim() !== ''
  
  // Guardar
  const handleSave = async () => {
    if (!isValid || saving) return
    
    setSaving(true)
    try {
      await onSave({
        nombre: nombre.trim(),
        objetivo,
        color,
        fecha_limite: usarFechaLimite && fechaLimite ? fechaLimite : undefined
      })
      onClose()
    } catch (err) {
      console.error('Error saving meta:', err)
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
              {isEditing ? 'Editar meta' : 'Nueva meta'}
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
            {/* Preview de la meta */}
            <div className="bg-surface px-4 py-6 mb-4">
              <div className="max-w-xs mx-auto">
                {/* Mini preview card */}
                <div
                  className="p-4 rounded-xl shadow-sm border border-[var(--separator)]"
                  style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
                >
                  <p className="font-semibold text-lg mb-2">
                    {nombre || 'Mi meta de ahorro'}
                  </p>
                  <div className="h-3 bg-[var(--border)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        backgroundColor: color, 
                        width: isEditing && meta ? `${Math.min(100, (meta.actual / objetivo) * 100)}%` : '0%' 
                      }}
                    />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    0€ / {objetivo > 0 ? formatMoney(objetivo, false) : '0,00'}€
                  </p>
                </div>
              </div>
            </div>
            
            {/* Objetivo */}
            <GroupedList title="Objetivo de ahorro" className="px-4 mb-4">
              <div className="px-4 py-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  ¿Cuánto quieres ahorrar?
                </label>
                <NumericInput
                  value={objetivo}
                  onChange={setObjetivo}
                  size="lg"
                  autoFocus
                  className="text-xl font-bold"
                />
              </div>
            </GroupedList>
            
            {/* Detalles */}
            <GroupedList title="Detalles" className="px-4 mb-4">
              {/* Nombre */}
              <div className="px-4 py-3">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre de la meta (ej: Vacaciones)"
                  className={cn(
                    'w-full bg-transparent text-[17px]',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:outline-none'
                  )}
                />
              </div>
            </GroupedList>
            
            {/* Color */}
            <GroupedList title="Color" className="px-4 mb-4">
              <div className="px-4 py-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  {COLORES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        'w-10 h-10 rounded-full transition-all',
                        c.class,
                        color === c.value 
                          ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                          : 'opacity-70 hover:opacity-100'
                      )}
                      aria-label={c.label}
                    />
                  ))}
                </div>
              </div>
            </GroupedList>
            
            {/* Fecha límite */}
            <GroupedList title="Fecha límite (opcional)" className="px-4 mb-4">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[17px]">Usar fecha límite</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={usarFechaLimite}
                  onClick={() => setUsarFechaLimite(!usarFechaLimite)}
                  className={cn(
                    'relative w-[51px] h-[31px] rounded-full transition-colors duration-200',
                    usarFechaLimite ? 'bg-green-500' : 'bg-[var(--text-muted)]'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-[2px] left-[2px] w-[27px] h-[27px]',
                      'bg-surface rounded-full shadow-sm',
                      'transition-transform duration-200',
                      usarFechaLimite && 'translate-x-[20px]'
                    )}
                  />
                </button>
              </div>
              
              {usarFechaLimite && (
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[17px]">Fecha</span>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={cn(
                      'bg-transparent text-[var(--text-secondary)] text-[17px]',
                      'focus:outline-none'
                    )}
                  />
                </div>
              )}
            </GroupedList>
            
            {/* Safe area padding */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
