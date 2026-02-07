# Desglose de Historia en Tareas

Divide una historia de usuario en tareas técnicas ejecutables.

## Variables

STORY_ID: $ARGUMENTS

## Instrucciones

### Paso 1: Validar Entrada

Si no se proporciona STORY_ID:

- Listar historias en `.claude/stories/`
- Mostrar estado de cada una
- Preguntar cuál desglosar

Buscar archivo: `.claude/stories/$STORY_ID*.md`

Si no existe:

- Mostrar error
- Sugerir `/stories:generate`

### Paso 2: Leer Historia

READ: `.claude/stories/$STORY_ID*.md`

Extraer:

- Criterios de aceptación
- Notas técnicas
- Dependencias
- Mockups/wireframes si existen

### Paso 3: Analizar Complejidad

Evaluar la historia:

1. **Alcance técnico**
   - ¿Cuántos archivos se modificarán?
   - ¿Hay nuevas dependencias?
   - ¿Se requiere configuración de infraestructura?

2. **Integraciones**
   - ¿Hay APIs externas involucradas?
   - ¿Se requiere autenticación/autorización?
   - ¿Hay manejo de estado complejo?

3. **Testing**
   - ¿Qué tipos de tests se necesitan?
   - ¿Hay casos edge importantes?

### Paso 4: Dividir en Tareas

**Reglas de división:**

- Cada tarea completable en < 8 puntos (Fibonacci: 1,2,3,5,8)
- Criterios verificables y binarios
- Máximo 5-7 tareas por historia (si más, subdividir historia)
- Una tarea = un worktree = un agente

**Escala de puntos:**

- 1 pt: Cambio trivial (< 30 min)
- 2 pts: Cambio simple (30min - 1h)
- 3 pts: Cambio moderado (1-2h)
- 5 pts: Cambio complejo (2-4h)
- 8 pts: Cambio muy complejo (4-8h)
- 13+ pts: Dividir en subtareas

Por cada tarea:

1. Crear usando template `.claude/templates/TASK.md`
2. Asignar ID secuencial global: T001, T002, T003...
3. Vincular a historia padre
4. Estimar puntos
5. Listar archivos específicos a modificar
6. Definir tests requeridos
7. Identificar dependencias entre tareas

### Paso 5: Validar con Usuario

Mostrar tabla resumen:

```
Historia: H001 - Autenticación de usuarios

| ID   | Título                | Pts | Archivos          | Dependencias |
|------|-----------------------|-----|-------------------|--------------|
| T001 | UI de login           | 3   | LoginForm.tsx     | -            |
| T002 | API de autenticación  | 5   | auth.ts, users.ts | -            |
| T003 | Middleware de sesión  | 3   | middleware.ts     | T002         |
| T004 | Tests de integración  | 3   | auth.test.ts      | T002, T003   |

Total: 14 puntos (~7h)
```

Preguntar: "¿Aprobar tareas o ajustar estimaciones/divisiones?"

### Paso 6: Guardar Tareas

Por cada tarea aprobada:

1. Guardar en `.claude/tasks/T00X-<slug>.md`
2. Actualizar historia padre con referencias a tareas

Actualizar `.claude/stories/$STORY_ID*.md`:

```markdown
## Tareas Asociadas

| ID   | Título               | Puntos | Estado |
| ---- | -------------------- | ------ | ------ |
| T001 | UI de login          | 3      | todo   |
| T002 | API de autenticación | 5      | todo   |

...
```

### Paso 7: Generar Índice

Actualizar `.claude/tasks/INDEX.md`:

```markdown
# Índice de Tareas

## Resumen

- Total tareas: X
- Puntos totales: Y
- Tareas pendientes: Z

## Por Historia

### H001 - Autenticación

| ID   | Título | Pts | Estado |
| ---- | ------ | --- | ------ |
| T001 | ...    | 3   | todo   |

### H002 - Dashboard

...
```

### Output Final

```
✅ TAREAS GENERADAS

📁 Directorio: .claude/tasks/
📊 Total: X tareas
⏱️ Estimación: Y puntos (~Zh)

📋 Archivos creados:
- T001-login-ui.md
- T002-auth-api.md
- ...

💡 Próximos pasos:

Opción 1 - Ejecutar secuencialmente:
  /ralph:start .claude/tasks/T001-login-ui.md

Opción 2 - Ejecutar en paralelo:
  bash .claude/scripts/swarm-launch.sh 4
```
