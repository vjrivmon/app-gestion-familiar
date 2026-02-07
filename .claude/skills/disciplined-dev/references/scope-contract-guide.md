# Guia de Scope Contracts

## Que es un Scope Contract

Un scope contract es un acuerdo explicito sobre que archivos se van a modificar
y cuales no, antes de empezar a escribir codigo. Previene scope creep, cambios
excesivos y modificaciones accidentales.

## Formato

```markdown
## Scope Contract

- **Task**: [descripcion en 1 linea]
- **Complexity**: simple | medium
- **Files to modify**: [lista explicita con backticks]
- **Files to create**: [si aplica]
- **Files NOT to touch**: [exclusiones explicitas]
- **Phases**: [solo para medium]
  1. [Fase 1]: [archivos] -> validar
  2. [Fase 2]: [archivos] -> validar
- **Validation**: tsc --noEmit && npm run build && npm run lint
- **Tests**: [archivos de test, si aplica]
```

## Ubicacion

Siempre en `.claude/scope-contract.active.md`. Solo puede existir uno a la vez.

## Ciclo de Vida

```
1. Crear scope contract
2. Implementar cambios
3. git add + git commit (hook valida automaticamente)
4. Si commit exitoso: eliminar scope contract
5. Si commit falla: corregir y reintentar
```

## Ejemplos

### Simple (1-3 archivos)

```markdown
## Scope Contract

- **Task**: Corregir typo en titulo de pagina principal
- **Complexity**: simple
- **Files to modify**: `src/app/page.tsx`
- **Files NOT to touch**: todo lo demas
- **Validation**: tsc --noEmit && npm run build && npm run lint
```

### Medium (4-10 archivos)

```markdown
## Scope Contract

- **Task**: Agregar endpoint de busqueda con filtros
- **Complexity**: medium
- **Files to modify**: `src/app/api/search/route.ts`, `src/lib/search.ts`,
  `src/types/search.ts`, `src/components/SearchBar.tsx`,
  `src/components/SearchResults.tsx`
- **Files to create**: `src/app/api/search/route.ts`, `src/types/search.ts`
- **Files NOT to touch**: auth, database schemas, layout
- **Phases**:
  1. Tipos y logica: `src/types/search.ts`, `src/lib/search.ts` -> validar
  2. API endpoint: `src/app/api/search/route.ts` -> validar
  3. UI: `src/components/SearchBar.tsx`, `src/components/SearchResults.tsx` ->
     validar
- **Validation**: tsc --noEmit && npm run build && npm run lint
- **Tests**: `__tests__/unit/search.test.ts`
```

## Enforcement

El hook `pre-commit-validate.sh` lee automaticamente el scope contract y:

1. Extrae la lista de `Files to modify` y `Files to create`
2. Compara con los archivos en git staging area
3. Si hay archivos staged que NO estan en la lista -> **bloquea el commit**

### Que hacer si el hook bloquea

1. **Archivo legitimamente necesario**: actualiza el scope contract, re-commit
2. **Archivo no deberia estar staged**: `git reset HEAD <archivo>`
3. **Scope incorrecto desde el inicio**: reescribe el scope contract

## Cuando NO usar Scope Contract

- Commits de solo documentacion (.md)
- Commits de configuracion (.env.example, package.json)
- Cuando no hay `.claude/scope-contract.active.md` (el hook lo permite todo)

## Reglas

1. Crear ANTES de escribir codigo
2. Solo UN scope contract activo a la vez
3. Eliminar DESPUES de commit exitoso
4. Si la tarea crece: actualizar el scope, no ignorarlo
5. Si necesitas tocar mas de 10 archivos: escala a gurusup-workflow
