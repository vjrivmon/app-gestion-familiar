'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { useRouter } from 'next/navigation'
import { useSwipeable } from 'react-swipeable'
import { Settings, ShoppingCart, Receipt, PiggyBank, Camera, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user } = useSupabase()
  const router = useRouter()

  // Swipe left to open camera
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => router.push('/camera'),
    delta: 50,
    preventScrollOnSwipe: true,
  })

  const userName = user?.email?.split('@')[0] || 'Usuario'

  return (
    <div {...swipeHandlers} className="min-h-screen p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-[28px] font-bold">Hola, {userName} 👋</h1>
          <p className="text-[var(--text-secondary)]">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
        <Link href="/settings" className="p-2 -mr-2">
          <Settings className="w-6 h-6 text-[var(--text-muted)]" />
        </Link>
      </div>

      {/* Balance Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <PiggyBank className="w-5 h-5 text-accent" />
          <span className="font-semibold">Balance Pareja</span>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Conecta con tu pareja para ver el balance
        </p>
        <Link href="/finanzas" className="text-accent text-sm font-medium mt-2 inline-block">
          Ver detalle →
        </Link>
      </div>

      {/* Budget Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-5 h-5 text-accent" />
          <span className="font-semibold">Presupuesto Febrero</span>
        </div>
        <div className="h-2 bg-[var(--separator)] rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: '0%' }} />
        </div>
        <p className="text-[var(--text-muted)] text-sm mt-2">
          0€ / sin definir
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="text-[15px] font-semibold text-[var(--text-secondary)]">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/compra" className="card flex flex-col items-center justify-center py-5 active:scale-95 transition-transform">
            <ShoppingCart className="w-8 h-8 text-accent mb-2" />
            <span className="text-[15px] font-medium">Nueva compra</span>
          </Link>
          <Link href="/finanzas" className="card flex flex-col items-center justify-center py-5 active:scale-95 transition-transform">
            <Receipt className="w-8 h-8 text-accent mb-2" />
            <span className="text-[15px] font-medium">Añadir gasto</span>
          </Link>
          <Link href="/finanzas" className="card flex flex-col items-center justify-center py-5 active:scale-95 transition-transform">
            <PiggyBank className="w-8 h-8 text-accent mb-2" />
            <span className="text-[15px] font-medium">Añadir ingreso</span>
          </Link>
          <Link href="/camera" className="card flex flex-col items-center justify-center py-5 active:scale-95 transition-transform">
            <Camera className="w-8 h-8 text-accent mb-2" />
            <span className="text-[15px] font-medium">Escanear precio</span>
          </Link>
        </div>
      </div>

      {/* Swipe hint */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 opacity-30 flex items-center gap-1 text-[var(--text-muted)]">
        <ChevronLeft size={16} />
        <span className="text-xs">Cámara</span>
      </div>
    </div>
  )
}
