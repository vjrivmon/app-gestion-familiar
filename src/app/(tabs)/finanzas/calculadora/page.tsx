'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calculator, 
  Home, 
  Wallet, 
  Percent, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useCalculadoraPiso } from '@/hooks/use-calculadora-piso'
import { useConfigHogar } from '@/hooks/use-config-hogar'
import { NumericInput } from '@/components/ui/numeric-input'
import { getNombrePagador } from '@/types/config'

export default function CalculadoraPisoPage() {
  const router = useRouter()
  const { config: hogarConfig } = useConfigHogar()
  const { 
    config, 
    calculo, 
    loading, 
    saving,
    patrimonioM1,
    patrimonioM2,
    patrimonioConjunta,
    patrimonioDisponible,
    updateConfig, 
    saveConfig 
  } = useCalculadoraPiso()
  
  const nombreM1 = getNombrePagador(hogarConfig, 'm1')
  const nombreM2 = getNombrePagador(hogarConfig, 'm2')
  
  const handleSave = async () => {
    const success = await saveConfig()
    if (success) {
      // Toast o feedback visual
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-surface p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-500 active:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold">Calculadora Compra Piso</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        
        {/* ================================================== */}
        {/* SECCIÓN 1: DINERO DISPONIBLE */}
        {/* ================================================== */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Dinero Disponible</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{nombreM1}</span>
              <span className="tabular-nums font-medium">{formatMoney(patrimonioM1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{nombreM2}</span>
              <span className="tabular-nums font-medium">{formatMoney(patrimonioM2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cuenta Conjunta</span>
              <span className="tabular-nums font-medium">{formatMoney(patrimonioConjunta)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="font-semibold">TOTAL DISPONIBLE</span>
              <span className={cn(
                'text-lg font-bold tabular-nums',
                patrimonioDisponible >= 0 ? 'text-positive' : 'text-negative'
              )}>
                {formatMoney(patrimonioDisponible)}
              </span>
            </div>
          </div>
        </div>
        
        {/* ================================================== */}
        {/* SECCIÓN 2: DATOS DE LA VIVIENDA */}
        {/* ================================================== */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Datos de la Vivienda</h2>
          </div>
          
          <div className="space-y-4">
            {/* Precio vivienda */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Precio vivienda
              </label>
              <NumericInput
                value={config.precio_vivienda}
                onChange={(v) => updateConfig({ precio_vivienda: v })}
                size="lg"
                placeholder="150.000,00"
              />
            </div>
            
            {/* Tipo vivienda */}
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Tipo de vivienda
              </label>
              <div className="flex bg-gray-200/70 dark:bg-gray-800 rounded-lg p-[2px]">
                <button
                  onClick={() => updateConfig({ tipo_vivienda: 'obra_nueva' })}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                    config.tipo_vivienda === 'obra_nueva'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  Obra Nueva
                </button>
                <button
                  onClick={() => updateConfig({ tipo_vivienda: 'segunda_mano' })}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                    config.tipo_vivienda === 'segunda_mano'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  2ª Mano
                </button>
              </div>
            </div>
            
            {/* Menor de 35 (solo 2ª mano) */}
            {config.tipo_vivienda === 'segunda_mano' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">¿Menor de 35 años?</span>
                  <p className="text-xs text-gray-500">ITP reducido al 6% en Valencia</p>
                </div>
                <button
                  onClick={() => updateConfig({ es_menor_35: !config.es_menor_35 })}
                  className={cn(
                    'w-12 h-7 rounded-full transition-colors relative',
                    config.es_menor_35 ? 'bg-positive' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
                      config.es_menor_35 ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            )}
            
            {/* % Financiación */}
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Financiación: <span className="font-semibold text-foreground">{config.porcentaje_financiacion}%</span>
              </label>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={config.porcentaje_financiacion}
                onChange={(e) => updateConfig({ porcentaje_financiacion: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-accent"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* ================================================== */}
        {/* SECCIÓN 3: GASTOS DE COMPRA */}
        {/* ================================================== */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Percent className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Gastos de Compra</h2>
          </div>
          
          <div className="space-y-2">
            {/* Impuestos */}
            {config.tipo_vivienda === 'obra_nueva' ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA (10%)</span>
                  <span className="tabular-nums">{formatMoney(calculo.impuesto_iva)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">AJD (1,5%)</span>
                  <span className="tabular-nums">{formatMoney(calculo.impuesto_ajd)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  ITP ({config.es_menor_35 ? '6%' : '10%'})
                </span>
                <span className="tabular-nums">{formatMoney(calculo.impuesto_itp)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Notaría + Registro + Gestoría</span>
              <span className="tabular-nums">{formatMoney(calculo.gastos_notaria)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tasación</span>
              <span className="tabular-nums">{formatMoney(calculo.gastos_tasacion)}</span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="font-semibold">TOTAL GASTOS</span>
              <span className="font-bold text-negative tabular-nums">
                {formatMoney(calculo.total_gastos_compra)}
              </span>
            </div>
          </div>
        </div>
        
        {/* ================================================== */}
        {/* SECCIÓN 4: HIPOTECA */}
        {/* ================================================== */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Hipoteca</h2>
          </div>
          
          <div className="space-y-4">
            {/* Importe hipoteca (calculado) */}
            <div className="flex justify-between">
              <span className="text-gray-500">Importe hipoteca</span>
              <span className="tabular-nums font-medium">{formatMoney(calculo.importe_hipoteca)}</span>
            </div>
            
            {/* Entrada (calculado) */}
            <div className="flex justify-between bg-amber-50 dark:bg-amber-900/20 -mx-4 px-4 py-2">
              <span className="font-medium">ENTRADA necesaria</span>
              <span className="tabular-nums font-bold text-amber-600">{formatMoney(calculo.entrada)}</span>
            </div>
            
            {/* TIN Anual */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                TIN Anual (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={config.tin_anual}
                  onChange={(e) => updateConfig({ tin_anual: parseFloat(e.target.value) || 0 })}
                  className="flex-1 h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <span className="text-gray-400">%</span>
              </div>
            </div>
            
            {/* Plazo años */}
            <div>
              <label className="text-sm text-gray-500 mb-2 block">
                Plazo: <span className="font-semibold text-foreground">{config.plazo_años} años</span>
              </label>
              <input
                type="range"
                min={10}
                max={40}
                step={1}
                value={config.plazo_años}
                onChange={(e) => updateConfig({ plazo_años: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-accent"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10 años</span>
                <span>40 años</span>
              </div>
            </div>
            
            {/* Cuota mensual (destacado) */}
            <div className="bg-accent/10 -mx-4 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">CUOTA MENSUAL</span>
                <span className="text-2xl font-bold text-accent tabular-nums">
                  {formatMoney(calculo.cuota_mensual)}
                </span>
              </div>
            </div>
            
            {/* Ingresos netos */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Ingresos netos/mes (pareja)
              </label>
              <NumericInput
                value={config.ingresos_netos_mes}
                onChange={(v) => updateConfig({ ingresos_netos_mes: v })}
                placeholder="3.000,00"
              />
            </div>
            
            {/* Ratio endeudamiento con semáforo */}
            {config.ingresos_netos_mes > 0 && (
              <div className={cn(
                '-mx-4 px-4 py-3 rounded-lg',
                calculo.estado_ratio === 'ok' && 'bg-green-50 dark:bg-green-900/20',
                calculo.estado_ratio === 'ajustado' && 'bg-amber-50 dark:bg-amber-900/20',
                calculo.estado_ratio === 'riesgo' && 'bg-red-50 dark:bg-red-900/20'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {calculo.estado_ratio === 'ok' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {calculo.estado_ratio === 'ajustado' && (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    {calculo.estado_ratio === 'riesgo' && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <span className="font-medium">Ratio endeudamiento</span>
                      <p className="text-xs text-gray-500">
                        {calculo.estado_ratio === 'ok' && '≤30% - OK'}
                        {calculo.estado_ratio === 'ajustado' && '30-35% - Ajustado'}
                        {calculo.estado_ratio === 'riesgo' && '>35% - Riesgo'}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xl font-bold tabular-nums',
                    calculo.estado_ratio === 'ok' && 'text-green-600',
                    calculo.estado_ratio === 'ajustado' && 'text-amber-600',
                    calculo.estado_ratio === 'riesgo' && 'text-red-600'
                  )}>
                    {calculo.ratio_endeudamiento.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* ================================================== */}
        {/* SECCIÓN 5: ¿CUÁNTO NECESITAMOS? */}
        {/* ================================================== */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">¿Cuánto Necesitamos?</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Entrada</span>
              <span className="tabular-nums">{formatMoney(calculo.entrada)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gastos de compra</span>
              <span className="tabular-nums">{formatMoney(calculo.total_gastos_compra)}</span>
            </div>
            
            {/* Muebles/Reformas (input) */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Muebles / Reformas
              </label>
              <NumericInput
                value={config.muebles_reformas}
                onChange={(v) => updateConfig({ muebles_reformas: v })}
                placeholder="5.000,00"
              />
            </div>
            
            {/* Colchón emergencia (input) */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Colchón de emergencia
              </label>
              <NumericInput
                value={config.colchon_emergencia}
                onChange={(v) => updateConfig({ colchon_emergencia: v })}
                placeholder="3.000,00"
              />
            </div>
            
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">TOTAL NECESARIO</span>
                <span className="font-bold tabular-nums">{formatMoney(calculo.total_necesario)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Disponible</span>
                <span className="tabular-nums text-positive">{formatMoney(calculo.disponible)}</span>
              </div>
              
              <div className={cn(
                'flex justify-between -mx-4 px-4 py-2',
                calculo.falta > 0 
                  ? 'bg-red-50 dark:bg-red-900/20' 
                  : 'bg-green-50 dark:bg-green-900/20'
              )}>
                <span className="font-semibold">
                  {calculo.falta > 0 ? 'FALTA' : 'SOBRA'}
                </span>
                <span className={cn(
                  'text-lg font-bold tabular-nums',
                  calculo.falta > 0 ? 'text-red-600' : 'text-green-600'
                )}>
                  {formatMoney(Math.abs(calculo.falta))}
                </span>
              </div>
            </div>
            
            {/* Barra de progreso */}
            {calculo.total_necesario > 0 && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progreso</span>
                  <span>
                    {Math.min(100, Math.round((calculo.disponible / calculo.total_necesario) * 100))}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all',
                      calculo.disponible >= calculo.total_necesario 
                        ? 'bg-green-500' 
                        : 'bg-accent'
                    )}
                    style={{ 
                      width: `${Math.min(100, (calculo.disponible / calculo.total_necesario) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* ================================================== */}
        {/* SECCIÓN 6: ESTIMACIÓN */}
        {/* ================================================== */}
        {calculo.falta > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-semibold">Estimación</h2>
            </div>
            
            <div className="space-y-4">
              {/* Ahorro mensual estimado */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">
                  Ahorro mensual estimado
                </label>
                <NumericInput
                  value={config.ahorro_mensual_estimado}
                  onChange={(v) => updateConfig({ ahorro_mensual_estimado: v })}
                  placeholder="500,00"
                />
              </div>
              
              {config.ahorro_mensual_estimado > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Meses necesarios</span>
                    <span className="font-semibold tabular-nums">
                      {calculo.meses_necesarios} meses
                    </span>
                  </div>
                  
                  {calculo.fecha_estimada && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha estimada</span>
                      <span className="font-semibold">
                        {new Date(calculo.fecha_estimada).toLocaleDateString('es-ES', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Botón guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'w-full py-4 rounded-xl font-semibold text-white',
            'bg-accent active:bg-accent/90 transition-colors',
            'flex items-center justify-center gap-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}
