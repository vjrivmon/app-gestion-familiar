# Checklist de Consistencia Visual

> Usar antes de cada commit/PR para garantizar consistencia.

---

## 🎨 Colores

- [ ] **No hay colores hardcoded** — Todos vienen de variables/tokens
- [ ] **Colores semánticos correctos:**
  - `positive` para dinero entrante, éxito, confirmaciones
  - `negative` para dinero saliente, errores, eliminaciones  
  - `warning` para alertas, atención requerida
  - `primary` para acciones principales, CTAs
- [ ] **Consistencia de tonos:**
  - No mezclar diferentes verdes/azules sin propósito
  - Usar `primary-light`/`primary-dark` para variantes
- [ ] **Dark mode verificado:**
  - Los colores cambian correctamente
  - El contraste es suficiente (4.5:1 mínimo texto)

### Búsqueda de problemas:
```bash
# Buscar colores hex hardcoded
grep -r "#[0-9A-Fa-f]\{6\}" src/components --include="*.tsx" | grep -v "token\|theme"
```

---

## 📝 Tipografía

- [ ] **Una sola familia tipográfica** (máximo 2 si hay monospace para números)
- [ ] **Tamaños de la escala definida:**
  - No usar `text-[14px]` arbitrarios
  - Usar `text-body-md`, `text-headline-sm`, etc.
- [ ] **Pesos consistentes:**
  - Regular (400) para body
  - Medium (500) para labels
  - Semibold (600) para headlines
  - Bold (700) para display/números grandes
- [ ] **Line-height apropiado:**
  - Títulos: 1.2-1.3
  - Body: 1.4-1.5
  - Labels: 1.2-1.3

### Búsqueda de problemas:
```bash
# Buscar tamaños de fuente arbitrarios
grep -r "text-\[" src/components --include="*.tsx"
```

---

## 📐 Espaciado

- [ ] **Escala de 4px base:** 4, 8, 12, 16, 20, 24, 32, 48
- [ ] **Padding consistente:**
  - Cards: `p-4` (16px)
  - Secciones: `p-4` a `p-6`
  - Items de lista: `py-3` a `py-4`
- [ ] **Gap consistente:**
  - Entre elementos relacionados: `gap-2` (8px)
  - Entre secciones: `gap-4` a `gap-6`
- [ ] **Touch targets:** Mínimo 44px de altura para botones/links

### Búsqueda de problemas:
```bash
# Buscar espaciados no estándar
grep -rE "p-[0-9]+|m-[0-9]+" src/components --include="*.tsx" | grep -vE "p-[0-4]|p-6|p-8|m-[0-4]|m-6|m-8"
```

---

## 🔲 Bordes y Sombras

- [ ] **Border radius consistente:**
  - Cards/Modals: `rounded-xl` (12px) o `rounded-2xl` (16px)
  - Inputs/Buttons: `rounded-lg` (8px) o `rounded-xl`
  - Chips/Badges: `rounded-full`
- [ ] **Sombras consistentes:**
  - Cards: `shadow-sm` o `shadow`
  - Modals: `shadow-lg` o `shadow-xl`
  - No mezclar sombras arbitrarias
- [ ] **Bordes:**
  - Color: `border-[var(--border)]`
  - No usar grises arbitrarios

---

## 🔘 Estados

- [ ] **Estados hover/active definidos:**
  - Hover: `hover:opacity-90` o `hover:bg-primary-light`
  - Active: `active:scale-95` o `active:opacity-80`
- [ ] **Estados disabled:**
  - `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] **Estados focus:**
  - `focus:ring-2 focus:ring-primary`

---

## 📱 Responsive

- [ ] **Mobile-first:** Estilos base son para móvil
- [ ] **Breakpoints estándar:**
  - `sm:` (640px) — Tablets pequeñas
  - `md:` (768px) — Tablets
  - `lg:` (1024px) — Desktop
- [ ] **Touch-friendly en móvil:**
  - Botones 44px mínimo
  - Espaciado suficiente entre elementos táctiles

---

## ✅ Checklist Rápido Pre-Commit

```
□ No hay #HEXCODES en el código (solo variables)
□ Tipografía usa clases de la escala
□ Espaciado usa valores de la escala (4, 8, 12, 16...)
□ Dark mode funciona
□ Touch targets ≥ 44px
□ Estados hover/active/disabled definidos
```

---

## Script de Validación

```bash
#!/bin/bash
# validate-consistency.sh

echo "🎨 Checking hardcoded colors..."
COLORS=$(grep -r "#[0-9A-Fa-f]\{6\}" src/components --include="*.tsx" | grep -v "token\|theme\|// " | wc -l)
if [ $COLORS -gt 0 ]; then
  echo "❌ Found $COLORS hardcoded colors"
  grep -r "#[0-9A-Fa-f]\{6\}" src/components --include="*.tsx" | grep -v "token\|theme\|// "
else
  echo "✅ No hardcoded colors"
fi

echo ""
echo "📝 Checking arbitrary font sizes..."
FONTS=$(grep -r "text-\[" src/components --include="*.tsx" | wc -l)
if [ $FONTS -gt 0 ]; then
  echo "⚠️  Found $FONTS arbitrary font sizes"
else
  echo "✅ Font sizes OK"
fi

echo ""
echo "📐 Checking arbitrary spacing..."
SPACING=$(grep -rE "\[[0-9]+px\]" src/components --include="*.tsx" | wc -l)
if [ $SPACING -gt 0 ]; then
  echo "⚠️  Found $SPACING arbitrary spacing values"
else
  echo "✅ Spacing OK"
fi
```
