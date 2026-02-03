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
- Next.js 15 with App Router, React 19, TypeScript
- Tailwind CSS with iOS-style design system
- Supabase (Auth, PostgreSQL, Realtime)
- PWA-enabled for iOS home screen installation

### Project Structure
```
src/
├── app/
│   ├── (tabs)/           # Tab-based pages with shared BottomNav layout
│   │   ├── home/
│   │   ├── compra/       # Shopping lists
│   │   ├── menu/         # Weekly meal planning
│   │   └── finanzas/     # Finances tracking
│   ├── login/
│   ├── camera/           # Fullscreen camera (hidden nav)
│   └── auth/callback/    # OAuth callback route
├── components/layout/    # Shared UI (BottomNav)
├── lib/supabase/         # Supabase client factories
├── providers/            # React context providers
└── middleware.ts         # Auth protection for routes
```

### Supabase Integration
- **Client-side**: `createClient()` from `@/lib/supabase/client` (browser)
- **Server-side**: `createClient()` from `@/lib/supabase/server` (Server Components/Route Handlers)
- **Auth context**: `useSupabase()` hook provides `{ supabase, user, loading }`

### Database Schema
Located in `supabase/migrations/001_initial_schema.sql`. Key entities:
- `hogares`: Household shared between 2 users (miembro_1, miembro_2)
- `listas_compra` / `productos_lista`: Shopping lists and items
- `menus_semanales` / `menu_dias` / `recetas`: Meal planning
- `gastos` / `ingresos`: Expense and income tracking

All tables use Row Level Security (RLS) with `get_my_hogar_id()` function for access control.

### Design System
CSS variables defined in `globals.css`:
- Colors: `--accent`, `--surface`, `--background`, `--positive`, `--negative`
- Safe area spacing: `--sat`, `--sab`, `--sal`, `--sar`
- Component classes: `.card`, `.btn-primary`, `.btn-secondary`, `.input`

Dark mode via `prefers-color-scheme: dark` media query.

### Routing Conventions
- Routes under `(tabs)/` show the bottom navigation bar
- Routes like `/camera`, `/comprar`, `/login` hide the nav (defined in `bottom-nav.tsx`)
- Middleware redirects unauthenticated users to `/login` and logged-in users away from `/login`

### Environment Variables
Required for local development (`.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `GEMINI_API_KEY` (AI features)
