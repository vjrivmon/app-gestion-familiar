import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Rosa Melocoton
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',

        // Secondary - Verde Menta/Salvia
        secondary: 'var(--secondary)',
        'secondary-light': 'var(--secondary-light)',
        'secondary-dark': 'var(--secondary-dark)',

        // Accent - Azul Cielo
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        'accent-dark': 'var(--accent-dark)',

        // Semantic - Pastel
        positive: 'var(--positive)',
        'positive-light': 'var(--positive-light)',
        'positive-dark': 'var(--positive-dark)',
        negative: 'var(--negative)',
        'negative-light': 'var(--negative-light)',
        'negative-dark': 'var(--negative-dark)',
        warning: 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        'warning-dark': 'var(--warning-dark)',

        // Surfaces
        background: 'var(--background)',
        'background-dark': 'var(--background-dark)',
        'background-light': 'var(--background-light)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',

        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',

        // Borders
        border: 'var(--border)',
        separator: 'var(--separator)',
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
        'neu-sm': 'var(--radius-sm)',
        'neu-md': 'var(--radius-md)',
        'neu-lg': 'var(--radius-lg)',
        'neu-xl': 'var(--radius-xl)',
        'pill': 'var(--radius-pill)',
        // Legacy
        'ios': '12px',
        'ios-lg': '16px',
      },
      boxShadow: {
        // Neumorficas elevadas (convexo)
        'neu-sm': 'var(--shadow-neu-sm)',
        'neu-md': 'var(--shadow-neu-md)',
        'neu-lg': 'var(--shadow-neu-lg)',
        // Neumorficas hundidas (concavo)
        'neu-inset': 'var(--shadow-neu-inset)',
        'neu-inset-sm': 'var(--shadow-neu-inset-sm)',
        'neu-pressed': 'var(--shadow-neu-pressed)',
      },
    },
  },
  plugins: [],
}

export default config
