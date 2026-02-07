# CLAUDE.md - Sistema de Desarrollo Orquestado de Vicente Rivas Monferrer

## Identidad del Sistema

Este es el entorno de desarrollo de **Vicente Rivas Monferrer**, desarrollador
Full Stack especializado en IA/ML, IoT y aplicaciones web modernas. Ganador del
primer puesto nacional en Líderes Digitales Universitarios 2025 (Telefónica) y
vinculado a la Cátedra ENIA-UPV.

El sistema está diseñado para transformar ideas en MVPs funcionales mediante:

1. **Entrevista profunda** (patrón SPEC.md de Thariq)
2. **Orquestación de agentes especializados**
3. **Automatización de tareas repetitivas**

---

## Comandos Slash Disponibles

| Comando                       | Descripción                                      |
| ----------------------------- | ------------------------------------------------ |
| `/project:interview <nombre>` | Inicia entrevista profunda para generar SPEC.md  |
| `/project:mvp <nombre>`       | Genera MVP completo desde SPEC existente         |
| `/project:stack`              | Recomienda stack tecnológico para el proyecto    |
| `/project:status`             | Muestra estado actual del proyecto               |
| `/ux-expert`                  | Consulta experto UX/UI para decisiones de diseño |
| `/mvp:auto-generate <spec>`   | SPEC → Historias → Tareas → Skills automático    |
| `/skill:generate <task-id>`   | Genera skill especializada para una tarea        |
| `/skill:batch <story-id>`     | Skills para todas las tareas de una historia     |

---

## Disciplined Dev Workflow

Sistema de desarrollo disciplinado con validacion pre-commit, scope contracts y
routing por complejidad. Previene buggy code post-deploy, over-engineering y
scope creep.

### Comandos de Desarrollo

| Comando               | Descripcion                                |
| --------------------- | ------------------------------------------ |
| `/dev:quick <desc>`   | Cambios simples (1-3 archivos, sin plan)   |
| `/dev:feature <desc>` | Features medios (4-10 archivos, por fases) |
| `/dev:deploy`         | Deploy con pre-flight checks               |
| `/dev:verify <url>`   | Verificacion read-only de produccion       |

### Routing por Complejidad

| Archivos | Comando          | Planificacion        |
| -------- | ---------------- | -------------------- |
| 1-3      | `/dev:quick`     | Ninguna              |
| 4-10     | `/dev:feature`   | Ligera (fases)       |
| 10+      | gurusup-workflow | Completa (plan mode) |

### Pre-Commit Validation Gate

Hook automatico que bloquea commits si:

- Archivos staged fuera del scope contract
- `tsc --noEmit` falla
- `npm run build` falla
- `npm run lint` falla

### Scope Contract

Archivo temporal `.claude/scope-contract.active.md` que define que archivos se
pueden modificar. Se crea antes de implementar y se elimina post-commit.

Ver: `.claude/skills/disciplined-dev/references/scope-contract-guide.md`

---

## Stack Tecnológico por Defecto

### Web Full Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes o tRPC
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Hosting**: Vercel (auto-deploy desde GitHub)
- **Testing**: Jest + Testing Library + Playwright

### AI/ML Application

- **Backend**: Python 3.11+, FastAPI
- **ML**: PyTorch o TensorFlow
- **Vector DB**: Pinecone o Chroma
- **Hosting**: Modal o Replicate

### IoT Project

- **Microcontroller**: ESP32 con MicroPython
- **Backend**: Python FastAPI + MQTT
- **Database**: TimescaleDB
- **Dashboard**: Grafana

---

## Comandos Bash Frecuentes

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Build de producción
npm run test         # Ejecuta tests
npm run lint         # Verifica código
npm run typecheck    # Verifica tipos TypeScript

# Git
git status           # Estado del repositorio
git add .            # Stage todos los cambios
git commit -m "..."  # Commit con mensaje
git push             # Push a remote

# Docker
docker compose up -d    # Inicia servicios
docker compose down     # Detiene servicios
docker compose logs -f  # Ver logs
```

---

## Estilo de Código

### TypeScript/JavaScript

- **TypeScript strict mode** siempre habilitado
- **ESLint + Prettier** para formateo consistente
- Nombres descriptivos sin abreviaciones
- Funciones de máximo 50 líneas
- Componentes funcionales con hooks
- Preferir composición sobre herencia

### Python

- **Black** para formateo
- **Ruff** para linting
- Type hints obligatorios
- Docstrings en funciones públicas

### Comentarios

- Comentar el **POR QUÉ**, no el **QUÉ**
- Solo agregar comentarios donde la lógica no es evidente
- NO agregar comentarios a código que no se modifica

---

## Workflow de Git

### Conventional Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
refactor: refactorización
test: tests
chore: mantenimiento
```

### Branches

```
feature/*   - Nuevas funcionalidades
bugfix/*    - Correcciones de bugs
hotfix/*    - Correcciones urgentes en producción
```

### Reglas

- PR requerido para merge a main
- Squash merge preferido
- Tests deben pasar antes de merge
- Al menos 1 review antes de merge

---

## Testing

### Principios

- **TDD**: Escribir tests antes del código
- Cobertura mínima: **80%** para código nuevo
- Nombres descriptivos para tests
- Mock servicios externos, no lógica interna

### Estructura

```
__tests__/
├── unit/           # Tests unitarios
├── integration/    # Tests de integración
└── e2e/            # Tests end-to-end
```

---

## Arquitectura

### Clean Architecture

```
src/
├── domain/         # Entidades, reglas de negocio
├── application/    # Casos de uso, DTOs
├── infrastructure/ # Repositorios, servicios externos
└── presentation/   # Controllers, componentes UI
```

### Principios

- Dependency Injection para testabilidad
- Repository pattern para acceso a datos
- DTOs en boundaries de API
- Separación clara entre capas

---

## Design-First Workflow

Before generating any code, run `/design:full` to create architecture artifacts.
The design phase produces C4 diagrams, domain models, user flows, and ADRs in
`.claude/designs/{project}/`. Code generation (`/project:mvp`) requires a
passing validation checklist.

| Comando                           | Descripción                                  |
| --------------------------------- | -------------------------------------------- |
| `/design:architecture <proyecto>` | Genera diagramas C4 y ADRs                   |
| `/design:domain <proyecto>`       | Modela el dominio (DDD + diagrama de clases) |
| `/design:flows <proyecto>`        | Diseña flujos de usuario y edge cases        |
| `/design:validate <proyecto>`     | Verifica completitud de artefactos           |
| `/design:full <proyecto>`         | Flujo completo orquestado (recomendado)      |

See `.claude/DESIGN-FIRST-GUIDE.md` for complete reference.

---

## Agentes Disponibles

| Agente                | Responsabilidad                           |
| --------------------- | ----------------------------------------- |
| `00-design-architect` | Genera diagramas C4 y ADRs                |
| `00-domain-modeler`   | Modela dominio DDD y diagrama de clases   |
| `00-flow-designer`    | Diseña flujos, secuencias y edge cases    |
| `01-project-setup`    | Inicializa estructura del proyecto        |
| `02-git-cicd`         | Configura Git y CI/CD                     |
| `03-architecture`     | Diseña arquitectura del sistema           |
| `04-ui-ux`            | Implementa interfaces (invoca /ux-expert) |
| `05-testing`          | Escribe tests (TDD)                       |
| `06-documentation`    | Genera documentación                      |
| `07-deployment`       | Configura despliegue                      |

---

## Referencias Importantes

- **Specs**: `.claude/specs/` - Especificaciones de proyectos
- **Agentes**: `.claude/agents/` - Agentes especializados
- **Skills**: `.claude/skills/` - Skills reutilizables
- **Commands**: `.claude/commands/` - Comandos personalizados
- **Templates**: `.claude/templates/` - Templates de documentos
- **Designs**: `.claude/designs/` - Artefactos de diseño por proyecto
- **Design Guide**: `.claude/DESIGN-FIRST-GUIDE.md` - Referencia de Design-First

---

## Preferencias de Comunicación

- Ser directo y técnico
- Sugerir alternativas al rechazar propuestas
- Preguntar antes de cambios grandes
- Usar ejemplos de código sobre explicaciones verbosas
- Documentación principalmente en **español** (código en inglés)

---

## Seguridad

### Nunca hacer

- Commitear archivos `.env` con secretos
- Force push a main/master
- Ejecutar `rm -rf /` o comandos destructivos
- Exponer API keys en código

### Siempre hacer

- Usar variables de entorno para secretos
- Validar inputs de usuario
- Sanitizar outputs
- Implementar rate limiting en APIs públicas

---

## Sistema de Desarrollo Autónomo

### Comandos de Autonomía

| Comando                    | Descripción                          |
| -------------------------- | ------------------------------------ |
| `/ralph:start <task>`      | Iniciar loop autónomo para una tarea |
| `/ralph:stop`              | Detener loop y guardar estado        |
| `/idea:validate <idea>`    | Validar idea con proceso de 6 fases  |
| `/stories:generate <spec>` | Generar historias desde SPEC.md      |
| `/tasks:breakdown <story>` | Dividir historia en tareas           |
| `/parallel:status`         | Estado de agentes paralelos          |

### Flujo Idea → MVP

```
1. /idea:validate <nombre>     → Genera SPEC o REJECTED
2. /project:interview <nombre> → Refina especificación
3. Crear historias             → template USER-STORY.md
4. Dividir en tareas           → template TASK.md
5. bash .claude/scripts/swarm-launch.sh 4 → Lanza agentes paralelos
6. bash .claude/scripts/worktree-manager.sh status → Monitorear
```

### Estructura de Directorios Extendida

```
.claude/
├── stories/      # Historias de usuario (H001.md, H002.md...)
├── tasks/        # Tareas del backlog (T001.md, T002.md...)
├── checkpoints/  # Estados de sesión (JSON)
├── memory/       # Knowledge graph persistente
├── logs/         # Logs de ejecución
├── research/     # Investigación de ideas
└── decisions/    # Architecture Decision Records

trees/            # Git worktrees para desarrollo paralelo
├── T001/         # Worktree para tarea T001
├── T002/         # Worktree para tarea T002
└── ...
```

### Ralph Loop (Ejecución Autónoma)

El Ralph Loop permite ejecutar tareas de forma iterativa y autónoma:

1. **Iniciar**: `/ralph:start .claude/tasks/T001.md`
   - Crea `.claude/PROMPT.md` con la tarea
   - Activa flag `.claude/ralph-active`
   - Inicia ejecución autónoma

2. **Loop automático**:
   - Ejecuta paso → Verifica criterios
   - Stop hook reinyecta prompt si incompleto
   - Continúa hasta completar o límite

3. **Finalización**:
   - Crear `.claude/COMPLETE` para indicar completitud
   - O `/ralph:stop` para pausa manual

### Desarrollo Paralelo (Worktrees)

```bash
# Crear worktree para una tarea
wt create T001-auth-feature

# Ver estado de todos los worktrees
wt status

# Merge worktree completado a main
wt merge T001-auth-feature

# Lanzar múltiples agentes
bash .claude/scripts/swarm-launch.sh 4
```

### Safety Limits

- **Máximo 30 iteraciones** por Ralph loop
- Si **mismo error 3+ veces**: PAUSAR automáticamente
- **Comandos bloqueados**: `rm -rf /`, `sudo rm`, `chmod 777`
- **Checkpoints automáticos** después de cada commit

### Aliases Recomendados (añadir a ~/.bashrc)

```bash
# Claude básico
alias cc="claude"
alias ccp="claude --dangerously-skip-permissions"
alias ccr="claude --resume"

# Worktree management
alias wt="bash .claude/scripts/worktree-manager.sh"
alias wtc="wt create"
alias wts="wt status"
alias wtm="wt merge"

# Swarm
alias swarm="bash .claude/scripts/swarm-launch.sh"

# Quick commits (atomic workflow)
alias gcq='git add -A && git commit -m'
```

---

## Sistema de MVP Hardening

### Comandos de Hardening

| Comando                    | Descripción                                             |
| -------------------------- | ------------------------------------------------------- |
| `/mvp:harden <proyecto>`   | Flujo completo: entrevista → historias → tareas → swarm |
| `/mvp:feedback <proyecto>` | Solo recopila feedback (genera FEEDBACK.md)             |
| `/mvp:fix [proyecto]`      | Genera historias/tareas desde FEEDBACK.md existente     |

### Flujo de Hardening (Post-MVP)

```
/mvp:feedback <proyecto>   → Entrevista de feedback (15-25 preguntas)
        ↓
    FEEDBACK.md            → Issues categorizados con severidad
        ↓
/mvp:fix                   → Genera historias H1XX y tareas T1XX
        ↓
/swarm:launch N            → Lanza N agentes paralelos
        ↓
/swarm:integrate           → Merge automático cuando terminen
```

### Categorías de Issues

| Categoría       | Prefijo  | Descripción                         |
| --------------- | -------- | ----------------------------------- |
| **BUGS**        | BUG-XXX  | Errores de funcionamiento           |
| **UX**          | UX-XXX   | Problemas de experiencia de usuario |
| **PERFORMANCE** | PERF-XXX | Problemas de rendimiento            |
| **SECURITY**    | SEC-XXX  | Vulnerabilidades de seguridad       |
| **FEATURES**    | FEAT-XXX | Funcionalidades faltantes           |

### Niveles de Severidad

| Severidad    | Descripción                                        |
| ------------ | -------------------------------------------------- |
| **critical** | Bloquea uso, pérdida de datos, seguridad grave     |
| **high**     | Funcionalidad core afectada, experiencia degradada |
| **medium**   | Problema molesto pero con workaround               |
| **low**      | Cosmético, edge case, nice-to-have                 |

### Estructura de Archivos Hardening

```
.claude/
├── feedback/
│   └── FEEDBACK-<proyecto>.md    # Issues del feedback
├── stories/
│   ├── H101-<nombre>.md          # Historias de hardening (H1XX)
│   └── STORIES-INDEX.md
├── tasks/
│   ├── T101-<nombre>.md          # Tareas de hardening (T1XX)
│   └── TASKS-INDEX.md
├── hardening/
│   └── progress.json             # Estado del proceso
└── templates/
    └── FEEDBACK-TEMPLATE.md      # Template para feedback
```

### Skill: hardening-interviewer

Entrevista estructurada en 6 fases:

1. **BUGS** (3-5 preguntas) - Funcionalidades rotas
2. **UX** (3-5 preguntas) - Fricciones en la experiencia
3. **PERFORMANCE** (2-4 preguntas) - Lentitudes
4. **SECURITY** (2-3 preguntas) - Vulnerabilidades
5. **FEATURES** (2-4 preguntas) - Gaps funcionales
6. **PRIORIZACIÓN** (2-3 preguntas) - Top 3 crítico

### Reglas de Conversión Issues → Historias

| Condición                     | Resultado                   |
| ----------------------------- | --------------------------- |
| 1 bug CRITICAL                | 1 historia H1XX             |
| 2-3 bugs HIGH similares       | 1 historia agrupada         |
| Issues UX de misma pantalla   | 1 historia                  |
| 1 SEC issue (cualquier nivel) | 1 historia dedicada         |
| Issues MEDIUM similares       | Agrupar en 1 historia       |
| Issues LOW                    | Agrupar o diferir a backlog |

### Ejemplo de Uso

```bash
# Flujo completo (entrevista + generación + swarm)
> /mvp:harden flowlearn

# O por partes:
> /mvp:feedback flowlearn        # Solo entrevista
> /mvp:fix                        # Genera historias/tareas
> /swarm:launch 4                 # Lanza 4 agentes

# Monitoreo
> /swarm:status                   # Ver progreso
> /swarm:integrate                # Merge cuando terminen
```

---

## Sistema de Escalado MVP → SaaS Profesional

### Comandos de Escalado

| Comando                    | Descripción                                   |
| -------------------------- | --------------------------------------------- |
| `/scale:assess <proyecto>` | Evalúa MVP y genera roadmap de escalado       |
| `/scale:iteration <fase>`  | Ejecuta iteración de mejora por fase          |
| `/scale:checklist`         | Checklist interactivo de production-readiness |
| `/scale:architecture`      | Analiza y propone mejoras arquitectónicas     |

### Historias y Tareas Automatizadas

| Comando                      | Descripción                                 |
| ---------------------------- | ------------------------------------------- |
| `/stories:auto <spec>`       | Genera historias con IA (técnica RaT)       |
| `/tasks:parallel <historia>` | Divide en tareas paralelas con dependencias |
| `/tasks:graph`               | Visualiza grafo de dependencias             |

### Ejecución Paralela Mejorada

| Comando             | Descripción                             |
| ------------------- | --------------------------------------- |
| `/swarm:launch <N>` | Lanza N agentes en terminales paralelas |
| `/swarm:status`     | Dashboard en tiempo real                |
| `/swarm:integrate`  | Activa agente integrador                |
| `/swarm:stop`       | Detiene agentes y guarda estado         |

### Shape Up Cycles

| Comando                    | Descripción                      |
| -------------------------- | -------------------------------- |
| `/shapeup:pitch <idea>`    | Define pitch + apuestas          |
| `/shapeup:cycle <semanas>` | Inicia ciclo (default 6 semanas) |
| `/shapeup:betting`         | Sesión de betting: go/no-go      |

### Fases de Escalado

```
Fase 0: Arquitectura Cloud-Native
├── Containerización (Docker)
├── Configuración por entorno
└── Separación de concerns

Fase 1: Auth + Security
├── Autenticación robusta
├── 2FA/MFA, SSO
├── Rate limiting
└── Headers de seguridad

Fase 2: Billing + Monetización
├── Integración Stripe/Paddle
├── Gestión de subscripciones
└── Webhooks + Invoicing

Fase 3: Observability
├── Error tracking (Sentry)
├── Logging estructurado
├── Métricas (PostHog)
└── APM + Alertas

Fase 4: Compliance
├── GDPR ready
├── Privacy Policy + ToS
└── Cookie consent

Fase 5: Deployment
├── CI/CD pipeline
├── Staging environment
├── Feature flags
└── Load testing
```

### Flujo MVP → SaaS (6 semanas)

```
SEMANA 0: /scale:assess → Roadmap
SEMANA 1-2: /scale:iteration auth → Auth + Security
SEMANA 3-4: /scale:iteration billing + monitoring
SEMANA 5: /scale:iteration compliance + testing
SEMANA 6: /scale:checklist → Deploy producción
```

### Agentes de Escalado

| Agente          | Responsabilidad                            |
| --------------- | ------------------------------------------ |
| `08-integrator` | Merge automático, resolución de conflictos |
| `09-scaler`     | Implementa mejoras de escalado             |
| `10-qa-final`   | Testing E2E, validación pre-producción     |

### Scripts de Escalado

```bash
# Swarm mejorado
bash .claude/scripts/swarm-launcher-v2.sh 4

# Integrador automático
bash .claude/scripts/integrator.sh

# Monitor en tiempo real
bash .claude/scripts/parallel-monitor.sh

# Resolver dependencias
bash .claude/scripts/dependency-resolver.sh
```

---

## Sistema de MVP Automation (SPEC → Skills)

### Comandos de Automatización

| Comando                     | Descripción                                         |
| --------------------------- | --------------------------------------------------- |
| `/mvp:auto-generate <spec>` | Flujo completo: SPEC → Historias → Tareas → Skills  |
| `/skill:generate <task-id>` | Genera skill especializada para una tarea           |
| `/skill:batch <story-id>`   | Genera skills para todas las tareas de una historia |

### Flujo Automatizado Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    MVP AUTOMATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /project:interview <nombre>                                    │
│           │                                                     │
│           ▼                                                     │
│     ┌─────────────┐                                             │
│     │   SPEC.md   │  ← Entrevista profunda                      │
│     └──────┬──────┘                                             │
│            │                                                    │
│            ▼ [Usuario confirma]                                 │
│                                                                 │
│  /mvp:auto-generate <spec>                                      │
│           │                                                     │
│           ├──────────────────────────────────────┐              │
│           ▼                                      ▼              │
│     ┌─────────────┐                       ┌─────────────┐       │
│     │  H001.md    │                       │  H002.md    │  ...  │
│     │  Historia 1 │                       │  Historia 2 │       │
│     └──────┬──────┘                       └──────┬──────┘       │
│            │                                     │              │
│            ▼                                     ▼              │
│     ┌─────────────┐                       ┌─────────────┐       │
│     │  T001.md    │                       │  T003.md    │       │
│     │  T002.md    │                       │  T004.md    │       │
│     └──────┬──────┘                       └──────┬──────┘       │
│            │                                     │              │
│            ▼                                     ▼              │
│     ┌─────────────┐                       ┌─────────────┐       │
│     │ SKILL-T001  │                       │ SKILL-T003  │       │
│     │ SKILL-T002  │                       │ SKILL-T004  │       │
│     └─────────────┘                       └─────────────┘       │
│                                                                 │
│            │ [Skills generadas]                                 │
│            ▼                                                    │
│                                                                 │
│  /swarm:launch N   ← Agentes con skills especializadas          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Estructura de Skills Generadas

```
.claude/
├── specs/
│   └── PROYECTO-SPEC.md
├── stories/
│   ├── H001-feature-name.md
│   ├── H002-another-feature.md
│   └── STORIES-INDEX.md
├── tasks/
│   ├── T001-task-name.md
│   ├── T002-task-name.md
│   └── TASKS-INDEX.md
└── skills/
    └── generated/
        └── PROYECTO/
            ├── T001-skill/
            │   └── SKILL.md
            ├── T002-skill/
            │   └── SKILL.md
            └── INDEX.md
```

### Contenido de Skills Especializadas

Cada skill generada incluye:

1. **Conocimiento Contextual**
   - Historia padre y criterios de aceptación
   - Dependencias con otras tareas
   - Stack tecnológico específico

2. **Patrones Recomendados**
   - Ejemplos de código del dominio
   - Estructura de archivos sugerida
   - APIs y librerías relevantes

3. **Anti-patterns**
   - Errores comunes a evitar
   - Trampas específicas del stack

4. **Checklist de Completitud**
   - Criterios verificables para "done"
   - Tests mínimos requeridos
   - Puntos de integración

### Categorías de Skills

| Palabras Clave en Tarea       | Categoría  |
| ----------------------------- | ---------- |
| auth, login, session, token   | `auth`     |
| database, schema, migration   | `database` |
| api, endpoint, route, handler | `api`      |
| ui, component, page, layout   | `ui`       |
| test, spec, coverage          | `testing`  |
| deploy, ci, cd, docker        | `devops`   |
| style, css, tailwind, theme   | `styling`  |
| cache, performance, optimize  | `perf`     |
| security, validate, sanitize  | `security` |
| docs, readme, comment         | `docs`     |

### Ejemplo de Uso

```bash
# 1. Entrevista para generar SPEC
> /project:interview NutriCoach

# 2. Confirmar SPEC y generar todo automáticamente
> /mvp:auto-generate .claude/specs/NutriCoach.md

# Output:
# - 12 historias generadas
# - 45 tareas creadas
# - 45 skills especializadas
# - Índices actualizados

# 3. Lanzar agentes con skills cargadas
> /swarm:launch 4

# Los agentes cargan automáticamente su skill correspondiente
```

### Opciones de Generación

```bash
# Solo historias
/mvp:auto-generate <spec> --stories-only

# Limitar tareas
/mvp:auto-generate <spec> --max-tasks=20

# Sin skills
/mvp:auto-generate <spec> --no-skills

# Regenerar desde historia específica
/mvp:auto-generate <spec> --from-story=H003

# Solo regenerar skills
/mvp:auto-generate <spec> --regenerate-skills
```

### Técnica RaT (Refine and Thought)

Las historias se generan usando el proceso iterativo RaT:

1. **Thought**: Identificar funcionalidades core del usuario
2. **Refine**: Verificar que cada historia es atómica y valiosa
3. **Iterate**: Validar criterios INVEST

### Integración con UX Skills

Las skills generadas pueden heredar conocimiento de skills de UX existentes:

- **Fitts Law**: Targets mínimos de 48px en mobile
- **Hick's Law**: Reducir opciones por pantalla
- **Jakob's Law**: Consistencia con patrones conocidos
- **Miller's Law**: Máximo 7±2 elementos en listas

### Beneficios del Sistema

1. **Agentes más inteligentes**: Cada agente tiene conocimiento específico
2. **Menos errores**: Anti-patterns documentados previenen problemas
3. **Consistencia**: Patrones estandarizados en todo el proyecto
4. **Trazabilidad**: Cada skill vinculada a su tarea e historia
5. **Reutilización**: Skills sirven para proyectos similares del mismo dominio
