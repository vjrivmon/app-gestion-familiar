---
name: design:flows
description: Genera user flows, diagramas de secuencia, casos de uso y analisis de edge cases
allowed-tools: Task, Read, Write, Glob, Grep, AskUserQuestion
---

# Comando: Design Flows

Disena los flujos de usuario, diagramas de secuencia y analiza edge cases.

## Uso

```
/design:flows <nombre-proyecto>
```

## Pre-requisitos

1. Debe existir `.claude/specs/$ARGUMENTS.md`
2. Debe existir `.claude/designs/$ARGUMENTS/c4/containers.mmd`
3. Recomendado: `.claude/designs/$ARGUMENTS/domain/aggregates.md`
4. Si falta el C4, indicar que ejecute `/design:architecture $ARGUMENTS` primero

## Ejecucion

1. Leer las instrucciones del agente en `.claude/agents/00-flow-designer.md`
2. Leer SPEC, C4 y modelo de dominio (si existe)
3. Crear directorios `.claude/designs/$ARGUMENTS/flows/` y `.claude/designs/$ARGUMENTS/uml/`
4. Ejecutar el workflow del agente 00-flow-designer paso a paso:
   - Paso 1: Identificar flujos criticos (preguntar al usuario)
   - Paso 2: Generar flowcharts por flujo
   - Paso 3: Aplicar 5 preguntas edge case por flujo
   - Paso 4: Diagramas de secuencia para flujos multi-sistema
   - Paso 5: Diagrama de casos de uso agregado

## Output Esperado

```
.claude/designs/$ARGUMENTS/
  flows/
    user-flow-{nombre}.mmd (uno por flujo)
    edge-cases.md
  uml/
    use-cases.mmd
    sequence-{nombre}.mmd (uno por flujo multi-sistema)
```

## Siguiente Paso

Al completar, sugerir: "Ejecuta `/design:validate $ARGUMENTS` para verificar completitud."
