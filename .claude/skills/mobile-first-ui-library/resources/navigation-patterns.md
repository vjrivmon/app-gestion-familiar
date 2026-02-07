# Navigation Patterns — Mobile First

---

## Bottom Tab Bar in Next.js App Router

### Architecture
```
src/app/
├── layout.tsx              ← Root layout (includes BottomNav)
├── (tabs)/                 ← Route group for tabbed pages
│   ├── layout.tsx          ← Tabs layout (content + bottom nav)
│   ├── home/
│   │   └── page.tsx
│   ├── compra/
│   │   ├── page.tsx        ← Lista
│   │   └── [id]/
│   │       ├── page.tsx    ← Editar lista
│   │       └── comprar/
│   │           └── page.tsx ← Modo compra (hides tab bar)
│   ├── menu/
│   │   ├── page.tsx
│   │   └── recetas/
│   │       └── [id]/page.tsx
│   └── finanzas/
│       ├── page.tsx
│       └── [...slug]/page.tsx
├── camera/
│   └── page.tsx            ← Fullscreen (no tab bar)
└── settings/
    └── page.tsx
```

### BottomNav Component
```tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
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
  const hideRoutes = ['/camera', '/compra/', '/comprar']
  if (hideRoutes.some(r => pathname?.includes(r) && r !== '/compra/')) return null
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-200 dark:bg-black/80 dark:border-gray-800"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex h-[49px]">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link key={href} href={href}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5
                    ${active ? 'text-accent' : 'text-gray-400'}`}>
              <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

---

## Stack Navigation (Push/Pop)

### Pattern: Use Next.js router for stack-like navigation
```tsx
'use client'
import { useRouter } from 'next/navigation'

// Push (forward)
router.push('/compra/abc123')

// Pop (back)  
router.back()

// Replace (no back stack)
router.replace('/home')
```

### Custom Back Button
```tsx
function NavBar({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl dark:bg-black/80"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center h-[44px] px-4">
        <button onClick={onBack || (() => router.back())}
                className="flex items-center text-accent -ml-2 p-2">
          <ChevronLeft size={28} />
          <span className="text-[17px]">Back</span>
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold">
          {title}
        </h1>
      </div>
    </header>
  )
}
```

---

## Swipe Gestures

### Swipe Left from Home → Camera
```tsx
import { useSwipeable } from 'react-swipeable'

function HomeScreen() {
  const router = useRouter()
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => router.push('/camera'),
    trackMouse: false,
    delta: 50,           // min swipe distance
    preventScrollOnSwipe: true,
  })

  return (
    <div {...swipeHandlers} className="min-h-screen">
      {/* Home content */}
      
      {/* Visual hint */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 opacity-30">
        <ChevronLeft size={20} />
      </div>
    </div>
  )
}
```

### Swipe Back (Edge Gesture)
Next.js + iOS Safari already handles swipe-back natively in standalone PWA mode.
For custom handling:
```tsx
const backSwipe = useSwipeable({
  onSwipedRight: (e) => {
    // Only trigger from left edge (first 30px)
    if (e.initial[0] < 30) router.back()
  },
  delta: 80,
})
```

### Swipe to Delete on List Items
```tsx
function SwipeableItem({ children, onDelete }: Props) {
  const [offset, setOffset] = useState(0)
  
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === 'Left') setOffset(Math.min(e.absX, 80))
    },
    onSwipedLeft: (e) => {
      if (e.absX > 60) onDelete()
      else setOffset(0)
    },
    onSwipedRight: () => setOffset(0),
  })

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <div className="absolute right-0 inset-y-0 w-20 bg-red-500 flex items-center justify-center">
        <Trash2 className="text-white" size={20} />
      </div>
      
      {/* Content */}
      <div {...handlers}
           style={{ transform: `translateX(-${offset}px)` }}
           className="relative bg-white transition-transform">
        {children}
      </div>
    </div>
  )
}
```

---

## Sheet / Modal Navigation

### Half Sheet (for quick actions)
```tsx
'use client'
import { Drawer } from 'vaul' // vaul = best sheet library for React

function PriceInputSheet({ open, onClose, onSubmit }) {
  return (
    <Drawer.Root open={open} onClose={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[12px] dark:bg-[#1C1C1E]"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="mx-auto w-[36px] h-[5px] rounded-full bg-gray-300 mt-2" />
          
          {/* Sheet content */}
          <div className="p-4">
            {/* ... */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

### Full Screen Sheet (for complex forms)
```tsx
<Drawer.Root open={open} onClose={onClose}>
  <Drawer.Content className="fixed inset-0 bg-white dark:bg-black"
                  style={{ paddingTop: 'env(safe-area-inset-top)' }}>
    <div className="flex items-center h-[44px] px-4 border-b">
      <button onClick={onClose}>Cancel</button>
      <h2 className="flex-1 text-center font-semibold">Title</h2>
      <button onClick={handleSave} className="text-accent font-semibold">Save</button>
    </div>
    <div className="overflow-y-auto" style={{ height: 'calc(100vh - 44px - env(safe-area-inset-top))' }}>
      {/* Form content */}
    </div>
  </Drawer.Content>
</Drawer.Root>
```

---

## Segmented Control (Sub-navigation)

```tsx
function SegmentedControl({ segments, active, onChange }) {
  return (
    <div className="flex bg-gray-200/60 dark:bg-gray-800 rounded-[9px] p-[2px] mx-4">
      {segments.map((seg) => (
        <button
          key={seg.value}
          onClick={() => onChange(seg.value)}
          className={`flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all
            ${active === seg.value 
              ? 'bg-white dark:bg-gray-600 shadow-sm' 
              : 'text-gray-500'}`}
        >
          {seg.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Page Transitions

### Shared Layout Animations (Framer Motion)
```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Wrap page content
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### iOS-style Push Animation
```tsx
const pushVariants = {
  enter: { x: '100%', opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: { x: '-30%', opacity: 0.5 },
}
```
