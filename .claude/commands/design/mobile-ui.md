---
name: design:mobile-ui
description: Genera diseño UI mobile-first con mockups ASCII, sistema de diseño, y componentes siguiendo iOS HIG. Incluye navegación, gestos, dark mode, y patrones PWA.
allowed-tools: Task, Read, Write, Glob, Grep, WebSearch, WebFetch, AskUserQuestion
---

# Comando: Design Mobile UI

Genera el diseño completo de UI mobile-first para un proyecto, incluyendo mockups ASCII de cada pantalla, sistema de diseño, patrones de navegación y componentes.

## Uso

```
/design:mobile-ui <nombre-proyecto>
```

## Prerequisitos

- El proyecto debe tener un `SPEC.md` con features definidas
- Opcionalmente un `USER-FLOWS.md` con los flujos de usuario

## Proceso

1. **Cargar contexto**: Leer SPEC.md y USER-FLOWS.md del proyecto
2. **Cargar skill**: Leer `.claude/skills/mobile-first-ui-library/SKILL.md`
3. **Sistema de diseño**: Definir colores, tipografía, spacing, componentes base
4. **Navegación**: Diseñar estructura de tabs, gestos, stack navigation
5. **Mockups ASCII**: Para CADA pantalla del flujo, generar mockup ASCII con frame iPhone (375×812)
6. **Interacciones**: Documentar gestos, transiciones, y feedback háptico por pantalla
7. **Dark mode**: Variantes de colores para modo oscuro
8. **PWA config**: manifest.json, viewport, safe areas

## Output

Genera `docs/UI-DESIGN.md` con:

### Secciones obligatorias:
- **Design System**: Colores, tipografía, spacing, componentes base
- **Navigation Architecture**: Tabs, stack, gestos, sub-navegación
- **Screen Mockups**: ASCII art de CADA pantalla (iPhone frame)
- **Interactions**: Por pantalla: gestos, transiciones, estados
- **Dark Mode**: Paleta dark y consideraciones
- **PWA Setup**: manifest, viewport, safe areas

### Formato mockup:
```
╔═══════════════════════════════════╗
║░░░░░░░░░ SAFE AREA TOP ░░░░░░░░░║
╠═══════════════════════════════════╣
║                                   ║
║  [Contenido de la pantalla]       ║
║                                   ║
╠═══════════════════════════════════╣
║  Tab1 │ Tab2 │ Tab3 │ Tab4       ║
╠═══════════════════════════════════╣
║░░░░░ SAFE AREA BOTTOM ░░░░░░░░░░║
╚═══════════════════════════════════╝
```

## Skill de referencia

Consultar siempre:
- `.claude/skills/mobile-first-ui-library/SKILL.md` — Quick reference
- `.claude/skills/mobile-first-ui-library/resources/component-catalog.md` — Qué componente usar
- `.claude/skills/mobile-first-ui-library/resources/ios-patterns.md` — iOS HIG compliance
- `.claude/skills/mobile-first-ui-library/resources/navigation-patterns.md` — Navegación en Next.js
- `.claude/skills/mobile-first-ui-library/resources/implementation-playbook.md` — Code snippets

## Ejemplo

```
/design:mobile-ui app-de-pus
```

Genera `mvps/app-de-pus/docs/UI-DESIGN.md` con mockups de todas las pantallas, sistema de diseño completo, y guía de implementación mobile-first.
