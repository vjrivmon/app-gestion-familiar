#!/bin/bash
# integrator.sh - Agente integrador automático
# Uso: bash .claude/scripts/integrator.sh [--manual]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
CLAUDE_DIR=".claude"
TREES_DIR="trees"
LOGS_DIR="$CLAUDE_DIR/logs"
SCALE_DIR="$CLAUDE_DIR/scale"
INTERVAL=${INTEGRATION_INTERVAL:-30}

# Crear directorios necesarios
mkdir -p "$LOGS_DIR" "$SCALE_DIR"

# Log file
LOG_FILE="$LOGS_DIR/integration-$(date +%Y%m%d-%H%M%S).log"

log() { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"; }
success() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"; }

# Verificar si una tarea puede mergearse
can_merge() {
    local task=$1
    local worktree="$TREES_DIR/$task"

    # Debe estar completado
    if [ ! -f "$worktree/$CLAUDE_DIR/COMPLETE" ]; then
        return 1
    fi

    # Debe tener commits
    local commits=$(cd "$worktree" && git rev-list --count HEAD ^main 2>/dev/null || echo "0")
    if [ "$commits" -eq 0 ]; then
        warn "$task: Sin commits nuevos"
        return 1
    fi

    # Verificar dependencias (simplificado)
    local task_file=$(ls "$CLAUDE_DIR/tasks/${task}"*.md 2>/dev/null | head -1)
    if [ -f "$task_file" ]; then
        local deps=$(grep -m1 "^depends_on:" "$task_file" 2>/dev/null | sed 's/depends_on: \[//' | sed 's/\]//' | tr -d ' ')

        if [ -n "$deps" ] && [ "$deps" != "[]" ]; then
            for dep in $(echo "$deps" | tr ',' ' '); do
                # Verificar si la dependencia ya está en main
                if ! git log main --oneline 2>/dev/null | grep -q "merge $dep"; then
                    log "$task: Esperando merge de $dep"
                    return 1
                fi
            done
        fi
    fi

    return 0
}

# Mergear una tarea
merge_task() {
    local task=$1
    local worktree="$TREES_DIR/$task"
    local branch="task/$task"

    log "═══ Iniciando merge de $task ═══"

    # Guardar directorio actual
    local current_dir=$(pwd)

    # Checkout a main
    git checkout main 2>/dev/null || {
        error "No se pudo hacer checkout a main"
        return 1
    }

    # Pull últimos cambios
    git pull origin main 2>/dev/null || true

    # Intentar merge
    if git merge --no-ff "$branch" -m "feat: merge $task - $(head -1 "$worktree/$CLAUDE_DIR/PROMPT.md" 2>/dev/null | sed 's/# //')"; then
        success "$task: Merge exitoso"

        # Ejecutar tests si existen
        if [ -f "package.json" ] && grep -q '"test"' package.json; then
            log "$task: Ejecutando tests..."
            if npm run test 2>&1 | tee -a "$LOG_FILE"; then
                success "$task: Tests pasaron"
            else
                error "$task: Tests fallaron - revirtiendo"
                git reset --hard HEAD~1
                return 1
            fi
        fi

        # Limpiar worktree
        log "$task: Limpiando worktree..."
        git worktree remove "$worktree" --force 2>/dev/null || true
        git branch -d "$branch" 2>/dev/null || true

        success "$task: Integración completada"
        return 0
    else
        error "$task: Conflicto de merge"
        git merge --abort 2>/dev/null || true
        return 1
    fi
}

# Generar reporte
generate_report() {
    local merged_tasks=("$@")

    log "Generando reporte de integración..."

    cat > "$SCALE_DIR/INTEGRATION-REPORT.md" << EOF
# Reporte de Integración

> Generado: $(date)

## Tareas Integradas

| Tarea | Estado |
|-------|--------|
$(for task in "${merged_tasks[@]}"; do
    echo "| $task | ✅ Mergeado |"
done)

## Commits en Main

\`\`\`
$(git log --oneline -10)
\`\`\`

## Log

Ver: $LOG_FILE
EOF

    success "Reporte guardado en $SCALE_DIR/INTEGRATION-REPORT.md"
}

# Loop principal
main() {
    local manual_mode=false

    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --manual)
                manual_mode=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  INTEGRATOR $([ "$manual_mode" = true ] && echo '[MANUAL]' || echo '[AUTO]')"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    # Verificar swarm activo
    if [ ! -f "$CLAUDE_DIR/swarm-active" ]; then
        error "No hay swarm activo"
        exit 1
    fi

    log "Log: $LOG_FILE"
    log "Intervalo: ${INTERVAL}s"
    echo ""

    local merged_tasks=()

    # Registrar PID
    echo $$ > "$CLAUDE_DIR/integrator-active"

    while true; do
        # Verificar si debe detenerse
        if [ -f "$CLAUDE_DIR/STOP-INTEGRATOR" ]; then
            log "Señal de stop recibida"
            rm -f "$CLAUDE_DIR/STOP-INTEGRATOR"
            break
        fi

        # Buscar tareas completadas
        local found_work=false

        for worktree in "$TREES_DIR"/T*; do
            [ -d "$worktree" ] || continue

            local task=$(basename "$worktree")

            if can_merge "$task"; then
                found_work=true

                if merge_task "$task"; then
                    merged_tasks+=("$task")
                fi
            fi
        done

        # Verificar si quedan worktrees
        local remaining=$(ls -d "$TREES_DIR"/T* 2>/dev/null | wc -l)

        if [ "$remaining" -eq 0 ]; then
            log "Todas las tareas integradas"
            rm -f "$CLAUDE_DIR/swarm-active"
            break
        fi

        # En modo manual, salir después de una pasada
        if [ "$manual_mode" = true ]; then
            log "Modo manual - saliendo"
            break
        fi

        # Esperar antes de próxima verificación
        if [ "$found_work" = false ]; then
            log "Esperando tareas completadas... (${INTERVAL}s)"
        fi

        sleep "$INTERVAL"
    done

    # Limpiar
    rm -f "$CLAUDE_DIR/integrator-active"

    # Generar reporte si hubo merges
    if [ ${#merged_tasks[@]} -gt 0 ]; then
        generate_report "${merged_tasks[@]}"
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  INTEGRATOR FINALIZADO"
    echo "  Tareas mergeadas: ${#merged_tasks[@]}"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
}

main "$@"
