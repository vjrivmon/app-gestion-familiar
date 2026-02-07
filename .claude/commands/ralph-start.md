# Iniciar Loop Ralph Wiggum

Inicia un loop autónomo para completar una tarea de forma iterativa.

## Variables
TASK_FILE: $ARGUMENTS

## Instrucciones

### Paso 1: Validar Entrada
Si no se proporciona TASK_FILE, preguntar al usuario qué tarea desea ejecutar.

### Paso 2: Leer Tarea
READ: $TASK_FILE

Extraer:
- Descripción de la tarea
- Checklist de validación
- Archivos a modificar
- Tests requeridos

### Paso 3: Crear Prompt de Loop
Crear archivo `.claude/PROMPT.md` con el siguiente contenido:

```markdown
# 🔄 RALPH LOOP ACTIVO

## Tarea
[Copiar contenido de la tarea aquí]

## Criterios de Completitud
[Copiar checklist de la tarea]

## Instrucciones de Loop

1. **Verificar Estado Actual**
   - ¿Qué criterios ya están completados?
   - ¿Hay errores pendientes de resolver?

2. **Identificar Siguiente Paso**
   - ¿Cuál es el criterio más prioritario pendiente?
   - ¿Qué necesito hacer para completarlo?

3. **Ejecutar**
   - Implementar el cambio necesario
   - Ejecutar tests relevantes
   - Verificar que no hay errores de tipos

4. **Validar**
   - ¿El criterio se cumple ahora?
   - ¿Se introdujeron nuevos errores?

5. **Decidir**
   - Si TODOS los criterios están completos:
     * Ejecutar: `rm .claude/ralph-active`
     * Crear: `touch .claude/COMPLETE`
     * Responder: <promise>COMPLETE</promise>
   - Si hay criterios pendientes:
     * Continuar al siguiente paso

## ⚠️ Safety Limits
- Contador de iteración: {iteration}/30
- Si iteration >= 30: PAUSAR y pedir intervención humana
- Si el mismo error aparece 3+ veces: PAUSAR

## 📊 Progreso Actual
[El agente debe actualizar esto en cada iteración]
- Criterios completados: X/Y
- Última acción: [descripción]
- Próximo paso: [descripción]
```

### Paso 4: Activar Flag
RUN: `touch .claude/ralph-active`

### Paso 5: Informar al Usuario
Mostrar mensaje:

```
🚀 RALPH LOOP INICIADO

📋 Tarea: [nombre de la tarea]
📁 Archivo de prompt: .claude/PROMPT.md
🔄 Flag activo: .claude/ralph-active

⚠️ IMPORTANTE:
- El loop continuará automáticamente después de cada respuesta
- Para detener manualmente: /ralph:stop
- Para ver estado: cat .claude/PROMPT.md

💡 Tip: Abre otra terminal para monitorear el progreso
```

### Paso 6: Iniciar Primera Iteración
Leer y ejecutar `.claude/PROMPT.md`
