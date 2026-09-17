/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crime: {
          bg:      '#060915',
          surface: '#0a0f1e',
          card:    '#0d1224',
          border:  '#1a2035',
          accent:  '#00ff88',
          red:     '#ff3366',
          amber:   '#ffaa00',
          blue:    '#00aaff',
          purple:  '#9d4edd',
          teal:    '#00ccaa',
          orange:  '#ff6600',
          muted:   '#475569',
          text:    '#e2e8f0',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'scan':        'scanLine 4s linear infinite',
        'float':       'float 4s ease-in-out infinite',
        'fade-up':     'fadeInUp 0.5s ease forwards',
        'fade-left':   'fadeInLeft 0.4s ease forwards',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          '100%': { boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88' },
        },
        scanLine: {
          '0%':   { top: '0%', opacity: 0 },
          '10%':  { opacity: 1 },
          '90%':  { opacity: 1 },
          '100%': { top: '100%', opacity: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
      },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: []
}
