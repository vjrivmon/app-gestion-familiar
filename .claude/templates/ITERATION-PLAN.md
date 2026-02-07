# Plan de Iteración: {FASE}

> Generado: {FECHA} Estado: {planning|in_progress|completed}

---

## Objetivo

{Descripción del objetivo de esta iteración}

---

## Historias Generadas

| ID   | Título   | Prioridad | Tareas |
| ---- | -------- | --------- | ------ |
| H001 | {Título} | Critical  | 3      |
| H002 | {Título} | High      | 4      |

---

## Tareas y Dependencias

### Grafo

```
T001 (setup)
├── T002 ──┐
├── T003 ──┼── T004
└── T005 ──┘
```

### Por Nivel

| Nivel | Tareas     | Paralelo |
| ----- | ---------- | -------- |
| 0     | T001       | No       |
| 1     | T002, T003 | Sí       |
| 2     | T004       | No       |

---

## Contratos Compartidos

```typescript
// .claude/contracts/{nombre}.ts
export interface {Nombre} {
  {campo}: {tipo};
}
```

---

## Ejecución

```bash
/swarm:launch {N}
/swarm:status
/swarm:integrate
```

---

_Generado por /scale:iteration_
