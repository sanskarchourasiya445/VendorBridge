/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand primary (blue) — full scale derived from #1a56db
        primary: {
          50: '#eff5ff',
          100: '#dbe7fe',
          200: '#bfd3fe',
          300: '#93b4fd',
          400: '#608cfa',
          500: '#3b66f6',
          600: '#1a56db', // base
          700: '#1742b0',
          800: '#18398e',
          900: '#193473',
          950: '#142147',
        },
        // Semantic
        success: {
          DEFAULT: '#057a55',
          50: '#f3faf7',
          100: '#def7ec',
          200: '#bcf0da',
          500: '#0e9f6e',
          600: '#057a55',
          700: '#046c4e',
          800: '#03543f',
        },
        warning: {
          DEFAULT: '#c27803',
          50: '#fdfdea',
          100: '#fef3c7',
          200: '#fce96a',
          500: '#e3a008',
          600: '#c27803',
          700: '#9f580a',
          800: '#8e4b10',
        },
        danger: {
          DEFAULT: '#e02424',
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          500: '#f05252',
          600: '#e02424',
          700: '#c81e1e',
          800: '#9b1c1c',
        },
        // Sidebar / dark surfaces
        sidebar: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          active: '#1a56db',
          border: '#1e293b',
          muted: '#64748b',
          text: '#cbd5e1',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.1), 0 2px 6px -2px rgba(15, 23, 42, 0.06)',
        dropdown: '0 10px 28px -6px rgba(15, 23, 42, 0.18)',
        modal: '0 20px 48px -12px rgba(15, 23, 42, 0.28)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
