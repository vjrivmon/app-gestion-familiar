---
id: T000
title: "<Título de Tarea>"
story: H000  # Historia de usuario asociada
points: 0  # 0|1|2|3|5|8|13|21|100 (Fibonacci)
status: todo  # todo|in-progress|review|done|blocked
assignee: ""  # Nombre del agente asignado
branch: feature/task-name
worktree: ""  # Path al worktree si aplica
created: YYYY-MM-DD
started: ""
completed: ""
---

# T000 - <Título de Tarea> - (POINTS pts)

## Historia de Usuario Relacionada

> H000 - <Título de Historia>

## Descripción

<Breve descripción de lo que hay que hacer en esta tarea específica>

## Checklist de Validación

> Cada item debe ser verificable de forma binaria (pasa/no pasa)

- [ ] Si `<acción>`, comprobar que `<resultado>`
- [ ] Si `<acción>`, comprobar que `<resultado>`
- [ ] Si `<acción>`, comprobar que `<resultado>`

## Archivos a Modificar

```
src/
├── components/
│   └── ComponenteNuevo.tsx  # CREAR
├── hooks/
│   └── useCustomHook.ts     # MODIFICAR
└── lib/
    └── utils.ts             # MODIFICAR (función X)
```

## Tests Requeridos

### Unit Tests
- [ ] Test para función X con input válido
- [ ] Test para función X con input inválido
- [ ] Test para edge case Y

### Integration Tests
- [ ] Test de integración entre A y B

### E2E Tests (si aplica)
- [ ] Test de flujo completo Z

## Definición de "Hecho"

Esta tarea está completa cuando:

1. ✅ Todos los items del checklist están marcados
2. ✅ Todos los tests pasan (`bun run test`)
3. ✅ Sin errores de tipos (`bun run typecheck`)
4. ✅ Sin warnings de linter (`bun run lint`)
5. ✅ Code coverage > 80% para código nuevo
6. ✅ Documentación actualizada (si aplica)
7. ✅ Commit creado con mensaje descriptivo

## Agente Asignado

| Propiedad | Valor |
|-----------|-------|
| Nombre | `<agent-name>` |
| SKILL.md | `.claude/agents/<agent>/SKILL.md` |
| Comando | `/agent:<command>` |
| Modelo | Sonnet 4 / Opus 4.5 |

## Notas de Implementación

### Approach Recomendado
1. <Primer paso>
2. <Segundo paso>
3. <Tercer paso>

### Patrones a Usar
- <Patrón de diseño sugerido>
- <Convención del proyecto>

### Dependencias Externas
- <Librería X versión Y>

## Blockers

| Blocker | Estado | Resolución |
|---------|--------|------------|
| <Descripción> | pendiente | <Acción> |

## Logs de Progreso

> El agente debe actualizar esta sección durante la ejecución

### Iteración 1 - YYYY-MM-DD HH:MM
- Acción: <lo que se hizo>
- Resultado: <éxito/fallo>
- Siguiente: <próximo paso>

---

## Para Ralph Loop

Si esta tarea se ejecuta con Ralph Loop, el prompt inicial es:

```markdown
# 🎯 TAREA ACTIVA: T000

## Objetivo
<Descripción de la tarea>

## Checklist
[Copiar checklist de arriba]

## Instrucciones
1. Verificar estado actual
2. Identificar siguiente item del checklist
3. Implementar
4. Verificar con tests
5. Si todo completo: `rm .claude/ralph-active && touch .claude/COMPLETE`

## Safety
- Máximo 30 iteraciones
- Pausar si mismo error 3+ veces
```
