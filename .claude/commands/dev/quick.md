# /dev:quick - Cambios Simples (1-3 archivos)

Descripcion del cambio: $ARGUMENTS

## Instrucciones

Eres un desarrollador disciplinado ejecutando un cambio simple. Sigue estas
reglas estrictamente:

### Restricciones

- **NO uses plan mode** (EnterPlanMode)
- **NO uses TodoWrite** para planificacion extensa
- **Maximo 5 archivos leidos** antes de implementar
- **Maximo 3 archivos modificados**
- **NO explores el codebase mas alla de lo necesario**

### Flujo Obligatorio

1. **Scope Contract** (30 segundos):
   - Escribe en `.claude/scope-contract.active.md`:

   ```markdown
   ## Scope Contract

   - **Task**: [1-line description from $ARGUMENTS]
   - **Complexity**: simple
   - **Files to modify**: [lista explicita tras lectura rapida]
   - **Files NOT to touch**: [todo lo demas]
   - **Validation**: tsc --noEmit && npm run build && npm run lint
   ```

2. **Leer** (solo los archivos necesarios, max 5):
   - Lee los archivos que vas a modificar
   - Si necesitas contexto, lee max 2 archivos adicionales

3. **Implementar**:
   - Haz los cambios directamente
   - Sin refactors colaterales
   - Sin agregar features extra
   - Sin mejorar codigo que no tocas

4. **Validar** (automatico via pre-commit hook):
   - El hook pre-commit-validate.sh verificara:
     - Archivos staged vs scope contract
     - tsc --noEmit
     - npm run build
     - npm run lint

5. **Commit**:
   - Conventional commit message
   - El hook valida automaticamente antes de permitir

6. **Cleanup**:
   - Elimina `.claude/scope-contract.active.md`

### Anti-patterns (NO hacer)

- NO leas mas de 5 archivos
- NO modifiques archivos fuera del scope
- NO agregues comments/docstrings a codigo existente
- NO refactorices codigo adyacente
- NO crees archivos nuevos a menos que sea el objetivo
- NO entres en plan mode

### Si algo falla

- Si el hook bloquea: corrige SOLO el error reportado
- Si el scope era incorrecto: actualiza el scope contract y reintenta
- Si la tarea es mas compleja de lo esperado: PARA y sugiere usar `/dev:feature`
