---
name: design:domain
description: Genera modelo de dominio DDD (bounded contexts, agregados, glosario) y diagrama de clases
allowed-tools: Task, Read, Write, Glob, Grep, WebSearch, AskUserQuestion
---

# Comando: Design Domain

Modela el dominio del proyecto usando principios DDD.

## Uso

```
/design:domain <nombre-proyecto>
```

## Pre-requisitos

1. Debe existir `.claude/specs/$ARGUMENTS.md`
2. Debe existir `.claude/designs/$ARGUMENTS/c4/containers.mmd`
3. Si falta el C4, indicar al usuario que ejecute primero `/design:architecture $ARGUMENTS`

## Ejecucion

1. Leer las instrucciones del agente en `.claude/agents/00-domain-modeler.md`
2. Leer la SPEC y los diagramas C4 existentes
3. Crear directorio `.claude/designs/$ARGUMENTS/domain/` y `.claude/designs/$ARGUMENTS/uml/`
4. Ejecutar el workflow del agente 00-domain-modeler paso a paso:
   - Paso 1: Analizar SPEC + C4
   - Paso 2: Definir bounded contexts
   - Paso 3: Identificar agregados, entidades, value objects
   - Paso 4: Compilar glosario de lenguaje ubicuo
   - Paso 5: Generar diagrama de clases UML

## Output Esperado

```
.claude/designs/$ARGUMENTS/
  domain/
    bounded-contexts.md
    aggregates.md
    ubiquitous-lang.md
  uml/
    class-diagram.mmd
```

## Siguiente Paso

Al completar, sugerir: "Ejecuta `/design:flows $ARGUMENTS` para disenar los flujos de usuario."
