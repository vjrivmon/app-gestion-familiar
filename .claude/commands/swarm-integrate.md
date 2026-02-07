# /swarm:integrate - Agente Integrador Automático

Activa el agente integrador que mergea automáticamente el trabajo de todos los
agentes.

## Uso

```
/swarm:integrate
/swarm:integrate --manual
/swarm:integrate --dry-run
```

## Skills Relevantes

Para estrategias de integración y resolución de conflictos:

| Área                | Skill                   | Sección             |
| ------------------- | ----------------------- | ------------------- |
| Merge strategy      | `/parallel-integration` | Integration Process |
| Conflict resolution | `/parallel-integration` | Conflict Resolution |
| Dependency ordering | `/parallel-integration` | Task Decomposition  |

Invoca el skill si hay conflictos complejos:

```
/parallel-integration
Contexto: Merge de T004 tiene conflicto en src/services/user.ts
Pregunta: Cómo resolver conflicto semántico en funciones con misma firma?
```

## Instrucciones para Claude

Cuando el usuario ejecute `/swarm:integrate`:

### 1. Verificar Swarm Activo

```bash
if [ ! -f ".claude/swarm-active" ]; then
    echo "No hay swarm activo. Usa /swarm:launch primero."
    exit 1
fi
```

### 2. Modo de Operación

**Automático (default)**: El integrador corre en background y mergea cuando
detecta completados.

**Manual (`--manual`)**: Solo mergea lo que ya está completado, sin esperar.

**Dry-run (`--dry-run`)**: Muestra qué haría sin ejecutar.

### 3. Algoritmo de Integración

```bash
#!/bin/bash
# .claude/scripts/integrator.sh

INTEGRATION_LOG=".claude/logs/integration-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date +%H:%M:%S)] $1" | tee -a "$INTEGRATION_LOG"
}

# Función para verificar si puede mergearse
can_merge() {
    local task=$1
    local worktree="trees/$task"

    # Debe estar completado
    [ ! -f "$worktree/.claude/COMPLETE" ] && return 1

    # Debe tener commits
    local commits=$(cd $worktree && git rev-list --count HEAD ^main)
    [ "$commits" -eq 0 ] && return 1

    # Verificar dependencias
    local deps=$(grep "depends_on:" ".claude/tasks/$task.md" | sed 's/depends_on: \[//' | sed 's/\]//')
    for dep in $deps; do
        # La dependencia debe estar ya mergeada
        if ! git log main --oneline | grep -q "$dep"; then
            log "  $task espera merge de $dep"
            return 1
        fi
    done

    return 0
}

# Función de merge
merge_task() {
    local task=$1
    local worktree="trees/$task"
    local branch="task/$task"

    log "Iniciando merge de $task..."

    # Actualizar main
    git checkout main
    git pull origin main 2>/dev/null || true

    # Merge con estrategia
    if git merge --no-ff "$branch" -m "feat: merge $task"; then
        log "  ✅ Merge exitoso"

        # Ejecutar tests de integración
        log "  Ejecutando tests..."
        if npm run test 2>&1 | tee -a "$INTEGRATION_LOG"; then
            log "  ✅ Tests pasaron"

            # Limpiar worktree
            git worktree remove "$worktree" --force
            git branch -d "$branch"

            return 0
        else
            log "  ❌ Tests fallaron - revirtiendo"
            git reset --hard HEAD~1
            return 1
        fi
    else
        log "  ❌ Conflicto de merge"
        git merge --abort
        return 1
    fi
}

# Loop principal
log "═══════════════════════════════════════"
log "  INTEGRATOR INICIADO"
log "═══════════════════════════════════════"

while [ -f ".claude/swarm-active" ]; do
    # Buscar tareas completadas
    for worktree in trees/T*; do
        task=$(basename $worktree)

        if can_merge "$task"; then
            merge_task "$task"
        fi
    done

    # Verificar si todos completaron
    pending=$(ls trees/T* -d 2>/dev/null | wc -l)
    if [ "$pending" -eq 0 ]; then
        log "Todas las tareas integradas"
        rm -f .claude/swarm-active
        break
    fi

    sleep 30
done

log "═══════════════════════════════════════"
log "  INTEGRATOR FINALIZADO"
log "═══════════════════════════════════════"
```

### 4. Manejo de Conflictos

Cuando hay conflicto:

```
═══════════════════════════════════════════════════════════════
  ⚠️ CONFLICTO DETECTADO
═══════════════════════════════════════════════════════════════

Tarea: T004 - Implementar servicio
Branch: task/T004
Conflicto en: src/services/user.ts

OPCIONES:

1. Resolver manualmente:
   cd trees/T004
   git checkout main
   git merge task/T004
   # Resolver conflictos
   git add .
   git commit

2. Usar versión del branch (theirs):
   /swarm:integrate --resolve T004 --theirs

3. Usar versión de main (ours):
   /swarm:integrate --resolve T004 --ours

4. Pausar integración:
   /swarm:stop --integrator

═══════════════════════════════════════════════════════════════
```

### 5. Generar Reporte de Integración

Después de completar, genera `.claude/scale/INTEGRATION-REPORT.md`:

```markdown
# Reporte de Integración

## Sesión: 2024-01-15

### Resumen

- Tareas integradas: 7
- Conflictos resueltos: 1
- Tiempo total: 2h 15min

### Tareas Mergeadas

| Orden | Tarea | Branch    | Commits | Tests   |
| ----- | ----- | --------- | ------- | ------- |
| 1     | T001  | task/T001 | 3       | ✅ Pass |
| 2     | T002  | task/T002 | 5       | ✅ Pass |
| 3     | T003  | task/T003 | 4       | ✅ Pass |
| 4     | T004  | task/T004 | 6       | ✅ Pass |
| 5     | T005  | task/T005 | 3       | ✅ Pass |
| 6     | T006  | task/T006 | 4       | ✅ Pass |
| 7     | T007  | task/T007 | 2       | ✅ Pass |

### Conflictos

| Tarea | Archivo              | Resolución         |
| ----- | -------------------- | ------------------ |
| T004  | src/services/user.ts | Manual - combinado |

### Archivos Finales Modificados

- `src/services/user.ts` (T002, T004)
- `src/types/user.ts` (T002)
- `src/db/config.ts` (T003)
- `src/api/routes.ts` (T005)
- `src/components/UserList.tsx` (T006)
- `tests/integration.test.ts` (T007)

### Tests de Integración
```

PASS tests/unit.test.ts (15 tests) PASS tests/integration.test.ts (8 tests) PASS
tests/e2e.test.ts (5 tests)

Total: 28 tests, 28 passed Coverage: 85%

```

### Commits en Main

```

abc1234 feat: merge T001 - Setup proyecto def5678 feat: merge T002 - Definir
tipos ghi9012 feat: merge T003 - Configurar DB jkl3456 feat: merge T004 -
Implementar servicio mno7890 feat: merge T005 - Crear API pqr1234 feat: merge
T006 - Crear UI stu5678 feat: merge T007 - Tests integración

```

```

### 6. Output al Usuario

```
═══════════════════════════════════════════════════════════════
  INTEGRADOR ACTIVADO
═══════════════════════════════════════════════════════════════

Modo: Automático
Intervalo: 30 segundos
Log: .claude/logs/integration-20240115-103000.log

El integrador:
  1. Monitorea worktrees completados
  2. Verifica dependencias cumplidas
  3. Ejecuta merge a main
  4. Corre tests de integración
  5. Limpia worktrees mergeados

ESTADO ACTUAL:
  Completados pendientes de merge: 2
  En cola: T001, T002

Para monitorear:
  tail -f .claude/logs/integration-*.log

Para detener:
  /swarm:stop --integrator

═══════════════════════════════════════════════════════════════
```

## Output Esperado

1. Integrador corriendo en background
2. Log de integración en `.claude/logs/`
3. Merges automáticos a main
4. Reporte final en `.claude/scale/INTEGRATION-REPORT.md`
5. Limpieza de worktrees completados
