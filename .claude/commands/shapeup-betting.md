# /shapeup:betting - Sesión de Betting

Facilita una sesión de betting para decidir qué pitches aprobar.

## Uso

```
/shapeup:betting
/shapeup:betting --pitch PITCH-001
```

## Instrucciones para Claude

Cuando el usuario ejecute `/shapeup:betting`:

### 1. Cargar Pitches Candidatos

```bash
# Buscar pitches con status=shaped (listos para betting)
grep -l "status: shaped" .claude/pitches/PITCH-*.md
```

### 2. Presentar Resumen de Pitches

```
═══════════════════════════════════════════════════════════════
  BETTING TABLE
═══════════════════════════════════════════════════════════════

CAPACIDAD DEL CICLO: 12 semanas-persona

PITCHES CANDIDATOS:
┌────────────┬─────────────────────┬──────────┬──────────────┐
│ ID         │ Título              │ Apetito  │ Prioridad    │
├────────────┼─────────────────────┼──────────┼──────────────┤
│ PITCH-001  │ Auth con SSO        │ 6 sem    │ Alta         │
│ PITCH-002  │ Dashboard Analytics │ 6 sem    │ Alta         │
│ PITCH-003  │ Export to PDF       │ 2 sem    │ Media        │
│ PITCH-004  │ Dark Mode           │ 2 sem    │ Baja         │
└────────────┴─────────────────────┴──────────┴──────────────┘

TOTAL APETITO: 16 semanas (4 semanas sobre capacidad)

═══════════════════════════════════════════════════════════════
```

### 3. Facilitar Discusión por Pitch

Para cada pitch, guía la discusión:

```
═══════════════════════════════════════════════════════════════
  PITCH-001: Auth con SSO
═══════════════════════════════════════════════════════════════

PROBLEMA:
  Los usuarios no pueden hacer login con sus cuentas de Google/GitHub.
  Actualmente solo email/password.

SOLUCIÓN PROPUESTA:
  Integrar NextAuth con providers OAuth (Google, GitHub).
  Unificar cuentas si mismo email.

APETITO: 6 semanas

RABBIT HOLES IDENTIFICADOS:
  - ❌ NO implementar account linking complejo
  - ❌ NO soportar SAML/enterprise SSO (futuro)

CRITERIOS DE DECISIÓN:
┌─────────────────────────────────┬─────────┐
│ Criterio                        │ Score   │
├─────────────────────────────────┼─────────┤
│ ¿El problema es real/urgente?   │ ⭐⭐⭐⭐⭐ │
│ ¿La solución está shaped?       │ ⭐⭐⭐⭐  │
│ ¿Cabe en el apetito?            │ ⭐⭐⭐⭐  │
│ ¿Tenemos capacidad?             │ ⭐⭐⭐⭐  │
│ ¿Hay dependencias bloqueantes?  │ ⭐⭐⭐⭐⭐ │
└─────────────────────────────────┴─────────┘

DECISIÓN:
  [1] ✅ GO - Aprobar para próximo ciclo
  [2] ❌ NO-GO - Rechazar o diferir
  [3] 🔄 RESHAPE - Necesita más trabajo
  [4] ⏸️ SKIP - Decidir después

Tu elección: _
```

### 4. Registrar Decisiones

Para cada pitch, registra:

```json
{
  "pitch_id": "PITCH-001",
  "decision": "go",
  "decided_at": "2024-01-14T15:00:00Z",
  "rationale": "Problema crítico, solución bien shaped",
  "assigned_to": "team-alpha",
  "notes": "Priorizar Google primero, GitHub segundo"
}
```

### 5. Actualizar Estado de Pitches

```bash
# Si GO
sed -i 's/status: shaped/status: approved/' .claude/pitches/PITCH-001.md

# Si NO-GO
sed -i 's/status: shaped/status: rejected/' .claude/pitches/PITCH-001.md

# Si RESHAPE
sed -i 's/status: shaped/status: draft/' .claude/pitches/PITCH-001.md
```

### 6. Generar Resumen de Betting

```
═══════════════════════════════════════════════════════════════
  RESUMEN DE BETTING
  Fecha: 2024-01-14
═══════════════════════════════════════════════════════════════

DECISIONES:

  ✅ APROBADOS (GO)
  ────────────────
  PITCH-001: Auth con SSO (6 sem)
    → Asignado a: team-alpha
    → Nota: Priorizar Google primero

  PITCH-003: Export to PDF (2 sem)
    → Asignado a: team-beta
    → Nota: Solo formato A4 por ahora

  ❌ RECHAZADOS (NO-GO)
  ──────────────────────
  PITCH-004: Dark Mode (2 sem)
    → Razón: Baja prioridad vs capacidad
    → Revisitar en: Q2 2024

  🔄 NECESITAN RESHAPE
  ────────────────────
  PITCH-002: Dashboard Analytics (6 sem)
    → Problema: Scope demasiado amplio
    → Acción: Reducir a métricas core

CAPACIDAD ASIGNADA:
  Total: 8 semanas de 12 disponibles
  Restante: 4 semanas (para cooldown/emergencias)

PRÓXIMOS PASOS:
  1. Actualizar PITCH-002 con scope reducido
  2. Iniciar ciclo con pitches aprobados:
     /shapeup:cycle 6

═══════════════════════════════════════════════════════════════
```

### 7. Guardar Acta de Betting

Crea `.claude/betting/BETTING-<fecha>.md`:

```markdown
# Acta de Betting: 2024-01-14

## Participantes

- (usuario)

## Capacidad

- Disponible: 12 semanas-persona
- Asignada: 8 semanas-persona
- Reserva: 4 semanas-persona

## Decisiones

### Aprobados

#### PITCH-001: Auth con SSO

- **Decisión**: GO
- **Apetito**: 6 semanas
- **Asignación**: team-alpha
- **Prioridad en ciclo**: 1
- **Notas**: Priorizar Google OAuth primero

#### PITCH-003: Export to PDF

- **Decisión**: GO
- **Apetito**: 2 semanas
- **Asignación**: team-beta
- **Prioridad en ciclo**: 2
- **Notas**: Solo formato A4

### Rechazados

#### PITCH-004: Dark Mode

- **Decisión**: NO-GO
- **Razón**: Baja prioridad relativa
- **Revisitar**: Q2 2024

### Para Reshape

#### PITCH-002: Dashboard Analytics

- **Decisión**: RESHAPE
- **Problema**: Scope demasiado amplio para 6 semanas
- **Acción requerida**: Reducir a 3 métricas core
- **Responsable**: (usuario)
- **Deadline**: Antes del próximo betting

## Notas Generales

- Buen balance entre features y capacidad
- Reserva de 4 semanas para imprevistos
- PITCH-002 prometedor si se reduce scope

## Próximo Betting

- Fecha: 2024-02-25 (después de cooldown)
- Pitches a revisar: PITCH-002 (reshape), nuevos
```

## Reglas del Betting

1. **No hay backlogs**: Solo se discuten pitches shaped
2. **Apetito fijo**: Si no cabe, reduce scope (no extiendas tiempo)
3. **Decisiones binarias**: GO o NO-GO (no "maybe")
4. **Capacidad respetada**: No sobre-asignar
5. **Reserva**: Siempre guardar ~20% para emergencias

## Output Esperado

1. Decisiones por pitch registradas
2. Estado de pitches actualizado
3. Acta de betting guardada
4. Resumen claro de próximos pasos
