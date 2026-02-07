# Reporte de Integración

> Sesión: {FECHA} Duración: {X}h {Y}min

---

## Resumen

| Métrica              | Valor |
| -------------------- | ----- |
| Tareas integradas    | {X}   |
| Conflictos resueltos | {Y}   |
| Tests ejecutados     | {Z}   |
| Tests pasados        | {W}   |

---

## Tareas Mergeadas

| Orden | Tarea | Branch    | Commits | Tests |
| ----- | ----- | --------- | ------- | ----- |
| 1     | T001  | task/T001 | 3       | ✅    |
| 2     | T002  | task/T002 | 5       | ✅    |
| 3     | T003  | task/T003 | 4       | ✅    |

---

## Conflictos

| Tarea   | Archivo   | Resolución         |
| ------- | --------- | ------------------ |
| {Tarea} | {archivo} | {cómo se resolvió} |

---

## Commits en Main

```
{hash} feat: merge T001 - {descripción}
{hash} feat: merge T002 - {descripción}
{hash} feat: merge T003 - {descripción}
```

---

## Archivos Modificados

- `src/path/file1.ts` (T001, T002)
- `src/path/file2.ts` (T003)

---

## Tests de Integración

```
PASS  tests/unit.test.ts ({X} tests)
PASS  tests/integration.test.ts ({Y} tests)

Total: {Z} tests, {W} passed
Coverage: {X}%
```

---

## Worktrees Limpiados

- [x] trees/T001
- [x] trees/T002
- [x] trees/T003

---

## Notas

- {Observaciones relevantes}

---

_Generado por /swarm:integrate_ _Fecha: {FECHA}_
