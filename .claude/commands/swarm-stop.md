# /swarm:stop - Detener Agentes del Swarm

Detiene todos los agentes del swarm y guarda el estado actual.

## Uso

```
/swarm:stop
/swarm:stop --task T001
/swarm:stop --integrator
/swarm:stop --force
```

## Instrucciones para Claude

Cuando el usuario ejecute `/swarm:stop`:

### 1. Verificar Swarm Activo

```bash
if [ ! -f ".claude/swarm-active" ]; then
    echo "No hay swarm activo."
    exit 0
fi

SWARM_STATE=$(cat .claude/swarm-active)
```

### 2. Modos de Operación

**Stop All (default)**: Detiene todos los agentes.

**Stop Task (`--task T001`)**: Detiene solo un agente específico.

**Stop Integrator (`--integrator`)**: Detiene solo el integrador.

**Force (`--force`)**: Fuerza detención sin guardar estado.

### 3. Procedimiento de Detención Segura

```bash
#!/bin/bash
# Detención segura de un agente

stop_agent() {
    local task=$1
    local worktree="trees/$task"

    echo "Deteniendo $task..."

    # Crear checkpoint
    if [ -d "$worktree" ]; then
        # Guardar estado actual
        cd "$worktree"

        # Commit WIP si hay cambios
        if [ -n "$(git status --porcelain)" ]; then
            git add -A
            git commit -m "WIP: checkpoint antes de stop"
        fi

        # Crear archivo de estado
        cat > .claude/checkpoint.json << EOF
{
    "task": "$task",
    "stopped_at": "$(date -Iseconds)",
    "status": "paused",
    "last_commit": "$(git rev-parse HEAD)",
    "uncommitted_changes": $(git status --porcelain | wc -l)
}
EOF

        cd -
    fi

    # Enviar señal de stop al proceso Claude
    # (Claude Code detecta archivo STOP)
    touch "$worktree/.claude/STOP"

    echo "  Checkpoint guardado"
}
```

### 4. Detener Todos los Agentes

```bash
# Para cada agente activo
for agent in $(jq -r '.agents[].task' .claude/swarm-active); do
    stop_agent "$agent"
done

# Detener integrador si está activo
if [ -f ".claude/integrator-active" ]; then
    kill $(cat .claude/integrator-active) 2>/dev/null
    rm -f .claude/integrator-active
    echo "Integrador detenido"
fi

# Guardar estado final
mv .claude/swarm-active .claude/swarm-paused
```

### 5. Generar Resumen de Sesión

```bash
# Calcular métricas de la sesión
started=$(jq -r '.started_at' .claude/swarm-paused)
now=$(date -Iseconds)

completed=$(ls trees/T*/.claude/COMPLETE 2>/dev/null | wc -l)
paused=$(ls trees/T*/.claude/checkpoint.json 2>/dev/null | wc -l)
total=$(ls trees/T* -d 2>/dev/null | wc -l)
```

### 6. Output al Usuario

```
═══════════════════════════════════════════════════════════════
  SWARM DETENIDO
═══════════════════════════════════════════════════════════════

SESIÓN GUARDADA

Duración: 2h 15min
Agentes detenidos: 4

ESTADO FINAL:
┌──────┬────────────────────┬────────────┬───────────────┐
│ Task │ Descripción        │ Estado     │ Checkpoint    │
├──────┼────────────────────┼────────────┼───────────────┤
│ T001 │ Setup proyecto     │ ✅ DONE    │ N/A           │
│ T002 │ Definir tipos      │ ⏸️ PAUSED  │ abc1234       │
│ T003 │ Configurar DB      │ ⏸️ PAUSED  │ def5678       │
│ T004 │ Implementar svc    │ ⏸️ PAUSED  │ ghi9012       │
└──────┴────────────────────┴────────────┴───────────────┘

PROGRESO:
  Completados: 1/7 (14%)
  Pausados: 3
  Pendientes: 3

WORKTREES PRESERVADOS:
  trees/T002 - con checkpoint
  trees/T003 - con checkpoint
  trees/T004 - con checkpoint

PARA CONTINUAR:
  /swarm:resume            - Retomar todos
  /swarm:resume --task T002  - Retomar uno específico

PARA LIMPIAR:
  /swarm:cleanup           - Eliminar worktrees pausados

═══════════════════════════════════════════════════════════════
```

### 7. Modo Force

Si se usa `--force`:

```bash
# Detener sin guardar
for worktree in trees/T*; do
    task=$(basename $worktree)

    # Matar proceso Claude
    pkill -f "claude.*$worktree" 2>/dev/null

    # Eliminar worktree
    git worktree remove "$worktree" --force 2>/dev/null
    git branch -D "task/$task" 2>/dev/null
done

rm -f .claude/swarm-active
rm -f .claude/swarm-paused
rm -f .claude/integrator-active

echo "⚠️ Swarm eliminado forzosamente. No hay checkpoints."
```

### 8. Guardar Historial

Añade entrada a `.claude/scale/swarm-history.json`:

```json
{
  "sessions": [
    {
      "id": "swarm-20240115-100000",
      "started_at": "2024-01-15T10:00:00Z",
      "stopped_at": "2024-01-15T12:15:00Z",
      "duration_minutes": 135,
      "tasks_total": 7,
      "tasks_completed": 1,
      "tasks_paused": 3,
      "stop_reason": "manual",
      "resume_available": true
    }
  ]
}
```

## Comandos Relacionados

- `/swarm:resume` - Retomar sesión pausada
- `/swarm:cleanup` - Limpiar worktrees
- `/swarm:status` - Ver estado antes de parar

## Output Esperado

1. Checkpoints guardados en cada worktree
2. Estado de sesión en `.claude/swarm-paused`
3. Historial actualizado
4. Worktrees preservados para resume
