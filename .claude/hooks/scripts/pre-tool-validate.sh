#!/usr/bin/env bash
# Pre-Tool Validation Hook
# Valida comandos antes de ejecutarlos para prevenir operaciones peligrosas
# Autor: Vicente Rivas Monferrer

# Leer input JSON desde stdin
INPUT=$(cat)

# Extraer el comando del JSON
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Si no hay comando, permitir
if [ -z "$COMMAND" ]; then
    exit 0
fi

# Patrones peligrosos a bloquear
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf /*"
    "> /dev/sda"
    "> /dev/hda"
    "dd if=/dev"
    "mkfs."
    ":(){:|:&};"
    "chmod -R 777 /"
    "chown -R"
)

# Verificar patrones peligrosos
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qF "$pattern"; then
        echo "BLOQUEADO: Comando peligroso detectado: $pattern" >&2
        echo "Este comando podría dañar el sistema. Operación cancelada." >&2
        exit 2  # Código 2 = bloquear operación
    fi
done

# Advertir sobre force push a main/master
if echo "$COMMAND" | grep -qE 'git\s+push.*--force.*(main|master)'; then
    echo "ADVERTENCIA: Force push a rama principal detectado" >&2
    echo "Esta operación puede sobrescribir el historial de otros desarrolladores." >&2
    # No bloqueamos, solo advertimos (exit 0)
fi

# Advertir sobre modificación de archivos .env
if echo "$COMMAND" | grep -qE '(cat|echo|printf).*>.*\.env'; then
    echo "ADVERTENCIA: Posible modificación de archivo .env" >&2
    echo "Asegúrate de no commitear secretos." >&2
fi

# Advertir sobre sudo
if echo "$COMMAND" | grep -qE '^sudo\s+'; then
    echo "ADVERTENCIA: Uso de sudo detectado" >&2
    echo "Verifica que este comando realmente necesita permisos elevados." >&2
fi

# Si llegamos aquí, el comando es seguro
exit 0
