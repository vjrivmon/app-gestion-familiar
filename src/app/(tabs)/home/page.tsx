'use client'

import { useState, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { useRouter } from 'next/navigation'
import { useSwipeable } from 'react-swipeable'
import Link from 'next/link'
import { Settings, ShoppingCart, Receipt, PiggyBank, Camera, ChevronLeft, ChevronRight, ListTodo } from 'lucide-react'

// Componentes
import { BalanceCard } from '@/components/finanzas/balance-card'
import { TareasCarousel } from '@/components/tareas/tareas-carousel'
import { TareaDetailSheet } from '@/components/tareas/tarea-detail-sheet'

// Hooks
import { useTareas, type TareaConEstado } from '@/hooks/use-tareas'
import { useBalance } from '@/hooks/use-balance'

export default function HomePage() {
  const { user } = useSupabase()
  const router = useRouter()
  const { tareas, completarTarea, eliminarTarea } = useTareas()
  const { balance } = useBalance()
  
  // Estado para sheet de detalle
  const [selectedTarea, setSelectedTarea] = useState<TareaConEstado | null>(null)

  // Swipe left to open camera
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => router.push('/camera'),
    delta: 50,
    preventScrollOnSwipe: true,
  })

  const userName = user?.email?.split('@')[0] || 'Usuario'
  
  // Handlers para tareas
  const handleCompleteTarea = useCallback(async (tareaId: string) => {
    return await completarTarea(tareaId)
  }, [completarTarea])
  
  const handleViewTareaDetail = useCallback((tarea: TareaConEstado) => {
    setSelectedTarea(tarea)
  }, [])
  
  const handleCloseTareaDetail = useCallback(() => {
    setSelectedTarea(null)
  }, [])
  
  const handleDeleteTarea = useCallback(async (tareaId: string) => {
    const success = await eliminarTarea(tareaId)
    if (success) {
      setSelectedTarea(null)
    }
    return success
  }, [eliminarTarea])

  // Contar tareas urgentes
  const tareasUrgentes = tareas.filter(t => t.estado === 'overdue').length

  return (
    <div {...swipeHandlers} className="min-h-screen p-4 space-y-4 pb-24">
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

      {/* Balance Card - Componente real */}
      <BalanceCard 
        onDetailClick={() => router.push('/finanzas')}
      />

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

      {/* Tareas del Hogar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[var(--text-secondary)]">
              Tareas del Hogar
            </h2>
            {tareasUrgentes > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {tareasUrgentes}
              </span>
            )}
          </div>
          <Link 
            href="/home/tareas" 
            className="flex items-center gap-1 text-accent text-sm font-medium"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <TareasCarousel
          tareas={tareas}
          onComplete={handleCompleteTarea}
          onViewDetail={handleViewTareaDetail}
        />
        
        {tareas.length === 0 && (
          <Link 
            href="/home/tareas"
            className="card flex items-center justify-center gap-2 py-4 text-[var(--text-secondary)]"
          >
            <ListTodo className="w-5 h-5" />
            <span>Configurar tareas del hogar</span>
          </Link>
        )}
      </div>

      {/* Budget Card - Placeholder mejorado */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-5 h-5 text-accent" />
          <span className="font-semibold">Presupuesto del mes</span>
        </div>
        <div className="h-2 bg-[var(--separator)] rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: '0%' }} />
        </div>
        <p className="text-[var(--text-muted)] text-sm mt-2">
          Sin presupuesto configurado
        </p>
        <Link href="/finanzas/config" className="text-accent text-sm font-medium mt-1 inline-block">
          Configurar →
        </Link>
      </div>

      {/* Swipe hint */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 opacity-30 flex items-center gap-1 text-[var(--text-muted)]">
        <ChevronLeft size={16} />
        <span className="text-xs">Cámara</span>
      </div>
      
      {/* Tarea Detail Sheet */}
      {selectedTarea && (
        <TareaDetailSheet
          tarea={selectedTarea}
          onClose={handleCloseTareaDetail}
          onComplete={handleCompleteTarea}
          onDelete={handleDeleteTarea}
        />
      )}
    </div>
  )
}
