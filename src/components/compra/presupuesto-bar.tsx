'use client'

import { centimosToEuros } from '@/types/compra'

interface PresupuestoBarProps {
  gastado: number // céntimos
  presupuesto: number // céntimos
}

export function PresupuestoBar({ gastado, presupuesto }: PresupuestoBarProps) {
  const porcentaje = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0
  const restante = presupuesto - gastado
  
  // Color según porcentaje
  const getColor = () => {
    if (porcentaje > 100) return 'bg-red-500'
    if (porcentaje >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  
  const getTextColor = () => {
    if (porcentaje > 100) return 'text-red-600'
    if (porcentaje >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }
  
  return (
    <div className="p-4 bg-surface rounded-2xl border border-[var(--separator)]">
      {/* Texto */}
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <span className="text-2xl font-bold">{centimosToEuros(gastado)}€</span>
          <span className="text-[var(--text-secondary)]"> de {centimosToEuros(presupuesto)}€</span>
        </div>
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {restante >= 0 
            ? `${centimosToEuros(restante)}€ restantes`
            : `${centimosToEuros(Math.abs(restante))}€ excedido`
          }
        </span>
      </div>
      
      {/* Barra */}
      <div className="h-3 bg-[var(--separator)] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${Math.min(porcentaje, 100)}%` }}
        />
      </div>
      
      {/* Porcentaje */}
      <div className="mt-1 text-right">
        <span className={`text-xs font-medium ${getTextColor()}`}>
          {Math.round(porcentaje)}%
        </span>
      </div>
    </div>
  )
}
