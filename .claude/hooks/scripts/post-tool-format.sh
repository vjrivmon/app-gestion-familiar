#!/usr/bin/env bash
# Post-Tool Format Hook
# Auto-formatea archivos después de editarlos
# Autor: Vicente Rivas Monferrer

# Leer input JSON desde stdin
INPUT=$(cat)

# Extraer el file_path del JSON
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Si no hay file_path, salir
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Si el archivo no existe, salir
if [ ! -f "$FILE_PATH" ]; then
    exit 0
fi

# Obtener extensión del archivo
EXTENSION="${FILE_PATH##*.}"

# Formatear según el tipo de archivo
case "$EXTENSION" in
    ts|tsx|js|jsx|mjs|cjs)
        # TypeScript/JavaScript: Prettier + ESLint
        if command -v npx &> /dev/null; then
            # Intentar formatear con Prettier
            npx prettier --write "$FILE_PATH" 2>/dev/null && echo "Prettier: $FILE_PATH"

            # Intentar arreglar con ESLint
            npx eslint --fix "$FILE_PATH" 2>/dev/null && echo "ESLint: $FILE_PATH"
        fi
        ;;

    py)
        # Python: Black + Ruff
        if command -v black &> /dev/null; then
            black "$FILE_PATH" --quiet 2>/dev/null && echo "Black: $FILE_PATH"
        fi

        if command -v ruff &> /dev/null; then
            ruff check --fix "$FILE_PATH" 2>/dev/null && echo "Ruff: $FILE_PATH"
        fi
        ;;

    json)
        # JSON: jq para formateo
        if command -v jq &> /dev/null; then
            TMP_FILE=$(mktemp)
            if jq '.' "$FILE_PATH" > "$TMP_FILE" 2>/dev/null; then
                mv "$TMP_FILE" "$FILE_PATH"
                echo "jq format: $FILE_PATH"
            else
                rm -f "$TMP_FILE"
            fi
        fi
        ;;

    yaml|yml)
        # YAML: prettier si está disponible
        if command -v npx &> /dev/null; then
            npx prettier --write "$FILE_PATH" 2>/dev/null && echo "Prettier: $FILE_PATH"
        fi
        ;;

    md)
        # Markdown: prettier
        if command -v npx &> /dev/null; then
            npx prettier --write "$FILE_PATH" --prose-wrap always 2>/dev/null && echo "Prettier: $FILE_PATH"
        fi
        ;;

    css|scss|less)
        # CSS: prettier
        if command -v npx &> /dev/null; then
            npx prettier --write "$FILE_PATH" 2>/dev/null && echo "Prettier: $FILE_PATH"
        fi
        ;;

    html)
        # HTML: prettier
        if command -v npx &> /dev/null; then
            npx prettier --write "$FILE_PATH" 2>/dev/null && echo "Prettier: $FILE_PATH"
        fi
        ;;

    *)
        # Tipo no reconocido, no hacer nada
        ;;
esac

exit 0
