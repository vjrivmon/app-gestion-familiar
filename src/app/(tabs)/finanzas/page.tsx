'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowLeftRight, Target, Calculator } from 'lucide-react'

const TABS = [
  { id: 'balance', label: 'Balance' },
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'mas', label: 'Más' },
]

export default function FinanzasPage() {
  const [activeTab, setActiveTab] = useState('balance')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="p-4 pt-2">
        <h1 className="text-[28px] font-bold mb-4">Finanzas</h1>
        
        {/* Segmented Control */}
        <div className="flex bg-[var(--separator)]/60 rounded-[9px] p-[2px]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all
                ${activeTab === tab.id 
                  ? 'bg-surface shadow-sm' 
                  : 'text-[var(--text-secondary)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-0">
        {activeTab === 'balance' && <BalanceTab />}
        {activeTab === 'ingresos' && <IngresosTab />}
        {activeTab === 'gastos' && <GastosTab />}
        {activeTab === 'mas' && <MasTab />}
      </div>
    </div>
  )
}

function BalanceTab() {
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
          <p className="text-[var(--text-muted)] text-xs">Ingresos Feb</p>
          <p className="text-xl font-bold">0€</p>
        </div>
        <div className="card">
          <TrendingDown className="w-6 h-6 text-negative mb-2" />
          <p className="text-[var(--text-muted)] text-xs">Gastos Feb</p>
          <p className="text-xl font-bold">0€</p>
        </div>
      </div>

      {/* Patrimonio */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="w-5 h-5 text-accent" />
          <span className="font-semibold">Patrimonio Total</span>
        </div>
        <p className="text-2xl font-bold">0,00€</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Configura los saldos iniciales
        </p>
      </div>
    </div>
  )
}

function IngresosTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-12">
        <TrendingUp className="w-12 h-12 text-[var(--text-muted)] mb-4" />
        <p className="text-[var(--text-secondary)] text-center mb-4">
          No hay ingresos registrados este mes
        </p>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Añadir ingreso
        </button>
      </div>
    </div>
  )
}

function GastosTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-12">
        <TrendingDown className="w-12 h-12 text-[var(--text-muted)] mb-4" />
        <p className="text-[var(--text-secondary)] text-center mb-4">
          No hay gastos registrados este mes
        </p>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Añadir gasto
        </button>
      </div>
    </div>
  )
}

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
          className="card flex items-center gap-4 active:bg-[var(--separator)] transition-colors"
        >
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <span className="font-medium flex-1">{label}</span>
          <span className="text-[var(--text-muted)]">›</span>
        </a>
      ))}
    </div>
  )
}
