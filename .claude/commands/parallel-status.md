# Estado de Agentes Paralelos

Muestra el estado de todos los worktrees y agentes en ejecución.

## Instrucciones

### Paso 1: Escanear Worktrees

RUN: `bash .claude/scripts/worktree-manager.sh status`

Capturar output para análisis.

### Paso 2: Verificar Estado Detallado

Por cada directorio en `./trees/`:

**Estado del agente:**

- Si existe `.claude/ralph-active` → 🔄 En progreso
- Si existe `.claude/COMPLETE` → ✅ Completado
- De lo contrario → ⏸️ Pausado

**Cambios pendientes:**

```bash
cd trees/<nombre>
git diff --stat | tail -1
```

**Último checkpoint:**

```bash
ls -t .claude/checkpoints/*.json | head -1
```

**Tests:**

```bash
# Intentar ejecutar tests si existen
npm test 2>/dev/null || pytest 2>/dev/null || echo "N/A"
```

### Paso 3: Leer Progreso de Ralph

Por cada worktree con `.claude/PROMPT.md`:

Extraer sección "Progreso Actual":

- Iteración actual
- Criterios completados
- Última acción
- Siguiente paso

### Paso 4: Generar Reporte

Mostrar tabla completa:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ESTADO DE AGENTES PARALELOS                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📊 Resumen
   Total worktrees: 4
   🔄 Running: 2
   ✅ Complete: 1
   ⏸️ Paused: 1

┌─────────┬─────────────────────┬──────────┬───────────┬────────────┬───────────┐
│ Worktree│ Tarea               │ Estado   │ Iteración │ Cambios    │ Tests     │
├─────────┼─────────────────────┼──────────┼───────────┼────────────┼───────────┤
│ T001    │ UI de login         │ 🔄 Run   │ 5/30      │ 3 files    │ ✅ Pass   │
│ T002    │ API de auth         │ 🔄 Run   │ 12/30     │ 5 files    │ ⚠️ 2 fail │
│ T003    │ Middleware sesión   │ ✅ Done  │ 8/30      │ 2 files    │ ✅ Pass   │
│ T004    │ Tests integración   │ ⏸️ Pause │ 0/30      │ 0 files    │ N/A       │
└─────────┴─────────────────────┴──────────┴───────────┴────────────┴───────────┘

📝 Detalle por Agente

## T001 - UI de login
   Estado: 🔄 En progreso (iteración 5/30)
   Última acción: Creado componente LoginForm.tsx
   Siguiente paso: Añadir validación de formulario
   Archivos modificados: LoginForm.tsx, styles.css, index.ts
   Branch: feature/T001

## T002 - API de auth
   Estado: 🔄 En progreso (iteración 12/30)
   Última acción: Implementado endpoint /api/login
   Siguiente paso: Añadir manejo de errores
   ⚠️ Tests fallando: 2 tests de integración
   Branch: feature/T002

## T003 - Middleware sesión ✅
   Estado: ✅ Completado
   Criterios: 4/4 completados
   Listo para merge
   Branch: feature/T003

## T004 - Tests integración
   Estado: ⏸️ Pausado
   Razón: Esperando T002 y T003
   Branch: feature/T004
```

### Paso 5: Mostrar Acciones Disponibles

```
💡 Acciones Disponibles

Para worktrees completados (T003):
  wt merge T003              # Merge a main
  wt remove T003             # Eliminar sin merge

Para worktrees con errores (T002):
  cd trees/T002 && claude    # Intervenir manualmente
  rm trees/T002/.claude/ralph-active  # Pausar

Para todos los worktrees:
  wt list                    # Listar todos
  wt status                  # Ver estado
  wt cleanup                 # Eliminar todos

Para el swarm:
  bash .claude/logs/swarm-*/monitor.sh  # Monitor en vivo
```

### Paso 6: Sugerir Siguiente Acción

Basado en el estado:

**Si hay worktrees completados:**

> "T003 está listo para merge. ¿Ejecutar `wt merge T003`?"

**Si hay worktrees con errores:**

> "T002 tiene tests fallando. ¿Quieres que investigue los errores?"

**Si todos están en progreso:**

> "Todos los agentes están trabajando. Monitorear con:
> `bash .claude/logs/swarm-*/monitor.sh`"

**Si hay tareas pendientes sin worktree:**

> "Hay tareas pendientes sin agente asignado. ¿Lanzar más agentes?
> `bash .claude/scripts/swarm-launch.sh`"
