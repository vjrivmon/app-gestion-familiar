// =============================================
// App de Pus - Utilidades de Dinero
// Todas las cantidades se almacenan en céntimos (integers)
// =============================================

/**
 * Formatea céntimos a string con formato español
 * @param cents - Cantidad en céntimos (1050 = 10.50€)
 * @param showSymbol - Si mostrar el símbolo € (default: true)
 * @returns String formateado (e.g., "1.234,56€")
 */
export function formatMoney(cents: number, showSymbol = true): string {
  const euros = cents / 100
  const formatted = euros.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return showSymbol ? `${formatted}€` : formatted
}

/**
 * Formatea céntimos a string compacto (sin decimales si es entero)
 * @param cents - Cantidad en céntimos
 * @returns String formateado compacto (e.g., "1.234€" o "1.234,50€")
 */
export function formatMoneyCompact(cents: number): string {
  const euros = cents / 100
  if (Number.isInteger(euros)) {
    return euros.toLocaleString('es-ES') + '€'
  }
  return formatMoney(cents)
}

/**
 * Parsea un string de dinero a céntimos
 * Acepta formatos: "10,50" / "10.50" / "10" / "10,5" / "10€"
 * @param input - String con la cantidad
 * @returns Cantidad en céntimos (integer)
 */
export function parseMoney(input: string): number {
  if (!input || input.trim() === '') return 0
  
  // Limpiar: quitar €, espacios, puntos de miles
  let cleaned = input
    .replace(/€/g, '')
    .replace(/\s/g, '')
    .trim()
  
  // Si tiene punto Y coma, el punto es separador de miles
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    // Si solo tiene coma, es decimal
    cleaned = cleaned.replace(',', '.')
  }
  
  const euros = parseFloat(cleaned)
  if (isNaN(euros)) return 0
  
  return Math.round(euros * 100)
}

/**
 * Suma múltiples cantidades en céntimos
 */
export function addMoney(...amounts: number[]): number {
  return amounts.reduce((acc, val) => acc + val, 0)
}

/**
 * Resta cantidades: base - ...rest
 */
export function subtractMoney(base: number, ...rest: number[]): number {
  return rest.reduce((acc, val) => acc - val, base)
}

/**
 * Calcula el porcentaje de un presupuesto gastado
 * @returns Porcentaje (0-100+)
 */
export function budgetPercent(spent: number, budget: number): number {
  if (budget === 0) return spent > 0 ? 100 : 0
  return Math.round((spent / budget) * 100)
}

/**
 * Devuelve el color Tailwind según el porcentaje de presupuesto
 */
export function budgetColor(percent: number): string {
  if (percent >= 100) return 'text-red-500'
  if (percent >= 80) return 'text-orange-500'
  if (percent >= 60) return 'text-yellow-500'
  return 'text-green-500'
}

/**
 * Devuelve el color de fondo Tailwind según el porcentaje de presupuesto
 */
export function budgetBgColor(percent: number): string {
  if (percent >= 100) return 'bg-red-100'
  if (percent >= 80) return 'bg-orange-100'
  if (percent >= 60) return 'bg-yellow-100'
  return 'bg-green-100'
}

/**
 * Calcula el balance (ingresos - gastos)
 */
export function calculateBalance(ingresos: number, gastos: number): {
  balance: number
  isPositive: boolean
  color: string
} {
  const balance = ingresos - gastos
  return {
    balance,
    isPositive: balance >= 0,
    color: balance >= 0 ? 'text-green-600' : 'text-red-600'
  }
}

/**
 * Divide una cantidad entre N partes iguales (maneja céntimos sobrantes)
 * @returns Array de N cantidades que suman exactamente el total
 */
export function splitMoney(total: number, parts: number): number[] {
  if (parts <= 0) return []
  if (parts === 1) return [total]
  
  const base = Math.floor(total / parts)
  const remainder = total % parts
  
  return Array(parts).fill(base).map((val, i) => 
    i < remainder ? val + 1 : val
  )
}

/**
 * Calcula el porcentaje que representa una cantidad del total
 */
export function percentOfTotal(amount: number, total: number): number {
  if (total === 0) return 0
  return Math.round((amount / total) * 100)
}

/**
 * Formatea para input (sin símbolo, con coma decimal)
 * Útil para el valor mostrado en inputs de dinero
 */
export function formatForInput(cents: number): string {
  if (cents === 0) return ''
  const euros = cents / 100
  return euros.toFixed(2).replace('.', ',')
}
