# Checklist: Fase 3 - Observability

## Objetivo

Implementar monitoring, logging y analytics para visibilidad en producción.

---

## Items

### 1. Error Tracking

- [ ] **Sentry configurado**
  - Cuenta creada
  - DSN en .env
  - Verificar: `grep -r "sentry" src/`

- [ ] **sentry.client.config.ts** presente
  - Verificar: `ls sentry.client.config.ts`

- [ ] **sentry.server.config.ts** presente
  - Verificar: `ls sentry.server.config.ts`

- [ ] **Source maps** configurados
  - Para mejor stack traces
  - Upload en build

- [ ] **Release tracking**
  - Versión en cada deploy
  - Asociar commits

### 2. Logging Estructurado

- [ ] **Logger configurado**
  - Winston / Pino / similar
  - Verificar: `grep -r "winston\|pino\|logger" src/`

- [ ] **Formato JSON** en producción
  - Facilita parsing
  - Compatible con log aggregators

- [ ] **Niveles de log** definidos
  - error: Errores críticos
  - warn: Warnings
  - info: Info general
  - debug: Solo en desarrollo

- [ ] **Contexto** en cada log
  - requestId
  - userId (si autenticado)
  - timestamp

### 3. Analytics

- [ ] **PostHog/Mixpanel** configurado
  - Cuenta creada
  - API key en .env
  - Verificar: `grep -r "posthog\|mixpanel" src/`

- [ ] **Eventos de negocio** trackeados:
  - [ ] user_signed_up
  - [ ] user_logged_in
  - [ ] subscription_started
  - [ ] feature_used
  - [ ] error_occurred

- [ ] **User identification**
  - Identificar usuario autenticado
  - Properties de usuario

### 4. APM (Application Performance Monitoring)

- [ ] **APM configurado** (opcional pero recomendado)
  - Datadog / New Relic / Vercel Analytics
  - Verificar: `grep -r "datadog\|newrelic" src/`

- [ ] **Métricas trackeadas**:
  - Response time
  - Error rate
  - Throughput

### 5. Alertas

- [ ] **Alertas configuradas** en Sentry
  - Error rate > threshold
  - Nuevos errores

- [ ] **Alertas de uptime**
  - BetterUptime / UptimeRobot
  - Notificación si app cae

- [ ] **Canales de notificación**
  - Email
  - Slack (recomendado)

---

## Comandos de Verificación

```bash
# Sentry
grep -r "@sentry" package.json
ls sentry.*.config.ts

# Logger
grep -r "logger\." src/

# Analytics
grep -r "posthog\|analytics" src/
```

---

## Código de Ejemplo

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Logger

```typescript
// src/lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" }
      : undefined,
});
```

### PostHog

```typescript
// src/lib/analytics.ts
import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "https://app.posthog.com",
  });
}

export const trackEvent = (event: string, properties?: object) => {
  posthog.capture(event, properties);
};
```

---

## Variables de Entorno

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# Logging
LOG_LEVEL=info
```

---

## Recursos

- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [PostHog Docs](https://posthog.com/docs)
- [Pino Logger](https://github.com/pinojs/pino)

---

## Siguiente Fase

Una vez completado:

```
/scale:iteration compliance
```
