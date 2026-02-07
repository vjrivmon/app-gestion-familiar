# /mvp:auto-generate - Generación Completa Automatizada

Genera el flujo completo de MVP: Historias → Tareas → Skills especializadas.

## Uso

```
/mvp:auto-generate <spec-file>
/mvp:auto-generate .claude/specs/NutriCoach.md
```

## Instrucciones para Claude

Cuando el usuario ejecute `/mvp:auto-generate <spec>`:

### 1. Validar SPEC

```bash
# Verificar que existe el SPEC
[ -f "<spec-file>" ] || echo "ERROR: SPEC no encontrado"

# Leer y validar contenido mínimo
cat <spec-file>
```

Verificar que el SPEC contiene:

- [ ] Nombre del proyecto
- [ ] Problema a resolver
- [ ] Usuarios objetivo
- [ ] Funcionalidades core (mínimo 3)
- [ ] Stack tecnológico

### 2. Pedir Confirmación

```
═══════════════════════════════════════════════════════════════
  SPEC VALIDADO - LISTO PARA GENERACIÓN AUTOMATIZADA
═══════════════════════════════════════════════════════════════

Proyecto: {{NOMBRE}}
Funcionalidades detectadas: {{N}}

Se van a generar:
  📋 Historias de usuario (~{{N}} historias)
  📝 Tareas paralelas (~{{N*3-5}} tareas)
  🧠 Skills especializadas (1 por tarea)

¿Proceder con la generación? (s/n)
═══════════════════════════════════════════════════════════════
```

### 3. Generar Historias (Técnica RaT)

Para cada funcionalidad en el SPEC:

**Paso 1 - Thought**:

```
¿Qué necesita el usuario poder hacer?
¿Cuál es el flujo principal?
¿Qué criterios de aceptación son verificables?
```

**Paso 2 - Refine**:

```
¿Es una historia atómica o debe dividirse?
¿Tiene valor independiente?
¿Cumple INVEST?
```

**Crear archivo**: `.claude/stories/H<XXX>-<nombre>.md`

```markdown
---
id: H<XXX>
title: <Título>
priority: critical|high|medium|low
depends_on: []
parallelizable: true|false
estimated_tasks: <N>
---

# Historia: <Título>

## Narrativa

**Como** <usuario> **Quiero** <acción> **Para** <beneficio>

## Criterios de Aceptación

1. **Dado** ... **Cuando** ... **Entonces** ...
2. ...

## Notas Técnicas

- Stack: ...
- Integraciones: ...
```

### 4. Generar Tareas por Historia

Para cada historia, generar tareas siguiendo:

- **Principio de única responsabilidad**: 1 tarea = 1 objetivo
- **Paralelizables**: Minimizar dependencias
- **Tamaño**: 2-4 horas de trabajo estimado

**Crear archivo**: `.claude/tasks/T<XXX>-<nombre>.md`

```markdown
---
id: T<XXX>
story_id: H<XXX>
title: <Título>
priority: <hereda de historia>
depends_on: []
blocks: []
estimated_hours: 2-4
status: pending
---

# Tarea: <Título>

## Objetivo

<Descripción clara y concisa>

## Contexto

Historia padre: H<XXX> - <título>

## Criterios de Aceptación

- [ ] ...
- [ ] ...

## Archivos a Crear/Modificar

- `src/...`
- `src/...`

## Testing Requerido

- [ ] Unit tests para ...
- [ ] Integration test para ...
```

### 5. Generar Skills por Tarea

Para cada tarea, usar el modelo para generar una skill especializada:

**Prompt de generación**:

```
Genera una SKILL especializada para la siguiente tarea:

TAREA: {{TASK_CONTENT}}
HISTORIA: {{STORY_CONTENT}}
STACK: {{STACK_FROM_SPEC}}

La skill debe incluir:
1. Conocimiento técnico específico necesario
2. Patrones de código recomendados con ejemplos
3. Anti-patterns a evitar
4. Checklist de completitud
5. Referencias útiles

Formato: Usar el template TASK-SKILL-TEMPLATE.md
```

**Crear directorio y archivo**:

```bash
mkdir -p .claude/skills/generated/{{PROJECT}}/T<XXX>-skill/
# Guardar en SKILL.md
```

### 6. Generar Índices

**STORIES-INDEX.md**:

````markdown
# Índice de Historias - {{PROJECT}}

## Resumen

- Total: X historias
- Critical: Y
- Parallelizables: Z

## Por Prioridad

### Critical

- [ ] H001 - ...
- [ ] H002 - ...

### High

- [ ] H003 - ...

## Grafo de Dependencias

    ```mermaid
    graph TD
        H001 --> H003
        H002 --> H003
    ```
````

**TASKS-INDEX.md**:

```markdown
# Índice de Tareas - {{PROJECT}}

## Resumen

- Total: X tareas
- Por historia: ...
- Skills generadas: X

## Por Historia

### H001 - <título>

- [ ] T001 - ... (SKILL: ✓)
- [ ] T002 - ... (SKILL: ✓)

### H002 - <título>

- [ ] T003 - ... (SKILL: ✓)
```

**SKILLS-INDEX.md** en `.claude/skills/generated/{{PROJECT}}/`:

```markdown
# Skills Generadas - {{PROJECT}}

## Estadísticas

- Total skills: X
- Categorías: auth, ui, api, db, ...

## Por Tarea

| Task | Skill              | Categoría | Estado |
| ---- | ------------------ | --------- | ------ |
| T001 | T001-supabase-auth | auth      | ✓      |
| T002 | T002-middleware    | auth      | ✓      |
| T003 | T003-login-page    | ui        | ✓      |
```

### 7. Output Final

```
═══════════════════════════════════════════════════════════════
  GENERACIÓN COMPLETADA
═══════════════════════════════════════════════════════════════

Proyecto: {{NOMBRE}}

HISTORIAS GENERADAS: {{N}}
  .claude/stories/H001-xxx.md
  .claude/stories/H002-xxx.md
  ...

TAREAS GENERADAS: {{M}}
  .claude/tasks/T001-xxx.md
  ...

SKILLS GENERADAS: {{M}}
  .claude/skills/generated/{{PROJECT}}/T001-skill/
  ...

ÍNDICES:
  .claude/stories/STORIES-INDEX.md
  .claude/tasks/TASKS-INDEX.md
  .claude/skills/generated/{{PROJECT}}/INDEX.md

═══════════════════════════════════════════════════════════════
  PRÓXIMOS PASOS
═══════════════════════════════════════════════════════════════

1. Revisar historias y tareas generadas
2. Ajustar prioridades si necesario
3. Ejecutar: /swarm:launch {{RECOMMENDED_AGENTS}}

Los agentes se lanzarán con sus skills especializadas cargadas
automáticamente.

═══════════════════════════════════════════════════════════════
```

## Configuración Avanzada

### Limitar generación

```
/mvp:auto-generate <spec> --stories-only    # Solo historias
/mvp:auto-generate <spec> --max-tasks=20    # Limitar tareas
/mvp:auto-generate <spec> --no-skills       # Sin skills
```

### Regenerar parcial

```
/mvp:auto-generate <spec> --from-story=H003
/mvp:auto-generate <spec> --regenerate-skills
```

## Output Esperado

1. Historias en `.claude/stories/`
2. Tareas en `.claude/tasks/`
3. Skills en `.claude/skills/generated/<proyecto>/`
4. Índices actualizados
5. Preparación para `/swarm:launch`
