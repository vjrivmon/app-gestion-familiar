#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
#  RALPH HOOK - Stop Hook para Ralph Wiggum Loops
#  Combina test-runner existente con reinyección de prompts para autonomía
# ═══════════════════════════════════════════════════════════════════════

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────
# Ejecutar test-runner existente primero (si existe)
# ─────────────────────────────────────────────────────────────────────────
if [ -f "$PROJECT_DIR/.claude/hooks/scripts/test-runner.sh" ]; then
    bash "$PROJECT_DIR/.claude/hooks/scripts/test-runner.sh" 2>/dev/null || true
fi

# ─────────────────────────────────────────────────────────────────────────
# Verificar si la tarea está completada
# ─────────────────────────────────────────────────────────────────────────
if [ -f "$PROJECT_DIR/.claude/COMPLETE" ]; then
    echo -e "${GREEN}✅ TAREA COMPLETADA${NC}"
    rm -f "$PROJECT_DIR/.claude/COMPLETE" "$PROJECT_DIR/.claude/ralph-active"
    rm -f "$PROJECT_DIR/.claude/PROMPT.md"

    # Guardar log de sesión completada
    mkdir -p "$PROJECT_DIR/.claude/logs"
    LOG_FILE="$PROJECT_DIR/.claude/logs/ralph-complete-$(date +%Y%m%d-%H%M%S).md"
    cat > "$LOG_FILE" << EOF
# ✅ Sesión Ralph Completada

## Timestamp
$(date -Iseconds)

## Commits de la Sesión
$(git log --oneline -10 2>/dev/null || echo "No hay commits")

## Archivos Modificados
$(git diff --stat HEAD~5 2>/dev/null || echo "No hay historial")
EOF

    echo -e "${CYAN}Log guardado: $LOG_FILE${NC}"
    exit 0
fi

# ─────────────────────────────────────────────────────────────────────────
# Verificar si Ralph está activo
# ─────────────────────────────────────────────────────────────────────────
if [ -f "$PROJECT_DIR/.claude/ralph-active" ]; then
    echo ""
    echo -e "${YELLOW}🔄 RALPH LOOP ACTIVO - Reinyectando prompt...${NC}"
    echo ""

    if [ -f "$PROJECT_DIR/.claude/PROMPT.md" ]; then
        # Incrementar contador de iteraciones
        ITERATION_FILE="$PROJECT_DIR/.claude/.ralph-iteration"
        if [ -f "$ITERATION_FILE" ]; then
            ITERATION=$(cat "$ITERATION_FILE")
            ITERATION=$((ITERATION + 1))
        else
            ITERATION=1
        fi
        echo "$ITERATION" > "$ITERATION_FILE"

        # Safety: máximo 30 iteraciones
        if [ "$ITERATION" -ge 30 ]; then
            echo -e "${RED}⚠️  LÍMITE DE ITERACIONES ALCANZADO (30)${NC}"
            echo -e "${RED}Pausando loop - intervención humana requerida${NC}"
            rm -f "$PROJECT_DIR/.claude/ralph-active"
            rm -f "$ITERATION_FILE"
            exit 0
        fi

        echo -e "${CYAN}📊 Iteración: $ITERATION/30${NC}"
        echo ""

        # Reinyectar el prompt
        cat "$PROJECT_DIR/.claude/PROMPT.md"

        # Exit code 2 indica que debe continuar
        exit 2
    else
        echo -e "${RED}❌ Error: No se encontró PROMPT.md${NC}"
        rm -f "$PROJECT_DIR/.claude/ralph-active"
        exit 0
    fi
fi

# ─────────────────────────────────────────────────────────────────────────
# Sin Ralph activo - comportamiento normal
# ─────────────────────────────────────────────────────────────────────────
exit 0
