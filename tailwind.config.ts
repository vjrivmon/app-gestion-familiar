import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Coral naranja
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        
        // Semantic
        positive: 'var(--positive)',
        'positive-light': 'var(--positive-light)',
        negative: 'var(--negative)',
        'negative-light': 'var(--negative-light)',
        warning: 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        
        // Surfaces
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        
        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        
        // Borders
        border: 'var(--border)',
        separator: 'var(--separator)',
        
        // Legacy (compatibilidad)
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'tab-bar': 'calc(49px + env(safe-area-inset-bottom))',
      },
      padding: {
        'tab-bar': 'calc(49px + env(safe-area-inset-bottom))',
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '16px',
      },
    },
  },
  plugins: [],
}

export default config
