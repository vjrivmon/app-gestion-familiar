'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { formatMoney, parseMoney, formatForInput } from '@/lib/utils/money'
import { cn } from '@/lib/utils'

interface NumericInputProps {
  value: number  // céntimos
  onChange: (cents: number) => void
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
  className?: string
  showCurrency?: boolean  // Mostrar € al final
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Input numérico para dinero
 * - Almacena internamente en céntimos (integers)
 * - Muestra formateado con coma decimal
 * - Teclado numérico en móvil
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

  // Sincronizar con valor externo (solo cuando no está enfocado)
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
    
    // Permitir solo números, coma y punto
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
    sm: 'h-9 text-sm px-2',
    md: 'h-11 text-base px-3',
    lg: 'h-14 text-lg px-4 font-semibold'
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"  // Teclado numérico con coma/punto en móvil
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          // Base
          'w-full rounded-lg border border-gray-200 bg-white',
          'transition-colors duration-150',
          'placeholder:text-gray-400',
          // Focus
          'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
          // Disabled
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          // Dark mode
          'dark:bg-surface dark:border-gray-700 dark:text-white',
          // Size
          sizeClasses[size],
          // Padding derecho para el símbolo
          showCurrency && 'pr-8',
          className
        )}
      />
      {showCurrency && (
        <span className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
          size === 'lg' && 'text-lg'
        )}>
          €
        </span>
      )}
    </div>
  )
}
