#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  TRACKER - Sistema de Tracking para Pipeline de Desarrollo
#  Registra eventos y estados del flujo Idea → MVP
# ═══════════════════════════════════════════════════════════════════════════

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
LOG_DIR="$PROJECT_DIR/.claude/logs"
PIPELINE_LOG="$LOG_DIR/pipeline.log"
ERRORS_LOG="$LOG_DIR/errors.log"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Asegurar que existe el directorio de logs
mkdir -p "$LOG_DIR"

# ─────────────────────────────────────────────────────────────────────────────
# Funciones de logging
# ─────────────────────────────────────────────────────────────────────────────

log_event() {
    local phase="$1"
    local step="$2"
    local status="$3"
    local message="$4"
    local duration="${5:-0}"

    local timestamp
    timestamp=$(date -Iseconds)

    # Formato JSON para fácil parsing
    local json_entry
    json_entry=$(cat << EOF
{"timestamp":"$timestamp","phase":"$phase","step":"$step","status":"$status","message":"$message","duration_ms":$duration}
EOF
)

    echo "$json_entry" >> "$PIPELINE_LOG"

    # También mostrar en consola
    case "$status" in
        success)
            echo -e "${GREEN}✓${NC} [$phase/$step] $message"
            ;;
        failed)
            echo -e "${RED}✗${NC} [$phase/$step] $message"
            echo "$timestamp [$phase/$step] ERROR: $message" >> "$ERRORS_LOG"
            ;;
        skipped)
            echo -e "${YELLOW}○${NC} [$phase/$step] $message"
            ;;
        progress)
            echo -e "${CYAN}→${NC} [$phase/$step] $message"
            ;;
        *)
            echo "[$phase/$step] $message"
            ;;
    esac
}

# ─────────────────────────────────────────────────────────────────────────────
# Comandos principales
# ─────────────────────────────────────────────────────────────────────────────

cmd_start() {
    local phase="$1"
    local step="$2"
    local message="${3:-Iniciando...}"

    log_event "$phase" "$step" "progress" "$message"

    # Guardar timestamp de inicio para calcular duración
    echo "$(date +%s%3N)" > "$LOG_DIR/.track_start_$phase_$step"
}

cmd_end() {
    local phase="$1"
    local step="$2"
    local status="$3"
    local message="${4:-Completado}"

    # Calcular duración
    local start_file="$LOG_DIR/.track_start_$phase_$step"
    local duration=0
    if [ -f "$start_file" ]; then
        local start_time
        start_time=$(cat "$start_file")
        local end_time
        end_time=$(date +%s%3N)
        duration=$((end_time - start_time))
        rm -f "$start_file"
    fi

    log_event "$phase" "$step" "$status" "$message" "$duration"
}

cmd_status() {
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}              ESTADO DEL PIPELINE DE DESARROLLO${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    # Contar eventos por fase
    if [ -f "$PIPELINE_LOG" ]; then
        echo -e "${CYAN}Eventos por Fase:${NC}"
        echo "───────────────────────────────────────"

        for phase in idea-validate stories-generate tasks-breakdown ralph-loop worktree; do
            local count
            count=$(grep -c "\"phase\":\"$phase\"" "$PIPELINE_LOG" 2>/dev/null || echo "0")
            local success
            success=$(grep "\"phase\":\"$phase\"" "$PIPELINE_LOG" 2>/dev/null | grep -c "\"status\":\"success\"" || echo "0")
            local failed
            failed=$(grep "\"phase\":\"$phase\"" "$PIPELINE_LOG" 2>/dev/null | grep -c "\"status\":\"failed\"" || echo "0")

            if [ "$count" -gt 0 ]; then
                echo -e "  $phase: ${GREEN}$success✓${NC} ${RED}$failed✗${NC} (total: $count)"
            fi
        done

        echo ""
        echo -e "${CYAN}Últimos 5 eventos:${NC}"
        echo "───────────────────────────────────────"
        tail -5 "$PIPELINE_LOG" | while read -r line; do
            local phase step status message
            phase=$(echo "$line" | jq -r '.phase' 2>/dev/null || echo "?")
            step=$(echo "$line" | jq -r '.step' 2>/dev/null || echo "?")
            status=$(echo "$line" | jq -r '.status' 2>/dev/null || echo "?")
            message=$(echo "$line" | jq -r '.message' 2>/dev/null || echo "?")

            case "$status" in
                success) echo -e "  ${GREEN}✓${NC} $phase/$step: $message" ;;
                failed) echo -e "  ${RED}✗${NC} $phase/$step: $message" ;;
                *) echo -e "  → $phase/$step: $message" ;;
            esac
        done
    else
        echo -e "${YELLOW}No hay eventos registrados aún.${NC}"
    fi

    echo ""

    # Mostrar errores recientes
    if [ -f "$ERRORS_LOG" ] && [ -s "$ERRORS_LOG" ]; then
        local error_count
        error_count=$(wc -l < "$ERRORS_LOG")
        echo -e "${RED}⚠️  $error_count errores registrados${NC}"
        echo -e "${CYAN}Últimos 3 errores:${NC}"
        tail -3 "$ERRORS_LOG"
    fi

    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
}

cmd_clear() {
    echo -e "${YELLOW}Limpiando logs...${NC}"
    rm -f "$PIPELINE_LOG" "$ERRORS_LOG" "$LOG_DIR"/.track_start_*
    echo -e "${GREEN}✓ Logs limpiados${NC}"
}

cmd_export() {
    local output="${1:-$LOG_DIR/pipeline-export-$(date +%Y%m%d).json}"

    if [ -f "$PIPELINE_LOG" ]; then
        echo "[" > "$output"
        sed 's/$/,/' "$PIPELINE_LOG" | sed '$ s/,$//' >> "$output"
        echo "]" >> "$output"
        echo -e "${GREEN}✓ Exportado a: $output${NC}"
    else
        echo -e "${RED}No hay datos para exportar${NC}"
    fi
}

cmd_help() {
    echo "Uso: tracker.sh <comando> [argumentos]"
    echo ""
    echo "Comandos:"
    echo "  start <phase> <step> [message]   Iniciar tracking de un paso"
    echo "  end <phase> <step> <status> [msg] Finalizar tracking (status: success/failed/skipped)"
    echo "  log <phase> <step> <status> <msg> Registrar evento puntual"
    echo "  status                            Mostrar estado del pipeline"
    echo "  clear                             Limpiar todos los logs"
    echo "  export [file]                     Exportar a JSON"
    echo "  help                              Mostrar esta ayuda"
    echo ""
    echo "Fases válidas:"
    echo "  idea-validate, stories-generate, tasks-breakdown, ralph-loop, worktree"
    echo ""
    echo "Ejemplos:"
    echo "  tracker.sh start idea-validate market-analysis"
    echo "  tracker.sh end idea-validate market-analysis success \"Mercado viable\""
    echo "  tracker.sh log ralph-loop iteration progress \"Iteración 5/30\""
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

case "${1:-help}" in
    start)
        cmd_start "${2:-unknown}" "${3:-unknown}" "${4:-}"
        ;;
    end)
        cmd_end "${2:-unknown}" "${3:-unknown}" "${4:-success}" "${5:-}"
        ;;
    log)
        log_event "${2:-unknown}" "${3:-unknown}" "${4:-progress}" "${5:-}"
        ;;
    status)
        cmd_status
        ;;
    clear)
        cmd_clear
        ;;
    export)
        cmd_export "$2"
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        echo "Comando desconocido: $1"
        cmd_help
        exit 1
        ;;
esac
