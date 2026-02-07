# /mvp:fix - Ejecutar Correcciones desde Feedback Existente

Genera historias y tareas desde un FEEDBACK.md existente y lanza el swarm de
correcciones. Útil cuando ya tienes feedback recopilado.

## Uso

```
/mvp:fix
/mvp:fix <proyecto>
/mvp:fix flowlearn --dry-run
```

## Cuándo Usar

- Después de `/mvp:feedback` para ejecutar las correcciones
- Cuando ya tienes un FEEDBACK.md listo
- Para relanzar correcciones tras pausa o errores

## Instrucciones para Claude

Cuando el usuario ejecute `/mvp:fix [proyecto]`:

### 1. Localizar FEEDBACK.md

Si se proporciona proyecto:

```bash
cat .claude/feedback/FEEDBACK-<proyecto>.md
```

Si no se proporciona:

```bash
# Buscar el más reciente
ls -t .claude/feedback/FEEDBACK-*.md | head -1
```

Si no existe ninguno:

```
ERROR: No se encontró FEEDBACK.md

Primero ejecuta:
  /mvp:feedback <proyecto>  (solo entrevista)
  /mvp:harden <proyecto>    (flujo completo)
```

### 2. Parsear FEEDBACK.md

Extraer del archivo:

- Nombre del proyecto (frontmatter)
- Lista de issues con sus IDs
- Severidades
- Priorización del usuario
- Total de issues por categoría

### 3. Verificar Prerrequisitos

```bash
# Verificar git status limpio
git status --porcelain

# Verificar que no hay swarm activo
[ -f ".claude/swarm-active" ] && echo "ERROR: Swarm ya activo"

# Verificar que no hay historias H1XX previas sin completar
ls .claude/stories/H1*.md 2>/dev/null | head -5
```

Si hay historias H1XX existentes, preguntar:

```
Se encontraron historias de hardening previas:
  H101-fix-login.md
  H102-mejoras-ux.md

¿Qué deseas hacer?
[1] Continuar desde donde quedamos (recomendado)
[2] Regenerar todas las historias
[3] Cancelar
```

### 4. FASE 1: Generar Historias

Aplicar reglas de conversión:

| Issues                        | Resultado                   |
| ----------------------------- | --------------------------- |
| 1 bug CRITICAL                | 1 historia H1XX             |
| 2-3 bugs HIGH relacionados    | 1 historia agrupada         |
| Issues UX de misma pantalla   | 1 historia                  |
| 1 SEC issue (cualquier nivel) | 1 historia dedicada         |
| PERF issues relacionados      | 1 historia                  |
| FEAT CRITICAL/HIGH            | 1 historia cada uno         |
| Issues MEDIUM similares       | Agrupar                     |
| Issues LOW                    | Agrupar o diferir a backlog |

**Formato de historia hardening:**

```markdown
---
id: H101
title: <título descriptivo>
priority: critical | high | medium | low
type: fix | improvement | feature
source: [BUG-001, BUG-002]
depends_on: []
parallelizable: true | false
estimated_tasks: N
---

# Historia: <título>

## Origen

Esta historia aborda los siguientes issues del feedback:

- [BUG-001] <descripción>
- [BUG-002] <descripción>

## Narrativa

**Como** <usuario> **Quiero** <qué se arregla/mejora> **Para** <beneficio>

## Criterios de Aceptación

1. **Dado** <contexto> **Cuando** <acción> **Entonces** <resultado esperado>

## Verificación

- [ ] Issue original ya no se reproduce
- [ ] No se introducen regresiones
- [ ] Tests cubren el caso

## Notas Técnicas

<Consideraciones de implementación>
```

Guardar en `.claude/stories/H1XX-<nombre-slug>.md`

### 5. FASE 2: Generar Tareas

Para cada historia, dividir en tareas atómicas:

```bash
# Usar lógica de tasks:parallel
```

**Formato de tarea hardening:**

```markdown
---
id: T101
story: H101
title: <título>
status: pending
depends_on: []
blocks: []
owner: null
---

# Tarea: <título>

## Historia Padre

[H101 - <nombre>](../stories/H101-<nombre>.md)

## Descripción

<Qué hacer exactamente>

## Archivos a Modificar

- `src/path/to/file.ts` - <qué cambiar>

## Criterios de Completitud

- [ ] Código implementado
- [ ] Sin errores TypeScript/ESLint
- [ ] Tests escritos
- [ ] Issue original verificado
```

Guardar en `.claude/tasks/T1XX-<nombre>.md`

### 6. Detectar Dependencias

Analizar tareas para detectar:

1. Dependencias explícitas (una tarea necesita output de otra)
2. Interfaces compartidas (crear contratos)
3. Recursos compartidos (DB, APIs)

Generar grafo de dependencias.

### 7. FASE 3: Mostrar Plan

```
═══════════════════════════════════════════════════════════════
  PLAN DE CORRECCIONES
═══════════════════════════════════════════════════════════════

FEEDBACK: .claude/feedback/FEEDBACK-<proyecto>.md
ISSUES: XX total (Y critical, Z high)

HISTORIAS GENERADAS:
  ┌──────┬───────────────────────────────┬──────────┬─────────┐
  │ ID   │ Título                        │ Prioridad│ Issues  │
  ├──────┼───────────────────────────────┼──────────┼─────────┤
  │ H101 │ Fix login case-insensitive    │ critical │ BUG-001 │
  │ H102 │ Mejoras UX registro           │ high     │ UX-001,2│
  │ H103 │ Optimizar dashboard           │ medium   │ PERF-001│
  └──────┴───────────────────────────────┴──────────┴─────────┘

TAREAS GENERADAS:
  Nivel 0 (sin deps):    T101, T103
  Nivel 1 (deps nivel 0): T102, T104
  Nivel 2 (deps nivel 1): T105

AGENTES RECOMENDADOS: 4 (máximo paralelo en nivel 1)

═══════════════════════════════════════════════════════════════
```

### 8. Confirmación

```
¿Continuar con el lanzamiento?

[1] Sí, lanzar 4 agentes (recomendado)
[2] Lanzar con menos agentes (especificar)
[3] Solo generar archivos, no lanzar
[4] Cancelar
```

### 9. FASE 4: Lanzar Swarm

Si el usuario confirma:

```bash
# Invocar swarm:launch
/swarm:launch <N>
```

### 10. Actualizar Estado

Crear/actualizar `.claude/hardening/progress.json`:

```json
{
  "project": "<proyecto>",
  "started_at": "2024-01-15T10:00:00Z",
  "feedback_file": ".claude/feedback/FEEDBACK-<proyecto>.md",
  "phase": "swarm_running",
  "stories": ["H101", "H102", "H103"],
  "tasks": ["T101", "T102", "T103", "T104", "T105"],
  "agents_launched": 4,
  "completed_tasks": []
}
```

### 11. Output Final

```
═══════════════════════════════════════════════════════════════
  CORRECCIONES LANZADAS
═══════════════════════════════════════════════════════════════

HISTORIAS: 3 (H101-H103)
TAREAS: 5 (T101-T105)
AGENTES: 4 ejecutándose

ARCHIVOS GENERADOS:
  .claude/stories/H101-fix-login.md
  .claude/stories/H102-mejoras-ux.md
  .claude/stories/H103-optimizar-dashboard.md
  .claude/tasks/T101-*.md
  .claude/tasks/T102-*.md
  ...

MONITOREO:
  /swarm:status   - Ver progreso
  /swarm:stop     - Detener

CUANDO TERMINEN:
  /swarm:integrate - Merge automático

═══════════════════════════════════════════════════════════════
```

## Flags Opcionales

### --dry-run

Muestra el plan sin ejecutar:

```
/mvp:fix flowlearn --dry-run
```

### --max-agents N

Limita número de agentes:

```
/mvp:fix --max-agents 2
```

### --no-launch

Solo genera historias y tareas, sin lanzar swarm:

```
/mvp:fix --no-launch
```

Después puedes lanzar manualmente:

```
/swarm:launch 4
```

### --priority critical|high

Solo procesa issues de cierta prioridad:

```
/mvp:fix --priority critical
```

## Recuperación de Errores

Si el swarm falló previamente:

```
/mvp:fix --resume
```

Esto:

1. Lee `progress.json`
2. Identifica tareas incompletas
3. Relanza solo las pendientes

## Relación con Otros Comandos

```
/mvp:feedback  →  Genera FEEDBACK.md
       ↓
/mvp:fix       →  [ESTE COMANDO] Genera historias/tareas + lanza
       ↓
/swarm:status  →  Monitorea progreso
       ↓
/swarm:integrate → Merge cuando termine

═══════════════════════════════════════════════════════════════

/mvp:harden = /mvp:feedback + /mvp:fix (todo en uno)
```
