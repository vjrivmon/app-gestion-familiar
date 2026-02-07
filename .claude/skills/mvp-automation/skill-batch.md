# /skill:batch - Generación de Skills por Historia

Genera skills especializadas para todas las tareas de una historia.

## Uso

```
/skill:batch <story-id>
/skill:batch H001
/skill:batch H003 --force
```

## Instrucciones para Claude

Cuando el usuario ejecute `/skill:batch <story-id>`:

### 1. Validar Historia

```bash
# Buscar archivo de historia
STORY_FILE=$(ls .claude/stories/${story-id}*.md 2>/dev/null | head -1)

if [ -z "$STORY_FILE" ]; then
    echo "ERROR: Historia ${story-id} no encontrada"
    exit 1
fi

cat "$STORY_FILE"
```

### 2. Identificar Tareas de la Historia

```bash
# Buscar todas las tareas que pertenecen a esta historia
TASKS=$(grep -l "story_id: ${story-id}" .claude/tasks/T*.md 2>/dev/null)

echo "Tareas encontradas:"
for task in $TASKS; do
    echo "  - $(basename $task)"
done
```

### 3. Generar Skills por Tarea

Para cada tarea identificada:

```bash
for TASK_FILE in $TASKS; do
    TASK_ID=$(basename "$TASK_FILE" .md | cut -d'-' -f1)

    # Verificar si ya existe skill
    SKILL_DIR=".claude/skills/generated/${PROJECT}/${TASK_ID}-skill"

    if [ -d "$SKILL_DIR" ] && [ -z "$FORCE" ]; then
        echo "SKIP: Skill para $TASK_ID ya existe (usar --force)"
        continue
    fi

    # Generar skill
    /skill:generate $TASK_ID
done
```

### 4. Generar Skill Individual

Para cada tarea, usar el prompt de generación:

```
Genera una SKILL especializada para la siguiente tarea:

CONTEXTO DEL PROYECTO:
{{SPEC_SUMMARY}}

HISTORIA PADRE:
ID: {{STORY_ID}}
Título: {{STORY_TITLE}}
Narrativa: {{STORY_NARRATIVE}}

TAREA:
ID: {{TASK_ID}}
Título: {{TASK_TITLE}}
{{TASK_CONTENT}}

STACK TECNOLÓGICO:
{{STACK}}

La skill debe incluir:
1. Conocimiento técnico específico necesario para esta tarea
2. Patrones de código recomendados con ejemplos concretos
3. Anti-patterns a evitar en este contexto
4. Checklist de completitud verificable
5. Referencias útiles (docs, ejemplos)

Usa el template TASK-SKILL-TEMPLATE.md
Categoría sugerida: {{CATEGORY}}
```

### 5. Actualizar Índice

```bash
INDEX_FILE=".claude/skills/generated/${PROJECT}/INDEX.md"

# Actualizar o crear índice
cat > "$INDEX_FILE" << EOF
# Skills Generadas - ${PROJECT}

## Historia: ${story-id}

| Task | Skill | Categoría | Estado |
|------|-------|-----------|--------|
EOF

for TASK_FILE in $TASKS; do
    TASK_ID=$(basename "$TASK_FILE" .md | cut -d'-' -f1)
    TASK_NAME=$(grep "^title:" "$TASK_FILE" | cut -d: -f2 | xargs)
    CATEGORY=$(detect_category "$TASK_FILE")

    echo "| $TASK_ID | ${TASK_ID}-skill | $CATEGORY | ✓ |" >> "$INDEX_FILE"
done
```

### 6. Output

```
═══════════════════════════════════════════════════════════════
  SKILLS GENERADAS - BATCH
═══════════════════════════════════════════════════════════════

Historia: {{STORY_ID}} - {{STORY_TITLE}}

Tareas procesadas: {{N}}

SKILLS CREADAS:
  ✓ T001-skill (auth)     → .claude/skills/generated/{{PROJECT}}/T001-skill/
  ✓ T002-skill (api)      → .claude/skills/generated/{{PROJECT}}/T002-skill/
  ✓ T003-skill (ui)       → .claude/skills/generated/{{PROJECT}}/T003-skill/

SKIPPED (ya existían):
  - T004-skill (usar --force para regenerar)

Índice actualizado:
  .claude/skills/generated/{{PROJECT}}/INDEX.md

Los agentes que trabajen en estas tareas cargarán sus skills
automáticamente al iniciar.

═══════════════════════════════════════════════════════════════
```

## Opciones

| Opción            | Descripción                          |
| ----------------- | ------------------------------------ |
| `--force`         | Regenerar skills existentes          |
| `--dry-run`       | Mostrar qué haría sin crear archivos |
| `--verbose`       | Mostrar contenido de skills          |
| `--category=X`    | Forzar categoría para todas          |
| `--include-tests` | Incluir ejemplos de tests            |

## Ejemplos

```bash
# Generar skills para historia H001
/skill:batch H001

# Regenerar todas las skills
/skill:batch H001 --force

# Ver qué haría sin ejecutar
/skill:batch H003 --dry-run

# Con información detallada
/skill:batch H002 --verbose
```

## Integración con Swarm

Cuando se lanza `/swarm:launch`, cada agente:

1. Recibe su tarea asignada
2. Detecta skill en `.claude/skills/generated/PROJECT/TASK-skill/`
3. Carga la skill automáticamente
4. Ejecuta con conocimiento especializado

## Output Esperado

1. Skills individuales en `.claude/skills/generated/PROJECT/TXXX-skill/SKILL.md`
2. Índice actualizado en `.claude/skills/generated/PROJECT/INDEX.md`
3. Resumen de operaciones en consola
