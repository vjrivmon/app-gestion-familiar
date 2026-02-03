// =============================================
// App de Pus - Tipos de Calculadora Compra Piso
// =============================================

/**
 * Configuración extendida para la calculadora de compra de piso
 * Se guarda en hogares.config.compra_piso
 */
export interface ConfigCalculadoraPiso {
  // Datos de la vivienda
  precio_vivienda: number         // céntimos
  tipo_vivienda: 'obra_nueva' | 'segunda_mano'
  es_menor_35: boolean            // Para ITP reducido en Valencia
  porcentaje_financiacion: number // 50-100
  
  // Hipoteca
  tin_anual: number               // Porcentaje (ej: 2.5 = 2.5%)
  plazo_años: number              // 10-40
  ingresos_netos_mes: number      // céntimos
  
  // Gastos adicionales
  muebles_reformas: number        // céntimos
  colchon_emergencia: number      // céntimos
  
  // Ahorro
  ahorro_mensual_estimado: number // céntimos
}

/**
 * Resultado de los cálculos de la calculadora
 */
export interface CalculoPiso {
  // Impuestos
  impuesto_itp: number            // céntimos (2ª mano)
  impuesto_iva: number            // céntimos (obra nueva)
  impuesto_ajd: number            // céntimos (obra nueva)
  total_impuestos: number         // céntimos
  
  // Gastos compra
  gastos_notaria: number          // céntimos (~1800€)
  gastos_tasacion: number         // céntimos (400€)
  total_gastos_compra: number     // céntimos
  
  // Hipoteca
  importe_hipoteca: number        // céntimos
  entrada: number                 // céntimos
  cuota_mensual: number           // céntimos
  total_intereses: number         // céntimos (a pagar durante toda la hipoteca)
  
  // Ratio de endeudamiento
  ratio_endeudamiento: number     // 0-100 porcentaje
  estado_ratio: 'ok' | 'ajustado' | 'riesgo'
  
  // Necesidades
  total_necesario: number         // céntimos
  disponible: number              // céntimos (patrimonio)
  falta: number                   // céntimos (puede ser negativo si sobra)
  
  // Estimación
  meses_necesarios: number        // meses
  fecha_estimada: string | null   // ISO date o null si no se puede calcular
}

// Constantes
export const GASTOS_NOTARIA_REGISTRO_GESTORIA = 180000 // 1800€ en céntimos
export const GASTOS_TASACION = 40000                   // 400€ en céntimos

export const IVA_OBRA_NUEVA = 0.10     // 10%
export const AJD_VALENCIA = 0.015      // 1.5%
export const ITP_MENOR_35_VALENCIA = 0.06 // 6%
export const ITP_NORMAL = 0.10         // 10%

export const CONFIG_DEFAULT: ConfigCalculadoraPiso = {
  precio_vivienda: 0,
  tipo_vivienda: 'segunda_mano',
  es_menor_35: true,
  porcentaje_financiacion: 80,
  tin_anual: 2.5,
  plazo_años: 30,
  ingresos_netos_mes: 0,
  muebles_reformas: 500000,    // 5000€
  colchon_emergencia: 300000,  // 3000€
  ahorro_mensual_estimado: 0
}
