# /swarm:launch - Lanzar Agentes Paralelos

Lanza N agentes en terminales paralelas para ejecutar tareas concurrentemente.

## Uso

```
/swarm:launch <N>
/swarm:launch 4
/swarm:launch 6 --tasks T001,T002,T003
```

## Instrucciones para Claude

Cuando el usuario ejecute `/swarm:launch <N>`:

### 1. Validar Prerrequisitos

```bash
# Verificar que hay tareas pendientes
ls .claude/tasks/T*.md 2>/dev/null | wc -l

# Verificar git status (debe estar limpio)
git status --porcelain

# Verificar que no hay swarm activo
[ -f ".claude/swarm-active" ] && echo "ERROR: Swarm ya activo"
```

### 2. Seleccionar Tareas

Si no se especifican tareas, selecciona automáticamente:

```bash
# Leer grafo de dependencias
cat .claude/scale/DEPENDENCY-GRAPH.md

# Identificar tareas sin dependencias pendientes
# (status=pending AND all depends_on are completed)
```

Algoritmo de selección:

1. Filtrar tareas con status=pending
2. Verificar que todas las dependencias están completadas
3. Ordenar por prioridad de historia padre
4. Seleccionar las primeras N tareas

### 3. Crear Worktrees

Para cada tarea seleccionada:

```bash
#!/bin/bash
# .claude/scripts/swarm-launcher-v2.sh

TASK_ID=$1
BRANCH_NAME="task/${TASK_ID}"

# Crear branch y worktree
git worktree add -b "$BRANCH_NAME" "trees/${TASK_ID}" main

# Copiar configuración
cp .claude/settings.json "trees/${TASK_ID}/.claude/"

# Crear PROMPT.md con la tarea
cp ".claude/tasks/${TASK_ID}.md" "trees/${TASK_ID}/.claude/PROMPT.md"

echo "Worktree creado: trees/${TASK_ID}"
```

### 4. Lanzar Agentes

Para cada worktree, abre terminal y ejecuta Claude:

```bash
#!/bin/bash
# Lanzamiento en terminales paralelas

for task in $SELECTED_TASKS; do
    # Gnome Terminal
    gnome-terminal --tab --title="Agent: $task" -- bash -c "
        cd trees/$task
        claude --dangerously-skip-permissions
    "

    # O Tmux
    tmux new-window -n "$task" "cd trees/$task && claude --dangerously-skip-permissions"
done
```

### 5. Registrar Estado

Crear `.claude/swarm-active`:

```json
{
  "started_at": "2024-01-15T10:00:00Z",
  "agents": [
    {
      "id": "agent-1",
      "task": "T001",
      "worktree": "trees/T001",
      "pid": 12345,
      "status": "running"
    },
    {
      "id": "agent-2",
      "task": "T002",
      "worktree": "trees/T002",
      "pid": 12346,
      "status": "running"
    }
  ],
  "total_agents": 4,
  "integration_mode": "manual"
}
```

### 6. Crear Monitor de Progreso

Lanza el monitor en background:

```bash
#!/bin/bash
# .claude/scripts/parallel-monitor.sh

while [ -f ".claude/swarm-active" ]; do
    clear
    echo "═══════════════════════════════════════"
    echo "  SWARM MONITOR - $(date +%H:%M:%S)"
    echo "═══════════════════════════════════════"

    for worktree in trees/T*; do
        task=$(basename $worktree)

        # Verificar si completó
        if [ -f "$worktree/.claude/COMPLETE" ]; then
            status="✅ COMPLETED"
        elif [ -f "$worktree/.claude/ERROR" ]; then
            status="❌ ERROR"
        else
            status="🔄 RUNNING"
        fi

        echo "  $task: $status"
    done

    echo "═══════════════════════════════════════"
    echo "  /swarm:status para detalles"
    echo "  /swarm:stop para detener"
    echo "═══════════════════════════════════════"

    sleep 10
done
```

### 7. Output al Usuario

```
═══════════════════════════════════════════════════════════════
  SWARM LANZADO
═══════════════════════════════════════════════════════════════

Agentes iniciados: 4

AGENT-1: T001 - Setup proyecto
  Worktree: trees/T001
  Terminal: Pestaña 1

AGENT-2: T002 - Definir tipos
  Worktree: trees/T002
  Terminal: Pestaña 2

AGENT-3: T003 - Configurar DB
  Worktree: trees/T003
  Terminal: Pestaña 3

AGENT-4: T004 - Implementar servicio
  Worktree: trees/T004
  Terminal: Pestaña 4

CONTRATOS COMPARTIDOS:
  .claude/contracts/user.ts (T002, T003, T004)
  ⚠️ NO modificar sin coordinación

MONITOREO:
  /swarm:status  - Ver estado actual
  /swarm:stop    - Detener todos

INTEGRACIÓN:
  /swarm:integrate - Activar merge automático
  (recomendado cuando todos completen)

═══════════════════════════════════════════════════════════════
```

## Configuración Avanzada

### Especificar Tareas

```
/swarm:launch 2 --tasks T001,T002
```

### Modo Dry-Run

```
/swarm:launch 4 --dry-run
```

Muestra qué haría sin ejecutar.

### Con Integrador

```
/swarm:launch 4 --with-integrator
```

Lanza también el agente integrador.

## Límites de Seguridad

- Máximo 6 agentes simultáneos (configurable)
- Verificación de git status limpio
- No permite lanzar si hay swarm activo
- Checkpoint obligatorio cada 30 minutos

## Output Esperado

1. Worktrees creados en `trees/T<XXX>`
2. Terminales/tabs abiertos con agentes
3. Archivo `.claude/swarm-active` con estado
4. Monitor ejecutándose en background
