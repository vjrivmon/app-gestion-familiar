#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  WORKTREE MANAGER para Claude Swarm
#  Gestiona múltiples worktrees para desarrollo paralelo
# ═══════════════════════════════════════════════════════════

set -e

# Configuración
TREES_DIR="${TREES_DIR:-./trees}"
BASE_BRANCH="${BASE_BRANCH:-main}"
CLAUDE_DIR=".claude"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# ─────────────────────────────────────────────────────────────
# Crear nuevo worktree
# ─────────────────────────────────────────────────────────────
create_worktree() {
    local FEATURE_NAME="$1"
    
    if [ -z "$FEATURE_NAME" ]; then
        log_error "Uso: $0 create <nombre-feature>"
        exit 1
    fi
    
    local BRANCH_NAME="feature/${FEATURE_NAME}"
    local WORKTREE_PATH="$TREES_DIR/$FEATURE_NAME"
    
    log_info "Creando worktree: $FEATURE_NAME"
    
    # Crear directorio base
    mkdir -p "$TREES_DIR"
    
    # Verificar si ya existe
    if [ -d "$WORKTREE_PATH" ]; then
        log_warning "Worktree ya existe: $WORKTREE_PATH"
        return 1
    fi
    
    # Crear worktree con nueva rama o rama existente
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" 2>/dev/null; then
        log_info "Usando rama existente: $BRANCH_NAME"
        git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
    else
        log_info "Creando nueva rama: $BRANCH_NAME"
        git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"
    fi
    
    # Copiar configuración de Claude
    if [ -d "$CLAUDE_DIR" ]; then
        log_info "Copiando configuración de Claude..."
        cp -r "$CLAUDE_DIR" "$WORKTREE_PATH/$CLAUDE_DIR"
    fi
    
    # Copiar archivos de entorno
    for env_file in .env .env.local .mcp.json; do
        if [ -f "$env_file" ]; then
            cp "$env_file" "$WORKTREE_PATH/$env_file" 2>/dev/null || true
        fi
    done
    
    # Instalar dependencias según el proyecto
    cd "$WORKTREE_PATH"
    
    if [ -f "package.json" ]; then
        if command -v bun &> /dev/null; then
            log_info "Instalando dependencias con bun..."
            bun install --silent 2>/dev/null || npm install --silent
        else
            log_info "Instalando dependencias con npm..."
            npm install --silent
        fi
    elif [ -f "requirements.txt" ]; then
        log_info "Instalando dependencias de Python..."
        pip install -r requirements.txt -q 2>/dev/null || true
    fi
    
    cd - > /dev/null
    
    log_success "Worktree creado: $WORKTREE_PATH"
    echo ""
    echo -e "${CYAN}Para usar:${NC}"
    echo "  cd $WORKTREE_PATH"
    echo "  claude --dangerously-skip-permissions"
}

# ─────────────────────────────────────────────────────────────
# Listar worktrees
# ─────────────────────────────────────────────────────────────
list_worktrees() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                    WORKTREES ACTIVOS                        ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    git worktree list --porcelain | while read -r line; do
        if [[ $line == worktree* ]]; then
            path="${line#worktree }"
            echo -e "${BLUE}📁 $path${NC}"
        elif [[ $line == branch* ]]; then
            branch="${line#branch refs/heads/}"
            echo -e "   └─ Branch: ${GREEN}$branch${NC}"
            
            # Verificar estado de Ralph
            worktree_dir=$(echo "$path" | tail -1)
            if [ -f "$worktree_dir/.claude/ralph-active" ]; then
                echo -e "   └─ Estado: ${YELLOW}🔄 Ralph Loop Activo${NC}"
            elif [ -f "$worktree_dir/.claude/COMPLETE" ]; then
                echo -e "   └─ Estado: ${GREEN}✅ Completado${NC}"
            else
                echo -e "   └─ Estado: ⏸️  Inactivo"
            fi
            echo ""
        fi
    done
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

# ─────────────────────────────────────────────────────────────
# Eliminar worktree
# ─────────────────────────────────────────────────────────────
remove_worktree() {
    local FEATURE_NAME="$1"
    
    if [ -z "$FEATURE_NAME" ]; then
        log_error "Uso: $0 remove <nombre-feature>"
        exit 1
    fi
    
    local WORKTREE_PATH="$TREES_DIR/$FEATURE_NAME"
    local BRANCH_NAME="feature/${FEATURE_NAME}"
    
    log_info "Eliminando worktree: $FEATURE_NAME"
    
    # Verificar cambios sin commit
    if [ -d "$WORKTREE_PATH" ]; then
        cd "$WORKTREE_PATH"
        if ! git diff --quiet 2>/dev/null; then
            log_warning "Hay cambios sin commit en $WORKTREE_PATH"
            read -p "¿Descartar cambios y continuar? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Cancelado"
                exit 0
            fi
        fi
        cd - > /dev/null
    fi
    
    # Eliminar worktree
    git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
    
    # Opcionalmente eliminar rama
    read -p "¿Eliminar también la rama $BRANCH_NAME? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D "$BRANCH_NAME" 2>/dev/null || true
        log_success "Rama eliminada: $BRANCH_NAME"
    fi
    
    log_success "Worktree eliminado: $FEATURE_NAME"
}

# ─────────────────────────────────────────────────────────────
# Merge worktree a main
# ─────────────────────────────────────────────────────────────
merge_worktree() {
    local FEATURE_NAME="$1"
    
    if [ -z "$FEATURE_NAME" ]; then
        log_error "Uso: $0 merge <nombre-feature>"
        exit 1
    fi
    
    local BRANCH_NAME="feature/${FEATURE_NAME}"
    local WORKTREE_PATH="$TREES_DIR/$FEATURE_NAME"
    
    log_info "Mergeando $BRANCH_NAME a $BASE_BRANCH"
    
    # Verificar que la rama existe
    if ! git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        log_error "Rama no encontrada: $BRANCH_NAME"
        exit 1
    fi
    
    # Cambiar a main y mergear
    git checkout "$BASE_BRANCH"
    git pull origin "$BASE_BRANCH" 2>/dev/null || true
    
    if git merge "$BRANCH_NAME" --no-ff -m "Merge $BRANCH_NAME into $BASE_BRANCH"; then
        log_success "Merge completado exitosamente"
        
        # Preguntar si eliminar worktree
        read -p "¿Eliminar worktree y rama? (Y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            remove_worktree "$FEATURE_NAME"
        fi
    else
        log_error "Conflictos de merge detectados"
        echo "Resuelve los conflictos y ejecuta:"
        echo "  git add ."
        echo "  git commit"
    fi
}

# ─────────────────────────────────────────────────────────────
# Limpiar todos los worktrees
# ─────────────────────────────────────────────────────────────
cleanup_all() {
    log_warning "Esto eliminará TODOS los worktrees en $TREES_DIR"
    read -p "¿Estás seguro? (y/N) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelado"
        exit 0
    fi
    
    log_info "Limpiando todos los worktrees..."
    
    for dir in "$TREES_DIR"/*; do
        if [ -d "$dir" ]; then
            local name=$(basename "$dir")
            git worktree remove "$dir" --force 2>/dev/null || true
            log_success "Eliminado: $name"
        fi
    done
    
    # Limpiar referencias huérfanas
    git worktree prune
    
    log_success "Limpieza completada"
}

# ─────────────────────────────────────────────────────────────
# Estado de todos los worktrees
# ─────────────────────────────────────────────────────────────
status_all() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}              ESTADO DE WORKTREES                           ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    printf "%-20s %-15s %-10s %-15s\n" "WORKTREE" "ESTADO" "CAMBIOS" "ÚLTIMO COMMIT"
    echo "─────────────────────────────────────────────────────────────"
    
    for dir in "$TREES_DIR"/*; do
        if [ -d "$dir" ]; then
            local name=$(basename "$dir")
            local status="⏸️  Inactivo"
            local changes="0"
            local last_commit=""
            
            if [ -f "$dir/.claude/ralph-active" ]; then
                status="🔄 Activo"
            elif [ -f "$dir/.claude/COMPLETE" ]; then
                status="✅ Completo"
            fi
            
            # Contar cambios
            cd "$dir"
            changes=$(git diff --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ file' | cut -d' ' -f1 || echo "0")
            last_commit=$(git log --oneline -1 2>/dev/null | cut -c1-7 || echo "N/A")
            cd - > /dev/null
            
            printf "%-20s %-15s %-10s %-15s\n" "$name" "$status" "$changes files" "$last_commit"
        fi
    done
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

# ─────────────────────────────────────────────────────────────
# Ayuda
# ─────────────────────────────────────────────────────────────
show_help() {
    echo ""
    echo -e "${CYAN}WORKTREE MANAGER - Gestión de worktrees para Claude Swarm${NC}"
    echo ""
    echo "Uso: $0 <comando> [argumentos]"
    echo ""
    echo "Comandos:"
    echo "  create <nombre>   Crear nuevo worktree con rama feature/<nombre>"
    echo "  list              Listar todos los worktrees activos"
    echo "  status            Ver estado detallado de todos los worktrees"
    echo "  remove <nombre>   Eliminar worktree específico"
    echo "  merge <nombre>    Mergear worktree a main y opcionalmente limpiar"
    echo "  cleanup           Eliminar todos los worktrees"
    echo ""
    echo "Ejemplos:"
    echo "  $0 create auth-feature"
    echo "  $0 list"
    echo "  $0 merge auth-feature"
    echo ""
    echo "Variables de entorno:"
    echo "  TREES_DIR     Directorio para worktrees (default: ./trees)"
    echo "  BASE_BRANCH   Rama base para merge (default: main)"
    echo ""
}

# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────
case "${1:-help}" in
    create)  create_worktree "$2" ;;
    list)    list_worktrees ;;
    status)  status_all ;;
    remove)  remove_worktree "$2" ;;
    merge)   merge_worktree "$2" ;;
    cleanup) cleanup_all ;;
    help|--help|-h) show_help ;;
    *)
        log_error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac
