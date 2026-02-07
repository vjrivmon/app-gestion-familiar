# /skill:generate - Generador de Skills Especializadas

Genera una skill especializada para una tarea específica.

## Uso

```
/skill:generate <task-id>
/skill:generate T001
/skill:generate T001 --category=auth
```

## Instrucciones para Claude

Cuando el usuario ejecute `/skill:generate <task-id>`:

### 1. Leer la Tarea

```bash
# Buscar archivo de tarea
TASK_FILE=$(ls .claude/tasks/${task-id}*.md 2>/dev/null | head -1)

if [ -z "$TASK_FILE" ]; then
    echo "ERROR: Tarea ${task-id} no encontrada"
    exit 1
fi

cat "$TASK_FILE"
```

Extraer:

- ID de tarea
- Título
- Descripción/Objetivo
- Historia padre (story_id)
- Criterios de aceptación
- Archivos a modificar

### 2. Leer Historia Padre

```bash
# Extraer story_id del frontmatter de la tarea
STORY_ID=$(grep "story_id:" "$TASK_FILE" | cut -d: -f2 | tr -d ' ')

STORY_FILE=$(ls .claude/stories/${STORY_ID}*.md 2>/dev/null | head -1)
cat "$STORY_FILE"
```

Extraer contexto de la historia:

- Narrativa (Como/Quiero/Para)
- Criterios de aceptación generales
- Notas técnicas

### 3. Determinar Categoría

Si no se especifica `--category`, inferir de:

| Palabras clave en tarea          | Categoría |
| -------------------------------- | --------- |
| auth, login, session, token      | auth      |
| database, schema, migration, sql | database  |
| api, endpoint, route, handler    | api       |
| ui, component, page, layout      | ui        |
| test, spec, coverage             | testing   |
| deploy, ci, cd, docker           | devops    |
| style, css, tailwind, theme      | styling   |
| cache, performance, optimize     | perf      |
| security, validate, sanitize     | security  |
| docs, readme, comment            | docs      |

### 4. Generar Contenido de la Skill

Usar el siguiente prompt interno:

```
Genera una SKILL especializada para un agente de desarrollo.

CONTEXTO:
- Proyecto: [extraer de SPEC o historia]
- Stack: [extraer de SPEC]
- Historia: {{STORY_TITLE}}
- Tarea: {{TASK_TITLE}}

TAREA COMPLETA:
{{TASK_CONTENT}}

REQUISITOS DE LA SKILL:

1. CONOCIMIENTO TÉCNICO:
   - Conceptos específicos que el agente necesita conocer
   - APIs, librerías o frameworks relevantes
   - Configuraciones necesarias

2. PATRONES DE CÓDIGO:
   - Ejemplos de código específicos para esta tarea
   - Estructura de archivos recomendada
   - Convenciones del proyecto

3. ANTI-PATTERNS:
   - Errores comunes que evitar
   - Trampas específicas del stack/dominio
   - Malas prácticas documentadas

4. CHECKLIST DE COMPLETITUD:
   - Criterios verificables para marcar la tarea como completada
   - Tests mínimos requeridos
   - Integración esperada

5. REFERENCIAS:
   - Documentación oficial relevante
   - Ejemplos en el codebase existente
   - Artículos o guías útiles

Formato de salida: Markdown siguiendo el template TASK-SKILL-TEMPLATE.md
```

### 5. Crear Archivo de Skill

```bash
# Determinar nombre del proyecto
PROJECT_NAME=$(basename $(pwd) | tr '[:upper:]' '[:lower:]')

# Crear directorio
SKILL_DIR=".claude/skills/generated/${PROJECT_NAME}/${task-id}-skill"
mkdir -p "$SKILL_DIR"

# Guardar skill
cat > "$SKILL_DIR/SKILL.md" << 'EOF'
[CONTENIDO GENERADO]
EOF
```

### 6. Estructura del SKILL.md Generado

```markdown
---
name: {{TASK_ID}}-{{SKILL_NAME}}
description: |
  {{DESCRIPCIÓN_GENERADA}}
metadata:
  author: mvp-automation
  version: "1.0"
  category: {{CATEGORY}}
  story_id: {{STORY_ID}}
  task_id: {{TASK_ID}}
  generated_at: {{ISO_TIMESTAMP}}
  stack: {{STACK_TAGS}}
---

# {{TASK_ID}}: {{TASK_TITLE}}

## Contexto de la Tarea

**Historia**: {{STORY_ID}} - {{STORY_TITLE}} **Categoría**: {{CATEGORY}}
**Prioridad**: {{PRIORITY}}

## Objetivo

{{OBJETIVO_CLARO}}

## Conocimiento Especializado

### Conceptos Clave

{{CONCEPTOS_ESPECÍFICOS}}

### Stack y Herramientas

- **Framework**: {{FRAMEWORK}}
- **Librerías**: {{LIBS}}
- **APIs**: {{APIS}}

## Patrones Recomendados

### Estructura de Archivos
```

{{FILE_STRUCTURE}}

````

### Código de Referencia

```{{LANGUAGE}}
{{CODE_EXAMPLE_1}}
````

### Integración

```{{LANGUAGE}}
{{INTEGRATION_CODE}}
```

## Anti-patterns a Evitar

- ❌ {{ANTIPATTERN_1}}
- ❌ {{ANTIPATTERN_2}}
- ❌ {{ANTIPATTERN_3}}

## Checklist de Completitud

### Implementación

- [ ] {{CHECK_1}}
- [ ] {{CHECK_2}}
- [ ] {{CHECK_3}}

### Testing

- [ ] Unit tests para {{UNIT_TARGET}}
- [ ] Test de integración para {{INTEGRATION_TARGET}}

### Calidad

- [ ] Código siguiendo convenciones del proyecto
- [ ] Sin warnings de TypeScript/ESLint
- [ ] Documentación inline donde necesario

## Dependencias

### Requiere completar primero

- {{DEP_TASK_1}} (si aplica)

### Habilita

- {{UNLOCKS_TASK}} (si aplica)

## Referencias

- {{REF_1}}
- {{REF_2}}
- {{REF_3}}

````

### 7. Actualizar Índice de Skills

```bash
INDEX_FILE=".claude/skills/generated/${PROJECT_NAME}/INDEX.md"

# Añadir entrada al índice
echo "| ${task-id} | ${task-id}-skill | ${CATEGORY} | ✓ |" >> "$INDEX_FILE"
````

### 8. Output

```
═══════════════════════════════════════════════════════════════
  SKILL GENERADA
═══════════════════════════════════════════════════════════════

Tarea: {{TASK_ID}} - {{TASK_TITLE}}
Categoría: {{CATEGORY}}

Archivo creado:
  .claude/skills/generated/{{PROJECT}}/{{TASK_ID}}-skill/SKILL.md

Contenido:
  - Conocimiento técnico específico
  - {{N}} patrones de código
  - {{M}} anti-patterns documentados
  - Checklist de {{K}} items

El agente que trabaje en {{TASK_ID}} cargará esta skill
automáticamente.

═══════════════════════════════════════════════════════════════
```

## Opciones

| Opción            | Descripción                  |
| ----------------- | ---------------------------- |
| `--category=X`    | Forzar categoría específica  |
| `--verbose`       | Mostrar contenido completo   |
| `--dry-run`       | Mostrar sin crear archivo    |
| `--force`         | Sobrescribir skill existente |
| `--include-tests` | Generar ejemplos de tests    |
| `--minimal`       | Skill mínima (solo esencial) |

## Ejemplos

```bash
# Generar skill básica
/skill:generate T001

# Forzar categoría
/skill:generate T005 --category=api

# Ver antes de crear
/skill:generate T010 --dry-run

# Regenerar existente
/skill:generate T003 --force

# Con ejemplos de tests
/skill:generate T007 --include-tests
```
