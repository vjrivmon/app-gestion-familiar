# Guia Rapida del Sistema de Desarrollo Autonomo

## TL;DR - Flujo en 60 segundos

```bash
# 1. Tienes una idea
/idea:validate mi-app

# 2. Si pasa, refinar
/project:interview mi-app

# 3. Generar historias
/stories:generate .claude/specs/mi-app-SPEC.md

# 4. Dividir en tareas
/tasks:breakdown H001

# 5. Ejecutar (elige uno)
/ralph:start .claude/tasks/T001.md        # Secuencial
bash .claude/scripts/swarm-launch.sh 4    # Paralelo (4 agentes)

# 6. Monitorear
/parallel:status
```

---

## Comandos Disponibles

| Comando                       | Descripcion                 | Cuando usar            |
| ----------------------------- | --------------------------- | ---------------------- |
| `/idea:validate <nombre>`     | Valida idea en 6 fases      | Tienes una idea nueva  |
| `/project:interview <nombre>` | Entrevista profunda         | Refinar especificacion |
| `/stories:generate <spec>`    | Genera historias de usuario | Despues de tener SPEC  |
| `/tasks:breakdown <historia>` | Divide historia en tareas   | Planificar trabajo     |
| `/ralph:start <tarea>`        | Loop autonomo               | Ejecutar tarea sola    |
| `/ralph:stop`                 | Detener loop                | Pausar ejecucion       |
| `/parallel:status`            | Estado de agentes           | Ver progreso global    |

---

## Estructura de Archivos

```
.claude/
|-- specs/           # Especificaciones (SPEC.md, REJECTED.md)
|-- stories/         # Historias de usuario (H001.md, H002.md...)
|-- tasks/           # Tareas del backlog (T001.md, T002.md...)
|-- checkpoints/     # Estados de sesion (JSON automatico)
|-- logs/            # Logs de ejecucion y errores
|-- research/        # Investigacion de ideas
|-- decisions/       # Architecture Decision Records
|-- memory/          # Knowledge graph persistente

trees/               # Git worktrees para paralelo
|-- T001/            # Worktree para tarea T001
|-- T002/            # Worktree para tarea T002
```

---

## Ralph Loop (Ejecucion Autonoma)

### Iniciar

```bash
/ralph:start .claude/tasks/T001-login-ui.md
```

Esto crea:

- `.claude/PROMPT.md` - Prompt a reinyectar
- `.claude/ralph-active` - Flag de loop activo

### Durante ejecucion

El sistema:

1. Ejecuta un paso
2. Verifica criterios de la tarea
3. Si incompleto, reinyecta prompt automaticamente
4. Repite hasta completar o limite (30 iteraciones)

### Finalizar

**Automatico**: Claude crea `.claude/COMPLETE` cuando termina

**Manual**:

```bash
/ralph:stop
```

### Safety Limits

- Maximo 30 iteraciones por loop
- Si mismo error 3+ veces: PAUSA automatica
- Checkpoints automaticos despues de cada commit

---

## Desarrollo Paralelo (Worktrees)

### Comandos basicos

```bash
# Ver worktrees existentes
bash .claude/scripts/worktree-manager.sh status
# o con alias: wts

# Crear worktree para tarea
bash .claude/scripts/worktree-manager.sh create T001-feature
# o con alias: wtc T001-feature

# Lanzar 4 agentes en paralelo
bash .claude/scripts/swarm-launch.sh 4

# Merge worktree completado
bash .claude/scripts/worktree-manager.sh merge T001-feature
# o con alias: wtm T001-feature
```

### Aliases recomendados

Agregar a `~/.bashrc`:

```bash
alias cc="claude"
alias ccp="claude --dangerously-skip-permissions"
alias ccr="claude --resume"
alias wt="bash .claude/scripts/worktree-manager.sh"
alias wtc="wt create"
alias wts="wt status"
alias wtm="wt merge"
alias swarm="bash .claude/scripts/swarm-launch.sh"
alias gcq='git add -A && git commit -m'
```

---

## Sistema de Tracking

### Ver estado del pipeline

```bash
bash .claude/scripts/tracker.sh status
```

### Registrar eventos manualmente

```bash
# Iniciar tracking de un paso
bash .claude/scripts/tracker.sh start idea-validate market-analysis

# Finalizar con estado
bash .claude/scripts/tracker.sh end idea-validate market-analysis success "Mercado viable"

# Evento puntual
bash .claude/scripts/tracker.sh log ralph-loop iteration progress "Iteracion 5/30"
```

### Exportar logs

```bash
bash .claude/scripts/tracker.sh export
# Genera: .claude/logs/pipeline-export-YYYYMMDD.json
```

---

## Flujo Completo: Ejemplo Practico

### Idea: "App de Pomodoro con estadisticas"

```bash
# Paso 1: Validar la idea
/idea:validate pomodoro-stats
# -> Si pasa: .claude/specs/pomodoro-stats-SPEC.md
# -> Si no:   .claude/specs/pomodoro-stats-REJECTED.md

# Paso 2: Refinar con entrevista
/project:interview pomodoro-stats

# Paso 3: Generar historias de usuario
/stories:generate .claude/specs/pomodoro-stats-SPEC.md
# Resultado:
#   - .claude/stories/H001-timer-basico.md
#   - .claude/stories/H002-configuracion.md
#   - .claude/stories/H003-estadisticas.md

# Paso 4: Dividir primera historia en tareas
/tasks:breakdown H001
# Resultado:
#   - .claude/tasks/T001-timer-ui.md
#   - .claude/tasks/T002-countdown-logic.md
#   - .claude/tasks/T003-controls.md

# Paso 5a: Ejecutar secuencialmente (una tarea)
/ralph:start .claude/tasks/T001-timer-ui.md

# Paso 5b: O ejecutar en paralelo (multiples tareas)
bash .claude/scripts/swarm-launch.sh 3

# Paso 6: Monitorear progreso
/parallel:status

# Paso 7: Merge cuando complete
bash .claude/scripts/worktree-manager.sh merge T001
```

---

## Comandos de Emergencia

| Situacion                   | Comando                                        |
| --------------------------- | ---------------------------------------------- |
| Detener Ralph loop          | `/ralph:stop`                                  |
| Ver estado de todo          | `/parallel:status`                             |
| Limpiar worktrees huerfanos | `wt cleanup`                                   |
| Limpiar logs                | `bash .claude/scripts/tracker.sh clear`        |
| Cancelar todo               | `rm -f .claude/ralph-active .claude/PROMPT.md` |

---

## Templates

### Crear historia de usuario manualmente

Copiar `.claude/templates/USER-STORY.md` y llenar:

- ID: H001, H002, etc.
- Titulo descriptivo
- Criterios de aceptacion verificables
- Tamano estimado: XS, S, M, L, XL

### Crear tarea manualmente

Copiar `.claude/templates/TASK.md` y llenar:

- ID: T001, T002, etc. (secuencial global)
- Historia padre
- Puntos: Fibonacci (1, 2, 3, 5, 8, 13, 21)
- Archivos a modificar
- Tests requeridos

---

## FAQ

**Q: El Ralph loop no se detiene** A: Crea el archivo `.claude/COMPLETE` o
ejecuta `/ralph:stop`

**Q: Quiero ejecutar mas de 4 agentes** A:
`bash .claude/scripts/swarm-launch.sh N` donde N es el numero

**Q: Como veo los logs de una sesion pasada?** A: `ls .claude/logs/` y luego
`cat .claude/logs/<archivo>`

**Q: El worktree tiene conflictos** A: Resuelve manualmente en `./trees/TXXX/` y
luego `wtm TXXX`

---

## Links Utiles

- CLAUDE.md: `.claude/CLAUDE.md` - Documentacion completa
- Templates: `.claude/templates/` - USER-STORY.md, TASK.md
- Scripts: `.claude/scripts/` - worktree-manager.sh, swarm-launch.sh, tracker.sh
- Hooks: `.claude/hooks/scripts/` - ralph-hook.sh, session-init.sh
