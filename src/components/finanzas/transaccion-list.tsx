'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { NOMBRES, type Pagador } from '@/types/finanzas'
import { PersonaAvatar } from './persona-picker'
import { TransaccionItem, TransaccionItemSkeleton } from './transaccion-item'
import type { Ingreso, Gasto } from '@/types/finanzas'

type TransaccionTipo = 'ingreso' | 'gasto'
type TransaccionData = Ingreso | Gasto

interface TransaccionListProps {
  tipo: TransaccionTipo
  items: TransaccionData[]
  loading?: boolean
  onEdit: (item: TransaccionData) => void
  onDelete: (id: string) => void
}

/**
 * Lista de transacciones agrupada por persona
 * Vicente → items de m1
 * Irene → items de m2
 * Conjunta → items de conjunta
 */
export function TransaccionList({ 
  tipo, 
  items, 
  loading, 
  onEdit, 
  onDelete 
}: TransaccionListProps) {
  // Agrupar por persona
  const grupos = useMemo(() => {
    const agrupados: Record<Pagador, TransaccionData[]> = {
      m1: [],
      m2: [],
      conjunta: []
    }
    
    items.forEach(item => {
      // destinatario para ingresos, pagador para gastos
      const persona = tipo === 'ingreso' 
        ? (item as Ingreso).destinatario 
        : (item as Gasto).pagador
      
      agrupados[persona].push(item)
    })
    
    return agrupados
  }, [items, tipo])
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-surface rounded-xl overflow-hidden">
          <TransaccionItemSkeleton />
          <TransaccionItemSkeleton />
        </div>
        <div className="bg-white dark:bg-surface rounded-xl overflow-hidden">
          <TransaccionItemSkeleton />
        </div>
      </div>
    )
  }
  
  // Empty state
  if (items.length === 0) {
    return <EmptyState tipo={tipo} />
  }
  
  // Orden de grupos a mostrar
  const personasOrden: Pagador[] = ['m1', 'm2', 'conjunta']
  const gruposConItems = personasOrden.filter(p => grupos[p].length > 0)
  
  return (
    <div className="space-y-4">
      {gruposConItems.map(persona => (
        <PersonaGroup
          key={persona}
          persona={persona}
          items={grupos[persona]}
          tipo={tipo}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface PersonaGroupProps {
  persona: Pagador
  items: TransaccionData[]
  tipo: TransaccionTipo
  onEdit: (item: TransaccionData) => void
  onDelete: (id: string) => void
}

function PersonaGroup({ persona, items, tipo, onEdit, onDelete }: PersonaGroupProps) {
  const total = useMemo(() => 
    items.reduce((sum, i) => sum + i.importe, 0),
    [items]
  )
  
  return (
    <div>
      {/* Header de grupo */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2">
          <PersonaAvatar persona={persona} size="sm" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {NOMBRES[persona]}
          </span>
        </div>
        <span className={cn(
          'text-sm font-semibold tabular-nums',
          tipo === 'ingreso' ? 'text-positive' : 'text-negative'
        )}>
          {tipo === 'ingreso' ? '+' : '-'}{formatMoney(total)}
        </span>
      </div>
      
      {/* Items */}
      <div className="bg-white dark:bg-surface rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        {items.map(item => (
          <TransaccionItem
            key={item.id}
            tipo={tipo}
            data={item}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  tipo: TransaccionTipo
}

function EmptyState({ tipo }: EmptyStateProps) {
  const Icon = tipo === 'ingreso' ? TrendingUp : TrendingDown
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center mb-4',
        tipo === 'ingreso' 
          ? 'bg-green-100 dark:bg-green-900/30'
          : 'bg-red-100 dark:bg-red-900/30'
      )}>
        <Icon className={cn(
          'w-8 h-8',
          tipo === 'ingreso' 
            ? 'text-green-500'
            : 'text-red-500'
        )} />
      </div>
      
      <p className="text-gray-500 text-center mb-2">
        No hay {tipo === 'ingreso' ? 'ingresos' : 'gastos'} este mes
      </p>
      
      <p className="text-sm text-gray-400 text-center">
        Pulsa el botón + para añadir uno
      </p>
    </div>
  )
}

/**
 * Resumen de totales (físico + digital)
 */
interface ResumenTotalesProps {
  tipo: TransaccionTipo
  totalMes: number
  totalFisico: number
  totalDigital: number
}

export function ResumenTotales({ tipo, totalMes, totalFisico, totalDigital }: ResumenTotalesProps) {
  const isIngreso = tipo === 'ingreso'
  
  return (
    <div className={cn(
      'rounded-xl p-4 mb-4',
      isIngreso 
        ? 'bg-green-50 dark:bg-green-900/20'
        : 'bg-red-50 dark:bg-red-900/20'
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total {isIngreso ? 'ingresos' : 'gastos'}
        </span>
        <span className={cn(
          'text-2xl font-bold tabular-nums',
          isIngreso ? 'text-positive' : 'text-negative'
        )}>
          {isIngreso ? '+' : '-'}{formatMoney(totalMes)}
        </span>
      </div>
      
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💵</span>
          <div>
            <p className="text-xs text-gray-500">Efectivo</p>
            <p className="text-sm font-medium tabular-nums">
              {formatMoney(totalFisico)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <div>
            <p className="text-xs text-gray-500">Digital</p>
            <p className="text-sm font-medium tabular-nums">
              {formatMoney(totalDigital)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
