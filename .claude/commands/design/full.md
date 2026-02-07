---
name: design:full
description: Ejecuta el flujo completo de diseno (C4 + DDD + Flows + Validacion)
allowed-tools: Task, Read, Write, Glob, Grep, WebSearch, WebFetch, AskUserQuestion
---

# Comando: Design Full

Orquesta el flujo completo de Phase 0: Design. Ejecuta los 4 pasos de diseno en orden, con validacion del usuario entre cada paso.

## Uso

```
/design:full <nombre-proyecto>
```

## Pre-requisitos

1. Debe existir `.claude/specs/$ARGUMENTS.md`
2. Si no existe, indicar al usuario que ejecute primero `/project:interview $ARGUMENTS`

## Flujo de Ejecucion

```
SPEC.md
   |
   v
[1] /design:architecture  -->  C4 diagrams + ADRs
   |
   v (usuario valida)
[2] /design:domain         -->  DDD model + class diagram
   |
   v (usuario valida)
[3] /design:flows          -->  User flows + sequences + edge cases
   |
   v (usuario valida)
[4] /design:validate       -->  Validation checklist
   |
   v
DESIGN-SUMMARY.md (final)
```

## Ejecucion Detallada

### Paso 1: Architecture (C4 + ADRs)

1. Crear directorio base: `.claude/designs/$ARGUMENTS/`
2. Leer instrucciones de `.claude/agents/00-design-architect.md`
3. Ejecutar workflow completo del architect:
   - Generar C4 Level 1 (Context) -> **Preguntar al usuario**
   - Generar C4 Level 2 (Containers) -> **Preguntar decisiones tecnologicas**
   - Generar ADRs
   - Generar C4 Level 3 si necesario
4. **PAUSA**: Mostrar resumen de C4 + ADRs al usuario
5. Esperar confirmacion antes de continuar

### Paso 2: Domain (DDD)

1. Leer instrucciones de `.claude/agents/00-domain-modeler.md`
2. Usar SPEC + C4 como input
3. Ejecutar workflow del domain modeler:
   - Definir bounded contexts
   - Identificar agregados y entidades
   - Compilar glosario
   - Generar diagrama de clases
4. **PAUSA**: Mostrar modelo de dominio al usuario
5. Esperar confirmacion antes de continuar

### Paso 3: Flows (User Flows + Sequences)

1. Leer instrucciones de `.claude/agents/00-flow-designer.md`
2. Usar SPEC + C4 + Domain como input
3. Ejecutar workflow del flow designer:
   - Identificar flujos criticos -> **Preguntar al usuario**
   - Generar flowcharts
   - Aplicar 5 preguntas edge case
   - Generar diagramas de secuencia
   - Generar use case diagram
4. **PAUSA**: Mostrar flujos y edge cases al usuario
5. Esperar confirmacion antes de continuar

### Paso 4: Validate

1. Recorrer todos los artefactos generados
2. Aplicar checklist de validacion
3. Generar `VALIDATION-CHECKLIST.md`
4. Mostrar resultado al usuario

### Paso 5: Design Summary Final

Generar/actualizar `.claude/designs/$ARGUMENTS/DESIGN-SUMMARY.md` con:

```markdown
# Design Summary: $ARGUMENTS

## Resumen Ejecutivo
[1-2 parrafos describiendo el sistema]

## Artefactos de Diseno

### C4 Architecture
- [Context Diagram](c4/context.mmd)
- [Container Diagram](c4/containers.mmd)
- [Component Diagram](c4/components.mmd) (si existe)

### Domain Model
- [Bounded Contexts](domain/bounded-contexts.md)
- [Aggregates](domain/aggregates.md)
- [Ubiquitous Language](domain/ubiquitous-lang.md)
- [Class Diagram](uml/class-diagram.mmd)

### User Flows
- [User Flow: {nombre}](flows/user-flow-{nombre}.mmd)
- [Edge Cases](flows/edge-cases.md)

### UML Diagrams
- [Use Cases](uml/use-cases.mmd)
- [Sequence: {nombre}](uml/sequence-{nombre}.mmd)

### Decisions
- [ADR-001: {titulo}](decisions/ADR-001-{titulo}.md)

### Validation
- [Validation Checklist](VALIDATION-CHECKLIST.md)

## Decisiones Clave
1. [Decision 1 resumida]
2. [Decision 2 resumida]

## Siguiente Paso
Ejecutar `/project:mvp $ARGUMENTS` para generar el codigo.
```

## Notas

- Cada paso es **iterativo**: si el usuario da feedback, incorporar y regenerar
- Si el usuario quiere saltar un paso, permitirlo pero notar en VALIDATION-CHECKLIST.md
- El flujo completo puede tomar varias interacciones; mantener contexto entre pasos
- Referirse a `.claude/DESIGN-FIRST-GUIDE.md` para buenas practicas
