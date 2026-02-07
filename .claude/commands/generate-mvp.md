---
name: project:mvp
description: Genera MVP completo desde SPEC.md existente orquestando todos los agentes
allowed-tools: Task, Read, Write, Bash, Glob, Grep, TodoWrite
---

# Comando: Generar MVP

Genera un MVP completo y funcional a partir de una especificación SPEC.md existente.

## Uso

```
/project:mvp <nombre-proyecto>
```

## Pre-requisitos

1. Debe existir `.claude/specs/$ARGUMENTS.md`
2. Si no existe, indicar al usuario que ejecute primero `/project:interview <nombre>`
3. **Design Gate**: Verificar que `.claude/designs/$ARGUMENTS/VALIDATION-CHECKLIST.md` existe
   y todos los items estan marcados como completados. Si no existe o tiene items pendientes,
   indicar al usuario que ejecute `/design:full $ARGUMENTS` antes de generar codigo.
   El diseno previo asegura que la arquitectura, dominio y flujos estan validados.

## Workflow de Ejecución

### Fase 1: Validación

```markdown
1. Leer SPEC desde `.claude/specs/$ARGUMENTS.md`
2. Validar secciones requeridas:
   - [ ] Resumen Ejecutivo
   - [ ] Declaración del Problema
   - [ ] Usuarios Objetivo
   - [ ] Requisitos Funcionales (mínimo 3 features)
   - [ ] Arquitectura Técnica
   - [ ] Especificaciones UI/UX
3. Si falta alguna sección → Solicitar completar la entrevista
```

### Fase 2: Foundation (Paralelo)

Lanzar en paralelo usando Task tool:

```
Task(subagent_type="general-purpose", prompt="Lee el agente en .claude/agents/01-project-setup/AGENT.md y ejecuta sus responsabilidades para el proyecto $ARGUMENTS basado en .claude/specs/$ARGUMENTS.md", run_in_background=true)

Task(subagent_type="general-purpose", prompt="Lee el agente en .claude/agents/02-git-cicd/AGENT.md y ejecuta sus responsabilidades para el proyecto $ARGUMENTS", run_in_background=true)
```

Esperar a que ambos completen antes de continuar.

### Fase 3: Architecture (Secuencial)

```
Task(subagent_type="general-purpose", prompt="Lee el agente en .claude/agents/03-architecture/AGENT.md y diseña la arquitectura basada en .claude/specs/$ARGUMENTS.md. Presenta la arquitectura para aprobación.")
```

- Presentar arquitectura al usuario
- Si no aprueba, iterar con feedback

### Fase 4: Implementation (Paralelo)

```
Task(subagent_type="general-purpose", prompt="Lee el agente en .claude/agents/04-ui-ux/AGENT.md e implementa las interfaces definidas en .claude/specs/$ARGUMENTS.md. Invoca /ux-expert si necesitas decisiones de diseño.", run_in_background=true)

Task(subagent_type="testing-engineer", prompt="Lee el agente en .claude/agents/05-testing/AGENT.md y escribe tests TDD para las features en .claude/specs/$ARGUMENTS.md", run_in_background=true)
```

### Fase 5: Polish (Paralelo)

```
Task(subagent_type="general-purpose", prompt="Lee el agente en .claude/agents/06-documentation/AGENT.md y genera documentación para el proyecto $ARGUMENTS", run_in_background=true)

Task(subagent_type="general-purpose", prompt="Lee el agente en .claude/agents/07-deployment/AGENT.md y configura deployment para el proyecto $ARGUMENTS", run_in_background=true)
```

### Fase 6: Delivery (Secuencial)

1. Ejecutar suite completa de tests
2. Verificar que todos los tests pasen
3. Si hay fallos, iterar hasta corregir
4. Crear commit siguiendo Conventional Commits
5. Crear PR con resumen del MVP

## Criterios de Éxito

El MVP está completo cuando:

- [ ] Estructura de proyecto creada
- [ ] CI/CD configurado y funcionando
- [ ] Arquitectura implementada según spec
- [ ] UI funcional para features core
- [ ] Tests con cobertura >= 80%
- [ ] Documentación generada (README, API)
- [ ] Deployment configurado
- [ ] Todos los tests pasan
- [ ] PR creado y listo para review

## Output Esperado

Al finalizar, mostrar resumen:

```markdown
## MVP Generado: $ARGUMENTS

### Archivos Creados
- [Lista de archivos principales]

### Tests
- Unitarios: X pasando
- Integración: X pasando
- Cobertura: XX%

### Documentación
- README.md ✓
- API docs ✓
- ADRs ✓

### Deployment
- Dockerfile ✓
- CI/CD ✓
- Vercel config ✓

### Próximos Pasos
1. Revisar PR: [URL]
2. Configurar variables de entorno en producción
3. [Otras acciones necesarias]
```

## Manejo de Errores

Si algún agente falla:

1. Registrar el error específico
2. Intentar reiniciar (máximo 2 intentos)
3. Si persiste, notificar al usuario con opciones:
   - Reintentar agente específico
   - Saltar al siguiente agente
   - Abortar generación

## Ejemplo de Uso

```
> /project:mvp task-manager

Verificando SPEC en .claude/specs/task-manager.md... ✓

Iniciando generación de MVP...

[Fase 1/6] Validación ✓
[Fase 2/6] Foundation (setup + git) ✓
[Fase 3/6] Architecture...
  → Arquitectura diseñada
  → Esperando aprobación...

¿Aprobar arquitectura propuesta?
```
