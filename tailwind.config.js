/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        summit: {
          50: '#f0f9f4',
          100: '#dcf0e3',
          200: '#bbe0cb',
          300: '#8ec8a9',
          400: '#5baa82',
          500: '#388d64',
          600: '#28714f',
          700: '#205b41',
          800: '#1c4935',
          900: '#183c2d',
          950: '#0d2219',
        },
        alpine: {
          50: '#f4f6fa',
          100: '#e8ecf3',
          200: '#ccd5e5',
          300: '#a2b3d0',
          400: '#728ab7',
          500: '#526ca0',
          600: '#3f5486',
          700: '#35456e',
          800: '#2e3a5c',
          900: '#2a334f',
          950: '#1c2235',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      backgroundImage: {
        'mountain-gradient': 'linear-gradient(180deg, #1c2235 0%, #2a334f 30%, #205b41 70%, #388d64 100%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(28,34,53,0.95) 0%, rgba(32,91,65,0.8) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
