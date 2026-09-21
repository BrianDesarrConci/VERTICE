import type { Config } from 'tailwindcss';

// Sistema de diseño VÉRTICE — e-commerce de moda (inspiración Shein / KOAJ / H&M).
// Marca: verde lima #7DD100 (principal) + #BEEE00 (secundario).
const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Verde lima marca — 500 = #7DD100 (principal).
        brand: {
          50: '#f4fce1',
          100: '#e6f9bd',
          200: '#d3f38a',
          300: '#bdea54',
          400: '#a3de26',
          500: '#7DD100',
          600: '#6bb800',
          700: '#528e00',
          800: '#406e07',
          900: '#375c0c',
        },
        // Secundario #BEEE00 (amarillo-lima) para acentos y degradados.
        lime2: {
          DEFAULT: '#BEEE00',
          soft: '#d6f24d',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '"SF Pro Display"',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        lift: '0 10px 40px rgba(0,0,0,0.12)',
        glow: '0 8px 30px rgba(125,209,0,0.35)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Burbujas ascendentes del fondo.
        'bubble-rise': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(-115vh) scale(1.15)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
