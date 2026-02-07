#!/bin/bash
# parallel-monitor.sh - Monitor en tiempo real de agentes paralelos
# Uso: bash .claude/scripts/parallel-monitor.sh [--watch]

# Configuración
CLAUDE_DIR=".claude"
TREES_DIR="trees"
REFRESH_INTERVAL=5

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Obtener estado de un worktree
get_worktree_status() {
    local worktree=$1
    local task=$(basename "$worktree")

    if [ -f "$worktree/$CLAUDE_DIR/COMPLETE" ]; then
        echo "completed"
    elif [ -f "$worktree/$CLAUDE_DIR/ERROR" ]; then
        echo "error"
    elif [ -f "$worktree/$CLAUDE_DIR/STOP" ]; then
        echo "stopped"
    else
        echo "running"
    fi
}

# Obtener icono de estado
get_status_icon() {
    local status=$1
    case $status in
        completed) echo "✅" ;;
        error) echo "❌" ;;
        stopped) echo "⏸️" ;;
        running) echo "🔄" ;;
        *) echo "⬜" ;;
    esac
}

# Obtener commits de un worktree
get_commits_count() {
    local worktree=$1
    cd "$worktree" 2>/dev/null && git rev-list --count HEAD ^main 2>/dev/null || echo "0"
}

# Obtener último commit
get_last_commit() {
    local worktree=$1
    cd "$worktree" 2>/dev/null && git log -1 --format="%h %s" 2>/dev/null | head -c 40 || echo "Sin commits"
}

# Obtener archivos modificados
get_modified_files() {
    local worktree=$1
    cd "$worktree" 2>/dev/null && git status --short 2>/dev/null | wc -l || echo "0"
}

# Mostrar dashboard
show_dashboard() {
    local watch_mode=$1

    # Limpiar pantalla si es modo watch
    [ "$watch_mode" = true ] && clear

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "  ${BOLD}SWARM MONITOR${NC} - $(date +%H:%M:%S)"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    # Verificar si hay swarm activo
    if [ ! -f "$CLAUDE_DIR/swarm-active" ]; then
        echo -e "  ${YELLOW}No hay swarm activo${NC}"
        echo ""
        echo "  Usa: /swarm:launch <N> para iniciar"
        echo ""
        return
    fi

    # Leer info del swarm
    local started_at=$(grep -o '"started_at": "[^"]*"' "$CLAUDE_DIR/swarm-active" | cut -d'"' -f4)
    echo -e "  Iniciado: ${CYAN}$started_at${NC}"
    echo ""

    # Contar estados
    local total=0
    local completed=0
    local running=0
    local errors=0

    # Tabla de agentes
    echo "┌──────┬────────────────────────────────┬──────────┬─────────┬──────────────────────────────┐"
    echo "│ Task │ Título                         │ Estado   │ Commits │ Último Commit                │"
    echo "├──────┼────────────────────────────────┼──────────┼─────────┼──────────────────────────────┤"

    for worktree in "$TREES_DIR"/T*; do
        [ -d "$worktree" ] || continue

        local task=$(basename "$worktree")
        local status=$(get_worktree_status "$worktree")
        local icon=$(get_status_icon "$status")
        local commits=$(get_commits_count "$worktree")
        local last_commit=$(get_last_commit "$worktree")

        # Obtener título de la tarea
        local title="N/A"
        if [ -f "$worktree/$CLAUDE_DIR/PROMPT.md" ]; then
            title=$(grep -m1 "^# " "$worktree/$CLAUDE_DIR/PROMPT.md" 2>/dev/null | sed 's/^# //' | head -c 28)
        fi

        ((total++))
        case $status in
            completed) ((completed++)) ;;
            error) ((errors++)) ;;
            running) ((running++)) ;;
        esac

        printf "│ %-4s │ %-30s │ %s %-6s │ %7s │ %-28s │\n" \
            "$task" "${title:0:30}" "$icon" "$status" "$commits" "${last_commit:0:28}"
    done

    echo "└──────┴────────────────────────────────┴──────────┴─────────┴──────────────────────────────┘"
    echo ""

    # Barra de progreso
    local progress=0
    [ $total -gt 0 ] && progress=$((completed * 100 / total))

    local filled=$((progress / 5))
    local empty=$((20 - filled))

    echo -n "  Progreso: ["
    printf '%0.s█' $(seq 1 $filled) 2>/dev/null
    printf '%0.s░' $(seq 1 $empty) 2>/dev/null
    echo "] $progress%"
    echo ""

    # Resumen
    echo "  ┌─────────────────────────────────┐"
    echo "  │ Total:     $total                   │"
    echo "  │ ✅ Done:    $completed                   │"
    echo "  │ 🔄 Running: $running                   │"
    echo "  │ ❌ Errors:  $errors                   │"
    echo "  └─────────────────────────────────┘"
    echo ""

    # Integrador activo?
    if [ -f "$CLAUDE_DIR/integrator-active" ]; then
        local integrator_pid=$(cat "$CLAUDE_DIR/integrator-active")
        if kill -0 "$integrator_pid" 2>/dev/null; then
            echo -e "  ${GREEN}Integrador activo${NC} (PID: $integrator_pid)"
        fi
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  Comandos: /swarm:status | /swarm:integrate | /swarm:stop"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
}

# Main
main() {
    local watch_mode=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --watch|-w)
                watch_mode=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    if [ "$watch_mode" = true ]; then
        # Modo watch: actualizar cada N segundos
        while true; do
            show_dashboard true
            sleep $REFRESH_INTERVAL

            # Salir si no hay swarm activo
            [ ! -f "$CLAUDE_DIR/swarm-active" ] && break
        done
    else
        # Mostrar una vez
        show_dashboard false
    fi
}

main "$@"
