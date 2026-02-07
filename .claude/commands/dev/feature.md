# /dev:feature - Features Medias (4-10 archivos)

Descripcion del feature: $ARGUMENTS

## Instrucciones

Eres un desarrollador disciplinado implementando un feature de complejidad
media. Sigue estas reglas estrictamente:

### Restricciones

- **Exploracion ligera**: max 10 archivos leidos, max 2 busquedas Grep
- **Max 10 archivos modificados**
- **Implementacion por fases** con validacion entre cada fase
- **Scope contract obligatorio** antes de escribir codigo

### Flujo Obligatorio

#### Paso 1: Explorar (max 2 minutos)

- Lee max 10 archivos relevantes
- Max 2 busquedas Grep para entender patrones
- Identifica archivos a crear/modificar

#### Paso 2: Scope Contract

Escribe en `.claude/scope-contract.active.md`:

```markdown
## Scope Contract

- **Task**: [description from $ARGUMENTS]
- **Complexity**: medium
- **Files to modify**: [lista explicita]
- **Files to create**: [si aplica]
- **Files NOT to touch**: [exclusiones explicitas]
- **Phases**:
  1. [Fase 1]: [archivos] -> validar
  2. [Fase 2]: [archivos] -> validar
  3. [Fase 3]: [archivos] -> validar (si necesario)
- **Validation**: tsc --noEmit && npm run build && npm run lint
- **Tests**: [archivos de test a crear/modificar]
```

#### Paso 3: Implementar por fases

Para CADA fase del scope contract:

1. Implementar los cambios de esa fase
2. Ejecutar validacion: `npx tsc --noEmit` (si TypeScript)
3. Si falla: corregir antes de continuar
4. Pasar a la siguiente fase

#### Paso 4: Tests

- Escribir/actualizar tests para el feature
- Ejecutar tests: `npm run test` (si existe)

#### Paso 5: Validacion final

El hook pre-commit-validate.sh verificara automaticamente:

- Archivos staged vs scope contract
- tsc --noEmit
- npm run build
- npm run lint

#### Paso 6: Commit

- Conventional commit message
- Si el feature es grande: commits atomicos por fase

#### Paso 7: Cleanup

- Elimina `.claude/scope-contract.active.md`

### Anti-patterns (NO hacer)

- NO explores mas de 10 archivos
- NO hagas mas de 2 busquedas Grep
- NO modifiques archivos fuera del scope
- NO refactorices codigo no relacionado
- NO agregues features extra no solicitados
- NO entres en plan mode completo (usa fases en su lugar)
- NO crees abstracciones para uso unico

### Escalado

- Si durante la exploracion descubres que necesitas tocar 10+ archivos: PARA y
  sugiere usar el workflow gurusup-workflow (explore -> plan -> implement)
- Si una fase falla repetidamente (3+ veces): PARA y reporta el problema
