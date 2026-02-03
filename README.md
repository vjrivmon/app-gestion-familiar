# App de Pus 🛒

Compra inteligente, menú semanal y finanzas de pareja.

## Setup

### 1. Supabase
1. Ve a tu proyecto: https://areozxxftwktirkgjppu.supabase.co
2. SQL Editor → New query
3. Copia y ejecuta el contenido de `supabase/migrations/001_initial_schema.sql`

### 2. Vercel
1. Ve a [vercel.com](https://vercel.com) y conecta este repo
2. En Settings → Environment Variables, añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://areozxxftwktirkgjppu.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (la anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (de Supabase → Settings → API → service_role)
   - `GEMINI_API_KEY` = (de https://aistudio.google.com/apikey)

### 3. GitHub Actions (opcional)
Si quieres deploy por Actions en vez del integration de Vercel:
1. En GitHub → Settings → Secrets, añade:
   - `VERCEL_TOKEN` (de vercel.com → Settings → Tokens)
   - `VERCEL_ORG_ID` (de Vercel project settings)
   - `VERCEL_PROJECT_ID` (de Vercel project settings)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Stack
- **Next.js 15** + React 19 + TypeScript
- **Tailwind CSS** 
- **Supabase** (Auth + PostgreSQL + Realtime)
- **Vercel** (hosting)

## PWA
La app es instalable en iOS:
1. Abre en Safari
2. Compartir → Añadir a pantalla de inicio
