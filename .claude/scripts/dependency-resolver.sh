#!/bin/bash
# dependency-resolver.sh - Resuelve y visualiza grafo de dependencias
# Uso: bash .claude/scripts/dependency-resolver.sh [--output json|ascii|mermaid]

set -e

# Configuración
CLAUDE_DIR=".claude"
TASKS_DIR="$CLAUDE_DIR/tasks"
SCALE_DIR="$CLAUDE_DIR/scale"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Recopilar información de tareas
declare -A TASK_STATUS
declare -A TASK_DEPS
declare -A TASK_TITLE

collect_tasks() {
    for task_file in "$TASKS_DIR"/T*.md; do
        [ -f "$task_file" ] || continue

        local filename=$(basename "$task_file" .md)
        local task_id=$(echo "$filename" | grep -oE '^T[0-9]+')

        [ -z "$task_id" ] && continue

        # Status
        local status=$(grep -m1 "^status:" "$task_file" 2>/dev/null | cut -d' ' -f2 || echo "pending")
        TASK_STATUS[$task_id]="$status"

        # Dependencias
        local deps=$(grep -m1 "^depends_on:" "$task_file" 2>/dev/null | sed 's/depends_on: \[//' | sed 's/\]//' | tr -d ' ' || echo "")
        TASK_DEPS[$task_id]="$deps"

        # Título
        local title=$(grep -m1 "^# " "$task_file" 2>/dev/null | sed 's/^# //' || echo "$task_id")
        TASK_TITLE[$task_id]="$title"
    done
}

# Detectar ciclos (DFS)
detect_cycles() {
    local visited=()
    local rec_stack=()
    local has_cycle=false

    dfs() {
        local node=$1
        visited+=("$node")
        rec_stack+=("$node")

        local deps="${TASK_DEPS[$node]}"
        if [ -n "$deps" ]; then
            for dep in $(echo "$deps" | tr ',' ' '); do
                if [[ ! " ${visited[@]} " =~ " ${dep} " ]]; then
                    dfs "$dep"
                elif [[ " ${rec_stack[@]} " =~ " ${dep} " ]]; then
                    echo -e "${RED}⚠️ CICLO DETECTADO: $node → $dep${NC}"
                    has_cycle=true
                fi
            done
        fi

        # Remove from rec_stack
        rec_stack=("${rec_stack[@]/$node}")
    }

    for task in "${!TASK_STATUS[@]}"; do
        if [[ ! " ${visited[@]} " =~ " ${task} " ]]; then
            dfs "$task"
        fi
    done

    $has_cycle && return 1 || return 0
}

# Calcular niveles de ejecución
calculate_levels() {
    declare -gA TASK_LEVEL

    get_level() {
        local task=$1

        # Si ya calculado, retornar
        [ -n "${TASK_LEVEL[$task]}" ] && echo "${TASK_LEVEL[$task]}" && return

        local deps="${TASK_DEPS[$task]}"
        local max_dep_level=-1

        if [ -n "$deps" ] && [ "$deps" != "" ]; then
            for dep in $(echo "$deps" | tr ',' ' '); do
                local dep_level=$(get_level "$dep")
                [ "$dep_level" -gt "$max_dep_level" ] && max_dep_level=$dep_level
            done
        fi

        TASK_LEVEL[$task]=$((max_dep_level + 1))
        echo "${TASK_LEVEL[$task]}"
    }

    for task in "${!TASK_STATUS[@]}"; do
        get_level "$task" > /dev/null
    done
}

# Output ASCII
output_ascii() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  GRAFO DE DEPENDENCIAS"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""

    # Estadísticas
    local total=${#TASK_STATUS[@]}
    local completed=0
    local in_progress=0
    local pending=0

    for task in "${!TASK_STATUS[@]}"; do
        case "${TASK_STATUS[$task]}" in
            completed) ((completed++)) ;;
            in_progress) ((in_progress++)) ;;
            *) ((pending++)) ;;
        esac
    done

    echo "  Total: $total | ✅ $completed | 🔄 $in_progress | ⏳ $pending"
    echo ""

    # Por nivel
    local max_level=0
    for task in "${!TASK_LEVEL[@]}"; do
        [ "${TASK_LEVEL[$task]}" -gt "$max_level" ] && max_level="${TASK_LEVEL[$task]}"
    done

    for level in $(seq 0 $max_level); do
        echo -e "${CYAN}NIVEL $level:${NC}"

        for task in "${!TASK_LEVEL[@]}"; do
            if [ "${TASK_LEVEL[$task]}" -eq "$level" ]; then
                local status_icon
                case "${TASK_STATUS[$task]}" in
                    completed) status_icon="✅" ;;
                    in_progress) status_icon="🔄" ;;
                    *) status_icon="⏳" ;;
                esac

                local deps="${TASK_DEPS[$task]}"
                local deps_str=""
                [ -n "$deps" ] && deps_str=" ← [$deps]"

                echo "  $status_icon $task: ${TASK_TITLE[$task]:0:40}$deps_str"
            fi
        done
        echo ""
    done

    # Tareas ejecutables ahora
    echo -e "${GREEN}EJECUTABLES AHORA:${NC}"
    for task in "${!TASK_STATUS[@]}"; do
        if [ "${TASK_STATUS[$task]}" = "pending" ]; then
            local can_execute=true
            local deps="${TASK_DEPS[$task]}"

            if [ -n "$deps" ]; then
                for dep in $(echo "$deps" | tr ',' ' '); do
                    if [ "${TASK_STATUS[$dep]}" != "completed" ]; then
                        can_execute=false
                        break
                    fi
                done
            fi

            $can_execute && echo "  - $task"
        fi
    done

    echo ""
    echo "═══════════════════════════════════════════════════════════════"
}

# Output Mermaid
output_mermaid() {
    echo "graph TD"

    for task in "${!TASK_STATUS[@]}"; do
        local style=""
        case "${TASK_STATUS[$task]}" in
            completed) style=":::completed" ;;
            in_progress) style=":::inprogress" ;;
        esac

        echo "    $task[\"$task: ${TASK_TITLE[$task]:0:30}\"]$style"

        local deps="${TASK_DEPS[$task]}"
        if [ -n "$deps" ]; then
            for dep in $(echo "$deps" | tr ',' ' '); do
                echo "    $dep --> $task"
            done
        fi
    done

    echo ""
    echo "    classDef completed fill:#90EE90"
    echo "    classDef inprogress fill:#FFE4B5"
}

# Output JSON
output_json() {
    echo "{"
    echo "  \"tasks\": ["

    local first=true
    for task in "${!TASK_STATUS[@]}"; do
        $first || echo ","
        first=false

        echo -n "    {"
        echo -n "\"id\": \"$task\", "
        echo -n "\"status\": \"${TASK_STATUS[$task]}\", "
        echo -n "\"level\": ${TASK_LEVEL[$task]}, "
        echo -n "\"depends_on\": [$(echo "${TASK_DEPS[$task]}" | sed 's/,/\", \"/g' | sed 's/^/\"/' | sed 's/$/\"/' | sed 's/\"\"//g')]"
        echo -n "}"
    done

    echo ""
    echo "  ]"
    echo "}"
}

# Main
main() {
    local output_format="ascii"

    while [[ $# -gt 0 ]]; do
        case $1 in
            --output)
                output_format="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done

    # Recopilar datos
    collect_tasks

    if [ ${#TASK_STATUS[@]} -eq 0 ]; then
        echo "No hay tareas en $TASKS_DIR"
        exit 0
    fi

    # Detectar ciclos
    detect_cycles || exit 1

    # Calcular niveles
    calculate_levels

    # Output
    case $output_format in
        json)
            output_json
            ;;
        mermaid)
            output_mermaid
            ;;
        *)
            output_ascii
            ;;
    esac

    # Guardar grafo
    mkdir -p "$SCALE_DIR"
    output_mermaid > "$SCALE_DIR/DEPENDENCY-GRAPH.mermaid"
}

main "$@"
