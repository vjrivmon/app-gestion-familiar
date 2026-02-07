#!/bin/bash
# swarm-launcher-v2.sh - Lanzador mejorado de agentes paralelos
# Uso: bash .claude/scripts/swarm-launcher-v2.sh <num_agents> [--tasks T001,T002]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
MAX_AGENTS=${MAX_PARALLEL_AGENTS:-6}
CLAUDE_DIR=".claude"
TASKS_DIR="$CLAUDE_DIR/tasks"
TREES_DIR="trees"

log() { echo -e "${BLUE}[SWARM]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Verificar prerrequisitos
check_prereqs() {
    log "Verificando prerrequisitos..."

    # Git limpio
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        warn "Hay cambios sin commitear. Considera hacer commit primero."
    fi

    # No hay swarm activo
    if [ -f "$CLAUDE_DIR/swarm-active" ]; then
        error "Ya hay un swarm activo. Usa /swarm:stop primero."
    fi

    # Directorio de tareas existe
    if [ ! -d "$TASKS_DIR" ]; then
        error "No existe directorio de tareas: $TASKS_DIR"
    fi

    success "Prerrequisitos OK"
}

# Seleccionar tareas disponibles
select_tasks() {
    local num_agents=$1
    local specific_tasks=$2

    if [ -n "$specific_tasks" ]; then
        # Tareas específicas
        echo "$specific_tasks" | tr ',' '\n'
    else
        # Seleccionar automáticamente tareas sin dependencias pendientes
        local available_tasks=()

        for task_file in "$TASKS_DIR"/T*.md; do
            [ -f "$task_file" ] || continue

            local task_id=$(basename "$task_file" .md | cut -d'-' -f1)
            local status=$(grep -m1 "^status:" "$task_file" 2>/dev/null | cut -d' ' -f2)

            # Solo tareas pendientes
            [ "$status" != "pending" ] && continue

            # Verificar dependencias
            local deps=$(grep -m1 "^depends_on:" "$task_file" 2>/dev/null | sed 's/depends_on: \[//' | sed 's/\]//')
            local deps_ok=true

            if [ -n "$deps" ] && [ "$deps" != "[]" ]; then
                for dep in $(echo "$deps" | tr ',' ' '); do
                    local dep_status=$(grep -m1 "^status:" "$TASKS_DIR/${dep}"*.md 2>/dev/null | cut -d' ' -f2)
                    if [ "$dep_status" != "completed" ]; then
                        deps_ok=false
                        break
                    fi
                done
            fi

            if $deps_ok; then
                available_tasks+=("$task_id")
            fi
        done

        # Limitar al número de agentes
        printf '%s\n' "${available_tasks[@]}" | head -n "$num_agents"
    fi
}

# Crear worktree para una tarea
create_worktree() {
    local task_id=$1
    local branch_name="task/$task_id"
    local worktree_path="$TREES_DIR/$task_id"

    log "Creando worktree para $task_id..."

    # Crear branch y worktree
    git worktree add -b "$branch_name" "$worktree_path" HEAD 2>/dev/null || {
        # Si el branch ya existe, solo crear worktree
        git worktree add "$worktree_path" "$branch_name" 2>/dev/null || {
            warn "Worktree ya existe: $worktree_path"
            return 0
        }
    }

    # Crear directorio .claude en worktree
    mkdir -p "$worktree_path/$CLAUDE_DIR"

    # Copiar tarea como PROMPT.md
    local task_file=$(ls "$TASKS_DIR"/${task_id}*.md 2>/dev/null | head -1)
    if [ -f "$task_file" ]; then
        cp "$task_file" "$worktree_path/$CLAUDE_DIR/PROMPT.md"
    fi

    success "Worktree creado: $worktree_path"
}

# Lanzar agente en terminal
launch_agent() {
    local task_id=$1
    local worktree_path="$TREES_DIR/$task_id"

    log "Lanzando agente para $task_id..."

    # Detectar terminal disponible
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --tab --title="Agent: $task_id" -- bash -c "
            cd '$worktree_path'
            echo '=== Agente $task_id ==='
            echo 'Worktree: $worktree_path'
            echo 'Tarea: $CLAUDE_DIR/PROMPT.md'
            echo ''
            claude --dangerously-skip-permissions
            exec bash
        " &
    elif command -v xterm &> /dev/null; then
        xterm -title "Agent: $task_id" -e "
            cd '$worktree_path' && claude --dangerously-skip-permissions; bash
        " &
    elif command -v tmux &> /dev/null; then
        tmux new-window -n "$task_id" "cd '$worktree_path' && claude --dangerously-skip-permissions"
    else
        warn "No se encontró terminal. Ejecuta manualmente:"
        echo "  cd $worktree_path && claude --dangerously-skip-permissions"
    fi

    success "Agente lanzado: $task_id"
}

# Registrar estado del swarm
register_swarm() {
    local tasks=("$@")

    log "Registrando estado del swarm..."

    cat > "$CLAUDE_DIR/swarm-active" << EOF
{
    "started_at": "$(date -Iseconds)",
    "agents": [
$(for i in "${!tasks[@]}"; do
    local task="${tasks[$i]}"
    echo "        {"
    echo "            \"id\": \"agent-$((i+1))\","
    echo "            \"task\": \"$task\","
    echo "            \"worktree\": \"$TREES_DIR/$task\","
    echo "            \"status\": \"running\""
    echo "        }$([ $i -lt $((${#tasks[@]}-1)) ] && echo ',')"
done)
    ],
    "total_agents": ${#tasks[@]}
}
EOF

    success "Estado registrado en $CLAUDE_DIR/swarm-active"
}

# Main
main() {
    local num_agents=${1:-2}
    local specific_tasks=""

    # Parsear argumentos
    shift || true
    while [[ $# -gt 0 ]]; do
        case $1 in
            --tasks)
                specific_tasks="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    # Validar número de agentes
    if [ "$num_agents" -gt "$MAX_AGENTS" ]; then
        warn "Reduciendo a máximo permitido: $MAX_AGENTS agentes"
        num_agents=$MAX_AGENTS
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  SWARM LAUNCHER v2"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    check_prereqs

    # Crear directorio de worktrees
    mkdir -p "$TREES_DIR"

    # Seleccionar tareas
    log "Seleccionando tareas..."
    local tasks=($(select_tasks "$num_agents" "$specific_tasks"))

    if [ ${#tasks[@]} -eq 0 ]; then
        error "No hay tareas disponibles para ejecutar"
    fi

    echo ""
    log "Tareas seleccionadas: ${tasks[*]}"
    echo ""

    if [ "$DRY_RUN" = true ]; then
        log "Modo dry-run. No se ejecutará nada."
        exit 0
    fi

    # Crear worktrees
    for task in "${tasks[@]}"; do
        create_worktree "$task"
    done

    # Registrar swarm
    register_swarm "${tasks[@]}"

    # Lanzar agentes
    echo ""
    log "Lanzando agentes..."
    for task in "${tasks[@]}"; do
        launch_agent "$task"
        sleep 1  # Pequeña pausa entre lanzamientos
    done

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  SWARM LANZADO: ${#tasks[@]} agentes"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "  Monitorear:    /swarm:status"
    echo "  Integrar:      /swarm:integrate"
    echo "  Detener:       /swarm:stop"
    echo ""
}

main "$@"
