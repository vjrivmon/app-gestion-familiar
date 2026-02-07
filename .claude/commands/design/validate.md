---
name: design:validate
description: Valida completitud de los artefactos de diseno contra el checklist
allowed-tools: Read, Write, Glob, Grep
---

# Comando: Design Validate

Recorre los artefactos de diseno y genera un informe de completitud. No genera artefactos nuevos.

## Uso

```
/design:validate <nombre-proyecto>
```

## Pre-requisitos

1. Debe existir `.claude/designs/$ARGUMENTS/` con al menos algunos artefactos

## Ejecucion

### 1. Leer template de checklist

Leer `.claude/templates/design/validation-checklist.md` como base.

### 2. Verificar existencia de artefactos

```
Verificar cada archivo:
- [ ] designs/{proyecto}/c4/context.mmd
- [ ] designs/{proyecto}/c4/containers.mmd
- [ ] designs/{proyecto}/c4/components.mmd (opcional, notar si no existe y por que)
- [ ] designs/{proyecto}/uml/use-cases.mmd
- [ ] designs/{proyecto}/uml/sequence-*.mmd (al menos 1)
- [ ] designs/{proyecto}/uml/class-diagram.mmd
- [ ] designs/{proyecto}/flows/user-flow-*.mmd (al menos 1)
- [ ] designs/{proyecto}/flows/edge-cases.md
- [ ] designs/{proyecto}/domain/bounded-contexts.md
- [ ] designs/{proyecto}/domain/aggregates.md
- [ ] designs/{proyecto}/domain/ubiquitous-lang.md
- [ ] designs/{proyecto}/decisions/ADR-*.md (al menos 1)
- [ ] designs/{proyecto}/DESIGN-SUMMARY.md
```

### 3. Verificar contenido minimo

Para cada archivo que existe, verificar:
- **C4 Context**: Contiene al menos 1 Person y 1 System
- **C4 Containers**: Contiene al menos 2 Container
- **Use Cases**: Contiene al menos 1 actor y 2 use cases
- **Class Diagram**: Contiene al menos 2 clases
- **User Flows**: Contiene nodos de decision (ramas)
- **Edge Cases**: Tiene las 5 preguntas respondidas por flujo
- **Bounded Contexts**: Al menos 1 contexto definido
- **Aggregates**: Al menos 1 agregado con entidades
- **Ubiquitous Language**: Al menos 10 terminos
- **ADRs**: Tienen seccion de alternativas

### 4. Verificar consistencia de nombres

Comparar nombres entre:
- Glosario (ubiquitous-lang.md) vs diagrama de clases
- C4 containers vs bounded contexts
- User flows vs use cases

Reportar inconsistencias.

### 5. Generar VALIDATION-CHECKLIST.md

Escribir resultado en `.claude/designs/$ARGUMENTS/VALIDATION-CHECKLIST.md` usando el template pero con los checkboxes marcados/desmarcados segun la verificacion.

### 6. Reportar resultado

Mostrar resumen al usuario:
- Items completados: X/Y
- Items faltantes: [lista]
- Inconsistencias encontradas: [lista]
- **Veredicto**: "Listo para codigo" o "Requiere iteracion en: [areas]"

## Output

```
.claude/designs/$ARGUMENTS/
  VALIDATION-CHECKLIST.md  # Checklist rellenado con estado real
```

## Nota

Este comando NO genera artefactos nuevos. Solo verifica y reporta. Si hay items faltantes, sugerir el comando `/design:*` correspondiente.
