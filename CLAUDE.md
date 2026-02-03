# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router, React 19, TypeScript
- **Tailwind CSS** with iOS Human Interface Guidelines design system
- **Supabase** (Auth via Magic Link, PostgreSQL, Realtime sync)
- **Recharts** for interactive charts
- **Vaul** for bottom sheets (iOS-style drawers)
- **react-swipeable** for swipe gestures
- PWA-enabled for iOS home screen installation

### Project Structure
```
src/
├── app/
│   ├── (tabs)/                    # Tab-based pages with BottomNav
│   │   ├── home/
│   │   │   ├── page.tsx           # Dashboard with balance, tasks, quick actions
│   │   │   └── tareas/page.tsx    # Full task management
│   │   ├── compra/                # Shopping lists (Phase 3)
│   │   ├── menu/                  # Weekly meal planning (Phase 3)
│   │   └── finanzas/
│   │       ├── page.tsx           # Main finances with tabs
│   │       ├── config/page.tsx    # Initial balances setup
│   │       ├── conjunta/page.tsx  # Joint account
│   │       ├── becas/page.tsx     # Scholarships/grants
│   │       ├── prestamos/page.tsx # Loans between couple
│   │       ├── metas/page.tsx     # Savings goals
│   │       ├── calculadora/page.tsx # Mortgage calculator
│   │       ├── historico/page.tsx # Annual history
│   │       └── graficos/page.tsx  # Charts dashboard
│   ├── login/page.tsx
│   ├── settings/page.tsx          # App settings, export, logout
│   ├── camera/page.tsx            # Fullscreen camera (OCR - Phase 3)
│   └── auth/callback/route.ts     # Magic Link callback
├── components/
│   ├── ui/                        # Base UI components
│   │   ├── numeric-input.tsx      # Money input (céntimos)
│   │   ├── grouped-list.tsx       # iOS Settings-style list
│   │   └── month-picker.tsx       # Month navigation
│   ├── layout/
│   │   └── bottom-nav.tsx         # 4-tab navigation
│   ├── finanzas/                  # Finance components
│   │   ├── ingreso-form.tsx       # Add/edit income
│   │   ├── gasto-form.tsx         # Add/edit expense
│   │   ├── transaccion-*.tsx      # Transaction list/items
│   │   ├── balance-card.tsx       # Who owes whom
│   │   ├── patrimonio-card.tsx    # Total wealth display
│   │   ├── beca-*.tsx             # Scholarship components
│   │   ├── prestamo-*.tsx         # Loan components
│   │   ├── meta-*.tsx             # Savings goal components
│   │   ├── transferencia-*.tsx    # Transfer components
│   │   ├── tabla-anual.tsx        # 12-month scrollable table
│   │   └── categoria-picker.tsx   # Category selector
│   ├── tareas/                    # Household tasks
│   │   ├── tarea-chip.tsx         # Compact task chip
│   │   ├── tareas-carousel.tsx    # Horizontal scroll
│   │   └── tarea-detail-sheet.tsx # Task details modal
│   └── graficos/                  # Recharts components
│       ├── grafico-evolucion.tsx  # Wealth evolution
│       ├── grafico-ingresos-gastos.tsx
│       ├── grafico-distribucion.tsx
│       └── grafico-balance-mensual.tsx
├── hooks/
│   ├── use-ingresos.ts            # Income CRUD + realtime
│   ├── use-gastos.ts              # Expenses CRUD + realtime
│   ├── use-balance.ts             # Couple balance calculation
│   ├── use-patrimonio.ts          # Wealth calculation
│   ├── use-config-hogar.ts        # Household config
│   ├── use-cuenta-conjunta.ts     # Joint account
│   ├── use-transferencias.ts      # Transfers between accounts
│   ├── use-becas.ts               # Scholarships
│   ├── use-prestamos.ts           # Loans
│   ├── use-metas.ts               # Savings goals
│   ├── use-tareas.ts              # Household tasks
│   ├── use-calculadora-piso.ts    # Mortgage calculator
│   ├── use-historico-anual.ts     # Annual data
│   ├── use-graficos-data.ts       # Chart data preparation
│   └── use-mes-actual.ts          # Month state management
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   └── server.ts              # Server client
│   └── utils/
│       └── money.ts               # formatMoney, parseMoney (céntimos)
├── types/
│   ├── finanzas.ts                # Ingreso, Gasto, Beca, Prestamo, Meta
│   ├── tareas.ts                  # TareaHogar, TAREAS_INICIALES
│   ├── config.ts                  # ConfigHogar, SaldosIniciales
│   └── calculadora-piso.ts        # Mortgage types
├── providers/
│   └── supabase-provider.tsx      # Auth context
└── middleware.ts                  # Route protection
```

### Database Schema

**Migrations in `supabase/migrations/`:**
- `001_initial_schema.sql` - Base tables (profiles, hogares, listas, menus, gastos, ingresos)
- `002_finanzas_completo.sql` - Extended tables (becas, prestamos, metas, tareas_hogar)

**Key Tables:**
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles, linked to auth.users |
| `hogares` | Household (max 2 members), stores config as JSONB |
| `ingresos` | Income records (céntimos) |
| `gastos` | Expense records (céntimos) |
| `becas` | Scholarships with status (pendiente/mensual/cobrada) |
| `prestamos` | Loans between couple |
| `metas` | Savings goals with progress |
| `tareas_hogar` | Household chores with frequency |
| `tareas_historial` | Task completion history |

**RLS Pattern:** All tables use `hogar_id = get_my_hogar_id()` for row-level security.

**Money Storage:** All monetary values stored as INTEGER (céntimos). Display with `formatMoney()`.

### Supabase Integration

```typescript
// Client-side (hooks, components)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server-side (Server Components, Route Handlers)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Auth context
import { useSupabase } from '@/providers/supabase-provider'
const { user, supabase, loading } = useSupabase()
```

### Design System (iOS HIG)

**CSS Variables (`globals.css`):**
```css
--accent: #7D8B74;        /* Sage green */
--positive: #34C759;      /* iOS green */
--negative: #FF3B30;      /* iOS red */
--warning: #FF9500;       /* iOS orange */
--background: #F2F2F7;    /* iOS system gray */
--surface: #FFFFFF;
```

**Safe Areas:**
```css
--sat: env(safe-area-inset-top);
--sab: env(safe-area-inset-bottom);
```

**Component Classes:** `.card`, `.btn-primary`, `.btn-secondary`, `.input`

**Touch Targets:** Minimum 44pt for all interactive elements.

### Key Patterns

**Forms:** Use Vaul sheets for fullscreen forms on mobile:
```tsx
import { Drawer } from 'vaul'
<Drawer.Root open={open} onOpenChange={setOpen}>
  <Drawer.Content>...</Drawer.Content>
</Drawer.Root>
```

**Swipe to Delete:**
```tsx
import { useSwipeable } from 'react-swipeable'
const handlers = useSwipeable({
  onSwipedLeft: () => onDelete(),
  delta: 50
})
```

**Haptic Feedback:**
```typescript
navigator.vibrate?.(50) // Light tap
```

**Money Formatting:**
```typescript
import { formatMoney, parseMoney } from '@/lib/utils/money'
formatMoney(1234)  // "12,34€"
parseMoney("12,34") // 1234 (céntimos)
```

### Routing

- Routes under `(tabs)/` show BottomNav
- Routes `/camera`, `/login` hide BottomNav (defined in `bottom-nav.tsx`)
- Middleware protects all routes except `/login`, `/auth/*`

### Environment Variables

**Required (`.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-only
GEMINI_API_KEY=xxx             # For OCR (Phase 3)
```

### Current Status

**Phase 2 Complete (Finances):**
- ✅ Income/Expense CRUD with realtime sync
- ✅ Balance calculation (who owes whom)
- ✅ Wealth tracking (físico + digital per person)
- ✅ Joint account management
- ✅ Transfers between accounts
- ✅ Scholarships/grants tracking
- ✅ Loans between couple
- ✅ Savings goals with progress
- ✅ Mortgage calculator with affordability check
- ✅ Annual history view (12-month tables)
- ✅ Charts (evolution, distribution, balance)
- ✅ Household tasks (12 default + add custom)
- ✅ Settings with JSON export

**Phase 3 Pending (Shopping + Menu):**
- 🔲 Smart shopping lists with budget tracking
- 🔲 Camera OCR for price extraction (Gemini Flash)
- 🔲 Weekly meal planning
- 🔲 Auto-generate shopping list from recipes

### First-Time User Flow

When a user logs in without a hogar:
1. `useConfigHogar()` detects no `hogar_id` in profile
2. Call `crearHogar()` to create household
3. Initial 12 tasks created via `crearTareasIniciales()`
4. User can start adding data
