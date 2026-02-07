---
name: mobile-first-ui-library
description: Biblioteca de componentes y patrones UI mobile-first para PWAs iOS/Android. Cubre navegación, gestos, componentes, cámara, safe areas, y patterns de Tailwind + shadcn/ui optimizados para móvil. Cumple iOS HIG y Material Design 3.
allowed-tools: Read, Glob, Grep, Bash
metadata:
  version: 1.0.0
  tags: [mobile, ui, ios, pwa, design-system, tailwind, shadcn, components, hig]
---

# Mobile First UI Library

> **Filosofía:** Diseña para el pulgar. Optimiza para la batería. Respeta la plataforma.
> **Core:** iOS Human Interface Guidelines + Material Design 3 + PWA best practices.

---

## Use this skill when

- Diseñando o implementando UI para apps mobile-first (PWA, React Native, o web responsive)
- Eligiendo entre componentes (¿sheet o modal? ¿tabs o drawer? ¿card o list?)
- Implementando gestos (swipe, pull-to-refresh, long press)
- Necesitando patrones de navegación para bottom tabs + stack navigation en Next.js
- Integrando cámara del navegador en una PWA
- Configurando safe areas, viewport, y touch targets
- Creando design tokens y sistema de colores mobile-first

## Do not use this skill when

- El target es exclusivamente desktop (>1024px)
- Se trata de diseño de APIs o backend
- Es una CLI o herramienta sin interfaz visual

## Instructions

1. Identificar la plataforma target (iOS PWA, Android, ambos)
2. Consultar el catálogo de componentes (`resources/component-catalog.md`)
3. Aplicar patrones iOS específicos (`resources/ios-patterns.md`)
4. Seguir patrones de navegación (`resources/navigation-patterns.md`)
5. Implementar con los snippets del playbook (`resources/implementation-playbook.md`)

---

## Quick Reference

### iOS Sizing (points)
```
Bottom Tab Bar:     49pt + env(safe-area-inset-bottom)
Navigation Bar:     44pt + env(safe-area-inset-top)
Touch Target:       min 44×44pt
Button Height:      50pt
Input Height:       44pt
Card Radius:        12-16pt
Sheet Radius:       12pt (top corners only)
Status Bar:         ~54pt (Dynamic Island) / ~44pt (notch) / ~20pt (legacy)
Home Indicator:     ~34pt
```

### Typography (SF Pro / System)
```
Large Title:  34pt Bold    → text-[34px] font-bold
Title 1:      28pt Bold    → text-[28px] font-bold  
Title 2:      22pt Bold    → text-[22px] font-bold
Title 3:      20pt Semi    → text-[20px] font-semibold
Headline:     17pt Semi    → text-[17px] font-semibold
Body:         17pt Regular → text-[17px]
Callout:      16pt Regular → text-base
Subhead:      15pt Regular → text-[15px]
Footnote:     13pt Regular → text-[13px]
Caption:      12pt Regular → text-xs
```

### Spacing Scale
```
xs: 4px   → p-1
sm: 8px   → p-2
md: 12px  → p-3
lg: 16px  → p-4
xl: 20px  → p-5
2xl: 24px → p-6
3xl: 32px → p-8
```

### Component Decision Tree

```
¿Necesitas mostrar contenido?
├─ Lista de items → <List> (grouped/inset style para iOS)
├─ Datos con acciones → <Card>
├─ Dato simple → <Cell> (label + value + chevron)
└─ Dashboard resumen → <StatCard> (icon + number + label)

¿Necesitas input del usuario?
├─ Acción rápida (1 tap) → <Button> (mín 44pt)
├─ Texto corto → <Input> (44pt height)
├─ Texto largo → <Textarea>
├─ Selección binaria → <Switch> (iOS style)
├─ Selección 1 de N → <SegmentedControl> (2-5 opciones)
│                    → <Select/Picker> (>5 opciones)
├─ Selección M de N → <Checkbox> group
├─ Número → <Stepper> o <NumericKeypad>
└─ Fecha/Hora → Native date/time picker

¿Necesitas overlay?
├─ Acción contextual → <ActionSheet> (iOS) / Bottom Sheet
├─ Confirmación → <Alert> nativo (window.confirm en PWA)
├─ Formulario rápido → <Sheet> (half/full screen)
├─ Detalle completo → Push navigation (no modal)
└─ Media/Preview → <Fullscreen Modal>

¿Necesitas navegación?
├─ Top level (2-5 destinos) → <BottomTabBar>
├─ Dentro de sección → Stack push/pop
├─ Filtrar contenido → <SegmentedControl>
├─ Sub-secciones muchas → <ScrollableTabBar>
└─ Acción primaria flotante → <FAB> (solo Android)
```

### Color System Template
```css
/* Light */
--background:     #F2F2F7;  /* iOS System Gray 6 */
--surface:        #FFFFFF;
--text-primary:   #1C1C1E;
--text-secondary: #8E8E93;
--separator:      #C6C6C8;
--accent:         /* Tu color principal */
--positive:       #34C759;  /* iOS Green */
--negative:       #FF3B30;  /* iOS Red */
--warning:        #FF9500;  /* iOS Orange */

/* Dark */
--background:     #000000;
--surface:        #1C1C1E;
--text-primary:   #FFFFFF;
--text-secondary: #8E8E93;
--separator:      #38383A;
```

---

## Resources

For detailed implementation:
- `resources/component-catalog.md` — Cuándo usar cada componente
- `resources/ios-patterns.md` — Checklist iOS HIG para web apps
- `resources/navigation-patterns.md` — Tabs, gestos, stack en Next.js
- `resources/implementation-playbook.md` — Snippets listos para copiar
