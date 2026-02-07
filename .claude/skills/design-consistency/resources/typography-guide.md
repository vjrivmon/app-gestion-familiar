# Guía de Tipografía — Apps iOS/PWA

---

## Fuentes Recomendadas

### 1. Inter — La Todo-Terreno
**Google Fonts:** https://fonts.google.com/specimen/Inter

```
┌─────────────────────────────────────────────────────┐
│  Inter                                               │
│  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm            │
│  1234567890  €$£¥  +−×÷=                            │
├─────────────────────────────────────────────────────┤
│  ✅ Pros:                                            │
│  • Diseñada específicamente para pantallas          │
│  • Excelente legibilidad en tamaños pequeños        │
│  • Muchos pesos (100-900)                           │
│  • Gratis, muy popular                              │
│  • Tiene variante "Display" para títulos            │
├─────────────────────────────────────────────────────┤
│  ❌ Contras:                                         │
│  • Muy común, puede parecer genérica                │
└─────────────────────────────────────────────────────┘
```

**Uso:** Apps que priorizan legibilidad sobre personalidad.

---

### 2. Plus Jakarta Sans — Premium y Cálida
**Google Fonts:** https://fonts.google.com/specimen/Plus+Jakarta+Sans

```
┌─────────────────────────────────────────────────────┐
│  Plus Jakarta Sans                                   │
│  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm            │
│  1234567890  €$£¥  +−×÷=                            │
├─────────────────────────────────────────────────────┤
│  ✅ Pros:                                            │
│  • Geométrica pero cálida                           │
│  • Aspecto premium/profesional                      │
│  • Buena para finanzas (números claros)             │
│  • Pesos 200-800                                    │
├─────────────────────────────────────────────────────┤
│  ❌ Contras:                                         │
│  • Ligeramente más pesada (archivo)                 │
└─────────────────────────────────────────────────────┘
```

**Uso:** Apps de finanzas que quieren sentirse premium.

---

### 3. DM Sans — Minimalista Moderna
**Google Fonts:** https://fonts.google.com/specimen/DM+Sans

```
┌─────────────────────────────────────────────────────┐
│  DM Sans                                             │
│  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm            │
│  1234567890  €$£¥  +−×÷=                            │
├─────────────────────────────────────────────────────┤
│  ✅ Pros:                                            │
│  • Muy limpia y moderna                             │
│  • Geométrica low-contrast                          │
│  • Ligera y rápida de cargar                        │
│  • Buena para UI minimalista                        │
├─────────────────────────────────────────────────────┤
│  ❌ Contras:                                         │
│  • Puede parecer fría                               │
│  • Menos pesos disponibles                          │
└─────────────────────────────────────────────────────┘
```

**Uso:** Apps minimalistas, estilo tech startup.

---

### 4. Nunito — Friendly y Redondeada
**Google Fonts:** https://fonts.google.com/specimen/Nunito

```
┌─────────────────────────────────────────────────────┐
│  Nunito                                              │
│  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm            │
│  1234567890  €$£¥  +−×÷=                            │
├─────────────────────────────────────────────────────┤
│  ✅ Pros:                                            │
│  • Muy amigable y accesible                         │
│  • Bordes redondeados = feeling cálido              │
│  • Perfecta para apps de familia                    │
│  • Muchos pesos                                     │
├─────────────────────────────────────────────────────┤
│  ❌ Contras:                                         │
│  • Puede parecer poco seria para finanzas           │
│  • Los números pueden ser menos "financieros"       │
└─────────────────────────────────────────────────────┘
```

**Uso:** Apps de familia, tareas del hogar, bienestar.

---

### 5. Outfit — Geométrica Equilibrada
**Google Fonts:** https://fonts.google.com/specimen/Outfit

```
┌─────────────────────────────────────────────────────┐
│  Outfit                                              │
│  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm            │
│  1234567890  €$£¥  +−×÷=                            │
├─────────────────────────────────────────────────────┤
│  ✅ Pros:                                            │
│  • Balance perfecto: seria pero amigable            │
│  • Variable font (un solo archivo)                  │
│  • Números tabulares (alinean bien)                 │
│  • Moderna sin ser fría                             │
├─────────────────────────────────────────────────────┤
│  ❌ Contras:                                         │
│  • Relativamente nueva, menos conocida              │
└─────────────────────────────────────────────────────┘
```

**Uso:** Apps modernas que quieren equilibrio.

---

### 6. Manrope — Versátil y Única
**Google Fonts:** https://fonts.google.com/specimen/Manrope

```
┌─────────────────────────────────────────────────────┐
│  Manrope                                             │
│  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm            │
│  1234567890  €$£¥  +−×÷=                            │
├─────────────────────────────────────────────────────┤
│  ✅ Pros:                                            │
│  • Semi-condensada = más texto en menos espacio     │
│  • Personalidad única sin ser extravagante          │
│  • Variable font                                    │
│  • Buena para dashboards                            │
├─────────────────────────────────────────────────────┤
│  ❌ Contras:                                         │
│  • El kerning requiere ajuste en algunos casos      │
└─────────────────────────────────────────────────────┘
```

**Uso:** Dashboards, apps con mucha información.

---

## Escala Tipográfica Recomendada

Para apps iOS/PWA, usar escala basada en **puntos (pt)** que equivalen a **px** en web:

```typescript
const typography = {
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  
  // Display — Números grandes, saldos
  display: {
    large:  { size: '34px', weight: 700, lineHeight: 1.2 },
    medium: { size: '28px', weight: 700, lineHeight: 1.2 },
    small:  { size: '24px', weight: 600, lineHeight: 1.2 },
  },
  
  // Headline — Títulos de sección
  headline: {
    large:  { size: '22px', weight: 600, lineHeight: 1.3 },
    medium: { size: '20px', weight: 600, lineHeight: 1.3 },
    small:  { size: '17px', weight: 600, lineHeight: 1.3 },
  },
  
  // Body — Texto principal
  body: {
    large:  { size: '17px', weight: 400, lineHeight: 1.5 },
    medium: { size: '15px', weight: 400, lineHeight: 1.5 },
    small:  { size: '13px', weight: 400, lineHeight: 1.4 },
  },
  
  // Label — Etiquetas, botones
  label: {
    large:  { size: '15px', weight: 500, lineHeight: 1.3 },
    medium: { size: '13px', weight: 500, lineHeight: 1.3 },
    small:  { size: '11px', weight: 500, lineHeight: 1.2 },
  },
  
  // Caption — Textos secundarios
  caption: {
    size: '12px',
    weight: 400,
    lineHeight: 1.3,
    letterSpacing: '0.02em',
  },
}
```

---

## Implementación en Next.js

### 1. Instalar fuente

En `src/app/layout.tsx`:
```typescript
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### 2. Configurar Tailwind

En `tailwind.config.ts`:
```typescript
export default {
  theme: {
    fontFamily: {
      sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      // Display
      'display-lg': ['34px', { lineHeight: '1.2', fontWeight: '700' }],
      'display-md': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
      'display-sm': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
      // Headline
      'headline-lg': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
      'headline-md': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
      'headline-sm': ['17px', { lineHeight: '1.3', fontWeight: '600' }],
      // Body
      'body-lg': ['17px', { lineHeight: '1.5', fontWeight: '400' }],
      'body-md': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
      'body-sm': ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      // Label
      'label-lg': ['15px', { lineHeight: '1.3', fontWeight: '500' }],
      'label-md': ['13px', { lineHeight: '1.3', fontWeight: '500' }],
      'label-sm': ['11px', { lineHeight: '1.2', fontWeight: '500' }],
    },
  },
}
```

---

## Recomendación para "App Gestión Familiar"

Para una app de **pareja** que mezcla **finanzas + hogar + tareas**:

**1ª opción: Plus Jakarta Sans**
- Balance perfecto entre seria (finanzas) y amigable (hogar)
- Números muy legibles
- Aspecto premium sin ser fría

**2ª opción: Outfit**
- Más moderna, geométrica
- Variable font (ligera)
- Buena para dashboards

**3ª opción: Nunito**
- Si queréis un feeling más "familiar" y menos "financiero"
- Muy amigable y cálida

**Evitaría:** Inter (demasiado genérica) o DM Sans (demasiado fría para una app de pareja).
