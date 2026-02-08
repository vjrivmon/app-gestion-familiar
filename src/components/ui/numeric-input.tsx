'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { formatMoney, parseMoney, formatForInput } from '@/lib/utils/money'
import { cn } from '@/lib/utils'

interface NumericInputProps {
  value: number  // centimos
  onChange: (cents: number) => void
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
  className?: string
  showCurrency?: boolean  // Mostrar EUR al final
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Input numerico para dinero - estilo neumórfico
 * - Almacena internamente en centimos (integers)
 * - Muestra formateado con coma decimal
 * - Teclado numerico en móvil
 */
export function NumericInput({
  value,
  onChange,
  placeholder = '0,00',
  autoFocus = false,
  disabled = false,
  className,
  showCurrency = true,
  size = 'md'
}: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Estado interno para el texto mientras se edita
  const [displayValue, setDisplayValue] = useState(() => formatForInput(value))
  const [isFocused, setIsFocused] = useState(false)

  // Sincronizar con valor externo (solo cuando no esta enfocado)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForInput(value))
    }
  }, [value, isFocused])

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    // Seleccionar todo el texto al enfocar
    setTimeout(() => {
      inputRef.current?.select()
    }, 0)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Parsear y notificar el valor final
    const cents = parseMoney(displayValue)
    onChange(cents)
    setDisplayValue(formatForInput(cents))
  }, [displayValue, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value

    // Permitir solo numeros, coma y punto
    input = input.replace(/[^0-9,.\s]/g, '')

    // Limitar a un solo separador decimal
    const parts = input.split(/[,.]/)
    if (parts.length > 2) {
      input = parts[0] + ',' + parts.slice(1).join('')
    }

    // Limitar decimales a 2
    if (parts.length === 2 && parts[1].length > 2) {
      input = parts[0] + ',' + parts[1].slice(0, 2)
    }

    setDisplayValue(input)

    // Notificar cambio en tiempo real (para feedback inmediato)
    const cents = parseMoney(input)
    if (!isNaN(cents)) {
      onChange(cents)
    }
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Enter = blur
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }, [])

  const sizeClasses = {
    sm: 'h-9 text-sm px-3',
    md: 'h-11 text-base px-4',
    lg: 'h-14 text-lg px-5 font-semibold'
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"  // Teclado numerico con coma/punto en movil
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          // Base - estilo neumórfico inset
          'w-full rounded-neu-md',
          'transition-all duration-150',
          'placeholder:text-[var(--text-muted)]',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Size
          sizeClasses[size],
          // Padding derecho para el simbolo
          showCurrency && 'pr-8',
          className
        )}
        style={{
          background: 'var(--background)',
          color: 'var(--text-primary)',
          boxShadow: isFocused ? 'var(--shadow-neu-inset), 0 0 0 2px var(--primary-light)' : 'var(--shadow-neu-inset-sm)',
          border: 'none',
          outline: 'none'
        }}
      />
      {showCurrency && (
        <span className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none',
          size === 'lg' && 'text-lg'
        )}>
          EUR
        </span>
      )}
    </div>
  )
}
