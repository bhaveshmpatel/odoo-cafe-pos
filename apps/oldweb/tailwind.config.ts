import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111111',
          active: '#242424',
          disabled: '#e5e7eb',
        },
        ink: '#111111',
        body: '#374151',
        muted: {
          DEFAULT: '#6b7280',
          soft: '#898989',
        },
        hairline: {
          DEFAULT: '#e5e7eb',
          soft: '#f3f4f6',
        },
        canvas: '#ffffff',
        surface: {
          soft: '#f8f9fa',
          card: '#f5f5f5',
          strong: '#e5e7eb',
          dark: '#101010',
          'dark-elevated': '#1a1a1a',
        },
        'on-primary': '#ffffff',
        'on-dark': {
          DEFAULT: '#ffffff',
          soft: '#a1a1aa',
        },
        'brand-accent': '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        badge: {
          orange: '#fb923c',
          pink: '#ec4899',
          violet: '#8b5cf6',
          emerald: '#34d399',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
        full: '9999px',
      },
      spacing: {
        section: '96px',
      },
      fontSize: {
        'display-xl': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['2.25rem', { lineHeight: '1.15', fontWeight: '700' }],
        'display-md': ['1.875rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        overline: ['0.6875rem', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0,0,0,0.05)',
        card: '0 4px 12px rgba(0,0,0,0.08)',
        glow: '0 0 40px rgba(59, 130, 246, 0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};

export default config;
