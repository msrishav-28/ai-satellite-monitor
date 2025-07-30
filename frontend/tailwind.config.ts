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
        'glass': {
          'white': 'rgba(255, 255, 255, 0.05)',
          'border': 'rgba(255, 255, 255, 0.1)',
        },
        'dark': {
          'primary': '#0a0f1b',
          'secondary': '#141b2d',
        },
        'accent': {
          'blue': '#3b82f6',
          'green': '#10b981',
          'red': '#ef4444',
          'orange': '#f59e0b',
          'purple': '#a855f7',
        }
      },
      fontFamily: {
        'sans': ['var(--font-inter)'],
        'display': ['var(--font-space-grotesk)'],
        'mono': ['var(--font-jetbrains-mono)'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' },
          'to': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
export default config