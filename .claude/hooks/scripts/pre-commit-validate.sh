#!/usr/bin/env bash
# Pre-Commit Validation Gate
# Intercepta git commit y ejecuta validaciones antes de permitirlo.
# - Verifica staged files vs scope contract (si existe)
# - Ejecuta tsc --noEmit, build, lint
# - Exit 2 = bloquear commit, Exit 0 = permitir
# Autor: Vicente Rivas Monferrer

set -euo pipefail

# Leer input JSON desde stdin
INPUT=$(cat)

# Extraer el comando del JSON
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Solo actuar en comandos git commit
if ! echo "$COMMAND" | grep -qE 'git\s+commit'; then
    exit 0
fi

# Directorio del proyecto
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
SCOPE_CONTRACT="$PROJECT_DIR/.claude/scope-contract.active.md"
ERRORS=()

# --- Scope Contract Enforcement ---
if [ -f "$SCOPE_CONTRACT" ]; then
    # Extraer archivos permitidos del scope contract
    ALLOWED_FILES=$(grep -A 50 'Files to modify' "$SCOPE_CONTRACT" | grep -oE '`[^`]+`' | tr -d '`' | head -20)

    if [ -n "$ALLOWED_FILES" ]; then
        # Obtener archivos staged
        STAGED_FILES=$(cd "$PROJECT_DIR" && git diff --cached --name-only 2>/dev/null || true)

        if [ -n "$STAGED_FILES" ]; then
            while IFS= read -r staged_file; do
                MATCH=false
                while IFS= read -r allowed; do
                    # Comprobar match exacto o como patron glob
                    if [[ "$staged_file" == "$allowed" ]] || [[ "$staged_file" == *"$allowed"* ]]; then
                        MATCH=true
                        break
                    fi
                done <<< "$ALLOWED_FILES"

                if [ "$MATCH" = false ]; then
                    ERRORS+=("SCOPE: '$staged_file' no esta en el scope contract")
                fi
            done <<< "$STAGED_FILES"
        fi
    fi
fi

# Si hay errores de scope, bloquear inmediatamente
if [ ${#ERRORS[@]} -gt 0 ]; then
    echo "BLOQUEADO: Scope contract violation" >&2
    for err in "${ERRORS[@]}"; do
        echo "  - $err" >&2
    done
    echo "" >&2
    echo "Archivos staged fuera del scope contract." >&2
    echo "Actualiza el scope contract o quita los archivos del staging." >&2
    exit 2
fi

# --- Validaciones de Codigo ---
# Solo ejecutar si hay package.json (proyecto Node.js)
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    exit 0
fi

cd "$PROJECT_DIR"

# Detectar gestor de paquetes
if [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then
    RUNNER="bun"
elif [ -f "pnpm-lock.yaml" ]; then
    RUNNER="pnpm"
elif [ -f "yarn.lock" ]; then
    RUNNER="yarn"
else
    RUNNER="npm"
fi

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "ADVERTENCIA: node_modules no encontrado, saltando validaciones de codigo" >&2
    exit 0
fi

# TypeScript check (si tsconfig existe)
if [ -f "tsconfig.json" ]; then
    echo "Pre-commit: ejecutando tsc --noEmit..." >&2
    if ! npx tsc --noEmit 2>&1 | tail -20 >&2; then
        ERRORS+=("TSC: Type check fallido")
    fi
fi

# Build check (si script existe en package.json)
if grep -q '"build"' package.json 2>/dev/null; then
    echo "Pre-commit: ejecutando build..." >&2
    if ! $RUNNER run build 2>&1 | tail -20 >&2; then
        ERRORS+=("BUILD: Build fallido")
    fi
fi

# Lint check (si script existe en package.json)
if grep -q '"lint"' package.json 2>/dev/null; then
    echo "Pre-commit: ejecutando lint..." >&2
    if ! $RUNNER run lint 2>&1 | tail -20 >&2; then
        ERRORS+=("LINT: Lint fallido")
    fi
fi

# Resultado final
if [ ${#ERRORS[@]} -gt 0 ]; then
    echo "" >&2
    echo "BLOQUEADO: Pre-commit validation fallida" >&2
    for err in "${ERRORS[@]}"; do
        echo "  - $err" >&2
    done
    echo "" >&2
    echo "Corrige los errores antes de commitear." >&2
    exit 2
fi

echo "Pre-commit: todas las validaciones pasaron" >&2
exit 0
