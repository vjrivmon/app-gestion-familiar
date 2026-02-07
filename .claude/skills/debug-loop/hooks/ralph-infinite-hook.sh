#!/bin/bash
# Ralph Infinite Hook - Template genérico
# Copiar a .claude/ralph-infinite/ del proyecto y personalizar

# CONFIGURAR ESTAS VARIABLES
PROJECT_DIR="${PWD}"
TASK_FILE="${PROJECT_DIR}/.claude/debug/TASK.md"
RALPH_STATE_FILE="${HOME}/.claude/ralph-infinite-state-$(basename $PROJECT_DIR).json"

# Inicializar estado si no existe
if [ ! -f "$RALPH_STATE_FILE" ]; then
    echo '{"iterations": 0, "consecutive_errors": 0, "start_time": "'$(date -Iseconds)'", "completed_criteria": 0}' > "$RALPH_STATE_FILE"
fi

# Leer estado actual
ITERATIONS=$(jq -r '.iterations // 0' "$RALPH_STATE_FILE")
CONSECUTIVE_ERRORS=$(jq -r '.consecutive_errors // 0' "$RALPH_STATE_FILE")
START_TIME=$(jq -r '.start_time // ""' "$RALPH_STATE_FILE")

# Incrementar iteraciones
ITERATIONS=$((ITERATIONS + 1))

# Contar criterios completados (busca [x] vs [ ])
if [ -f "$TASK_FILE" ]; then
    COMPLETED=$(grep -cE '\[x\]|\[X\]' "$TASK_FILE" 2>/dev/null || echo "0")
    PENDING=$(grep -c '\[ \]' "$TASK_FILE" 2>/dev/null || echo "0")
    TOTAL=$((COMPLETED + PENDING))
else
    COMPLETED=0
    TOTAL=0
    echo "⚠️ No se encontró TASK.md en ${TASK_FILE}"
fi

# Calcular tiempo transcurrido
if [ -n "$START_TIME" ] && [ "$START_TIME" != "null" ]; then
    START_EPOCH=$(date -d "$START_TIME" +%s 2>/dev/null || date +%s)
    NOW_EPOCH=$(date +%s)
    ELAPSED_SECONDS=$((NOW_EPOCH - START_EPOCH))
    ELAPSED_MINUTES=$((ELAPSED_SECONDS / 60))
    ELAPSED_HOURS=$((ELAPSED_MINUTES / 60))
    ELAPSED_MINS_REMAINING=$((ELAPSED_MINUTES % 60))
else
    ELAPSED_HOURS=0
    ELAPSED_MINS_REMAINING=0
fi

# Actualizar estado
jq --argjson iter "$ITERATIONS" \
   --argjson completed "$COMPLETED" \
   '.iterations = $iter | .completed_criteria = $completed' \
   "$RALPH_STATE_FILE" > "${RALPH_STATE_FILE}.tmp" && mv "${RALPH_STATE_FILE}.tmp" "$RALPH_STATE_FILE"

# Progress bar
if [ "$TOTAL" -gt 0 ]; then
    PROGRESS=$((COMPLETED * 100 / TOTAL))
    FILLED=$((PROGRESS / 5))
    EMPTY=$((20 - FILLED))
    BAR=$(printf '█%.0s' $(seq 1 $FILLED 2>/dev/null) || echo "")
    BAR="${BAR}$(printf '░%.0s' $(seq 1 $EMPTY 2>/dev/null) || echo "")"
else
    PROGRESS=0
    BAR="░░░░░░░░░░░░░░░░░░░░"
fi

# Logging visual
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           🔄 RALPH INFINITE LOOP                         ║"
echo "╠══════════════════════════════════════════════════════════╣"
printf "║  Iteración: %-5s                                       ║\n" "#${ITERATIONS}"
printf "║  Criterios: %-3s/%-3s completados                         ║\n" "$COMPLETED" "$TOTAL"
printf "║  Progreso:  [%-20s] %3d%%                  ║\n" "$BAR" "$PROGRESS"
printf "║  Tiempo:    %02d:%02d horas                                  ║\n" "$ELAPSED_HOURS" "$ELAPSED_MINS_REMAINING"
printf "║  Errores:   %d/5 consecutivos                            ║\n" "$CONSECUTIVE_ERRORS"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Verificar condiciones de parada
if [ "$TOTAL" -gt 0 ] && [ "$COMPLETED" -eq "$TOTAL" ]; then
    echo "🎉 ¡TODOS LOS CRITERIOS COMPLETADOS!"
    echo "   Limpiando estado de Ralph Loop..."
    rm -f "$RALPH_STATE_FILE"
    exit 0
fi

if [ "$CONSECUTIVE_ERRORS" -ge 5 ]; then
    echo "⚠️  5 ERRORES CONSECUTIVOS DETECTADOS"
    echo "   Pausando para revisión manual."
    echo "   Revisa los logs y reinicia cuando estés listo."
    echo ""
    echo "   Para resetear errores: jq '.consecutive_errors = 0' $RALPH_STATE_FILE > tmp && mv tmp $RALPH_STATE_FILE"
    exit 1
fi

# Continuar
echo "➡️  Continuando con la siguiente iteración..."
exit 0
