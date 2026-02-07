---
name: design-consistency
description: Mantiene consistencia visual en apps iOS/PWA. Define paleta de colores, tipografía, espaciado, y componentes siguiendo un Design Token System. Evita inconsistencias de colores, fuentes y estilos. Usar cuando se detecten problemas de consistencia visual o al iniciar un nuevo proyecto.
allowed-tools: Read, Write, Glob, Grep, Bash
metadata:
  version: 1.0.0
  tags: [design-system, colors, typography, consistency, ios, pwa, tokens]
---

# Design Consistency System

> **Problema que resuelve:** Inconsistencias visuales en apps (diferentes tonos de verde, tipografías mezcladas, espaciados irregulares).
> **Solución:** Un sistema de Design Tokens centralizado que garantiza coherencia.

---

## Use this skill when

- Se detectan inconsistencias de colores en la app
- Se usan diferentes tonos del mismo color sin criterio
- La tipografía no es consistente
- Se inicia un nuevo proyecto y necesita un design system
- Se quiere profesionalizar la apariencia visual

## Do not use this skill when

- Solo se necesita un componente específico (usar mobile-first-ui-library)
- El proyecto ya tiene un design system consolidado y documentado

---

## Design Token System

### Estructura de Tokens

```
tokens/
├── colors.ts         # Paleta completa con variantes
├── typography.ts     # Fuentes, tamaños, pesos
├── spacing.ts        # Espaciado consistente
├── shadows.ts        # Sombras y elevación
├── borders.ts        # Bordes y radios
└── index.ts          # Export unificado
```

### 1. Sistema de Colores

**Regla fundamental:** Cada color tiene un PROPÓSITO, no un nombre de color.

```typescript
// ❌ MAL - Colores por nombre
const colors = {
  green: '#34C759',
  lightGreen: '#4CD964',
  darkGreen: '#248A3D'
}

// ✅ BIEN - Colores por propósito
const colors = {
  // Semánticos
  positive: '#34C759',      // Dinero entrante, éxito
  negative: '#FF3B30',      // Dinero saliente, error
  warning: '#FF9500',       // Alertas, atención
  info: '#007AFF',          // Información, links
  
  // Marca
  primary: '#5B6CF0',       // Acción principal
  primaryLight: '#8B96F5',  // Hover/pressed
  primaryDark: '#3A4AD4',   // Texto sobre primary
  
  // Neutrales
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Texto
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textMuted: '#AEAEB2',
  textInverse: '#FFFFFF',
  
  // Bordes
  border: '#E5E5EA',
  borderFocused: '#5B6CF0',
  separator: '#C6C6C8'
}
```

### 2. Sistema de Tipografía

**Fuentes recomendadas para iOS/PWA:**

| Fuente | Uso | Características |
|--------|-----|-----------------|
| **SF Pro** (sistema) | Default iOS | Nativa, 0 carga |
| **Inter** | Alternativa moderna | Legible, variantes |
| **Plus Jakarta Sans** | Premium, amigable | Geométrica, cálida |
| **DM Sans** | Minimalista | Limpia, moderna |
| **Nunito** | Friendly, casual | Redondeada, amigable |

**Escala tipográfica consistente:**
```typescript
const typography = {
  // Display (títulos grandes)
  displayLarge: { size: 34, weight: 700, lineHeight: 1.2 },
  displayMedium: { size: 28, weight: 700, lineHeight: 1.2 },
  
  // Headlines
  headlineLarge: { size: 22, weight: 600, lineHeight: 1.3 },
  headlineMedium: { size: 20, weight: 600, lineHeight: 1.3 },
  headlineSmall: { size: 17, weight: 600, lineHeight: 1.3 },
  
  // Body
  bodyLarge: { size: 17, weight: 400, lineHeight: 1.5 },
  bodyMedium: { size: 15, weight: 400, lineHeight: 1.5 },
  bodySmall: { size: 13, weight: 400, lineHeight: 1.4 },
  
  // Labels
  labelLarge: { size: 15, weight: 500, lineHeight: 1.3 },
  labelMedium: { size: 13, weight: 500, lineHeight: 1.3 },
  labelSmall: { size: 11, weight: 500, lineHeight: 1.2 },
  
  // Monospace (números, dinero)
  mono: { family: 'SF Mono, monospace', size: 17, weight: 500 }
}
```

### 3. Espaciado

**Escala de 4px base:**
```typescript
const spacing = {
  xs: 4,    // Separación mínima
  sm: 8,    // Entre elementos relacionados
  md: 12,   // Padding interno
  lg: 16,   // Padding de cards
  xl: 20,   // Separación de secciones
  '2xl': 24,
  '3xl': 32,
  '4xl': 48
}
```

### 4. Validación de Consistencia

**Checklist antes de commit:**
- [ ] ¿Todos los colores vienen de tokens?
- [ ] ¿No hay valores hex hardcoded?
- [ ] ¿Tipografía usa escala definida?
- [ ] ¿Espaciado usa valores de la escala?
- [ ] ¿Dark mode usa los tokens correctos?

---

## Implementación en Next.js + Tailwind

### 1. Definir tokens

Crear `src/styles/tokens.ts`:
```typescript
export const tokens = {
  colors: { ... },
  typography: { ... },
  spacing: { ... }
}
```

### 2. Aplicar en Tailwind

En `tailwind.config.ts`:
```typescript
import { tokens } from './src/styles/tokens'

export default {
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: {
        sans: [tokens.typography.fontFamily, 'system-ui', 'sans-serif'],
        mono: [tokens.typography.monoFamily, 'monospace']
      },
      fontSize: {
        // Mapear escala tipográfica
      }
    }
  }
}
```

### 3. CSS Variables

En `globals.css`:
```css
:root {
  /* Colors */
  --color-primary: theme('colors.primary');
  --color-positive: theme('colors.positive');
  /* etc. */
}
```

---

## Resources

- `resources/color-palettes.md` — Paletas predefinidas por tipo de app
- `resources/typography-guide.md` — Guía de tipografía con ejemplos
- `resources/consistency-checklist.md` — Checklist de revisión
