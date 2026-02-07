#!/bin/bash
# integration-hook.sh - Hook post-merge para el integrador
# Se ejecuta después de cada merge exitoso

set -e

# Configuración
CLAUDE_DIR=".claude"
SCALE_DIR="$CLAUDE_DIR/scale"
LOGS_DIR="$CLAUDE_DIR/logs"

# Crear directorios
mkdir -p "$SCALE_DIR" "$LOGS_DIR"

# Obtener información del merge
MERGED_BRANCH=${1:-"unknown"}
MERGE_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
TIMESTAMP=$(date -Iseconds)

log() {
    echo "[$(date +%H:%M:%S)] $1" >> "$LOGS_DIR/integration-hooks.log"
}

log "Hook post-merge ejecutado para: $MERGED_BRANCH"

# Actualizar contador de merges
MERGE_COUNT_FILE="$SCALE_DIR/merge-count.txt"
MERGE_COUNT=$(cat "$MERGE_COUNT_FILE" 2>/dev/null || echo "0")
MERGE_COUNT=$((MERGE_COUNT + 1))
echo "$MERGE_COUNT" > "$MERGE_COUNT_FILE"

# Registrar merge en historial
HISTORY_FILE="$SCALE_DIR/merge-history.jsonl"
echo "{\"branch\": \"$MERGED_BRANCH\", \"commit\": \"$MERGE_COMMIT\", \"timestamp\": \"$TIMESTAMP\"}" >> "$HISTORY_FILE"

# Ejecutar tests de smoke (si existen)
if [ -f "package.json" ] && grep -q '"test:smoke"' package.json; then
    log "Ejecutando smoke tests..."
    if npm run test:smoke 2>&1 >> "$LOGS_DIR/integration-hooks.log"; then
        log "Smoke tests: PASS"
    else
        log "Smoke tests: FAIL"
        # Notificar pero no fallar
    fi
fi

# Verificar build (si es aplicación web)
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    log "Verificando build..."
    if npm run build 2>&1 >> "$LOGS_DIR/integration-hooks.log"; then
        log "Build: OK"
    else
        log "Build: FAIL - Revisa los cambios"
    fi
fi

# Actualizar métricas
METRICS_FILE="$SCALE_DIR/integration-metrics.json"
cat > "$METRICS_FILE" << EOF
{
    "last_merge": "$TIMESTAMP",
    "last_branch": "$MERGED_BRANCH",
    "total_merges": $MERGE_COUNT,
    "last_commit": "$MERGE_COMMIT"
}
EOF

log "Hook completado"

# Notificar si hay webhook configurado
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Merge completado: $MERGED_BRANCH\"}" \
        "$SLACK_WEBHOOK_URL" || true
fi

exit 0
