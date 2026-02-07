# /scale:checklist - Checklist de Production-Readiness

Muestra y valida el checklist interactivo de production-readiness.

## Uso

```
/scale:checklist [fase]
```

- Sin argumento: Muestra todas las fases
- Con fase: Muestra checklist específico (`auth`, `billing`, `monitoring`, etc.)

## Instrucciones para Claude

Cuando el usuario ejecute `/scale:checklist`:

### 1. Cargar Estado Actual

Lee `.claude/scale/progress.json` para conocer el estado:

```json
{
  "phases": {
    "0": { "status": "completed", "items": {...} },
    "1": { "status": "in_progress", "items": {...} }
  }
}
```

### 2. Mostrar Checklist Interactivo

Para cada fase, muestra el estado visual:

```
═══════════════════════════════════════════════════
  PRODUCTION READINESS CHECKLIST
═══════════════════════════════════════════════════

FASE 0: ARQUITECTURA CLOUD-NATIVE
──────────────────────────────────
  ✅ Docker configurado
  ✅ docker-compose.yml presente
  ⬜ Variables de entorno por ambiente
  ⬜ Health checks implementados

  Progreso: 2/4 (50%)
  Comando verificación: docker compose config

FASE 1: AUTH + SECURITY
──────────────────────────
  ⬜ Sistema de autenticación
  ⬜ Middleware de auth
  ⬜ Rate limiting
  ⬜ CORS configurado
  ⬜ Headers de seguridad
  ⬜ Validación de inputs

  Progreso: 0/6 (0%)
  Para implementar: /scale:iteration auth

[... más fases ...]

═══════════════════════════════════════════════════
  RESUMEN TOTAL: 8/30 items (27%)
  Siguiente: Fase 1 - Auth + Security
═══════════════════════════════════════════════════
```

### 3. Validación Automática

Para items que se pueden verificar automáticamente:

```bash
# Docker
[ -f "Dockerfile" ] && echo "✅ Dockerfile" || echo "⬜ Dockerfile"
[ -f "docker-compose.yml" ] && echo "✅ docker-compose" || echo "⬜ docker-compose"

# Auth
grep -q "middleware" src/middleware.ts 2>/dev/null && echo "✅ Middleware" || echo "⬜ Middleware"

# Security
grep -rq "helmet\|secure-headers" . && echo "✅ Security headers" || echo "⬜ Security headers"

# Tests
npm run test -- --coverage 2>/dev/null | grep "Coverage" || echo "⬜ Tests"
```

### 4. Modo Interactivo (por fase)

Si el usuario especifica una fase:

```
/scale:checklist auth
```

Muestra checklist detallado con comandos de verificación:

```
FASE 1: AUTH + SECURITY - DETALLE
═════════════════════════════════

1. Sistema de Autenticación
   Estado: ⬜ No configurado
   Verificar: grep -r "nextauth\|clerk\|auth0" src/
   Implementar: /scale:iteration auth

2. Middleware de Auth
   Estado: ⬜ No encontrado
   Verificar: cat src/middleware.ts | grep "auth"
   Docs: https://nextjs.org/docs/app/building-your-application/authentication

3. Rate Limiting
   Estado: ⬜ No implementado
   Verificar: grep -r "ratelimit\|upstash" src/
   Recomendado: @upstash/ratelimit

[... más items ...]

¿Deseas implementar esta fase ahora? [s/n]
```

### 5. Actualizar Estado

Cuando un item se verifica como completado, actualiza progress.json:

```json
{
  "phases": {
    "1": {
      "status": "in_progress",
      "items": {
        "auth_system": { "completed": true, "verified_at": "2024-01-XX" },
        "middleware": { "completed": false },
        "rate_limiting": { "completed": false }
      }
    }
  }
}
```

### 6. Generar Reporte (opcional)

Si el usuario pide `/scale:checklist --report`:

```markdown
# Production Readiness Report

## Fecha: 2024-01-XX

## Proyecto: <nombre>

### Resumen Ejecutivo

- Completitud total: 27%
- Fases completadas: 0/5
- Bloqueadores críticos: Auth no implementado

### Por Fase

| Fase              | Estado       | Completitud |
| ----------------- | ------------ | ----------- |
| 0 - Arquitectura  | ⚠️ Parcial   | 50%         |
| 1 - Auth          | ❌ Pendiente | 0%          |
| 2 - Billing       | ❌ Pendiente | 0%          |
| 3 - Observability | ❌ Pendiente | 0%          |
| 4 - Compliance    | ❌ Pendiente | 0%          |
| 5 - Deployment    | ⚠️ Parcial   | 33%         |

### Recomendación

Priorizar Fase 1 (Auth) antes de continuar.
```

## Output Esperado

1. Visualización clara del estado actual
2. Comandos de verificación ejecutables
3. Próximos pasos recomendados
4. Actualización automática de progress.json
