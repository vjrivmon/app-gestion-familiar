#!/bin/bash
# scale-checkpoint.sh - Checkpoint automático por fase de escalado
# Se ejecuta al completar una fase

set -e

# Configuración
CLAUDE_DIR=".claude"
SCALE_DIR="$CLAUDE_DIR/scale"
CHECKPOINTS_DIR="$CLAUDE_DIR/checkpoints"

# Crear directorios
mkdir -p "$SCALE_DIR" "$CHECKPOINTS_DIR"

# Argumentos
PHASE=${1:-"unknown"}
STATUS=${2:-"completed"}
TIMESTAMP=$(date -Iseconds)
CHECKPOINT_ID="checkpoint-$(date +%Y%m%d-%H%M%S)"

log() {
    echo "[CHECKPOINT] $1"
}

log "Creando checkpoint para fase: $PHASE"

# Crear directorio de checkpoint
CHECKPOINT_PATH="$CHECKPOINTS_DIR/$CHECKPOINT_ID"
mkdir -p "$CHECKPOINT_PATH"

# Guardar estado de git
git rev-parse HEAD > "$CHECKPOINT_PATH/git-commit.txt" 2>/dev/null || echo "unknown"
git branch --show-current > "$CHECKPOINT_PATH/git-branch.txt" 2>/dev/null || echo "main"
git stash list > "$CHECKPOINT_PATH/git-stash.txt" 2>/dev/null || true

# Guardar estado del proyecto
if [ -f "package.json" ]; then
    cp package.json "$CHECKPOINT_PATH/"
fi
if [ -f "package-lock.json" ]; then
    cp package-lock.json "$CHECKPOINT_PATH/"
fi

# Guardar estado de escalado
if [ -f "$SCALE_DIR/progress.json" ]; then
    cp "$SCALE_DIR/progress.json" "$CHECKPOINT_PATH/"
fi

# Crear metadata del checkpoint
cat > "$CHECKPOINT_PATH/metadata.json" << EOF
{
    "id": "$CHECKPOINT_ID",
    "phase": "$PHASE",
    "status": "$STATUS",
    "timestamp": "$TIMESTAMP",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'main')",
    "files_saved": [
        "git-commit.txt",
        "git-branch.txt",
        "git-stash.txt",
        "package.json",
        "progress.json"
    ]
}
EOF

# Actualizar progress.json
PROGRESS_FILE="$SCALE_DIR/progress.json"
if [ -f "$PROGRESS_FILE" ]; then
    # Actualizar fase completada
    TMP_FILE=$(mktemp)
    jq --arg phase "$PHASE" --arg status "$STATUS" --arg timestamp "$TIMESTAMP" \
        '.phases[$phase].status = $status | .phases[$phase].completed_at = $timestamp | .last_checkpoint = $timestamp' \
        "$PROGRESS_FILE" > "$TMP_FILE" 2>/dev/null && mv "$TMP_FILE" "$PROGRESS_FILE" || true
else
    # Crear nuevo progress.json
    cat > "$PROGRESS_FILE" << EOF
{
    "project": "$(basename $(pwd))",
    "started_at": "$TIMESTAMP",
    "last_checkpoint": "$TIMESTAMP",
    "phases": {
        "$PHASE": {
            "status": "$STATUS",
            "completed_at": "$TIMESTAMP"
        }
    }
}
EOF
fi

# Actualizar índice de checkpoints
INDEX_FILE="$CHECKPOINTS_DIR/index.json"
if [ -f "$INDEX_FILE" ]; then
    TMP_FILE=$(mktemp)
    jq --arg id "$CHECKPOINT_ID" --arg phase "$PHASE" --arg timestamp "$TIMESTAMP" \
        '.checkpoints += [{"id": $id, "phase": $phase, "timestamp": $timestamp}]' \
        "$INDEX_FILE" > "$TMP_FILE" 2>/dev/null && mv "$TMP_FILE" "$INDEX_FILE" || true
else
    cat > "$INDEX_FILE" << EOF
{
    "checkpoints": [
        {
            "id": "$CHECKPOINT_ID",
            "phase": "$PHASE",
            "timestamp": "$TIMESTAMP"
        }
    ]
}
EOF
fi

# Limpiar checkpoints antiguos (mantener últimos 10)
CHECKPOINT_COUNT=$(ls -d "$CHECKPOINTS_DIR"/checkpoint-* 2>/dev/null | wc -l)
if [ "$CHECKPOINT_COUNT" -gt 10 ]; then
    log "Limpiando checkpoints antiguos..."
    ls -dt "$CHECKPOINTS_DIR"/checkpoint-* | tail -n +11 | xargs rm -rf
fi

log "Checkpoint creado: $CHECKPOINT_ID"
log "Ubicación: $CHECKPOINT_PATH"

# Mostrar resumen
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  CHECKPOINT CREADO"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  ID:        $CHECKPOINT_ID"
echo "  Fase:      $PHASE"
echo "  Estado:    $STATUS"
echo "  Timestamp: $TIMESTAMP"
echo ""
echo "  Para restaurar:"
echo "    bash .claude/scripts/restore-checkpoint.sh $CHECKPOINT_ID"
echo ""
echo "═══════════════════════════════════════════════════════════════"

exit 0
