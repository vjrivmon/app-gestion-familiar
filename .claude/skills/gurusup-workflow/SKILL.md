---
name: gurusup-workflow
description: "Workflow completo de desarrollo Design-First: exploración → clarificación → planificación → implementación autónoma (Ralph Loop). Incluye creación de issues GitHub de alta calidad estilo PRD."
version: 1.0.0
author: VisiClaw (basado en GuruSup workflow)
commands:
  - /explore-plan
  - /implement
  - /create-issue
  - /product-clarify
---

# GuruSup Workflow - Design-First Development

Sistema completo de desarrollo que integra exploración, planificación detallada, e implementación autónoma con feedback loops.

---

## Comandos Disponibles

### `/explore-plan <descripción>`
Explora el codebase y crea un plan detallado de implementación.

### `/implement <issue_number>`
Inicia el Ralph Loop para ejecutar el plan de forma autónoma hasta completar todas las validaciones.

### `/create-issue <plan_path>`
Crea una issue de GitHub de alta calidad estilo PRD.

### `/product-clarify <issue_number>`
Clarifica requisitos de producto para una issue existente.

---

## Filosofía

**Design-First**: Antes de escribir código, entender completamente el problema y planificar la solución.

**Ralph Loop**: Implementación autónoma iterativa. Cada iteración valida, corrige y avanza hasta completar.

**Self-documenting**: Todo el proceso queda documentado en archivos de sesión y logs de progreso.

---

## Flujo de Trabajo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  1. EXPLORE & PLAN                                              │
│     /explore-plan "nueva funcionalidad X"                       │
│     → Crea context_session_{feature}.md                         │
│     → Explora código existente                                  │
│     → Hace preguntas de clarificación                           │
│     → Genera plan detallado con fases                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. CREATE GITHUB ISSUE                                         │
│     /create-issue context_session_{feature}.md                  │
│     → Genera issue estilo PRD                                   │
│     → Incluye criterios de aceptación                           │
│     → Añade diagramas UML                                       │
│     → Documenta edge cases                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. IMPLEMENT (Ralph Loop)                                      │
│     /implement <issue_number>                                   │
│     → Crea worktree feature-issue-{N}                           │
│     → Loop autónomo: implement → validate → fix → repeat        │
│     → Genera reporte de implementación                          │
│     → Crea PR a develop                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos

```
.claude/
├── sessions/
│   └── context_session_{feature}.md    # Plan de sesión activa
├── ralph.state.md                      # Estado del Ralph Loop
├── ralph-archives/                     # Historial de loops completados
│   └── YYYY-MM-DD-{feature}/
│       ├── state.md
│       ├── plan.md
│       └── learnings.md
└── reports/
    └── {feature}-report.md             # Reporte de implementación
```

---

## Referencias

Ver carpeta `references/` para:
- `explore-plan.md` - Comando de exploración y planificación
- `implement-ralph.md` - Comando de implementación autónoma
- `create-issue.md` - Creación de issues GitHub estilo PRD
- `product-clarify.md` - Clarificación de requisitos
- `ralph-loop-guide.md` - Guía detallada del Ralph Loop

---

## Uso Recomendado

### Para una nueva feature:
```
1. /explore-plan "Implementar sistema de notificaciones push"
2. [Responder preguntas de clarificación]
3. [Revisar plan generado]
4. /create-issue .claude/sessions/context_session_notificaciones.md
5. /implement 42
```

### Para un bug:
```
1. /explore-plan "Fix: usuarios ven documentos de otros educandos"
2. [Analizar código relevante]
3. /create-issue .claude/sessions/context_session_fix_docs.md
4. /implement 43
```

---

## Integración con Setup-Software-IA

Esta skill complementa el sistema Design-First existente:

| Fase Design-First | Comando GuruSup |
|-------------------|-----------------|
| Entrevista | `/explore-plan` (clarificación) |
| Diseño | `/explore-plan` (planificación) |
| Implementación | `/implement` (Ralph Loop) |
| Documentación | `/create-issue` (PRD automático) |
