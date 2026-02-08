'use client'

import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface GroupedListProps {
  children: React.ReactNode
  title?: string
  footer?: string
  className?: string
}

/**
 * Lista agrupada estilo neumórfico
 * - Fondo beige, grupos con sombras suaves
 * - Separadores sutiles entre items
 */
export function GroupedList({ children, title, footer, className }: GroupedListProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {title && (
        <h3 className="px-4 pb-1 text-[13px] text-[var(--text-secondary)] uppercase tracking-wide">
          {title}
        </h3>
      )}
      <div className="rounded-neu-lg overflow-hidden divide-y divide-[var(--separator)] shadow-neu-sm"
           style={{ background: 'var(--surface-elevated)' }}>
        {children}
      </div>
      {footer && (
        <p className="px-4 pt-1 text-[13px] text-[var(--text-secondary)]">
          {footer}
        </p>
      )}
    </div>
  )
}

interface GroupedListItemProps {
  children: React.ReactNode
  onClick?: () => void
  showChevron?: boolean
  destructive?: boolean
  className?: string
  leftIcon?: React.ReactNode
  rightContent?: React.ReactNode
}

/**
 * Item de lista agrupada
 * - Touch target minimo 44pt
 * - Chevron opcional para navegación
 */
export function GroupedListItem({
  children,
  onClick,
  showChevron = false,
  destructive = false,
  className,
  leftIcon,
  rightContent
}: GroupedListItemProps) {
  const isClickable = !!onClick

  const Component = isClickable ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        // Base
        'w-full flex items-center gap-3 px-4 min-h-[44px] py-3',
        'text-left text-[17px]',
        // Clickable styles
        isClickable && [
          'active:bg-[var(--background-dark)]',
          'transition-colors duration-75'
        ],
        // Destructive
        destructive && 'text-negative',
        className
      )}
    >
      {leftIcon && (
        <span className="flex-shrink-0 w-7 text-center">
          {leftIcon}
        </span>
      )}
      <span className="flex-1 min-w-0">
        {children}
      </span>
      {rightContent && (
        <span className="flex-shrink-0 text-[var(--text-muted)]">
          {rightContent}
        </span>
      )}
      {showChevron && !rightContent && (
        <ChevronRight className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
      )}
    </Component>
  )
}

interface GroupedListCellProps {
  label: string
  value?: string | React.ReactNode
  onClick?: () => void
  showChevron?: boolean
  leftIcon?: React.ReactNode
  className?: string
}

/**
 * Cell con label y valor
 * Label a la izquierda, valor a la derecha
 */
export function GroupedListCell({
  label,
  value,
  onClick,
  showChevron,
  leftIcon,
  className
}: GroupedListCellProps) {
  return (
    <GroupedListItem
      onClick={onClick}
      showChevron={showChevron}
      leftIcon={leftIcon}
      rightContent={value ? (
        <span className="text-[var(--text-secondary)] text-[17px]">{value}</span>
      ) : undefined}
      className={className}
    >
      {label}
    </GroupedListItem>
  )
}

interface GroupedListToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  leftIcon?: React.ReactNode
  disabled?: boolean
}

/**
 * Toggle switch estilo neumórfico
 */
export function GroupedListToggle({
  label,
  checked,
  onChange,
  leftIcon,
  disabled = false
}: GroupedListToggleProps) {
  return (
    <GroupedListItem
      leftIcon={leftIcon}
      rightContent={
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative w-[51px] h-[31px] rounded-full transition-all duration-200',
            checked
              ? 'shadow-neu-sm'
              : 'shadow-neu-inset-sm',
            disabled && 'opacity-50'
          )}
          style={{
            background: checked
              ? 'linear-gradient(145deg, var(--positive), var(--positive-dark))'
              : 'var(--background)'
          }}
        >
          <span
            className={cn(
              'absolute top-[2px] left-[2px] w-[27px] h-[27px]',
              'rounded-full shadow-neu-sm',
              'transition-transform duration-200'
            )}
            style={{ background: 'var(--surface-elevated)' }}
          />
          <span
            className={cn(
              'absolute top-[2px] left-[2px] w-[27px] h-[27px]',
              'rounded-full shadow-neu-sm',
              'transition-transform duration-200',
              checked && 'translate-x-[20px]'
            )}
            style={{ background: 'var(--surface-elevated)' }}
          />
        </button>
      }
    >
      {label}
    </GroupedListItem>
  )
}
