---
id: T{XXX}
story: H{YYY}
title: { Título descriptivo }
status: pending
parallelizable: true|false
depends_on: []
blocks: []
interfaces:
  - name: { NombreInterface }
    file: src/path/to/file.ts
owner: null
worktree: null
created_at: { timestamp }
---

# Tarea: {Título}

## Historia Padre

[H{YYY} - {Nombre}](../stories/H{YYY}.md)

## Descripción

{Descripción clara de qué hacer}

## Archivos a Crear/Modificar

### Crear

- `src/path/to/new-file.ts` - {descripción}

### Modificar

- `src/path/to/existing.ts` - {qué cambiar}

## Pasos de Implementación

1. [ ] {Paso 1}
2. [ ] {Paso 2}
3. [ ] {Paso 3}

## Criterios de Completitud

- [ ] Código implementado
- [ ] Sin errores TypeScript
- [ ] Sin errores ESLint
- [ ] Tests escritos (si aplica)

## Interfaces/Contratos

```typescript
// Interfaces compartidas que usa esta tarea
interface {Nombre} {
  {campo}: {tipo};
}
```

## Comandos de Verificación

```bash
npm run typecheck
npm run lint
npm run test -- --grep "{feature}"
```

## Notas

- {Consideraciones especiales}

---

_Template: TASK-PARALLEL.md_
