#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  CLAUDE SWARM - Lanzador de Agentes Paralelos
#  Orquesta múltiples sesiones de Claude Code en worktrees aislados
# ═══════════════════════════════════════════════════════════════════════

set -e

# Configuración
MAX_AGENTS="${1:-4}"
TASKS_DIR=".claude/tasks"
TREES_DIR="./trees"
LOG_DIR=".claude/logs/swarm-$(date +%Y%m%d-%H%M%S)"
TERMINAL="${TERMINAL:-gnome-terminal}"  # gnome-terminal, kitty, alacritty, etc.

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Banner
show_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}║   ${MAGENTA}█▀▀ █   █▀█ █ █ █▀▄ █▀▀   █▀▀ █ █ █▀█ █▀█ █▄█${CYAN}                ║${NC}"
    echo -e "${CYAN}║   ${MAGENTA}█   █   █▀█ █ █ █ █ █▀▀   ▀▀█ █▄█ █▀█ █▀▄ █ █${CYAN}                ║${NC}"
    echo -e "${CYAN}║   ${MAGENTA}▀▀▀ ▀▀▀ ▀ ▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀▀  ▀  ▀ ▀ ▀ ▀ ▀ ▀${CYAN}                ║${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}║        Sistema de Orquestación de Agentes Paralelos           ║${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerrequisitos..."
    
    if ! command -v claude &> /dev/null; then
        log_error "Claude Code no está instalado"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git no está instalado"
        exit 1
    fi
    
    if [ ! -d ".claude" ]; then
        log_error "No se encontró directorio .claude. ¿Estás en el directorio correcto?"
        exit 1
    fi
    
    log_success "Prerrequisitos verificados"
}

# Obtener tareas pendientes
get_pending_tasks() {
    local count=0
    
    if [ ! -d "$TASKS_DIR" ]; then
        log_warning "No se encontró directorio de tareas: $TASKS_DIR"
        return
    fi
    
    for task_file in "$TASKS_DIR"/*.md; do
        if [ -f "$task_file" ]; then
            if grep -q "status: todo" "$task_file" 2>/dev/null; then
                echo "$task_file"
                count=$((count + 1))
                if [ $count -ge $MAX_AGENTS ]; then
                    break
                fi
            fi
        fi
    done
}

# Configurar agente para una tarea
setup_agent() {
    local task_file="$1"
    local task_id=$(basename "$task_file" .md)
    local worktree_path="$TREES_DIR/$task_id"
    
    log_info "Configurando agente para: $task_id"
    
    # Crear worktree
    if [ ! -d "$worktree_path" ]; then
        bash .claude/scripts/worktree-manager.sh create "$task_id" 2>/dev/null || {
            log_warning "No se pudo crear worktree para $task_id"
            return 1
        }
    fi
    
    # Copiar tarea como prompt
    cp "$task_file" "$worktree_path/.claude/PROMPT.md"
    
    # Crear prompt wrapper para Ralph
    cat > "$worktree_path/.claude/PROMPT.md" << EOF
# 🎯 TAREA ACTIVA: $task_id

## Instrucciones
Lee el contenido de la tarea y complétala siguiendo los criterios de validación.

## Contenido de la Tarea
$(cat "$task_file")

## Criterios de Completitud
Cuando TODOS los criterios de validación estén cumplidos:
1. Ejecutar: \`rm .claude/ralph-active\`
2. Crear: \`touch .claude/COMPLETE\`
3. Responder: <promise>COMPLETE</promise>

## Safety
- Máximo 30 iteraciones
- Si el mismo error aparece 3+ veces: PAUSAR
- Si no hay progreso en 5 iteraciones: PAUSAR

## Progreso
[Actualizar en cada iteración]
- Iteración: 1
- Criterios completados: 0/N
- Última acción: Inicio
- Siguiente paso: Leer tarea
EOF
    
    # Activar Ralph
    touch "$worktree_path/.claude/ralph-active"
    
    # Actualizar estado de la tarea
    sed -i 's/status: todo/status: in-progress/' "$task_file"
    
    log_success "Agente configurado: $task_id"
    return 0
}

# Generar script de lanzamiento
generate_launch_script() {
    mkdir -p "$LOG_DIR"
    
    local launch_script="$LOG_DIR/launch.sh"
    
    cat > "$launch_script" << 'HEADER'
#!/bin/bash
# Script de lanzamiento generado automáticamente
# NO EJECUTAR directamente - usar: source launch.sh

HEADER
    
    local count=0
    for dir in "$TREES_DIR"/T*; do
        if [ -d "$dir" ] && [ -f "$dir/.claude/ralph-active" ]; then
            local task_id=$(basename "$dir")
            local log_file="$LOG_DIR/$task_id.log"
            
            case "$TERMINAL" in
                gnome-terminal)
                    echo "gnome-terminal --tab --title='$task_id' --working-directory='$PWD/$dir' -- bash -c 'claude --dangerously-skip-permissions 2>&1 | tee $log_file; echo \"Presiona Enter para cerrar...\"; read'" >> "$launch_script"
                    ;;
                kitty)
                    echo "kitty --title '$task_id' --directory '$PWD/$dir' -- bash -c 'claude --dangerously-skip-permissions 2>&1 | tee $log_file; echo \"Presiona Enter para cerrar...\"; read' &" >> "$launch_script"
                    ;;
                alacritty)
                    echo "alacritty --title '$task_id' --working-directory '$PWD/$dir' -e bash -c 'claude --dangerously-skip-permissions 2>&1 | tee $log_file; echo \"Presiona Enter para cerrar...\"; read' &" >> "$launch_script"
                    ;;
                tmux)
                    echo "tmux new-window -n '$task_id' \"cd $PWD/$dir && claude --dangerously-skip-permissions 2>&1 | tee $log_file\"" >> "$launch_script"
                    ;;
                *)
                    echo "cd $PWD/$dir && claude --dangerously-skip-permissions 2>&1 | tee $log_file &" >> "$launch_script"
                    ;;
            esac
            
            count=$((count + 1))
        fi
    done
    
    chmod +x "$launch_script"
    log_success "Script de lanzamiento generado: $launch_script"
    echo "$count"
}

# Generar monitor script
generate_monitor_script() {
    local monitor_script="$LOG_DIR/monitor.sh"
    
    cat > "$monitor_script" << 'EOF'
#!/bin/bash
# Monitor de Claude Swarm

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

TREES_DIR="./trees"

while true; do
    clear
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              CLAUDE SWARM - MONITOR EN VIVO                   ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Actualizado: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    printf "${BLUE}%-25s %-15s %-12s %-20s${NC}\n" "WORKTREE" "ESTADO" "CAMBIOS" "ÚLTIMO LOG"
    echo "─────────────────────────────────────────────────────────────────"
    
    for dir in "$TREES_DIR"/T*; do
        if [ -d "$dir" ]; then
            task=$(basename "$dir")
            
            # Determinar estado
            if [ -f "$dir/.claude/ralph-active" ]; then
                status="${YELLOW}🔄 RUNNING${NC}"
            elif [ -f "$dir/.claude/COMPLETE" ]; then
                status="${GREEN}✅ COMPLETE${NC}"
            else
                status="⏸️  PAUSED"
            fi
            
            # Contar cambios
            changes=$(cd "$dir" && git diff --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ file' | cut -d' ' -f1 || echo "0")
            
            # Último log (últimas palabras)
            last_log=""
            if [ -f "$dir/.claude/PROMPT.md" ]; then
                last_log=$(grep -A1 "Última acción:" "$dir/.claude/PROMPT.md" 2>/dev/null | tail -1 | head -c 18)
            fi
            
            printf "%-25s %-15b %-12s %-20s\n" "$task" "$status" "${changes:-0} files" "${last_log:-N/A}"
        fi
    done
    
    echo ""
    echo "─────────────────────────────────────────────────────────────────"
    
    # Resumen
    total=$(ls -d "$TREES_DIR"/T* 2>/dev/null | wc -l)
    running=$(find "$TREES_DIR" -name "ralph-active" 2>/dev/null | wc -l)
    complete=$(find "$TREES_DIR" -name "COMPLETE" 2>/dev/null | wc -l)
    paused=$((total - running - complete))
    
    echo ""
    echo -e "  Total: $total | ${YELLOW}Running: $running${NC} | ${GREEN}Complete: $complete${NC} | Paused: $paused"
    echo ""
    echo -e "  ${CYAN}Presiona Ctrl+C para salir${NC}"
    
    sleep 10
done
EOF
    
    chmod +x "$monitor_script"
    log_success "Monitor generado: $monitor_script"
}

# Main
main() {
    show_banner
    
    check_prerequisites
    
    echo ""
    log_info "Configuración:"
    echo "  - Máximo de agentes: $MAX_AGENTS"
    echo "  - Directorio de tareas: $TASKS_DIR"
    echo "  - Directorio de worktrees: $TREES_DIR"
    echo "  - Terminal: $TERMINAL"
    echo ""
    
    # Obtener tareas pendientes
    log_info "Buscando tareas pendientes..."
    pending_tasks=$(get_pending_tasks)
    
    if [ -z "$pending_tasks" ]; then
        log_warning "No hay tareas pendientes en $TASKS_DIR"
        log_info "Crea tareas con status: todo en archivos .md"
        exit 0
    fi
    
    task_count=$(echo "$pending_tasks" | wc -l)
    log_info "Encontradas $task_count tareas pendientes"
    
    # Confirmar lanzamiento
    echo ""
    echo -e "${YELLOW}Se van a configurar $task_count agentes paralelos.${NC}"
    echo -e "${YELLOW}Esto usará --dangerously-skip-permissions.${NC}"
    echo ""
    read -p "¿Continuar? (y/N) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelado por el usuario"
        exit 0
    fi
    
    # Configurar agentes
    echo ""
    log_info "Configurando agentes..."
    
    for task_file in $pending_tasks; do
        setup_agent "$task_file"
    done
    
    # Generar scripts
    echo ""
    agent_count=$(generate_launch_script)
    generate_monitor_script
    
    # Mostrar instrucciones
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ SWARM CONFIGURADO${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  Agentes configurados: $agent_count"
    echo "  Logs en: $LOG_DIR"
    echo ""
    echo -e "${YELLOW}Para lanzar los agentes:${NC}"
    echo "  bash $LOG_DIR/launch.sh"
    echo ""
    echo -e "${YELLOW}Para monitorear:${NC}"
    echo "  bash $LOG_DIR/monitor.sh"
    echo ""
    echo -e "${YELLOW}Para detener un agente:${NC}"
    echo "  rm trees/<task-id>/.claude/ralph-active"
    echo ""
    echo -e "${YELLOW}Para limpiar después:${NC}"
    echo "  bash .claude/scripts/worktree-manager.sh cleanup"
    echo ""
}

# Ejecutar
main "$@"
