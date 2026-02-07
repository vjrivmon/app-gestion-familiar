# /scale:iteration - Ejecutar Iteración de Escalado

Ejecuta una iteración completa de mejora para una fase específica.

## Uso

```
/scale:iteration <fase>
```

Fases disponibles:

- `auth` - Autenticación + Seguridad
- `billing` - Pagos + Monetización
- `monitoring` - Observability + Logging
- `compliance` - GDPR + Legal
- `performance` - Optimización + Caching
- `testing` - Coverage + E2E

## Skills Relevantes

Antes de implementar cada fase, consulta el skill correspondiente para aplicar
las mejores prácticas:

| Fase        | Skill a Invocar         | Principios                    |
| ----------- | ----------------------- | ----------------------------- |
| auth        | `/auth-security`        | 42 principios de seguridad    |
| billing     | `/billing-saas`         | 36 principios de monetización |
| monitoring  | `/observability`        | 36 principios de monitoreo    |
| compliance  | `/production-readiness` | Sección de compliance/data    |
| performance | `/production-readiness` | Sección de escalabilidad      |

## Instrucciones para Claude

Cuando el usuario ejecute `/scale:iteration <fase>`:

### 1. Cargar Checklist de la Fase

Lee el checklist correspondiente:

- `auth` → `.claude/checklists/phase-1-auth-security.md`
- `billing` → `.claude/checklists/phase-2-billing.md`
- `monitoring` → `.claude/checklists/phase-3-observability.md`
- `compliance` → `.claude/checklists/phase-4-compliance.md`
- `performance` → `.claude/checklists/phase-0-architecture.md`
- `testing` → (Tests E2E, cobertura 80%+)

### 2. Analizar Estado Actual

```bash
# Para auth
grep -r "nextauth\|clerk\|auth0" --include="*.ts" --include="*.tsx"
cat middleware.ts 2>/dev/null

# Para billing
grep -r "stripe\|paddle" --include="*.ts"
ls src/app/api/webhooks/ 2>/dev/null

# Para monitoring
grep -r "sentry\|posthog\|datadog" --include="*.ts"
cat sentry.client.config.ts 2>/dev/null
```

### 3. Generar Historias Automáticamente

Para cada item pendiente del checklist, genera una historia:

```markdown
# Historia: Implementar [item del checklist]

## Como

- Desarrollador del proyecto

## Quiero

- [Descripción del item]

## Para

- Cumplir requisitos de producción de fase [X]

## Criterios de Aceptación

1. [Criterio específico derivado del checklist]
2. [Criterio de testing]
3. [Criterio de documentación si aplica]

## Dependencias

- [Otras historias que deben completarse primero]

## Parallelizable

- Sí/No
```

Guarda en `.claude/stories/H<XXX>-<fase>-<item>.md`

### 4. Dividir en Tareas

Para cada historia, genera tareas atómicas:

```markdown
---
id: T<XXX>
story: H<XXX>
parallelizable: true/false
depends_on: [T<YYY>]
interfaces:
  - name: NombreInterface
    file: src/path/to/file.ts
    contract: |
      interface Example { ... }
---

# Tarea: [Nombre específico]

## Descripción

[Qué hacer exactamente]

## Archivos a Modificar

- `src/...`

## Criterios de Completitud

- [ ] Código implementado
- [ ] Tests escritos
- [ ] Sin errores de lint/type
```

### 5. Crear Plan de Iteración

Genera `.claude/scale/ITERATION-<fase>.md`:

```markdown
# Plan de Iteración: [Fase]

## Resumen

- Historias generadas: X
- Tareas totales: Y
- Tareas paralelas: Z

## Grafo de Dependencias
```

T001 (setup) ├── T002 (config) [paralelo con T003] ├── T003 (types) [paralelo
con T002] └── T004 (implementation) [depende de T002, T003] └── T005 (tests)
[depende de T004]

```

## Orden de Ejecución
1. T001 - Setup inicial
2. T002, T003 - En paralelo
3. T004 - Después de 2,3
4. T005 - Tests finales

## Comando de Ejecución

Para lanzar con 4 agentes paralelos:
\`\`\`
/swarm:launch 4
\`\`\`
```

### 6. Ofrecer Siguiente Paso

Pregunta al usuario:

```
Iteración [fase] preparada:
- X historias generadas
- Y tareas creadas
- Z pueden ejecutarse en paralelo

¿Deseas:
1. Revisar las tareas antes de lanzar
2. Lanzar /swarm:launch [N] ahora
3. Ejecutar manualmente una por una
```

## Output Esperado

1. Historias en `.claude/stories/`
2. Tareas en `.claude/tasks/`
3. Plan en `.claude/scale/ITERATION-<fase>.md`
4. Progress actualizado en `.claude/scale/progress.json`
