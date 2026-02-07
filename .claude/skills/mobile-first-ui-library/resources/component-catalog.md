# Component Catalog — Mobile First UI Library

> Guía de cuándo usar cada componente. iOS-first, adaptable a Android.

---

## Layout Components

### Card
**Usar cuando:** Mostrar un bloque de información agrupada con posible acción.
**No usar cuando:** Es una lista de items homogéneos (usar List).
```
┌─────────────────────────┐
│ 💰 Balance              │  ← Header con icon
│                         │
│  Irene debe 23,50€     │  ← Content
│  a Vicente              │
│                         │
│  [Ver detalle →]        │  ← Action (optional)
└─────────────────────────┘
   radius: 12-16pt
   padding: 16pt
   shadow: 0 1px 3px rgba(0,0,0,0.08)
```

### List (Grouped/Inset)
**Usar cuando:** Items homogéneos con posible acción individual.
**Estilo iOS:** Fondo gris, secciones con fondo blanco y bordes redondeados.
```
── Sección Title ──────────
┌─────────────────────────┐
│ Item 1           Detail >│
│─────────────────────────│
│ Item 2           Detail >│
│─────────────────────────│
│ Item 3           Detail >│
└─────────────────────────┘
```

### StatCard
**Usar cuando:** Dashboard — métricas numéricas con label.
```
┌──────────┐
│ 📊       │
│ 1.340€   │  ← Value (large, bold)
│ Gastado  │  ← Label (muted)
└──────────┘
```

### ProgressBar
**Usar cuando:** Porcentaje de avance (presupuesto, meta, progreso).
```
████████████░░░░░░░  67%
1.340€ / 2.000€
```
Colores: verde (<60%), amarillo (60-80%), naranja (80-100%), rojo (>100%).

---

## Input Components

### Button
**Variantes:**
| Variante | Uso | Ejemplo |
|----------|-----|---------|
| Primary | Acción principal por pantalla | "Empezar compra" |
| Secondary | Acciones alternativas | "Compartir lista" |
| Destructive | Eliminar/cancelar | "Eliminar gasto" |
| Ghost | Acciones terciarias | "Ver más" |
| Icon | Acciones compactas | 📸 ✏️ ⚙️ |

**Regla:** MAX 1 primary button por pantalla visible.

### Input
**Variantes:**
- **Text**: Nombre, concepto, producto
- **Numeric**: Precios (siempre con €), cantidades
- **Search**: Con icono 🔍 y clear button
- **Textarea**: Notas, descripciones

**iOS style:** Dentro de celdas de lista agrupada, no floating labels.

### Switch (Toggle)
**Usar para:** On/off binario (modo oscuro, notificaciones, activo/inactivo).
**No usar para:** Selección de opciones (usar SegmentedControl o Radio).

### SegmentedControl
**Usar para:** 2-5 opciones mutuamente excluyentes que filtran contenido.
```
┌─────────────────────────────────┐
│ [Balance] │ Ingresos │ Gastos  │
└─────────────────────────────────┘
```
**No usar para:** Navegación principal (usar BottomTabBar).

### NumericKeypad (Custom)
**Usar para:** Entrada de precios rápida en modo compra.
```
┌─────────────────────────┐
│         37,50€          │  ← Display
├────────┬────────┬───────┤
│   1    │   2    │   3   │
├────────┼────────┼───────┤
│   4    │   5    │   6   │
├────────┼────────┼───────┤
│   7    │   8    │   9   │
├────────┼────────┼───────┤
│   ,    │   0    │   ⌫   │
├────────┴────────┴───────┤
│          ✅ OK           │
└─────────────────────────┘
```

### DatePicker
**Siempre usar el nativo del navegador** (`<input type="date">`).
En iOS Safari renderiza el picker nativo del sistema.

---

## Overlay Components

### Sheet (Bottom Sheet)
**Usar para:** Formularios, detalles expandidos, selección de opciones.
**Tamaños:** small (25%), medium (50%), large (90%), fullscreen.
```
╔═══════════════════════════════╗
║  ──── (handle)                ║
║                               ║
║  Título del Sheet             ║
║                               ║
║  Contenido...                 ║
║                               ║
║  [Acción principal]           ║
║                               ║
╚═══════════════════════════════╝
```
**iOS style:** Handle visible (5×36pt, centered, radius 2.5pt).
**Dismiss:** Swipe down o tap fuera.

### ActionSheet
**Usar para:** Menú contextual con 2-5 acciones.
```
╔═══════════════════════════════╗
║  ┌───────────────────────┐    ║
║  │ 📸 Hacer foto         │    ║
║  │─────────────────────│    ║
║  │ 🖼️ Elegir de galería │    ║
║  │─────────────────────│    ║
║  │ 📋 Pegar URL         │    ║
║  └───────────────────────┘    ║
║                               ║
║  ┌───────────────────────┐    ║
║  │ Cancelar              │    ║
║  └───────────────────────┘    ║
╚═══════════════════════════════╝
```

### Toast/Snackbar
**Usar para:** Feedback efímero (3s): "Gasto añadido", "Lista guardada".
**Posición:** Top (iOS style), bottom (Android style).
**No usar para:** Errores que requieren acción (usar Alert).

### Alert (Confirmation)
**Usar para:** Confirmaciones destructivas: "¿Eliminar este gasto?".
**Usar `window.confirm()` o dialog nativo** en PWA para máxima compatibilidad iOS.

---

## Navigation Components

### BottomTabBar
**Reglas:**
- 2-5 tabs (iOS HIG)
- 49pt + safe area bottom
- Icon + label siempre (no icon-only)
- Tab activa: accent color. Inactivas: gray
- Tap = switch content. Tap active tab = scroll to top

### NavigationBar (Top)
**Contiene:** Back button (←) + Title + Right actions (max 2).
**44pt height** + safe area top.
**Large title mode:** Title empieza grande (34pt), se colapsa al hacer scroll.

### Swipe Gestures
| Gesto | Uso | Ejemplo |
|-------|-----|---------|
| Swipe right (edge) | Back navigation | Volver atrás |
| Swipe left on item | Quick actions (delete, edit) | Eliminar producto |
| Swipe left (full) | Custom (ej: abrir cámara) | Home → Camera |
| Pull down | Refresh | Actualizar datos |
| Long press | Context menu | Opciones de item |

---

## Feedback Components

### Haptic Feedback (navigator.vibrate)
| Evento | Pattern |
|--------|---------|
| Success | `navigator.vibrate(50)` |
| Warning | `navigator.vibrate([50, 100, 50])` |
| Error | `navigator.vibrate([100, 50, 100, 50, 100])` |
| Budget exceeded | `navigator.vibrate([200])` |

### Empty State
**Siempre mostrar** cuando una lista está vacía:
```
┌─────────────────────────┐
│                         │
│      🛒                 │
│                         │
│  No hay productos       │
│  en tu lista            │
│                         │
│  [+ Añadir producto]    │
│                         │
└─────────────────────────┘
```

### Loading State
- **Skeleton screens** > spinners para listas/cards
- **Pull-to-refresh indicator** para refreshes manuales
- **Inline spinner** solo para acciones puntuales (guardar, enviar)
