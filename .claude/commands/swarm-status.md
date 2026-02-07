# /swarm:status - Dashboard de Estado del Swarm

Muestra el estado en tiempo real de todos los agentes del swarm.

## Uso

```
/swarm:status
/swarm:status --watch
/swarm:status --task T001
```

## Instrucciones para Claude

Cuando el usuario ejecute `/swarm:status`:

### 1. Verificar Swarm Activo

```bash
if [ ! -f ".claude/swarm-active" ]; then
    echo "No hay swarm activo. Usa /swarm:launch para iniciar."
    exit 0
fi

cat .claude/swarm-active
```

### 2. Recopilar Estado de Agentes

Para cada agente registrado:

```bash
for worktree in trees/T*; do
    task=$(basename $worktree)

    # Estado de completitud
    if [ -f "$worktree/.claude/COMPLETE" ]; then
        status="completed"
        completed_at=$(stat -c %Y "$worktree/.claude/COMPLETE")
    elif [ -f "$worktree/.claude/ERROR" ]; then
        status="error"
        error_msg=$(cat "$worktree/.claude/ERROR")
    else
        status="running"
    fi

    # Último commit (si hay)
    last_commit=$(cd $worktree && git log -1 --format="%h %s" 2>/dev/null || echo "Sin commits")

    # Archivos modificados
    changes=$(cd $worktree && git status --short | wc -l)

    echo "$task|$status|$last_commit|$changes"
done
```

### 3. Calcular Métricas

```bash
total=$(ls trees/T* -d 2>/dev/null | wc -l)
completed=$(ls trees/T*/.claude/COMPLETE 2>/dev/null | wc -l)
errors=$(ls trees/T*/.claude/ERROR 2>/dev/null | wc -l)
running=$((total - completed - errors))

progress=$((completed * 100 / total))
```

### 4. Mostrar Dashboard

```
═══════════════════════════════════════════════════════════════
  SWARM STATUS DASHBOARD
  Actualizado: 2024-01-15 12:30:45
═══════════════════════════════════════════════════════════════

RESUMEN
───────
  Total agentes:    4
  Completados:      1 (25%)
  En ejecución:     2
  Con errores:      1

PROGRESO
───────
  [████████░░░░░░░░░░░░░░░░░░░░░░] 25%

AGENTES
───────
┌──────┬────────────────────┬──────────┬─────────────────────────┐
│ Task │ Descripción        │ Estado   │ Último Commit           │
├──────┼────────────────────┼──────────┼─────────────────────────┤
│ T001 │ Setup proyecto     │ ✅ DONE  │ abc1234 - feat: setup   │
│ T002 │ Definir tipos      │ 🔄 RUN   │ def5678 - wip: types    │
│ T003 │ Configurar DB      │ 🔄 RUN   │ Sin commits             │
│ T004 │ Implementar svc    │ ❌ ERROR │ Error: TypeScript fail  │
└──────┴────────────────────┴──────────┴─────────────────────────┘

DETALLES POR AGENTE
───────────────────

T001 - Setup proyecto
  Estado: ✅ Completado
  Commits: 3
  Archivos cambiados: 5
  Tiempo: 15 min
  Worktree: trees/T001

T002 - Definir tipos
  Estado: 🔄 En ejecución
  Commits: 2
  Archivos cambiados: 3
  Tiempo activo: 10 min
  Worktree: trees/T002

T003 - Configurar DB
  Estado: 🔄 En ejecución
  Commits: 0
  Archivos cambiados: 1
  Tiempo activo: 8 min
  Worktree: trees/T003

T004 - Implementar servicio
  Estado: ❌ Error
  Error: TypeScript compilation failed
  Último intento: hace 2 min
  Worktree: trees/T004

COLA DE ESPERA
──────────────
  T005 (esperando T004)
  T006 (esperando T004)
  T007 (esperando T005, T006)

ACCIONES DISPONIBLES
────────────────────
  /swarm:stop T004     - Detener agente con error
  /swarm:retry T004    - Reintentar tarea fallida
  /swarm:integrate     - Mergear completados a main

═══════════════════════════════════════════════════════════════
```

### 5. Modo Watch (--watch)

Si se usa `--watch`, actualizar cada 5 segundos:

```bash
while true; do
    clear
    # Mostrar dashboard
    show_dashboard
    sleep 5
done
```

### 6. Detalle de Tarea (--task)

Si se especifica `--task T001`:

```
═══════════════════════════════════════════════════════════════
  DETALLE: T001 - Setup proyecto
═══════════════════════════════════════════════════════════════

ESTADO: ✅ Completado

CRONOLOGÍA:
  10:00:00 - Iniciado
  10:05:32 - Commit: feat: add package.json
  10:08:45 - Commit: feat: configure typescript
  10:12:18 - Commit: feat: setup project structure
  10:15:00 - Marcado como completado

ARCHIVOS MODIFICADOS:
  + package.json
  + tsconfig.json
  + src/index.ts
  + src/types/index.ts
  M README.md

COMMITS:
  abc1234 feat: add package.json
  def5678 feat: configure typescript
  ghi9012 feat: setup project structure

LOG DE ERRORES:
  (ninguno)

MÉTRICAS:
  Tiempo total: 15 min
  Commits: 3
  Archivos: 5

═══════════════════════════════════════════════════════════════
```

### 7. Guardar Snapshot

Cada vez que se ejecuta, guarda snapshot:

```json
// .claude/scale/swarm-snapshots/2024-01-15-123045.json
{
  "timestamp": "2024-01-15T12:30:45Z",
  "agents": [...],
  "metrics": {
    "total": 4,
    "completed": 1,
    "running": 2,
    "errors": 1
  }
}
```

## Output Esperado

1. Dashboard visual del estado
2. Métricas de progreso
3. Detalles por agente
4. Acciones recomendadas
5. Snapshot guardado para histórico
