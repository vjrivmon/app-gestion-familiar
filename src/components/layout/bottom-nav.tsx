'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, UtensilsCrossed, Wallet } from 'lucide-react'

const tabs = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/compra', icon: ShoppingCart, label: 'Compra' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menú' },
  { href: '/finanzas', icon: Wallet, label: 'Finanzas' },
]

export function BottomNav() {
  const pathname = usePathname()

  // Hide during fullscreen experiences
  const hideRoutes = ['/camera', '/comprar', '/login']
  if (hideRoutes.some(r => pathname?.includes(r))) return null

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-t border-[var(--separator)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-[49px]">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link 
              key={href} 
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                ${active ? 'text-accent' : 'text-[var(--text-muted)]'}`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
