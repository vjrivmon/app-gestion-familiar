'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useMesActual } from '@/hooks/use-mes-actual'
import { useCuentaConjunta } from '@/hooks/use-cuenta-conjunta'
import { useTransferencias } from '@/hooks/use-transferencias'
import { useConfigHogar } from '@/hooks/use-config-hogar'
import { getNombrePagador } from '@/types/config'
import { NOMBRES } from '@/types/finanzas'
import { TransferenciaForm } from '@/components/finanzas/transferencia-form'
import { TransferenciasList } from '@/components/finanzas/transferencias-list'

export default function CuentaConjuntaPage() {
  const router = useRouter()
  const mesState = useMesActual()
  const { config } = useConfigHogar()
  
  const {
    saldoConjunta,
    saldoEfectivo,
    saldoDigital,
    ingresosMes,
    gastosMes,
    loading: loadingCuenta,
    getAportacionesMes,
    getEvolucionConjunta
  } = useCuentaConjunta(mesState.mes, mesState.año)
  
  const {
    transferencias,
    loading: loadingTransf
  } = useTransferencias(mesState.mes, mesState.año)
  
  // Estado para aportaciones
  const [aportaciones, setAportaciones] = useState({ m1: 0, m2: 0, otros: 0 })
  const [evolucion, setEvolucion] = useState<{ nombreMes: string; saldo: number }[]>([])
  
  // Cargar aportaciones y evolución
  useEffect(() => {
    getAportacionesMes(mesState.mes, mesState.año).then(setAportaciones)
    getEvolucionConjunta(6).then(data => setEvolucion(data.map(e => ({
      nombreMes: e.nombreMes,
      saldo: e.saldo
    }))))
  }, [mesState.mes, mesState.año, getAportacionesMes, getEvolucionConjunta])
  
  // Formulario de transferencia
  const [showTransferForm, setShowTransferForm] = useState(false)
  
  // Totales del mes
  const totalIngresosMes = ingresosMes.reduce((sum, i) => sum + i.importe, 0)
  const totalGastosMes = gastosMes.reduce((sum, g) => sum + g.importe, 0)
  
  // Nombres personalizados
  const nombreM1 = getNombrePagador(config, 'm1')
  const nombreM2 = getNombrePagador(config, 'm2')
  
  const loading = loadingCuenta || loadingTransf
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-surface dark:bg-surface shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-accent font-medium -ml-2 px-2 py-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Volver</span>
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center mr-6">
            Cuenta Conjunta
          </h1>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Card: Saldo actual */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-surface/20 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Saldo actual</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : formatMoney(saldoConjunta)}
              </p>
            </div>
          </div>
          
          {/* Desglose efectivo/digital */}
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-purple-200">💵 Efectivo:</span>{' '}
              <span className="font-medium">{formatMoney(saldoEfectivo)}</span>
            </div>
            <div>
              <span className="text-purple-200">💳 Digital:</span>{' '}
              <span className="font-medium">{formatMoney(saldoDigital)}</span>
            </div>
          </div>
        </div>
        
        {/* Quick stats del mes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <TrendingUp className="w-5 h-5 text-positive mb-1" />
            <p className="text-[var(--text-secondary)] text-xs">Ingresos {mesState.nombreMesCorto}</p>
            <p className="text-lg font-bold text-positive">
              +{formatMoney(totalIngresosMes)}
            </p>
          </div>
          <div className="card">
            <TrendingDown className="w-5 h-5 text-negative mb-1" />
            <p className="text-[var(--text-secondary)] text-xs">Gastos {mesState.nombreMesCorto}</p>
            <p className="text-lg font-bold text-negative">
              -{formatMoney(totalGastosMes)}
            </p>
          </div>
        </div>
        
        {/* Sección: Aportaciones este mes */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold">Aportaciones {mesState.nombreMesCorto}</h2>
          </div>
          
          <div className="space-y-3">
            {/* Vicente */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  V
                </div>
                <span>{nombreM1} aportó</span>
              </div>
              <span className={cn(
                'font-semibold',
                aportaciones.m1 > 0 ? 'text-positive' : 'text-[var(--text-muted)]'
              )}>
                {formatMoney(aportaciones.m1)}
              </span>
            </div>
            
            {/* Irene */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-medium">
                  I
                </div>
                <span>{nombreM2} aportó</span>
              </div>
              <span className={cn(
                'font-semibold',
                aportaciones.m2 > 0 ? 'text-positive' : 'text-[var(--text-muted)]'
              )}>
                {formatMoney(aportaciones.m2)}
              </span>
            </div>
            
            {/* Otros */}
            {aportaciones.otros > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium">
                    ?
                  </div>
                  <span>Otros</span>
                </div>
                <span className="font-semibold text-positive">
                  {formatMoney(aportaciones.otros)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Sección: Gastos de la conjunta */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Gastos de la conjunta</h2>
            <span className="text-sm text-[var(--text-secondary)]">{mesState.nombreMesCorto}</span>
          </div>
          
          {gastosMes.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-4">
              Sin gastos este mes
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gastosMes.slice(0, 5).map(gasto => (
                <div 
                  key={gasto.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{gasto.concepto}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(gasto.fecha).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                  <span className="font-semibold text-negative">
                    -{formatMoney(gasto.importe)}
                  </span>
                </div>
              ))}
              {gastosMes.length > 5 && (
                <p className="text-sm text-[var(--text-secondary)] text-center pt-2">
                  +{gastosMes.length - 5} más
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Sección: Evolución */}
        {evolucion.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold">Evolución</h2>
            </div>
            
            {/* Mini gráfico de barras */}
            <div className="flex items-end justify-between gap-1 h-24 mb-2">
              {evolucion.map((mes, i) => {
                const maxSaldo = Math.max(...evolucion.map(e => e.saldo), 1)
                const height = Math.max((mes.saldo / maxSaldo) * 100, 5)
                const isLast = i === evolucion.length - 1
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={cn(
                        'w-full rounded-t transition-all',
                        isLast ? 'bg-purple-500' : 'bg-purple-200 dark:bg-purple-800'
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-[var(--text-secondary)]">{mes.nombreMes}</span>
                  </div>
                )
              })}
            </div>
            
            {/* Leyenda */}
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>{formatMoney(evolucion[0]?.saldo || 0)}</span>
              <span className="font-medium text-purple-600">
                {formatMoney(evolucion[evolucion.length - 1]?.saldo || 0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Sección: Transferencias recientes */}
        <div>
          <h2 className="font-semibold mb-3 px-1">Transferencias recientes</h2>
          <TransferenciasList
            transferencias={transferencias.filter(t => 
              t.de === 'conjunta' || t.a === 'conjunta'
            )}
            loading={loadingTransf}
            emptyMessage="Sin transferencias a/desde la conjunta"
          />
        </div>
      </div>
      
      {/* FAB: Aportar a conjunta */}
      <button
        onClick={() => setShowTransferForm(true)}
        className={cn(
          'fixed bottom-24 right-4 z-30',
          'flex items-center gap-2 px-5 py-3.5 rounded-full',
          'bg-purple-500 text-white shadow-lg',
          'active:scale-95 transition-transform',
          'font-medium'
        )}
      >
        <Plus className="w-5 h-5" />
        Aportar
      </button>
      
      {/* Formulario de transferencia */}
      <TransferenciaForm
        open={showTransferForm}
        onClose={() => setShowTransferForm(false)}
        destinoFijo="conjunta"
        onSuccess={() => {
          // Refrescar datos
          getAportacionesMes(mesState.mes, mesState.año).then(setAportaciones)
        }}
      />
    </div>
  )
}
