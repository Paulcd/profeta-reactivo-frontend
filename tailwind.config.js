/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocre: '#D4A574',
        pacifico: '#2E8B9E',
        mineria: '#7CB342',
        'dark-bg': '#0F1419',
        'dark-surface': '#161C23',
        'dark-border': '#3A3A3A',
        'text-main': '#E8E8E8',
        'text-muted': '#8A97A3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        container: '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease',
        'spin-slow': 'spinSlow 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
