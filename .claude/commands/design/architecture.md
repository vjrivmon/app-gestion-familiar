---
name: design:architecture
description: Genera diagramas C4 y ADRs para un proyecto desde su SPEC.md
allowed-tools: Task, Read, Write, Glob, Grep, WebSearch, WebFetch, AskUserQuestion
---

# Comando: Design Architecture

Genera la arquitectura del sistema usando el modelo C4 y documenta decisiones como ADRs.

## Uso

```
/design:architecture <nombre-proyecto>
```

## Pre-requisitos

1. Debe existir `.claude/specs/$ARGUMENTS.md`
2. Si no existe, indicar al usuario que ejecute primero `/project:interview $ARGUMENTS`

## Ejecucion

1. Leer las instrucciones del agente en `.claude/agents/00-design-architect.md`
2. Leer la SPEC del proyecto en `.claude/specs/$ARGUMENTS.md`
3. Crear directorio `.claude/designs/$ARGUMENTS/c4/` y `.claude/designs/$ARGUMENTS/decisions/`
4. Ejecutar el workflow del agente 00-design-architect paso a paso:
   - Paso 1: Analizar SPEC
   - Paso 2: Generar C4 Level 1 (Context) -> Preguntar al usuario
   - Paso 3: Generar C4 Level 2 (Containers) -> Preguntar decisiones tecnologicas
   - Paso 4: Generar ADRs por cada decision
   - Paso 5: C4 Level 3 si el proyecto lo requiere
   - Paso 6: Generar DESIGN-SUMMARY.md parcial

## Output Esperado

```
.claude/designs/$ARGUMENTS/
  c4/
    context.mmd
    containers.mmd
    components.mmd (si aplica)
  decisions/
    ADR-001-*.md
    ADR-002-*.md (etc.)
  DESIGN-SUMMARY.md
```

## Siguiente Paso

Al completar, sugerir: "Ejecuta `/design:domain $ARGUMENTS` para modelar el dominio."
