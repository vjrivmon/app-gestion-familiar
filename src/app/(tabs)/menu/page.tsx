'use client'

import { UtensilsCrossed, Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function MenuPage() {
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex justify-between items-center pt-2 mb-6">
        <h1 className="text-[28px] font-bold">Menú Semanal</h1>
        <Link href="/menu/recetas" className="p-2 -mr-2">
          <BookOpen className="w-6 h-6 text-accent" />
        </Link>
      </div>

      {/* Week selector */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-2 text-accent">← Anterior</button>
        <span className="font-semibold">3-9 Febrero</span>
        <button className="p-2 text-accent">Siguiente →</button>
      </div>

      {/* Week grid */}
      <div className="space-y-3">
        {DIAS.map((dia, i) => (
          <div key={dia} className="card p-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 text-[13px] font-semibold text-[var(--text-secondary)]">{dia}</span>
              <span className="text-[13px] text-[var(--text-muted)]">{3 + i} feb</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 p-3 bg-background rounded-lg text-left">
                <span className="text-lg">🍽️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--text-muted)]">Comida</p>
                  <p className="text-[15px] truncate text-[var(--text-secondary)]">Sin planificar</p>
                </div>
              </button>
              <button className="flex items-center gap-2 p-3 bg-background rounded-lg text-left">
                <span className="text-lg">🌙</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--text-muted)]">Cena</p>
                  <p className="text-[15px] truncate text-[var(--text-secondary)]">Sin planificar</p>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate list button */}
      <div className="fixed bottom-[calc(49px+env(safe-area-inset-bottom)+16px)] left-4 right-4">
        <button className="btn-primary w-full flex items-center justify-center gap-2">
          <UtensilsCrossed className="w-5 h-5" />
          Generar lista de compra
        </button>
      </div>
    </div>
  )
}
