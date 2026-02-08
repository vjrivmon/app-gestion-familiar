'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MonthPickerProps {
  value: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Selector de mes con flechas - estilo neumórfico
 * Muestra "Febrero 2026" con navegación lateral
 */
export function MonthPicker({
  value,
  onChange,
  minDate,
  maxDate,
  className,
  size = 'md'
}: MonthPickerProps) {
  const mes = value.getMonth()
  const año = value.getFullYear()

  // Comprobar limites
  const canGoPrev = !minDate || (
    año > minDate.getFullYear() ||
    (año === minDate.getFullYear() && mes > minDate.getMonth())
  )

  const canGoNext = !maxDate || (
    año < maxDate.getFullYear() ||
    (año === maxDate.getFullYear() && mes < maxDate.getMonth())
  )

  // Es el mes actual
  const ahora = new Date()
  const esActual = mes === ahora.getMonth() && año === ahora.getFullYear()

  const handlePrev = () => {
    if (!canGoPrev) return
    onChange(new Date(año, mes - 1, 1))
  }

  const handleNext = () => {
    if (!canGoNext) return
    onChange(new Date(año, mes + 1, 1))
  }

  const handleToday = () => {
    onChange(new Date(ahora.getFullYear(), ahora.getMonth(), 1))
  }

  // Formato del mes
  const nombreMes = value.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  })
  // Capitalizar primera letra
  const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm min-w-[120px]'
    },
    md: {
      container: 'gap-3',
      button: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-base min-w-[150px]'
    },
    lg: {
      container: 'gap-4',
      button: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-lg font-semibold min-w-[180px]'
    }
  }

  const s = sizeClasses[size]

  return (
    <div className={cn(
      'flex items-center justify-center',
      s.container,
      className
    )}>
      {/* Boton anterior */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canGoPrev}
        className={cn(
          'flex items-center justify-center rounded-full',
          'transition-all duration-150',
          'disabled:opacity-30 disabled:cursor-not-allowed',
          'active:scale-95',
          s.button
        )}
        style={{
          background: 'var(--background)',
          boxShadow: 'var(--shadow-neu-sm)'
        }}
        aria-label="Mes anterior"
      >
        <ChevronLeft className={cn(s.icon, 'text-[var(--text-primary)]')} />
      </button>

      {/* Mes y año */}
      <button
        type="button"
        onClick={handleToday}
        disabled={esActual}
        className={cn(
          'text-center font-medium px-4 py-2 rounded-full',
          'active:scale-95 transition-all duration-150',
          'disabled:opacity-100',
          s.text
        )}
        style={{
          background: 'var(--background)',
          boxShadow: 'var(--shadow-neu-sm)',
          color: 'var(--text-primary)'
        }}
        title={esActual ? 'Mes actual' : 'Ir al mes actual'}
      >
        {nombreMesCapitalizado}
        {esActual && (
          <span className="ml-2 text-xs text-primary">*</span>
        )}
      </button>

      {/* Boton siguiente */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext}
        className={cn(
          'flex items-center justify-center rounded-full',
          'transition-all duration-150',
          'disabled:opacity-30 disabled:cursor-not-allowed',
          'active:scale-95',
          s.button
        )}
        style={{
          background: 'var(--background)',
          boxShadow: 'var(--shadow-neu-sm)'
        }}
        aria-label="Mes siguiente"
      >
        <ChevronRight className={cn(s.icon, 'text-[var(--text-primary)]')} />
      </button>
    </div>
  )
}

/**
 * Version inline (sin botones, solo texto clicable)
 */
interface MonthPickerInlineProps {
  value: Date
  onPrev: () => void
  onNext: () => void
  onToday?: () => void
  canGoPrev?: boolean
  canGoNext?: boolean
  className?: string
}

export function MonthPickerInline({
  value,
  onPrev,
  onNext,
  onToday,
  canGoPrev = true,
  canGoNext = true,
  className
}: MonthPickerInlineProps) {
  const nombreMes = value.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  })
  const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="p-2 -ml-2 disabled:opacity-30 rounded-full active:scale-95 transition-transform"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-6 h-6 text-[var(--text-primary)]" />
      </button>

      <button
        type="button"
        onClick={onToday}
        className="text-lg font-semibold active:opacity-70 text-[var(--text-primary)]"
      >
        {nombreMesCapitalizado}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="p-2 -mr-2 disabled:opacity-30 rounded-full active:scale-95 transition-transform"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-6 h-6 text-[var(--text-primary)]" />
      </button>
    </div>
  )
}
