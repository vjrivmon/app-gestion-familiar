# iOS Patterns — HIG Compliance for Web Apps / PWA

---

## PWA Setup Checklist

### manifest.json
```json
{
  "name": "App Name",
  "short_name": "App",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#F2F2F7",
  "background_color": "#F2F2F7",
  "start_url": "/",
  "scope": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
```

### Safe Areas CSS
```css
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
  --sar: env(safe-area-inset-right);
}

/* Main content */
.app-content {
  padding-top: var(--sat);
  padding-bottom: calc(49px + var(--sab)); /* tab bar + safe area */
}

/* Tab bar */
.tab-bar {
  position: fixed;
  bottom: 0;
  height: calc(49px + var(--sab));
  padding-bottom: var(--sab);
}
```

---

## iOS-Specific Behaviors

### Prevent Rubber Banding (Full Page)
```css
html, body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

.scrollable-content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}
```

### Disable Text Selection on Interactive Elements
```css
button, .interactive {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```

### Prevent Zoom on Input Focus
```css
input, select, textarea {
  font-size: 16px; /* iOS zooms if <16px */
}
```

### Disable Pull-to-Refresh (when custom implementation)
```css
body {
  overscroll-behavior-y: none;
}
```

### Status Bar Overlap (standalone mode)
```css
.header {
  padding-top: max(env(safe-area-inset-top), 20px);
}
```

---

## iOS Design Patterns

### Grouped List (Settings Style)
```
Background: #F2F2F7 (system gray 6)

┌─────────────────────────────────┐  ← White, radius 10pt
│ Label                    Value >│  ← 44pt row height
│─────────────────────────────────│  ← Separator (indent 16pt)
│ Label                    Value >│
│─────────────────────────────────│
│ Label                    Value >│
└─────────────────────────────────┘

Section footer: muted text, 13pt
```

### Action Sheet Pattern
- Always include "Cancel" as separate bottom group
- Destructive actions in red
- Max 6-7 options before it scrolls

### Swipe Actions on List Items
```
← Swipe Left:
  [Flag]  [Delete]     (right side actions)

→ Swipe Right:
  [Pin]   [Read]       (left side actions)
```
- Primary action (leftmost) activates on full swipe
- Destructive = red background
- Use `react-swipeable` or custom touch handlers

### Pull to Refresh
```
  ↓ Pull down
  
  ●●● (loading dots, not spinner)
  
  Content refreshes
```
- Threshold: ~80px pull distance
- Haptic on trigger: `navigator.vibrate(10)`

### Large Title Pattern
```
Before scroll:        After scroll (>50px):
┌──────────────┐     ┌──────────────┐
│              │     │ Title    [+] │ ← 44pt, compact
│ Large Title  │     ├──────────────┤
│ 34pt Bold    │     │ Content...   │
├──────────────┤     │              │
│ Content...   │     
```

---

## Touch & Gesture Guidelines

### Touch Targets
- **Minimum:** 44×44pt (Apple HIG)
- **Recommended:** 48×48pt for primary actions
- **Spacing between targets:** minimum 8pt

### Gesture Conflict Resolution
| Priority | Gesture | Zone |
|----------|---------|------|
| 1 | System (swipe from edges) | 20pt from screen edge |
| 2 | App navigation (swipe back) | Left 44pt edge |
| 3 | Content gestures (swipe to delete) | Content area |
| 4 | Scroll | Vertical axis |

### Thumb Zone (one-handed use)
```
┌───────────────────┐
│  Hard to reach    │  ← Top 30%: less frequent actions
│                   │
├───────────────────┤
│  Comfortable      │  ← Middle 40%: content/browsing
│                   │
├───────────────────┤
│  Easy / Primary   │  ← Bottom 30%: primary actions, nav
└───────────────────┘
```
**Rule:** Primary actions go at the bottom. Navigation goes at the bottom.

---

## Dark Mode

### Detection
```css
@media (prefers-color-scheme: dark) { ... }
```

```typescript
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
```

### iOS Dark Mode Colors
```
Background:     #000000 (true black for OLED)
Surface:        #1C1C1E (elevated)
Surface 2:      #2C2C2E (grouped bg)
Surface 3:      #3A3A3C (tertiary)
Separator:      #38383A
Text Primary:   #FFFFFF
Text Secondary: #8E8E93
```

### Rules
- Never use gray backgrounds in dark mode — use true black (#000)
- Shadows are invisible in dark mode — use borders or elevation
- Reduce vibrancy of accent colors slightly
- Test with "Smart Invert" accessibility setting
