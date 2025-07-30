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
        // Premium gradient backgrounds
        'dark': {
          'primary': '#000000',
          'secondary': '#0a0a0a',
          'tertiary': '#111111',
          'gradient-start': '#000000',
          'gradient-mid': '#0a0a0f',
          'gradient-end': '#0f0a1a',
        },
        // Sophisticated glass morphism
        'glass': {
          'primary': 'rgba(255, 255, 255, 0.03)',
          'secondary': 'rgba(255, 255, 255, 0.05)',
          'tertiary': 'rgba(255, 255, 255, 0.08)',
          'border': 'rgba(255, 255, 255, 0.08)',
          'border-strong': 'rgba(255, 255, 255, 0.12)',
          'purple': 'rgba(139, 92, 246, 0.05)',
          'purple-border': 'rgba(139, 92, 246, 0.15)',
        },
        // Refined purple palette
        'purple': {
          '50': '#faf7ff',
          '100': '#f3edff',
          '200': '#e9ddff',
          '300': '#d4c2ff',
          '400': '#b794ff',
          '500': '#9b5cff',
          '600': '#8b3dff',
          '700': '#7c2dff',
          '800': '#6b1fff',
          '900': '#5b15e6',
          '950': '#3d0a99',
        },
        // Professional accent colors
        'accent': {
          'blue': '#3b82f6',
          'green': '#10b981',
          'red': '#ef4444',
          'orange': '#f59e0b',
          'purple': '#8b5cf6',
          'purple-light': '#a78bfa',
          'purple-dark': '#7c3aed',
        },
        // Typography colors
        'text': {
          'primary': '#ffffff',
          'secondary': '#a1a1aa',
          'tertiary': '#71717a',
          'muted': '#52525b',
        }
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-jetbrains-mono)', 'Menlo', 'Monaco', 'monospace'],
      },
      // Premium animations with physics-based motion
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      // Enhanced spacing for premium layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Professional shadows
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.16)',
        'purple': '0 8px 32px rgba(139, 92, 246, 0.15)',
        'purple-lg': '0 16px 64px rgba(139, 92, 246, 0.2)',
        'inner-glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      // Gradient backgrounds
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #0a0a0f 50%, #0f0a1a 100%)',
        'gradient-purple': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      }
    },
  },
  plugins: [],
}
export default config