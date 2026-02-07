# Generador de Historias de Usuario

Genera historias de usuario estructuradas desde una especificación SPEC.md.

## Variables

SPEC_FILE: $ARGUMENTS

## Instrucciones

### Paso 1: Validar Entrada

Si no se proporciona SPEC_FILE:

- Buscar archivos en `.claude/specs/`
- Listar specs disponibles
- Preguntar al usuario cuál usar

Si el archivo no existe:

- Mostrar error y sugerir `/idea:validate` o `/project:interview`

### Paso 2: Leer Especificación

READ: $SPEC_FILE

Extraer:

- Nombre del proyecto
- Descripción general
- Funcionalidades principales
- Usuario target
- Requisitos técnicos

### Paso 3: Entrevista de Priorización

Usar AskUserQuestion para clarificar:

1. **Funcionalidades prioritarias**
   - ¿Cuáles son las 3 funcionalidades más críticas para el MVP?
   - ¿Hay funcionalidades que pueden esperar a una v2?

2. **Restricciones técnicas**
   - ¿Hay tecnologías obligatorias?
   - ¿Hay limitaciones de tiempo/recursos?

3. **Usuario principal**
   - ¿Quién es el usuario principal? (persona específica)
   - ¿Hay usuarios secundarios a considerar?

### Paso 4: Generar Historias

Por cada funcionalidad identificada:

1. Crear archivo usando template `.claude/templates/USER-STORY.md`
2. Asignar ID secuencial: H001, H002, H003...
3. Estimar tamaño:
   - XS = 1-2h (muy simple)
   - S = 2-4h (simple)
   - M = 4-8h (moderado)
   - L = 8-16h (complejo)
   - XL = 16-40h (muy complejo)
4. Definir criterios de aceptación verificables
5. Identificar dependencias entre historias
6. Asignar prioridad: critical > high > medium > low

### Paso 5: Mostrar Resumen

Presentar tabla resumen:

```
| ID   | Título                    | Tamaño | Prioridad | Dependencias |
|------|---------------------------|--------|-----------|--------------|
| H001 | Autenticación de usuarios | M      | critical  | -            |
| H002 | Dashboard principal       | L      | high      | H001         |
| H003 | Gestión de tareas         | M      | high      | H001         |
```

Preguntar: "¿Deseas aprobar, modificar o rechazar alguna historia?"

### Paso 6: Guardar Historias

Por cada historia aprobada:

1. Guardar en `.claude/stories/H00X-<slug>.md`
2. Actualizar estado a "approved"

Generar archivo índice `.claude/stories/INDEX.md`:

```markdown
# Índice de Historias de Usuario

## Proyecto: <nombre>

## Generado: <fecha>

| ID   | Título | Tamaño | Estado   | Archivo      |
| ---- | ------ | ------ | -------- | ------------ |
| H001 | ...    | M      | approved | H001-auth.md |

...

## Resumen

- Total historias: X
- Estimación total: Y puntos
- Prioridad crítica: Z historias
```

### Output Final

```
✅ HISTORIAS GENERADAS

📁 Directorio: .claude/stories/
📊 Total: X historias
⏱️ Estimación: Y horas

📋 Archivos creados:
- H001-auth.md
- H002-dashboard.md
- ...

💡 Próximo paso:
/tasks:breakdown H001
```
