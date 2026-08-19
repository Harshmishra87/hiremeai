/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0e1e',
        deep: '#0d1128',
        midnight: '#131a3a',
        accent: {
          purple: '#7c5cff',
          violet: '#9d7bff',
          blue: '#4f7cff',
          cyan: '#5ce1e6',
        },
        glass: {
          light: 'rgba(255,255,255,0.10)',
          border: 'rgba(255,255,255,0.14)',
          dark: 'rgba(10,14,30,0.55)',
        },
        ink: {
          primary: '#f3f5fb',
          secondary: '#aab0d1',
          muted: '#6d7399',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        dock: '0 10px 40px rgba(0,0,0,0.45)',
        glow: '0 0 40px rgba(124,92,255,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float-slow': 'float 12s ease-in-out infinite',
        'float-slower': 'float 18s ease-in-out infinite',
        'aurora': 'aurora 24s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(20px,-30px)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate(-5%, -5%) rotate(0deg) scale(1)' },
          '50%': { transform: 'translate(5%, 5%) rotate(8deg) scale(1.15)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
