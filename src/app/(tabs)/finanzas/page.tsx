'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowLeftRight, Target, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/utils/money'
import { useMesActual } from '@/hooks/use-mes-actual'
import { useIngresos } from '@/hooks/use-ingresos'
import { useGastos } from '@/hooks/use-gastos'
import { MonthPicker } from '@/components/ui/month-picker'
import { TransaccionList, ResumenTotales } from '@/components/finanzas/transaccion-list'
import { IngresoForm } from '@/components/finanzas/ingreso-form'
import { GastoForm } from '@/components/finanzas/gasto-form'
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
  const { ingresos, totalMes: totalIngresos } = useIngresos(mesState.mes, mesState.año)
  const { gastos, totalMes: totalGastos } = useGastos(mesState.mes, mesState.año)
  
  const balance = totalIngresos - totalGastos
  
  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="card bg-accent text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/70 text-sm">Balance de pareja</p>
            <p className="text-3xl font-bold">0,00€</p>
          </div>
          <ArrowLeftRight className="w-8 h-8 text-white/50" />
        </div>
        <p className="text-white/90 text-sm">
          Estáis en paz 🤝
        </p>
      </div>

      {/* Quick stats */}
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

      {/* Balance del mes */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-accent" />
          <span className="font-semibold">Balance {mesState.nombreMesCorto}</span>
        </div>
        <p className={cn(
          'text-2xl font-bold',
          balance >= 0 ? 'text-positive' : 'text-negative'
        )}>
          {balance >= 0 ? '+' : ''}{formatMoney(balance)}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          {balance >= 0 
            ? 'Ahorrado este mes' 
            : 'Gastado más de lo ingresado'}
        </p>
      </div>

      {/* Patrimonio */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="w-5 h-5 text-accent" />
          <span className="font-semibold">Patrimonio Total</span>
        </div>
        <p className="text-2xl font-bold">0,00€</p>
        <p className="text-gray-500 text-sm mt-1">
          Configura los saldos iniciales
        </p>
      </div>
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
    { icon: ArrowLeftRight, label: 'Préstamos', href: '/finanzas/prestamos' },
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
