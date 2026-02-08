// =============================================
// App de Pus - Tipos de Configuración
// =============================================

import type { Pagador } from "./finanzas";

// Saldos iniciales para cada persona
export interface SaldosIniciales {
  m1: {
    efectivo: number; // céntimos
    digital: number; // céntimos
  };
  m2: {
    efectivo: number; // céntimos
    digital: number; // céntimos
  };
  conjunta: {
    efectivo: number; // céntimos
    digital: number; // céntimos
  };
}

// Configuración del objetivo de compra de piso
export interface ConfigCompraPiso {
  activo: boolean;
  objetivo_total: number; // céntimos - objetivo total a ahorrar
  objetivo_mensual: number; // céntimos - cuánto ahorrar cada mes
  fecha_objetivo?: string; // ISO date - cuándo quieren comprar
  porcentaje_aporte: {
    m1: number; // 0-100
    m2: number; // 0-100
  };
}

// Gastos fijos mensuales
export interface GastoFijo {
  concepto: string;
  importe: number; // céntimos
  categoria: string;
  pagador: Pagador;
  dia_mes: number; // 1-31, día del mes en que se cobra
}

// Ingresos fijos mensuales
export interface IngresoFijo {
  concepto: string;
  importe: number; // céntimos
  categoria: string;
  destinatario: Pagador;
  dia_mes: number; // 1-31, día del mes en que se recibe
}

// Configuración general del hogar
export interface ConfigHogar {
  // Nombres personalizados para m1 y m2
  nombres: {
    m1: string;
    m2: string;
  };

  // Saldos iniciales (se establecen una vez al empezar)
  saldos_iniciales?: SaldosIniciales;
  fecha_saldos_iniciales?: string; // ISO date

  // Objetivo de compra de piso
  compra_piso?: ConfigCompraPiso;

  // Gastos fijos mensuales (alquiler, suministros, etc.)
  gastos_fijos?: GastoFijo[];

  // Ingresos fijos mensuales (nóminas)
  ingresos_fijos?: IngresoFijo[];

  // Presupuesto mensual por categoría (opcional)
  presupuestos?: {
    [categoria: string]: number; // céntimos
  };

  // Preferencias de la app
  preferencias?: {
    moneda: string; // default 'EUR'
    primer_dia_semana: 0 | 1; // 0 = Domingo, 1 = Lunes
    notificaciones: boolean;
  };
}

// Default config
export const CONFIG_HOGAR_DEFAULT: ConfigHogar = {
  nombres: {
    m1: "Vicente",
    m2: "Irene",
  },
  preferencias: {
    moneda: "EUR",
    primer_dia_semana: 1, // Lunes
    notificaciones: true,
  },
};

// Helper para obtener nombre de un pagador
export function getNombrePagador(
  config: ConfigHogar | null | undefined,
  pagador: Pagador,
): string {
  if (pagador === "conjunta") return "Conjunta";
  if (!config?.nombres) {
    return pagador === "m1" ? "Vicente" : "Irene";
  }
  return config.nombres[pagador];
}
