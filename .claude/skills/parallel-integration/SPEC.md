# Parallel Development & Integration Principles

> 30 principios organizados en 5 categorías para desarrollo paralelo efectivo

---

## 1. Task Decomposition (6 principios)

### 1.1 Principio de Vertical Slicing

**Descripción**: Dividir trabajo en slices verticales completos (UI + API + DB)
en lugar de capas horizontales.

**Vertical (BIEN)**:

```
Tarea A: Feature Login completo
  - UI de login
  - API endpoint
  - DB schema para sessions

Tarea B: Feature Profile completo
  - UI de profile
  - API endpoints
  - DB schema para profile
```

**Horizontal (MAL)**:

```
Tarea A: Todos los endpoints
Tarea B: Toda la UI
Tarea C: Todo el DB schema
```

**Beneficio**: Menos dependencias, integración más fácil.

---

### 1.2 Principio de Interface First

**Descripción**: Definir interfaces/contratos ANTES de paralelizar trabajo.

**Proceso**:

1. Definir tipos TypeScript compartidos
2. Definir API contracts (OpenAPI)
3. Crear mocks para desarrollo
4. Desarrollar en paralelo contra contratos
5. Integrar al final

**Ejemplo**:

```typescript
// types/user.ts (definido ANTES de dividir)
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}
```

---

### 1.3 Principio de Dependency Mapping

**Descripción**: Visualizar dependencias entre tareas antes de asignar.

**Grafo de dependencias**:

```
T1 (Auth)
   ↓
T2 (User CRUD) ←── T3 (Profile UI)
   ↓
T4 (Permissions)
   ↓
T5 (Admin Panel)
```

**Regla**: Tareas sin dependencias pueden ejecutarse en paralelo.

---

### 1.4 Principio de Shared Code Identification

**Descripción**: Identificar código que será modificado por múltiples tareas.

**Código de alto conflicto**:

- package.json (dependencies)
- Archivos de configuración
- Tipos compartidos
- Rutas/router principal
- Schema de base de datos

**Estrategia**: Resolver estos primero o asignar a un solo agente.

---

### 1.5 Principio de Task Sizing

**Descripción**: Tareas paralelas deben tener tamaño similar para evitar cuellos
de botella.

**Tamaños recomendados**:

- 2-4 horas de trabajo por tarea
- Máximo 1 día por tarea
- Si es más grande, subdividir

**Anti-patrón**: Una tarea de 1 día, otra de 1 hora.

---

### 1.6 Principio de Completion Criteria

**Descripción**: Cada tarea tiene criterios claros de completitud.

**Template**:

```markdown
## Criterios de Completitud

- [ ] Feature funciona según spec
- [ ] Tests unitarios pasando
- [ ] No hay errores de TypeScript
- [ ] Código formateado (lint)
- [ ] Documentación actualizada
```

---

## 2. Branching Strategy (6 principios)

### 2.1 Principio de Feature Branches

**Descripción**: Cada tarea en su propia branch aislada.

**Nomenclatura**:

```
task/T001-auth-login
task/T002-user-profile
task/T003-settings-page
```

---

### 2.2 Principio de Git Worktrees

**Descripción**: Usar worktrees para desarrollo paralelo sin cambiar de branch.

**Setup**:

```bash
# Crear worktree para cada tarea
git worktree add ../T001 task/T001-auth-login
git worktree add ../T002 task/T002-user-profile

# Cada agente trabaja en su directorio
cd ../T001 && # agente 1 trabaja aquí
cd ../T002 && # agente 2 trabaja aquí
```

**Beneficio**: Cambio de contexto instantáneo.

---

### 2.3 Principio de Frequent Rebasing

**Descripción**: Rebasar frecuentemente contra main para reducir divergencia.

**Frecuencia recomendada**:

- Al menos 1 vez al día
- Antes de abrir PR
- Después de grandes merges a main

**Comando**:

```bash
git fetch origin main
git rebase origin/main
```

---

### 2.4 Principio de Atomic Commits

**Descripción**: Commits pequeños y atómicos que hacen una sola cosa.

**BIEN**:

```
feat(auth): add login form component
feat(auth): add login API endpoint
feat(auth): add session storage
test(auth): add login flow tests
```

**MAL**:

```
WIP
fix stuff
final changes
actually final
```

---

### 2.5 Principio de Protected Main

**Descripción**: Main siempre debe estar en estado deployable.

**Protecciones**:

- Require PRs (no direct push)
- Require passing CI
- Require review
- Require up-to-date branch

---

### 2.6 Principio de Short-lived Branches

**Descripción**: Branches deben vivir máximo 2-3 días.

**Si branch vive mucho**:

- Merge conflicts crecen
- Context switch más difícil
- Integration más riesgosa

**Solución**: Dividir en tareas más pequeñas.

---

## 3. Conflict Resolution (6 principios)

### 3.1 Principio de Early Detection

**Descripción**: Detectar conflictos potenciales antes de que ocurran.

**Técnicas**:

- CI check: "Esta PR conflictúa con estas otras PRs"
- Daily sync: Revisar qué archivos tocan otros
- Shared file alerts: Notificar si dos tareas tocan mismo archivo

---

### 3.2 Principio de Merge Order

**Descripción**: El orden de merge importa. Menor conflicto primero.

**Algoritmo**:

1. Ordenar PRs por dependencias
2. PRs sin dependencias primero
3. Dentro de cada nivel, menor cambios primero
4. Después de cada merge, los demás rebase

---

### 3.3 Principio de Conflict Ownership

**Descripción**: Quien crea el conflicto lo resuelve.

**Regla**:

- PR A se mergea primero (clean)
- PR B ahora tiene conflictos
- Autor de PR B resuelve conflictos
- PR B se mergea

---

### 3.4 Principio de Semantic Conflicts

**Descripción**: No todos los conflictos son de texto. Algunos son semánticos.

**Ejemplo semántico**:

```typescript
// PR A: Añade función
export function getUser(id: string) { ... }

// PR B: También añade función con mismo nombre pero diferente firma
export function getUser(id: number) { ... }

// Git no detecta conflicto pero el código rompe
```

**Solución**: Tests de integración post-merge.

---

### 3.5 Principio de Conflict-Free Zones

**Descripción**: Diseñar arquitectura que minimiza conflictos.

**Técnicas**:

- Feature flags en lugar de modificar código existente
- Plugin architecture
- Archivos separados por feature
- Barrel exports (index.ts) al final

---

### 3.6 Principio de Automated Resolution

**Descripción**: Automatizar resolución de conflictos triviales.

**Conflictos auto-resolubles**:

- package.json: merge dependencies
- Changelog: concatenar entradas
- Index exports: añadir ambos exports

**Herramienta**: Scripts custom o git merge drivers.

---

## 4. Integration Process (6 principios)

### 4.1 Principio de Continuous Integration

**Descripción**: Integrar frecuentemente, no al final.

**Frecuencia**:

- Al menos 1 vez al día
- Cada feature completo
- Antes de empezar feature dependiente

---

### 4.2 Principio de Integration Tests

**Descripción**: Tests que verifican que componentes trabajan juntos.

**Niveles**:

```
Unit Tests (por tarea)
    ↓
Integration Tests (post-merge)
    ↓
E2E Tests (sistema completo)
```

---

### 4.3 Principio de Staged Rollout

**Descripción**: Integrar incrementalmente, no todo de golpe.

**Proceso**:

1. Merge PR A → Run tests → All green
2. Merge PR B → Run tests → All green
3. Merge PR C → Run tests → Failure → Revert PR C

---

### 4.4 Principio de Feature Flags

**Descripción**: Merge código sin activar funcionalidad.

**Implementación**:

```typescript
if (featureFlags.newAuthFlow) {
  return <NewLoginForm />;
}
return <OldLoginForm />;
```

**Beneficio**: Merge safely, activar cuando listo.

---

### 4.5 Principio de Smoke Tests

**Descripción**: Tests rápidos que verifican que nada crítico rompió.

**Smoke test suite**:

- App arranca
- Login funciona
- Homepage carga
- APIs principales responden

**Duración**: < 2 minutos.

---

### 4.6 Principio de Rollback Ready

**Descripción**: Siempre poder revertir un merge problemático.

**Preparación**:

- Commits atómicos (fácil revert)
- Feature flags para disable
- DB migrations reversibles
- Runbook de rollback

---

## 5. Coordination (6 principios)

### 5.1 Principio de Single Source of Truth

**Descripción**: Un lugar centralizado para estado de todas las tareas.

**Información a centralizar**:

- Estado de cada tarea (pending, in_progress, complete)
- Archivos que toca cada tarea
- Dependencias entre tareas
- Conflictos detectados

---

### 5.2 Principio de Async Communication

**Descripción**: Comunicación asíncrona para no bloquear trabajo.

**Canales**:

- PR comments para discusión de código
- Commits con mensajes claros
- Archivos NOTES.md para contexto
- Status updates automatizados

---

### 5.3 Principio de Sync Points

**Descripción**: Puntos de sincronización definidos.

**Sync points típicos**:

- Al completar interface definitions
- Antes de integration merge
- Cuando hay blocking issue
- Al final de cada día

---

### 5.4 Principio de Escalation Path

**Descripción**: Cómo escalar cuando hay bloqueo.

**Niveles**:

1. Intentar resolver solo
2. Consultar en PR comment
3. Pausar y esperar dependencia
4. Escalar a integrador/lead

---

### 5.5 Principio de Progress Visibility

**Descripción**: Todos pueden ver progreso de todos.

**Dashboard debe mostrar**:

- Tareas por estado
- Commits por tarea
- Conflictos potenciales
- Bloqueadores activos

---

### 5.6 Principio de Integrator Role

**Descripción**: Un agente/persona responsable de la integración final.

**Responsabilidades**:

- Monitorear estado de todas las tareas
- Decidir orden de merge
- Resolver conflictos complejos
- Ejecutar integration tests
- Dar go/no-go para deploy

---

## Quick Reference

| Categoría     | Principios Clave                               |
| ------------- | ---------------------------------------------- |
| Decomposition | Vertical slices, Interface first, Task sizing  |
| Branching     | Worktrees, Frequent rebase, Short-lived        |
| Conflicts     | Early detection, Merge order, Semantic aware   |
| Integration   | Continuous, Staged rollout, Feature flags      |
| Coordination  | Single source of truth, Async, Integrator role |
