#!/usr/bin/env bash
# Test Runner Hook
# Ejecuta tests automáticamente al finalizar la sesión
# Autor: Vicente Rivas Monferrer

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

echo ""
echo "=============================="
echo "Ejecutando verificaciones..."
echo "=============================="

# Detectar y ejecutar tests según el stack

# Node.js (npm/yarn/pnpm)
if [ -f "$PROJECT_DIR/package.json" ]; then
    cd "$PROJECT_DIR"

    # Verificar si hay script de test
    if grep -q '"test"' package.json 2>/dev/null; then
        echo ""
        echo "Ejecutando tests de Node.js..."
        npm test -- --passWithNoTests --watchAll=false 2>/dev/null || echo "Tests finalizados (algunos pueden haber fallado)"
    fi

    # Ejecutar typecheck si existe
    if grep -q '"typecheck"' package.json 2>/dev/null; then
        echo ""
        echo "Verificando tipos TypeScript..."
        npm run typecheck 2>/dev/null || echo "Typecheck finalizado (pueden haber errores)"
    fi

    # Ejecutar lint si existe
    if grep -q '"lint"' package.json 2>/dev/null; then
        echo ""
        echo "Ejecutando linter..."
        npm run lint 2>/dev/null || echo "Lint finalizado (pueden haber warnings)"
    fi

    cd - > /dev/null
fi

# Python (pytest)
if [ -f "$PROJECT_DIR/pytest.ini" ] || [ -f "$PROJECT_DIR/pyproject.toml" ] || [ -d "$PROJECT_DIR/tests" ]; then
    cd "$PROJECT_DIR"

    # Activar venv si existe
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi

    if command -v pytest &> /dev/null; then
        echo ""
        echo "Ejecutando tests de Python..."
        pytest --tb=short -q 2>/dev/null || echo "Tests finalizados (algunos pueden haber fallado)"
    fi

    cd - > /dev/null
fi

# Rust (cargo)
if [ -f "$PROJECT_DIR/Cargo.toml" ]; then
    cd "$PROJECT_DIR"

    if command -v cargo &> /dev/null; then
        echo ""
        echo "Ejecutando tests de Rust..."
        cargo test --quiet 2>/dev/null || echo "Tests finalizados"
    fi

    cd - > /dev/null
fi

# Go
if [ -f "$PROJECT_DIR/go.mod" ]; then
    cd "$PROJECT_DIR"

    if command -v go &> /dev/null; then
        echo ""
        echo "Ejecutando tests de Go..."
        go test ./... 2>/dev/null || echo "Tests finalizados"
    fi

    cd - > /dev/null
fi

echo ""
echo "=============================="
echo "Verificaciones completadas"
echo "=============================="

exit 0
