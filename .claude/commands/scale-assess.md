# /scale:assess - Evaluación de MVP para Escalado

Evalúa el estado actual de un MVP y genera un roadmap personalizado de escalado.

## Uso

```
/scale:assess <nombre-proyecto>
```

## Instrucciones para Claude

Cuando el usuario ejecute `/scale:assess <proyecto>`:

### 1. Análisis del Proyecto

Analiza la estructura del proyecto buscando:

```bash
# Estructura de archivos
ls -la
find . -name "package.json" -o -name "requirements.txt" -o -name "Cargo.toml"

# Configuración existente
cat package.json 2>/dev/null | jq '.dependencies, .devDependencies'
cat docker-compose.yml 2>/dev/null
cat .env.example 2>/dev/null
```

### 2. Detectar Estado por Fase

Evalúa cada fase de producción:

**Fase 0 - Arquitectura**:

- [ ] Docker/containerización configurado
- [ ] Variables de entorno separadas por ambiente
- [ ] Estructura de carpetas clean architecture

**Fase 1 - Auth + Security**:

- [ ] Sistema de autenticación (NextAuth, Auth0, Clerk, etc.)
- [ ] Rate limiting implementado
- [ ] Headers de seguridad (helmet, CORS)
- [ ] Validación de inputs (zod, joi)

**Fase 2 - Billing**:

- [ ] Integración de pagos (Stripe, Paddle)
- [ ] Modelos de subscripción
- [ ] Webhooks de pago
- [ ] Gestión de planes

**Fase 3 - Observability**:

- [ ] Error tracking (Sentry)
- [ ] Logging estructurado
- [ ] Analytics (PostHog, Mixpanel)
- [ ] APM configurado

**Fase 4 - Compliance**:

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] GDPR compliance
- [ ] Cookie consent

**Fase 5 - Deployment**:

- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Tests automatizados
- [ ] Estrategia de rollback

### 3. Generar Roadmap

Crea el archivo `.claude/scale/ROADMAP-<proyecto>.md`:

```markdown
# Roadmap de Escalado: <proyecto>

## Estado Actual

### Resumen

- MVP funcional: ✅/❌
- Test coverage: X%
- Documentación: ✅/❌

### Por Fase

| Fase             | Estado       | Items Completados |
| ---------------- | ------------ | ----------------- |
| 0 - Arquitectura | ⚠️ Parcial   | 2/4               |
| 1 - Auth         | ❌ Pendiente | 0/6               |
| ...              | ...          | ...               |

## Iteraciones Recomendadas

### Prioridad CRÍTICA

1. **Fase 1: Auth + Security**
   - Razón: Sin auth no hay producto viable
   - Esfuerzo estimado: 1 semana
   - Bloqueantes: Ninguno

### Prioridad ALTA

2. **Fase 3: Observability**
   - Razón: Necesario antes de producción
   - Esfuerzo estimado: 3 días
   - Bloqueantes: Ninguno

### Prioridad MEDIA

3. **Fase 2: Billing**
   - Razón: Monetización
   - Esfuerzo estimado: 1 semana
   - Bloqueantes: Fase 1 completada

## Siguiente Paso

Ejecuta: \`\`\` /scale:iteration auth \`\`\`
```

### 4. Guardar Estado

Actualiza `.claude/scale/progress.json`:

```json
{
  "project": "<nombre>",
  "assessed_at": "2024-01-XX",
  "phases": {
    "0": { "status": "partial", "completed": 2, "total": 4 },
    "1": { "status": "pending", "completed": 0, "total": 6 }
  },
  "next_iteration": "auth",
  "roadmap_file": ".claude/scale/ROADMAP-<proyecto>.md"
}
```

## Output Esperado

1. Roadmap completo en `.claude/scale/ROADMAP-<proyecto>.md`
2. Progress tracking en `.claude/scale/progress.json`
3. Resumen en consola con próximos pasos recomendados
