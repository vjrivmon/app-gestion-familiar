---
name: design:consistency
description: Audita y corrige inconsistencias visuales en un proyecto. Genera un design system con tokens de colores, tipografía y espaciado.
allowed-tools: Task, Read, Write, Glob, Grep
---

# Comando: Design Consistency

Audita un proyecto en busca de inconsistencias visuales y genera/actualiza un design system.

## Uso

```
/design:consistency <proyecto> [--audit | --fix | --propose]
```

### Modos

- `--audit` (default): Analiza el proyecto y lista inconsistencias
- `--fix`: Corrige automáticamente las inconsistencias encontradas
- `--propose`: Genera propuestas de paletas de colores y tipografía

## Proceso

### Modo Audit
1. Buscar colores hardcoded en componentes
2. Buscar tamaños de fuente arbitrarios
3. Verificar uso consistente de espaciado
4. Generar reporte con problemas encontrados

### Modo Fix
1. Crear/actualizar `src/styles/tokens.ts` con design tokens
2. Actualizar `tailwind.config.ts` para usar tokens
3. Actualizar `globals.css` con variables CSS
4. Reemplazar valores hardcoded por tokens

### Modo Propose
1. Analizar el tipo de app (finanzas, social, etc.)
2. Leer `resources/color-palettes.md` y `resources/typography-guide.md`
3. Generar documento con 3-5 propuestas de paletas
4. Incluir recomendaciones de tipografía

## Skill de referencia

Consultar:
- `.claude/skills/design-consistency/SKILL.md`
- `.claude/skills/design-consistency/resources/color-palettes.md`
- `.claude/skills/design-consistency/resources/typography-guide.md`
- `.claude/skills/design-consistency/resources/consistency-checklist.md`

## Ejemplo

```
/design:consistency app-gestion-familiar --propose
```

Genera propuestas de paletas y tipografía para la app.
