# Checklist: Fase 1 - Auth + Security

## Objetivo

Implementar autenticación robusta y medidas de seguridad básicas.

---

## Items

### 1. Sistema de Autenticación

- [ ] **Librería de auth configurada**
  - NextAuth.js / Clerk / Auth0
  - Verificar: `grep -r "nextauth\|clerk\|auth0" src/`

- [ ] **Providers configurados**
  - Email/Password
  - Google OAuth (recomendado)
  - GitHub OAuth (opcional)

- [ ] **Sesiones/JWT configurados**
  - Tokens seguros
  - Refresh tokens (si aplica)
  - Expiración configurada

- [ ] **Páginas de auth**
  - /login
  - /register
  - /forgot-password
  - /reset-password

### 2. Middleware de Auth

- [ ] **middleware.ts** configurado
  - Verificar: `ls src/middleware.ts`
  - Protege rutas privadas
  - Redirige a login si no autenticado

- [ ] **Rutas protegidas definidas**
  - Lista clara de qué requiere auth
  - Roles si aplica (admin, user)

### 3. Rate Limiting

- [ ] **Rate limiter implementado**
  - Upstash / Redis-based
  - Verificar: `grep -r "ratelimit" src/`

- [ ] **Límites por endpoint**
  - Login: 5/min
  - Register: 3/min
  - API general: 100/min

- [ ] **Respuesta 429** correcta
  - Headers Retry-After
  - Mensaje claro

### 4. CORS

- [ ] **CORS configurado**
  - Verificar: `grep -r "cors" next.config`
  - Origins específicos (no \*)
  - Methods permitidos

### 5. Headers de Seguridad

- [ ] **Security headers presentes**
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
  - Content-Security-Policy

- [ ] **Helmet o similar** configurado
  - Verificar: `grep -r "helmet\|securityHeaders" src/`

### 6. Validación de Inputs

- [ ] **Schema validation** en todas las APIs
  - Zod / Yup / Joi
  - Verificar: `grep -r "z\\.object\|yup\\.object" src/`

- [ ] **Sanitización** de outputs
  - XSS prevention
  - SQL injection prevention

---

## Comandos de Verificación

```bash
# Auth
grep -r "nextauth\|signIn\|signOut" src/

# Rate limiting
grep -r "ratelimit\|Ratelimit" src/

# Security headers
curl -I http://localhost:3000 | grep -i "x-frame\|strict-transport"

# Validación
grep -r "z\\.object\|z\\.string" src/
```

---

## Código de Ejemplo

### NextAuth Setup

```typescript
// src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    authorized: ({ auth }) => !!auth,
  },
});
```

### Rate Limiting

```typescript
// src/middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

## Recursos

- [NextAuth.js Docs](https://authjs.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts)

---

## Siguiente Fase

Una vez completado:

```
/scale:iteration billing
```
