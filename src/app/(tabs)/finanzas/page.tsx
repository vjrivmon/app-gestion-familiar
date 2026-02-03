'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowLeftRight, Target, Calculator, Settings, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useMesActual } from '@/hooks/use-mes-actual'
import { useIngresos } from '@/hooks/use-ingresos'
import { useGastos } from '@/hooks/use-gastos'
import { MonthPicker } from '@/components/ui/month-picker'
import { TransaccionList, ResumenTotales } from '@/components/finanzas/transaccion-list'
import { IngresoForm } from '@/components/finanzas/ingreso-form'
import { GastoForm } from '@/components/finanzas/gasto-form'
import { BalanceCard } from '@/components/finanzas/balance-card'
import { PatrimonioCard } from '@/components/finanzas/patrimonio-card'
import { ResumenMesCard } from '@/components/finanzas/resumen-mes-card'
import type { Ingreso, Gasto } from '@/types/finanzas'

const TABS = [
  { id: 'balance', label: 'Balance' },
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'mas', label: 'Más' },
] as const

type TabId = typeof TABS[number]['id']

export default function FinanzasPage() {
  const [activeTab, setActiveTab] = useState<TabId>('balance')
  
  // Estado del mes para tabs de ingresos/gastos
  const mesState = useMesActual()
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-surface p-4 pt-2 shadow-sm">
        <h1 className="text-[28px] font-bold mb-4">Finanzas</h1>
        
        {/* Segmented Control */}
        <div className="flex bg-gray-200/70 dark:bg-gray-800 rounded-[9px] p-[2px]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all',
                activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'balance' && <BalanceTab mesState={mesState} />}
        {activeTab === 'ingresos' && <IngresosTab mesState={mesState} />}
        {activeTab === 'gastos' && <GastosTab mesState={mesState} />}
        {activeTab === 'mas' && <MasTab />}
      </div>
    </div>
  )
}

// ==========================================
// TAB: BALANCE
// ==========================================

interface BalanceTabProps {
  mesState: ReturnType<typeof useMesActual>
}

function BalanceTab({ mesState }: BalanceTabProps) {
  const router = useRouter()
  const { totalMes: totalIngresos } = useIngresos(mesState.mes, mesState.año)
  const { totalMes: totalGastos } = useGastos(mesState.mes, mesState.año)
  
  const handleConfigClick = () => {
    router.push('/finanzas/config')
  }
  
  return (
    <div className="space-y-4">
      {/* Balance de pareja */}
      <BalanceCard 
        onDetailClick={() => {
          // TODO: navegar a historial de balance
        }}
      />

      {/* Quick stats del mes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <TrendingUp className="w-6 h-6 text-positive mb-2" />
          <p className="text-gray-500 text-xs">Ingresos {mesState.nombreMesCorto}</p>
          <p className="text-xl font-bold text-positive">
            +{formatMoney(totalIngresos)}
          </p>
        </div>
        <div className="card">
          <TrendingDown className="w-6 h-6 text-negative mb-2" />
          <p className="text-gray-500 text-xs">Gastos {mesState.nombreMesCorto}</p>
          <p className="text-xl font-bold text-negative">
            -{formatMoney(totalGastos)}
          </p>
        </div>
      </div>

      {/* Resumen del mes */}
      <ResumenMesCard
        mes={mesState.mes}
        año={mesState.año}
        nombreMes={mesState.nombreMesCorto}
      />

      {/* Patrimonio */}
      <PatrimonioCard onConfigClick={handleConfigClick} />

      {/* Link a configuración */}
      <button
        onClick={handleConfigClick}
        className="w-full card flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <span className="font-medium">Configurar saldos iniciales</span>
        </div>
        <span className="text-gray-400">›</span>
      </button>
    </div>
  )
}

// ==========================================
// TAB: INGRESOS
// ==========================================

interface IngresosTabProps {
  mesState: ReturnType<typeof useMesActual>
}

function IngresosTab({ mesState }: IngresosTabProps) {
  const {
    ingresos,
    loading,
    totalMes,
    totalFisico,
    totalDigital,
    crearIngreso,
    actualizarIngreso,
    eliminarIngreso
  } = useIngresos(mesState.mes, mesState.año)
  
  const [showForm, setShowForm] = useState(false)
  const [editingIngreso, setEditingIngreso] = useState<Ingreso | undefined>()
  
  const handleSave = async (data: Parameters<typeof crearIngreso>[0]) => {
    if (editingIngreso) {
      await actualizarIngreso(editingIngreso.id, data)
    } else {
      await crearIngreso(data)
    }
  }
  
  const handleEdit = (ingreso: Ingreso | Gasto) => {
    setEditingIngreso(ingreso as Ingreso)
    setShowForm(true)
  }
  
  const handleDelete = async (id: string) => {
    await eliminarIngreso(id)
  }
  
  const handleClose = () => {
    setShowForm(false)
    setEditingIngreso(undefined)
  }
  
  return (
    <div className="space-y-4">
      {/* Month picker */}
      <MonthPicker
        value={mesState.fecha}
        onChange={(date) => mesState.irAMes(date.getMonth(), date.getFullYear())}
        className="mb-2"
      />
      
      {/* Resumen */}
      <ResumenTotales
        tipo="ingreso"
        totalMes={totalMes}
        totalFisico={totalFisico}
        totalDigital={totalDigital}
      />
      
      {/* Lista */}
      <TransaccionList
        tipo="ingreso"
        items={ingresos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className={cn(
          'fixed bottom-24 right-4 z-30',
          'w-14 h-14 rounded-full',
          'bg-positive text-white shadow-lg',
          'flex items-center justify-center',
          'active:scale-95 transition-transform'
        )}
        aria-label="Añadir ingreso"
      >
        <Plus className="w-7 h-7" />
      </button>
      
      {/* Formulario */}
      <IngresoForm
        open={showForm}
        onClose={handleClose}
        ingreso={editingIngreso}
        onSave={handleSave}
      />
    </div>
  )
}

// ==========================================
// TAB: GASTOS
// ==========================================

interface GastosTabProps {
  mesState: ReturnType<typeof useMesActual>
}

function GastosTab({ mesState }: GastosTabProps) {
  const {
    gastos,
    loading,
    totalMes,
    totalFisico,
    totalDigital,
    crearGasto,
    actualizarGasto,
    eliminarGasto
  } = useGastos(mesState.mes, mesState.año)
  
  const [showForm, setShowForm] = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>()
  
  const handleSave = async (data: Parameters<typeof crearGasto>[0]) => {
    if (editingGasto) {
      await actualizarGasto(editingGasto.id, data)
    } else {
      await crearGasto(data)
    }
  }
  
  const handleEdit = (gasto: Ingreso | Gasto) => {
    setEditingGasto(gasto as Gasto)
    setShowForm(true)
  }
  
  const handleDelete = async (id: string) => {
    await eliminarGasto(id)
  }
  
  const handleClose = () => {
    setShowForm(false)
    setEditingGasto(undefined)
  }
  
  return (
    <div className="space-y-4">
      {/* Month picker */}
      <MonthPicker
        value={mesState.fecha}
        onChange={(date) => mesState.irAMes(date.getMonth(), date.getFullYear())}
        className="mb-2"
      />
      
      {/* Resumen */}
      <ResumenTotales
        tipo="gasto"
        totalMes={totalMes}
        totalFisico={totalFisico}
        totalDigital={totalDigital}
      />
      
      {/* Lista */}
      <TransaccionList
        tipo="gasto"
        items={gastos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className={cn(
          'fixed bottom-24 right-4 z-30',
          'w-14 h-14 rounded-full',
          'bg-negative text-white shadow-lg',
          'flex items-center justify-center',
          'active:scale-95 transition-transform'
        )}
        aria-label="Añadir gasto"
      >
        <Plus className="w-7 h-7" />
      </button>
      
      {/* Formulario */}
      <GastoForm
        open={showForm}
        onClose={handleClose}
        gasto={editingGasto}
        onSave={handleSave}
      />
    </div>
  )
}

// ==========================================
// TAB: MÁS
// ==========================================

function MasTab() {
  const items = [
    { icon: Wallet, label: 'Cuenta Conjunta', href: '/finanzas/conjunta' },
    { icon: ArrowLeftRight, label: 'Transferencias', href: '/finanzas/conjunta#transferencias' },
    { icon: GraduationCap, label: 'Becas y Ayudas', href: '/finanzas/becas' },
    { icon: PiggyBank, label: 'Préstamos', href: '/finanzas/prestamos' },
    { icon: Target, label: 'Metas de ahorro', href: '/finanzas/metas' },
    { icon: Calculator, label: 'Calculadora piso', href: '/finanzas/calculadora' },
  ]

  return (
    <div className="space-y-2">
      {items.map(({ icon: Icon, label, href }) => (
        <a
          key={href}
          href={href}
          className="card flex items-center gap-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
        >
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <span className="font-medium flex-1">{label}</span>
          <span className="text-gray-400">›</span>
        </a>
      ))}
    </div>
  )
}
