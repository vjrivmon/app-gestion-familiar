# Checklist: Fase 5 - Deployment

## Objetivo

Configurar CI/CD, staging y estrategias de deployment seguro.

---

## Items

### 1. CI/CD Pipeline

- [ ] **GitHub Actions** configurado
  - Verificar: `ls .github/workflows/`

- [ ] **Workflow de CI**:
  - [ ] Lint
  - [ ] Type check
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] Build

- [ ] **Workflow de CD**:
  - [ ] Deploy a staging (en PR merge)
  - [ ] Deploy a producción (en release)

- [ ] **Secrets configurados**
  - En GitHub repository settings
  - No en código

### 2. Staging Environment

- [ ] **Ambiente de staging** creado
  - URL: staging.example.com
  - Base de datos separada
  - Variables de entorno separadas

- [ ] **Paridad con producción**
  - Mismo proveedor
  - Misma configuración
  - Solo datos de prueba

- [ ] **Acceso restringido**
  - Auth básica o IP whitelist
  - No indexable por buscadores

### 3. Feature Flags

- [ ] **Sistema de feature flags**
  - LaunchDarkly / Unleash / custom
  - Verificar: `grep -r "feature.*flag\|isEnabled" src/`

- [ ] **Flags configurados**:
  - [ ] Por ambiente (staging vs prod)
  - [ ] Por usuario (beta testers)
  - [ ] Por porcentaje (rollout gradual)

### 4. Rollback Strategy

- [ ] **Rollback documentado**
  - Cómo revertir un deploy
  - Quién tiene acceso

- [ ] **Vercel/Railway/etc.** rollback
  - Un clic para revertir
  - Historial de deploys

- [ ] **Database migrations** reversibles
  - Migraciones up y down
  - Plan de rollback de schema

### 5. Load Testing

- [ ] **Herramienta configurada**
  - k6 / Artillery / Locust
  - Verificar: `ls k6/ || ls tests/load/`

- [ ] **Escenarios definidos**:
  - [ ] Homepage load
  - [ ] Login flow
  - [ ] API endpoints críticos
  - [ ] Picos de tráfico

- [ ] **Baseline establecido**
  - Requests/segundo soportados
  - P95 response time
  - Error rate aceptable

### 6. Monitoring de Deploys

- [ ] **Notificaciones de deploy**
  - Slack / Discord / Email
  - Cuando empieza y termina

- [ ] **Health check post-deploy**
  - Verificar endpoints críticos
  - Rollback automático si falla

---

## Comandos de Verificación

```bash
# CI/CD
ls .github/workflows/

# Feature flags
grep -r "feature\|flag" src/

# Load tests
ls k6/ || ls tests/load/
```

---

## Código de Ejemplo

### GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

### GitHub Actions CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

### Feature Flag Simple

```typescript
// src/lib/features.ts
const features = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",
  betaFeature: process.env.FEATURE_BETA === "true",
};

export const isFeatureEnabled = (feature: keyof typeof features) => {
  return features[feature] ?? false;
};
```

### k6 Load Test

```javascript
// k6/load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  const res = http.get("https://staging.example.com/api/health");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

---

## Variables de Entorno

```bash
# CI/CD
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...

# Feature flags
FEATURE_NEW_DASHBOARD=false
FEATURE_BETA=false
```

---

## Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CI/CD](https://vercel.com/docs/concepts/git)
- [k6 Load Testing](https://k6.io/docs/)
- [Feature Flag Best Practices](https://launchdarkly.com/blog/what-are-feature-flags/)

---

## Verificación Final

Una vez completada esta fase:

```
/scale:checklist --report
```

Esto genera reporte completo de production-readiness.
