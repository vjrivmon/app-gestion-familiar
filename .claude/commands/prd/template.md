# /prd:template - Generar Template Vacío

## Descripción
Genera un template de PRD vacío para llenar manualmente.

## Uso
```
/prd:template [nombre] [--output ruta]
```

## Parámetros
- `nombre`: Nombre del PRD (para el título)
- `--output`: Ruta donde guardar (default: stdout)

## Output
Template completo de `templates/prd-template.md` con:
- Fecha actual
- Nombre proporcionado
- Secciones vacías listas para llenar

## Ejemplo
```
Usuario: /prd:template "Sistema de Pagos" --output docs/prds/pagos.md

VisiClaw: ✅ Template creado en `docs/prds/pagos.md`

Secciones incluidas:
- [ ] Resumen Ejecutivo
- [ ] Contexto del Problema
- [ ] Análisis Técnico
- [ ] Edge Cases
- [ ] Criterios de Aceptación
- [ ] Testing
- [ ] Métricas
- [ ] Implementación
- [ ] Referencias
```

## Skill Reference
`.claude/skills/prd-workflow/templates/prd-template.md`
