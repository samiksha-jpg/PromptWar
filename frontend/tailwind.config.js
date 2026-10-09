/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        space: {
          950: '#050811',
          900: '#070b14',
          850: '#0b1120',
          800: '#0f172a',
          750: '#15203b',
          700: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-teal': '0 0 35px -5px rgba(20, 184, 166, 0.35)',
        'glow-teal-lg': '0 0 55px -10px rgba(20, 184, 166, 0.45)',
        'glow-amber': '0 0 30px -5px rgba(245, 158, 11, 0.3)',
        'glow-purple': '0 0 30px -5px rgba(168, 85, 247, 0.3)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
