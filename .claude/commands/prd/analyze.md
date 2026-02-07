# /prd:analyze - Analizar Requisitos

## Descripción
Analiza requisitos existentes (texto, issue, o conversación) y genera análisis técnico.

## Uso
```
/prd:analyze [fuente]
```

## Fuentes Válidas
- Texto directo en el mensaje
- URL de issue de GitHub
- Archivo markdown
- Conversación previa

## Output
Genera análisis siguiendo el formato de `prd-analyst`:
- Componentes afectados
- Dependencias
- Edge cases
- Estimación de esfuerzo
- Riesgos

## Ejemplo
```
Usuario: /prd:analyze https://github.com/vjrivmon/Osyris-Web/issues/4

VisiClaw: 
📊 **Análisis de Issue #4: Bug de documentos mezclados**

### Componentes Afectados
| Componente | Cambio | Riesgo |
|------------|--------|--------|
| documentos_familia.model.js | Modificar | Medio |
| confirmaciones.model.js | Modificar | Bajo |
| galeria_fotos.model.js | Modificar | Medio |

### Causa Raíz
Referencias incorrectas a `familiares_scouts` y `scout_id` que deberían ser `familiares_educandos` y `educando_id`.

### Edge Cases
1. Educandos sin familiar asociado
2. Múltiples educandos en misma familia
3. Documentos históricos con IDs antiguos

### Estimación
- Tiempo: 2-3 horas
- Complejidad: Media
- Riesgo: Bajo (cambios localizados)

### Plan de Acción Sugerido
1. Corregir referencias en models
2. Verificar queries existentes
3. Añadir tests de regresión
```

## Skill Reference
`.claude/skills/prd-workflow/agents/prd-analyst.md`
