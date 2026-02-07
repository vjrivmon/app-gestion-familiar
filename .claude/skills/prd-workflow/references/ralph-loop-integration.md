# Integración PRD → Ralph Loop

## Flujo Completo

```
PRD Workflow          Ralph Loop
    │                     │
    ▼                     │
[Entrevista]              │
    │                     │
    ▼                     │
[Análisis]                │
    │                     │
    ▼                     │
[PRD Document]            │
    │                     │
    ▼                     │
[Issue GitHub] ──────────►│
                          ▼
                   [Divide en Tasks]
                          │
                          ▼
                   ┌──────────────┐
                   │  RALPH LOOP  │
                   │              │
                   │  1. Implement│
                   │  2. Validate │
                   │  3. Iterate  │
                   │  4. Complete │
                   └──────────────┘
```

## Activación del Ralph Loop

Una vez creado el PRD y la issue, el usuario puede:

```
Usuario: Implementa con Ralph Loop

VisiClaw: 
1. Leo el PRD/Issue
2. Divido en micro-tareas
3. Ejecuto Ralph Loop por cada tarea:
   - Implement → Test → Fix → Repeat
4. Valido criterios de aceptación
5. Creo PR cuando todo pasa
```

## División de Tareas

El Ralph Loop divide el PRD en tareas de máximo 1-2 horas:

```markdown
## Micro-tareas para: [título del PRD]

### Backend
- [ ] Task 1: Crear modelo/schema (30min)
- [ ] Task 2: Implementar endpoint GET (45min)
- [ ] Task 3: Implementar endpoint POST (45min)
- [ ] Task 4: Añadir validaciones (30min)

### Frontend
- [ ] Task 5: Crear componente base (1h)
- [ ] Task 6: Conectar con API (45min)
- [ ] Task 7: Añadir estados de carga/error (30min)

### Testing
- [ ] Task 8: Unit tests backend (45min)
- [ ] Task 9: Unit tests frontend (45min)
- [ ] Task 10: Integration tests (1h)
```

## Ciclo Ralph por Tarea

```
┌─────────────────────────────────────────┐
│                                         │
│   ┌─────────┐                           │
│   │IMPLEMENT│ ── Escribe código         │
│   └────┬────┘                           │
│        │                                │
│        ▼                                │
│   ┌─────────┐                           │
│   │VALIDATE │ ── Ejecuta tests          │
│   └────┬────┘                           │
│        │                                │
│   ┌────┴────┐                           │
│   │         │                           │
│ PASS     FAIL                           │
│   │         │                           │
│   ▼         ▼                           │
│ NEXT    ┌─────┐                         │
│ TASK    │ FIX │ ── Corrige errores      │
│         └──┬──┘                         │
│            │                            │
│            └────── Loop back ───────────┘
│
└─────────────────────────────────────────┘
```

## Validaciones Automáticas

Por cada micro-tarea, Ralph valida:

1. **Sintaxis** - El código compila/parsea
2. **Linting** - Pasa las reglas de estilo
3. **Tests** - Los tests pasan
4. **Types** - No hay errores de tipos
5. **Coverage** - Cobertura mínima alcanzada

## Comandos de Integración

```bash
# Después de crear PRD
/prd                    # Crea el PRD completo
/prd:issue              # Crea issue en GitHub

# Activar implementación
/ralph                  # Inicia Ralph Loop
/ralph:status           # Ver progreso
/ralph:pause            # Pausar ejecución
/ralph:continue         # Continuar
```

## Ejemplo de Flujo Completo

```
1. Usuario: PRD para añadir dark mode

2. [PRD Workflow]
   - Entrevista: 8 preguntas
   - Análisis: componentes afectados
   - PRD: documento completo
   - Issue: #123 creada

3. Usuario: Implementa #123 con Ralph Loop

4. [Ralph Loop]
   Task 1/8: Crear ThemeContext ✅
   Task 2/8: Implementar toggle UI ✅
   Task 3/8: Persistir preferencia ✅
   Task 4/8: Estilos dark mode... 🔄
   
   [Fallo en Task 4: contraste insuficiente]
   Fixing... ✅
   
   Task 4/8: Estilos dark mode ✅
   Task 5/8: Tests unitarios ✅
   ...
   
   ✅ Todas las tareas completadas
   ✅ Criterios de aceptación verificados
   
5. [Resultado]
   PR #124 creado, listo para review
```

## Notas
- El PRD define QUÉ hacer
- Ralph Loop define CÓMO hacerlo
- Juntos = flujo completo de idea → código → PR
