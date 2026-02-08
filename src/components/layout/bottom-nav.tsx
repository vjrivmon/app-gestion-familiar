'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, UtensilsCrossed, Wallet } from 'lucide-react'

const tabs = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/compra', icon: ShoppingCart, label: 'Compra' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/finanzas', icon: Wallet, label: 'Finanzas' },
]

export function BottomNav() {
  const pathname = usePathname()

  // Hide during fullscreen experiences
  const hideRoutes = ['/camera', '/comprar', '/login']
  if (hideRoutes.some(r => pathname?.includes(r))) return null

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-50 rounded-neu-xl"
      style={{
        background: 'var(--background)',
        boxShadow: 'var(--shadow-neu-lg)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex h-[56px]">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150"
              style={{
                color: active ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150"
                style={{
                  background: active ? 'linear-gradient(145deg, var(--primary-light), var(--primary))' : 'transparent',
                  boxShadow: active ? 'var(--shadow-neu-sm)' : 'none'
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2 : 1.5}
                  style={{ color: active ? 'var(--text-inverse)' : 'var(--text-muted)' }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
