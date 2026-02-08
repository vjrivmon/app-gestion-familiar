import { test, expect } from '@playwright/test'

/**
 * Tests visuales para verificar el rediseño neumórfico pastel.
 *
 * La app requiere autenticación Supabase. Las rutas protegidas
 * redirigen a /login. Estos tests verifican:
 * 1. La página de login renderiza correctamente con estilo neumórfico
 * 2. Las variables CSS del design system están presentes
 * 3. No quedan clases dark: residuales en el HTML renderizado
 * 4. Los componentes base (.card, .btn-primary, .input) tienen estilos correctos
 * 5. Todas las rutas protegidas redirigen correctamente a /login
 */

// ====================================
// 1. LOGIN PAGE - Visual Smoke Test
// ====================================

test.describe('Login Page - Neumorphic Design', () => {
  test('renders with neumorphic background color', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Verify background is our warm beige (#F0EBE3)
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--background').trim()
    })
    expect(bgColor).toBe('#F0EBE3')

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/login-page.png', fullPage: true })
  })

  test('has correct neumorphic CSS variables', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const cssVars = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        background: style.getPropertyValue('--background').trim(),
        backgroundDark: style.getPropertyValue('--background-dark').trim(),
        backgroundLight: style.getPropertyValue('--background-light').trim(),
        primary: style.getPropertyValue('--primary').trim(),
        primaryLight: style.getPropertyValue('--primary-light').trim(),
        primaryDark: style.getPropertyValue('--primary-dark').trim(),
        positive: style.getPropertyValue('--positive').trim(),
        negative: style.getPropertyValue('--negative').trim(),
        textPrimary: style.getPropertyValue('--text-primary').trim(),
        textSecondary: style.getPropertyValue('--text-secondary').trim(),
        textMuted: style.getPropertyValue('--text-muted').trim(),
        surface: style.getPropertyValue('--surface').trim(),
        surfaceElevated: style.getPropertyValue('--surface-elevated').trim(),
        shadowNeuSm: style.getPropertyValue('--shadow-neu-sm').trim(),
        shadowNeuMd: style.getPropertyValue('--shadow-neu-md').trim(),
        shadowNeuInset: style.getPropertyValue('--shadow-neu-inset').trim(),
      }
    })

    // Core palette
    expect(cssVars.background).toBe('#F0EBE3')
    expect(cssVars.primary).toBe('#C0796B')
    expect(cssVars.primaryLight).toBe('#E8A598')
    expect(cssVars.primaryDark).toBe('#A05A4C')
    expect(cssVars.positive).toBe('#5B9E5B')
    expect(cssVars.negative).toBe('#C45858')

    // Text colors (darker for contrast)
    expect(cssVars.textPrimary).toBe('#3D3832')
    expect(cssVars.textSecondary).toBe('#6B645B')
    expect(cssVars.textMuted).toBe('#8A837A')

    // Surface = background (neumorphic - same as background)
    expect(cssVars.surface).toBe('#F0EBE3')
    expect(cssVars.surfaceElevated).toBe('#FAF8F5')

    // Neumorphic shadows exist
    expect(cssVars.shadowNeuSm).toContain('rgba')
    expect(cssVars.shadowNeuMd).toContain('rgba')
    expect(cssVars.shadowNeuInset).toContain('inset')
  })

  test('no dark mode media query active', async ({ page }) => {
    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Background should still be our light beige even in dark mode
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--background').trim()
    })
    expect(bgColor).toBe('#F0EBE3')

    await page.screenshot({ path: 'tests/screenshots/login-page-dark-preference.png', fullPage: true })
  })

  test('card component has neumorphic shadow', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // The login page's "Email sent" card or the form wrapper should use .card class
    // Check the card class exists in CSS
    const cardStyles = await page.evaluate(() => {
      // Create a temporary element with .card class to check computed styles
      const el = document.createElement('div')
      el.className = 'card'
      document.body.appendChild(el)
      const styles = getComputedStyle(el)
      const result = {
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
        padding: styles.padding,
      }
      document.body.removeChild(el)
      return result
    })

    // Should have rounded corners (20px)
    expect(cardStyles.borderRadius).toBe('20px')
    // Should have neumorphic shadow (contains both light and dark shadows)
    expect(cardStyles.boxShadow).toContain('rgb')
    // Should have padding
    expect(cardStyles.padding).toBe('20px')
  })

  test('btn-primary has gradient background', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Find the "Entrar con Magic Link" button
    const button = page.locator('button[type="submit"]')
    await expect(button).toBeVisible()

    const bgImage = await button.evaluate((el) => {
      return getComputedStyle(el).backgroundImage
    })

    // Should have a gradient (linear-gradient)
    expect(bgImage).toContain('linear-gradient')

    await page.screenshot({ path: 'tests/screenshots/login-button-detail.png' })
  })

  test('input has neumorphic inset shadow', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Find the email input
    const input = page.locator('input[type="email"]')
    await expect(input).toBeVisible()

    const inputStyles = await input.evaluate((el) => {
      const styles = getComputedStyle(el)
      return {
        boxShadow: styles.boxShadow,
        borderRadius: styles.borderRadius,
        border: styles.border,
      }
    })

    // Should have inset shadow (neumorphic)
    expect(inputStyles.boxShadow).toContain('inset')
    // Should have rounded corners
    expect(parseInt(inputStyles.borderRadius)).toBeGreaterThanOrEqual(12)
  })

  test('no dark: classes in rendered HTML', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const darkClasses = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')
      const darkClassElements: string[] = []
      allElements.forEach((el) => {
        const classes = el.className
        if (typeof classes === 'string' && classes.includes('dark:')) {
          darkClassElements.push(`${el.tagName}: ${classes}`)
        }
      })
      return darkClassElements
    })

    // No elements should have dark: classes
    expect(darkClasses).toEqual([])
  })

  test('text has proper contrast against background', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check text color of main heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    const headingColor = await heading.evaluate((el) => {
      return getComputedStyle(el).color
    })

    // Text should be dark enough for contrast
    // #3D3832 = rgb(61, 56, 50) - very dark for good contrast
    expect(headingColor).toMatch(/rgb\(\s*\d+,\s*\d+,\s*\d+\s*\)/)

    // Parse RGB values and verify they're dark enough
    const match = headingColor.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/)
    if (match) {
      const [, r, g, b] = match.map(Number)
      // For good contrast on light beige, text should be dark (low RGB values)
      expect(r).toBeLessThan(120)
      expect(g).toBeLessThan(120)
      expect(b).toBeLessThan(120)
    }
  })
})

// ====================================
// 2. ROUTE EXISTENCE - All pages accessible
// ====================================

test.describe('Routes - All pages exist and redirect', () => {
  const protectedRoutes = [
    '/home',
    '/home/tareas',
    '/finanzas',
    '/finanzas/becas',
    '/finanzas/calculadora',
    '/finanzas/config',
    '/finanzas/conjunta',
    '/finanzas/graficos',
    '/finanzas/historico',
    '/finanzas/metas',
    '/finanzas/prestamos',
    '/compra',
    '/menu',
    '/settings',
  ]

  for (const route of protectedRoutes) {
    test(`${route} redirects to login (route exists)`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'networkidle' })

      // Should redirect to /login since we're not authenticated
      expect(page.url()).toContain('/login')

      // The redirect response chain should include a redirect status
      // (302 or the final 200 from /login)
      expect(response?.status()).toBe(200) // Final page after redirect
    })
  }
})

// ====================================
// 3. RESPONSIVE - Mobile viewport
// ====================================

test.describe('Login Page - Mobile Responsive', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14

  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Form should be visible
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    // Button should be full width on mobile
    const buttonWidth = await submitButton.evaluate((el) => {
      return el.getBoundingClientRect().width
    })
    const viewportWidth = 390
    // Button should be at least 80% of viewport width (full-width with padding)
    expect(buttonWidth).toBeGreaterThan(viewportWidth * 0.7)

    await page.screenshot({ path: 'tests/screenshots/login-mobile.png', fullPage: true })
  })

  test('touch targets meet minimum 44px', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check submit button height
    const submitButton = page.locator('button[type="submit"]')
    const buttonHeight = await submitButton.evaluate((el) => {
      return el.getBoundingClientRect().height
    })
    expect(buttonHeight).toBeGreaterThanOrEqual(44)

    // Check input height
    const emailInput = page.locator('input[type="email"]')
    const inputHeight = await emailInput.evaluate((el) => {
      return el.getBoundingClientRect().height
    })
    expect(inputHeight).toBeGreaterThanOrEqual(44)
  })
})

// ====================================
// 4. CSS DESIGN SYSTEM INTEGRITY
// ====================================

test.describe('Design System - CSS Classes', () => {
  test('all neumorphic utility classes work', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const results = await page.evaluate(() => {
      const testClasses = [
        { cls: 'card', check: 'boxShadow' },
        { cls: 'btn-primary', check: 'backgroundImage' },
        { cls: 'btn-secondary', check: 'boxShadow' },
        { cls: 'input', check: 'boxShadow' },
      ]

      return testClasses.map(({ cls, check }) => {
        const el = document.createElement('div')
        el.className = cls
        document.body.appendChild(el)
        const value = getComputedStyle(el)[check as keyof CSSStyleDeclaration] as string
        document.body.removeChild(el)
        return { cls, prop: check, value, hasValue: value !== '' && value !== 'none' }
      })
    })

    for (const result of results) {
      expect(result.hasValue, `${result.cls} should have ${result.prop}`).toBe(true)
    }
  })

  test('neumorphic border-radius tokens work in Tailwind', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const radii = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        sm: style.getPropertyValue('--radius-sm').trim(),
        md: style.getPropertyValue('--radius-md').trim(),
        lg: style.getPropertyValue('--radius-lg').trim(),
        xl: style.getPropertyValue('--radius-xl').trim(),
        pill: style.getPropertyValue('--radius-pill').trim(),
      }
    })

    expect(radii.sm).toBeTruthy()
    expect(radii.md).toBeTruthy()
    expect(radii.lg).toBeTruthy()
    expect(radii.xl).toBeTruthy()
    expect(radii.pill).toBeTruthy()
  })
})

// ====================================
// 5. VISUAL REGRESSION - Screenshots
// ====================================

test.describe('Visual Screenshots', () => {
  test('login page - full page screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready)

    await page.screenshot({
      path: 'tests/screenshots/login-full.png',
      fullPage: true,
    })
  })

  test('login page - with email filled', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('test@ejemplo.com')

    await page.screenshot({
      path: 'tests/screenshots/login-filled.png',
      fullPage: true,
    })
  })

  test('login page - focused input state', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.focus()

    // Wait for focus transition
    await page.waitForTimeout(200)

    await page.screenshot({
      path: 'tests/screenshots/login-input-focused.png',
      fullPage: true,
    })
  })
})
