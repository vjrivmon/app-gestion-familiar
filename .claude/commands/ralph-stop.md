# Detener Loop Ralph Wiggum

Detiene el loop autónomo actual y guarda el estado.

## Instrucciones

### Paso 1: Verificar Estado
RUN: `ls -la .claude/ralph-active 2>/dev/null || echo "No hay loop activo"`

Si no hay loop activo, informar al usuario y terminar.

### Paso 2: Guardar Estado Final
Crear log de sesión:

RUN: 
```bash
mkdir -p .claude/logs
cat > .claude/logs/ralph-session-$(date +%Y%m%d-%H%M%S).md << 'EOF'
# Sesión Ralph Wiggum

## Timestamp
$(date -Iseconds)

## Estado al Detener
$(cat .claude/PROMPT.md | grep -A 20 "Progreso Actual" || echo "Sin datos de progreso")

## Cambios Realizados
$(git diff --stat HEAD~5 2>/dev/null || echo "No hay historial git disponible")

## Commits de la Sesión  
$(git log --oneline -10 2>/dev/null || echo "No hay commits")
EOF
```

### Paso 3: Desactivar Flag
RUN: `rm -f .claude/ralph-active`

### Paso 4: Limpiar Prompt
RUN: `mv .claude/PROMPT.md .claude/PROMPT.md.backup 2>/dev/null || true`

### Paso 5: Mostrar Resumen
```
🛑 RALPH LOOP DETENIDO

📊 Resumen de Sesión:
- Log guardado en: .claude/logs/ralph-session-*.md
- Prompt backup: .claude/PROMPT.md.backup

📋 Próximos Pasos:
1. Revisa los cambios: git diff
2. Si el trabajo está completo: git commit
3. Si necesitas continuar: /ralph:start <task-file>

💡 Para ver el log completo:
cat .claude/logs/$(ls -t .claude/logs/ | head -1)
```
