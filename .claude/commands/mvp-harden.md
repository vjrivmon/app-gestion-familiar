# /mvp:harden - Flujo Completo de MVP Hardening

Flujo completo para fortalecer un MVP: entrevista de feedback, generación de
historias, división en tareas y lanzamiento automático de swarm.

## Uso

```
/mvp:harden <proyecto>
/mvp:harden flowlearn
/mvp:harden mi-app --skip-interview
```

## Instrucciones para Claude

Cuando el usuario ejecute `/mvp:harden <proyecto>`:

### 1. Verificar Prerrequisitos

```bash
# Verificar que existe SPEC del proyecto
ls .claude/specs/SPEC-<proyecto>.md 2>/dev/null || ls .claude/specs/<proyecto>.md

# Verificar estado del repositorio
git status --porcelain

# Verificar que no hay swarm activo
[ -f ".claude/swarm-active" ] && echo "ERROR: Swarm ya activo"
```

Si no existe SPEC, sugerir ejecutar primero `/project:interview <proyecto>`.

### 2. FASE 1: Entrevista de Feedback (15-25 preguntas)

Usa el skill `hardening-interviewer` para realizar la entrevista estructurada.

**Iniciar entrevista:**

```
═══════════════════════════════════════════════════════════════
  MVP HARDENING - Entrevista de Feedback
  Proyecto: <proyecto>
═══════════════════════════════════════════════════════════════

Voy a hacerte preguntas sobre tu experiencia usando el MVP.
El objetivo es identificar bugs, problemas de UX, performance,
seguridad y features faltantes.

Responde con ejemplos concretos cuando sea posible.
```

**Categorías a cubrir (usar AskUserQuestion):**

1. **BUGS** (3-5 preguntas)
   - Funcionalidades que no funcionan
   - Errores en consola
   - Flujos que no completan
   - Bugs por dispositivo/navegador

2. **UX** (3-5 preguntas)
   - Acciones con muchos clicks
   - Momentos de confusión
   - Feedback visual faltante
   - Problemas de layout

3. **PERFORMANCE** (2-4 preguntas)
   - Pantallas/acciones lentas
   - Lag o parpadeos
   - Consumo de recursos

4. **SECURITY** (2-3 preguntas)
   - Acceso no autorizado
   - Datos sensibles expuestos
   - Manejo de sesión

5. **FEATURES** (2-4 preguntas)
   - Funcionalidad prometida faltante
   - Features "obvias" esperadas
   - Integraciones faltantes

6. **PRIORIZACIÓN** (2-3 preguntas)
   - Top 3 crítico
   - Must-fix antes de producción
   - Qué puede esperar

**Para cada issue, obtener:**

- Título descriptivo
- Severidad: critical | high | medium | low
- Categoría: BUG | UX | PERF | SEC | FEAT
- Detalles específicos (pasos reproducir, dónde ocurre, etc.)

### 3. FASE 2: Generar FEEDBACK.md

Al terminar la entrevista:

```bash
# Leer template
cat .claude/templates/FEEDBACK-TEMPLATE.md
```

Crear `.claude/feedback/FEEDBACK-<proyecto>.md` con:

- Frontmatter con conteos
- Cada issue categorizado con ID único
- Tabla resumen por severidad
- Priorización del usuario

Formato de IDs:

- BUG-001, BUG-002, ...
- UX-001, UX-002, ...
- PERF-001, PERF-002, ...
- SEC-001, SEC-002, ...
- FEAT-001, FEAT-002, ...

### 4. FASE 3: Generar Historias (Automático)

Reglas de conversión a historias:

| Condición                    | Resultado                      |
| ---------------------------- | ------------------------------ |
| 1 bug CRITICAL               | 1 historia H1XX                |
| 2-3 bugs HIGH similares      | 1 historia agrupada            |
| Mejoras UX relacionadas      | 1 historia UX                  |
| 1 feature CRITICAL/HIGH      | 1 historia                     |
| Issues MEDIUM relacionados   | Agrupar en 1 historia          |
| Issues LOW                   | Agrupar por categoría o aplaza |
| Issues SEC (cualquier nivel) | 1 historia por cada uno        |
| Issues PERF                  | 1 historia si hay 2+ issues    |

**Prefijo de historias hardening: H1XX** (ej: H101, H102...)

Usar formato de `/stories:auto` pero adaptado para fixes:

```markdown
---
id: H101
title: Fix login con emails case-insensitive
priority: critical
source: [BUG-001]
type: fix
depends_on: []
estimated_tasks: 2
---

# Historia: Fix login con emails case-insensitive

## Narrativa

**Como** usuario registrado **Quiero** poder hacer login independientemente de
mayúsculas/minúsculas en email **Para** no ser bloqueado por un error de
capitalización

## Issues Relacionados

- [BUG-001] Login falla con emails en mayúsculas

## Criterios de Aceptación

1. **Dado** un usuario registrado con email "Test@Example.com" **Cuando**
   intenta login con "test@example.com" **Entonces** el login es exitoso

...
```

Guardar historias en `.claude/stories/H1XX-<nombre>.md`

### 5. FASE 4: Generar Tareas (Automático)

Usar `/tasks:parallel` internamente para dividir cada historia:

**Prefijo de tareas hardening: T1XX** (ej: T101, T102...)

Para cada historia H1XX:

1. Identificar subtareas atómicas
2. Detectar dependencias entre tareas
3. Crear contratos compartidos si hay interfaces

Guardar tareas en `.claude/tasks/T1XX-<nombre>.md`

### 6. FASE 5: Mostrar Plan

```
═══════════════════════════════════════════════════════════════
  PLAN DE HARDENING GENERADO
═══════════════════════════════════════════════════════════════

PROYECTO: <proyecto>

FEEDBACK RECOPILADO:
  BUGS:        X (Y critical, Z high)
  UX:          X
  PERFORMANCE: X
  SECURITY:    X
  FEATURES:    X
  ─────────────
  TOTAL:       XX issues

HISTORIAS GENERADAS: N
  H101 - Fix login case-insensitive (critical) [BUG-001]
  H102 - Mejoras UX formulario registro (high) [UX-001, UX-002]
  H103 - Optimizar carga dashboard (medium) [PERF-001]
  ...

TAREAS GENERADAS: M
  Nivel 0: T101, T103 (paralelo)
  Nivel 1: T102, T104 (paralelo)
  Nivel 2: T105

GRAFO DE DEPENDENCIAS:
  T101 ─┬─ T102
        │
  T103 ─┴─ T104 ── T105

MÁXIMO PARALELO: X agentes simultáneos

═══════════════════════════════════════════════════════════════
```

### 7. FASE 6: Confirmación y Lanzamiento

Preguntar al usuario:

```
¿Deseas lanzar el swarm ahora?

[1] Sí, lanzar X agentes (recomendado)
[2] Revisar primero las historias/tareas
[3] Cancelar
```

Si confirma:

```bash
# Ejecutar lanzamiento de swarm
/swarm:launch <N>
```

### 8. Output Final

```
═══════════════════════════════════════════════════════════════
  MVP HARDENING COMPLETADO
═══════════════════════════════════════════════════════════════

ARCHIVOS GENERADOS:
  .claude/feedback/FEEDBACK-<proyecto>.md
  .claude/stories/H101-<nombre>.md
  .claude/stories/H102-<nombre>.md
  ...
  .claude/tasks/T101-<nombre>.md
  .claude/tasks/T102-<nombre>.md
  ...

SWARM LANZADO: X agentes

MONITOREO:
  /swarm:status  - Ver estado actual
  /swarm:stop    - Detener todos

CUANDO TERMINEN:
  /swarm:integrate - Merge automático

═══════════════════════════════════════════════════════════════
```

## Flags Opcionales

### --skip-interview

Salta la entrevista y usa FEEDBACK.md existente:

```
/mvp:harden flowlearn --skip-interview
```

Equivalente a `/mvp:fix`.

### --dry-run

Muestra el plan sin ejecutar:

```
/mvp:harden flowlearn --dry-run
```

### --max-agents N

Limita agentes del swarm:

```
/mvp:harden flowlearn --max-agents 2
```

## Integración con Sistema

Este comando orquesta:

- `hardening-interviewer` (skill)
- `/stories:auto` (genera historias)
- `/tasks:parallel` (genera tareas)
- `/swarm:launch` (lanza agentes)

## Archivos Generados

```
.claude/
├── feedback/
│   └── FEEDBACK-<proyecto>.md
├── stories/
│   ├── H101-fix-login.md
│   ├── H102-mejoras-ux.md
│   └── STORIES-INDEX.md (actualizado)
├── tasks/
│   ├── T101-normalizar-email.md
│   ├── T102-tests-login.md
│   └── TASKS-INDEX.md (actualizado)
└── hardening/
    └── progress.json
```

## Estado de Progreso

`.claude/hardening/progress.json`:

```json
{
  "project": "<proyecto>",
  "started_at": "2024-01-15T10:00:00Z",
  "phase": "swarm_running",
  "feedback_file": ".claude/feedback/FEEDBACK-<proyecto>.md",
  "stories_generated": 5,
  "tasks_generated": 12,
  "agents_launched": 4,
  "completed_tasks": 0
}
```

## Ejemplo de Uso Completo

```
> /mvp:harden flowlearn

═══════════════════════════════════════════════════════════════
  MVP HARDENING - Entrevista de Feedback
  Proyecto: flowlearn
═══════════════════════════════════════════════════════════════

[Pregunta 1/~20] ¿Hay alguna funcionalidad que no funciona o da error?

> El login falla cuando uso mi email con mayúsculas

[Pregunta 2] ¿Qué error exacto ves?

> Dice "usuario no encontrado" aunque mi cuenta existe

[... continúa entrevista ...]

═══════════════════════════════════════════════════════════════
  PLAN DE HARDENING GENERADO
═══════════════════════════════════════════════════════════════

Issues: 8 (2 critical, 3 high, 3 medium)
Historias: 5 (H101-H105)
Tareas: 12 (T101-T112)

¿Lanzar swarm con 4 agentes? [S/n]: S

═══════════════════════════════════════════════════════════════
  SWARM LANZADO - 4 agentes trabajando
═══════════════════════════════════════════════════════════════
```
