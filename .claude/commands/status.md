---
name: project:status
description: Muestra el estado actual del proyecto y progreso del MVP
allowed-tools: Read, Glob, Grep, Bash
---

# Comando: Estado del Proyecto

Muestra un resumen completo del estado actual del proyecto, incluyendo progreso de desarrollo, tests, documentación y deployment.

## Uso

```
/project:status
/project:status <nombre-proyecto>
```

## Información a Recopilar

### 1. Detección del Proyecto

```bash
# Detectar tipo de proyecto
if [ -f "package.json" ]; then
  # Node.js project
  PROJECT_TYPE="nodejs"
elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
  # Python project
  PROJECT_TYPE="python"
elif [ -f "go.mod" ]; then
  # Go project
  PROJECT_TYPE="go"
fi
```

### 2. Estado del Repositorio Git

```markdown
## Git Status

- **Branch actual**: feature/xxx
- **Commits ahead**: 3
- **Commits behind**: 0
- **Archivos modificados**: 5
- **Archivos sin trackear**: 2
```

### 3. Progreso de SPEC

Si existe `.claude/specs/*.md`:

```markdown
## SPEC del Proyecto

- **Archivo**: .claude/specs/mi-proyecto.md
- **Última modificación**: 2024-01-15
- **Secciones completadas**:
  - [x] Resumen Ejecutivo
  - [x] Problema
  - [x] Usuarios
  - [x] Requisitos Funcionales
  - [ ] Arquitectura (pendiente)
  - [ ] UI/UX (pendiente)
```

### 4. Cobertura de Tests

```markdown
## Tests

| Tipo | Pasando | Fallando | Skipped |
|------|---------|----------|---------|
| Unit | 45 | 2 | 0 |
| Integration | 12 | 0 | 1 |
| E2E | 5 | 1 | 0 |

**Cobertura total**: 78% (objetivo: 80%)

### Tests Fallando
- `src/services/auth.test.ts:45` - Login timeout
- `e2e/checkout.spec.ts:23` - Payment redirect
```

### 5. Calidad del Código

```markdown
## Calidad

- **TypeScript errors**: 0
- **ESLint warnings**: 3
- **ESLint errors**: 0
- **TODO/FIXME**: 7

### Issues Pendientes
- `src/components/Button.tsx:12` - TODO: Add loading state
- `src/api/users.ts:34` - FIXME: Handle rate limit
```

### 6. Dependencias

```markdown
## Dependencias

- **Desactualizadas**: 5 packages
- **Vulnerabilidades**: 0 high, 2 moderate
- **Última actualización**: 2024-01-10

### Packages desactualizados
| Package | Current | Latest |
|---------|---------|--------|
| next | 14.0.0 | 14.1.0 |
| react | 18.2.0 | 18.3.0 |
```

### 7. Estado de CI/CD

```markdown
## CI/CD

- **Último build**: ✅ Pasó (hace 2 horas)
- **Último deploy**: Production (hace 1 día)
- **Branch protegido**: main ✓

### Últimos Workflows
| Workflow | Status | Duración |
|----------|--------|----------|
| CI | ✅ | 3m 45s |
| Deploy | ✅ | 1m 20s |
| Tests | ✅ | 5m 12s |
```

### 8. Documentación

```markdown
## Documentación

- [x] README.md
- [x] API docs (OpenAPI)
- [ ] Contributing guide
- [ ] Architecture docs
- [x] Changelog

**Cobertura JSDoc/docstrings**: 65%
```

### 9. Deployment

```markdown
## Deployment

| Ambiente | URL | Estado |
|----------|-----|--------|
| Production | https://app.example.com | ✅ Online |
| Staging | https://staging.example.com | ✅ Online |
| Preview | https://pr-123.example.com | ✅ Online |

**Última versión**: v1.2.3
**Commits sin deploy**: 5
```

## Output Consolidado

```markdown
# Estado del Proyecto: [nombre]

## Resumen Rápido

| Área | Estado | Acción Requerida |
|------|--------|------------------|
| Tests | ⚠️ 78% | Subir a 80% |
| Build | ✅ | - |
| Deploy | ✅ | - |
| Docs | ⚠️ | Completar arquitectura |
| Security | ✅ | - |

## Métricas Clave

```
Tests:        ████████░░ 78%
Coverage:     ████████░░ 78%
Docs:         ██████░░░░ 65%
TypeSafety:   ██████████ 100%
```

## Acciones Sugeridas

1. 🔴 **Crítico**: Arreglar 2 tests fallando
2. 🟠 **Importante**: Subir cobertura a 80%
3. 🟡 **Mejora**: Actualizar 5 dependencias
4. 🟢 **Opcional**: Documentar arquitectura

## Próximos Pasos

- [ ] `npm test -- --watch` para arreglar tests
- [ ] `/project:mvp` para continuar desarrollo
- [ ] Crear PR cuando tests pasen
```

## Integración

Este comando se ejecuta automáticamente:
- Al inicio de sesión (via SessionStart hook)
- Antes de crear PR
- Después de `/project:mvp` completado
