# /shapeup:cycle - Iniciar Ciclo de Desarrollo

Inicia un ciclo de desarrollo Shape Up con duración definida.

## Uso

```
/shapeup:cycle <semanas>
/shapeup:cycle 6
/shapeup:cycle 2 --pitch PITCH-001
```

## Instrucciones para Claude

Cuando el usuario ejecute `/shapeup:cycle <semanas>`:

### 1. Verificar Pitches Aprobados

```bash
# Buscar pitches con status=approved
grep -l "status: approved" .claude/pitches/PITCH-*.md
```

Si no hay pitches aprobados:

```
No hay pitches aprobados para este ciclo.
Usa /shapeup:betting primero para aprobar pitches.
```

### 2. Configurar Ciclo

```markdown
---
id: CYCLE-001
start_date: 2024-01-15
end_date: 2024-02-26
duration_weeks: 6
status: active
pitches:
  - PITCH-001
  - PITCH-002
cooldown_weeks: 2
---
```

### 3. Crear Hill Chart

El Hill Chart visualiza el progreso:

```
HILL CHART - CYCLE-001 (Semana 1/6)

         UPHILL                    DOWNHILL
    (Descubriendo)              (Ejecutando)
           |                          |
     100% -|                          |- 100%
           |                          |
           |          ^               |
      75% -|         /|\              |- 75%
           |        / | \             |
           |       /  |  \            |
      50% -|------/---|---\-----------|- 50%
           |     /    |    \          |
           |    /     |     \         |
      25% -|   •      |      \        |- 25%
           |  P001    |       \       |
           | (aquí)   |        •      |
       0% -|----------|--------P002---|- 0%
           |          |               |
           +----------+---------------+

LEYENDA:
  • PITCH-001: Auth SSO - Uphill 25% (descubriendo)
  • PITCH-002: Dashboard - Downhill 75% (ejecutando)
```

### 4. Generar Estructura del Ciclo

Crea `.claude/cycles/CYCLE-<id>/`:

```
.claude/cycles/CYCLE-001/
├── CYCLE.md              # Configuración del ciclo
├── HILL-CHART.md         # Hill chart actualizable
├── WEEKLY-UPDATES/
│   ├── week-1.md
│   ├── week-2.md
│   └── ...
├── PITCHES/
│   ├── PITCH-001/        # Trabajo del pitch
│   │   ├── scopes.md     # Scopes definidos
│   │   ├── tasks.md      # Tareas del scope
│   │   └── progress.md   # Progreso diario
│   └── PITCH-002/
└── RETROSPECTIVE.md      # Al final del ciclo
```

### 5. Definir Scopes por Pitch

Para cada pitch aprobado, divide en scopes:

```markdown
# Scopes: PITCH-001 - Auth SSO

## Scope 1: OAuth Providers Setup

- Configurar Google OAuth
- Configurar GitHub OAuth
- Configurar variables de entorno

## Scope 2: Auth Flow

- Implementar login redirect
- Implementar callback handler
- Manejar errores de auth

## Scope 3: Session Management

- Crear/actualizar usuario
- Generar session token
- Configurar cookies

## Scope 4: UI Components

- Botones de login social
- Loading states
- Error messages
```

### 6. Output al Usuario

```
═══════════════════════════════════════════════════════════════
  CICLO INICIADO
═══════════════════════════════════════════════════════════════

CYCLE-001
Duración: 6 semanas
Inicio: 2024-01-15
Fin: 2024-02-26
Cooldown: 2 semanas después

PITCHES EN ESTE CICLO:
┌────────────┬─────────────────────┬──────────┬──────────┐
│ ID         │ Título              │ Apetito  │ Scopes   │
├────────────┼─────────────────────┼──────────┼──────────┤
│ PITCH-001  │ Auth con SSO        │ 6 sem    │ 4        │
│ PITCH-002  │ Dashboard Analytics │ 6 sem    │ 3        │
└────────────┴─────────────────────┴──────────┴──────────┘

HILL CHART INICIAL:
  PITCH-001: ○ (0% - sin empezar)
  PITCH-002: ○ (0% - sin empezar)

ESTRUCTURA CREADA:
  .claude/cycles/CYCLE-001/

WORKFLOW DEL CICLO:
  Semana 1-2: Descubrimiento (uphill)
    - Investigar unknowns
    - Definir approach técnico
    - Crear tareas concretas

  Semana 3-5: Ejecución (downhill)
    - Implementar scopes
    - Tests y refinamiento
    - Integración

  Semana 6: Polish
    - Bug fixes
    - QA final
    - Documentación

COMANDOS ÚTILES:
  /shapeup:update PITCH-001 50    - Actualizar progreso
  /shapeup:status                 - Ver estado del ciclo
  /stories:auto PITCH-001         - Generar historias de un pitch

═══════════════════════════════════════════════════════════════
```

### 7. Checkpoints Semanales

Cada semana, generar update:

```markdown
# Week 2 Update - CYCLE-001

## Fecha: 2024-01-22

## Hill Chart
```

    PITCH-001: ●───────○ (40% uphill)
    PITCH-002: ○───●─── (60% downhill)

```

## Por Pitch

### PITCH-001: Auth SSO
**Progreso**: 40% (uphill)
**Estado**: Descubriendo approach para SSO

**Esta semana**:
- ✅ Investigado providers (Google, GitHub)
- ✅ Spike de NextAuth
- 🔄 Definiendo schema de usuario

**Próxima semana**:
- Implementar OAuth flow
- Crear componentes de UI

**Blockers**: Ninguno

### PITCH-002: Dashboard Analytics
**Progreso**: 60% (downhill)
**Estado**: Ejecutando

**Esta semana**:
- ✅ Charts implementados
- ✅ API de métricas
- 🔄 Filtros de fecha

**Próxima semana**:
- Completar filtros
- Tests E2E

**Blockers**: Ninguno

## Riesgos
- (ninguno identificado)

## Notas
- Buen progreso en general
- PITCH-002 adelantado
```

## Cooldown

Después del ciclo, 2 semanas de cooldown para:

- Bug fixes
- Refactoring
- Preparar próximos pitches
- Descanso del equipo

## Output Esperado

1. Ciclo configurado en `.claude/cycles/CYCLE-XXX/`
2. Scopes definidos por pitch
3. Hill chart inicial
4. Template para updates semanales
