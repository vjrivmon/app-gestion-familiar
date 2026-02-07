# /tasks:parallel - División en Tareas Paralelas

Divide una historia en tareas que pueden ejecutarse en paralelo con dependencias
explícitas.

## Uso

```
/tasks:parallel <historia>
/tasks:parallel H001
/tasks:parallel .claude/stories/H001-setup-inicial.md
```

## Instrucciones para Claude

Cuando el usuario ejecute `/tasks:parallel <historia>`:

### 1. Leer Historia

```bash
cat .claude/stories/<historia>.md
```

Extrae:

- Criterios de aceptación
- Notas técnicas
- Dependencias
- Estimación de complejidad

### 2. Identificar Subtareas

Descompone la historia en tareas atómicas:

**Reglas de descomposición**:

1. Cada tarea debe ser completable en < 2 horas
2. Cada tarea debe tener un entregable verificable
3. Cada tarea debe poder asignarse a un único agente
4. Minimizar dependencias entre tareas

**Categorías típicas**:

- **Setup**: Configuración inicial, dependencias
- **Types**: Definición de interfaces y tipos
- **API**: Endpoints, rutas, handlers
- **UI**: Componentes, páginas, estilos
- **Logic**: Servicios, hooks, utilidades
- **Tests**: Unit tests, integration tests
- **Docs**: Documentación, comentarios

### 3. Detectar Interfaces Compartidas

Antes de paralelizar, identifica los "contratos":

```typescript
// Ejemplo: Si T002 y T003 se ejecutan en paralelo,
// ambas pueden depender de los mismos tipos

// .claude/contracts/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserService {
  getUser(id: string): Promise<User>;
  createUser(data: CreateUserDTO): Promise<User>;
}
```

### 4. Generar Tareas

Para cada tarea, usa el template:

```markdown
---
id: T<XXX>
story: H<YYY>
title: <Título descriptivo>
status: pending
parallelizable: true|false
depends_on: [T<ZZZ>]
blocks: [T<WWW>]
interfaces:
  - name: <NombreInterface>
    file: src/path/to/file.ts
    contract: |
      interface Example {
        method(): ReturnType;
      }
owner: null
worktree: null
created_at: <timestamp>
---

# Tarea: <Título>

## Historia Padre

[H<YYY> - Nombre de historia](../stories/H<YYY>.md)

## Descripción

<Descripción clara y concisa de qué hacer>

## Archivos a Crear/Modificar

### Crear

- `src/path/to/new-file.ts` - <descripción>

### Modificar

- `src/path/to/existing.ts` - <qué cambiar>

## Pasos de Implementación

1. [ ] <Paso 1>
2. [ ] <Paso 2>
3. [ ] <Paso 3>

## Criterios de Completitud

- [ ] Código implementado según especificación
- [ ] Sin errores de TypeScript
- [ ] Sin errores de ESLint
- [ ] Tests unitarios escritos (si aplica)
- [ ] Funcionalidad verificada manualmente

## Interfaces/Contratos

Esta tarea usa las siguientes interfaces compartidas:

\`\`\`typescript // src/types/user.ts interface User { id: string; email:
string; } \`\`\`

## Notas

- <Consideraciones especiales>
- <Posibles problemas>

## Comandos de Verificación

\`\`\`bash

# Compilación

npm run typecheck

# Lint

npm run lint

# Tests

npm run test -- --grep "nombre-feature" \`\`\`
```

### 5. Definir Grafo de Dependencias

Analiza qué tareas pueden ejecutarse en paralelo:

```
Nivel 0 (sin dependencias):
  T001 - Setup proyecto

Nivel 1 (depende de T001):
  T002 - Definir tipos [paralelo con T003]
  T003 - Configurar DB [paralelo con T002]

Nivel 2 (depende de T002 Y T003):
  T004 - Implementar servicio

Nivel 3 (depende de T004):
  T005 - Crear endpoints API [paralelo con T006]
  T006 - Crear componentes UI [paralelo con T005]

Nivel 4 (depende de T005 Y T006):
  T007 - Tests de integración
```

### 6. Crear Contratos Compartidos

Si hay interfaces compartidas, crea:

`.claude/contracts/<nombre>.ts`:

```typescript
/**
 * Contrato compartido para tareas paralelas
 * NO MODIFICAR sin coordinar con otras tareas
 *
 * Usado por: T002, T003, T004
 */

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(data: Omit<User, "id" | "createdAt">): Promise<User>;
}
```

### 7. Guardar Tareas

Crea archivos en `.claude/tasks/`:

```
.claude/tasks/
├── T001-setup-proyecto.md
├── T002-definir-tipos.md
├── T003-configurar-db.md
├── T004-implementar-servicio.md
├── T005-crear-api.md
├── T006-crear-ui.md
├── T007-tests-integracion.md
└── TASKS-INDEX.md
```

### 8. Generar Índice de Tareas

`.claude/tasks/TASKS-INDEX.md`:

```markdown
# Índice de Tareas

## Historia: H001 - <Nombre>

### Resumen

- Total tareas: 7
- Parallelizables: 4
- Secuenciales: 3

### Por Nivel de Ejecución

| Nivel | Tareas     | Paralelo |
| ----- | ---------- | -------- |
| 0     | T001       | No       |
| 1     | T002, T003 | Sí       |
| 2     | T004       | No       |
| 3     | T005, T006 | Sí       |
| 4     | T007       | No       |

### Grafo Visual

\`\`\` T001 ├── T002 ──┐ │ ├── T004 ──┬── T005 ──┐ ├── T003 ──┘ │ ├── T007 └──
T006 ──┘ \`\`\`

### Contratos Compartidos

- `.claude/contracts/user.ts` (T002, T003, T004)

## Comandos

Lanzar 4 agentes paralelos: \`\`\` /swarm:launch 4 \`\`\`

Ver grafo completo: \`\`\` /tasks:graph \`\`\`
```

### 9. Output al Usuario

```
═══════════════════════════════════════
  TAREAS GENERADAS
═══════════════════════════════════════

Historia: H001 - Setup inicial
Tareas creadas: 7

ORDEN DE EJECUCIÓN:
  Nivel 0: T001 (secuencial)
  Nivel 1: T002, T003 (paralelo)
  Nivel 2: T004 (secuencial)
  Nivel 3: T005, T006 (paralelo)
  Nivel 4: T007 (secuencial)

CONTRATOS CREADOS:
  .claude/contracts/user.ts

MÁXIMO PARALELO: 2 agentes simultáneos

Siguiente paso:
  /swarm:launch 2
  o
  /tasks:graph (ver dependencias)
═══════════════════════════════════════
```

## Output Esperado

1. Tareas en `.claude/tasks/T<XXX>-<nombre>.md`
2. Contratos en `.claude/contracts/`
3. Índice en `.claude/tasks/TASKS-INDEX.md`
4. Resumen con orden de ejecución
