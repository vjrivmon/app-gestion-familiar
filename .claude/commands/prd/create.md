# /prd:create - Crear PRD Completo

## Descripción
Flujo completo para crear un Product Requirement Document desde cero.

## Uso
```
/prd:create [tema opcional]
```

## Flujo

### Paso 1: Kickoff
Si no se proporciona tema:
```
¿Sobre qué feature/problema quieres crear el PRD?
```

### Paso 2: Entrevista
Ejecutar agente `prd-interviewer`:
- 8-12 preguntas según contexto
- Generar resumen de entrevista

### Paso 3: Análisis
Ejecutar agente `prd-analyst`:
- Analizar impacto técnico
- Identificar edge cases
- Estimar esfuerzo

### Paso 4: Escritura
Ejecutar agente `prd-writer`:
- Generar PRD completo
- Usar template de `templates/prd-template.md`

### Paso 5: Revisión
Presentar PRD al usuario:
```
📄 PRD generado. ¿Quieres que:
1. Lo guarde en /docs/prds/[nombre].md
2. Cree una issue en GitHub
3. Haga ajustes
```

### Paso 6: Acciones Post-PRD
Según respuesta:
- Guardar → escribir archivo
- Issue → ejecutar `/prd:issue`
- Ajustes → iterar

## Ejemplo
```
Usuario: /prd:create sistema de notificaciones

VisiClaw: ¡Perfecto! Vamos a crear un PRD para el sistema de notificaciones.

**Entrevista (8 preguntas):**
1. ¿Qué tipo de notificaciones? (push, email, in-app)
2. ¿Para qué eventos se disparan?
...

[Después de respuestas]

**Análisis:**
- Componentes: NotificationService, UserPreferences, PushGateway
- Edge cases: usuario sin token, rate limiting, timezone
- Estimación: 5-7 días

**PRD Generado:**
[Documento completo]

¿Procedo a crear la issue en GitHub?
```

## Skill Reference
`.claude/skills/prd-workflow/SKILL.md`
