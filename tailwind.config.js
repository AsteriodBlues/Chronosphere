/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'gloock': ['Gloock', 'serif'],
      },
      colors: {
        'chrome': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        'plasma': {
          50: '#fef7ff',
          100: '#feeeff', 
          200: '#fcdaff',
          300: '#f9b8ff',
          400: '#f486ff',
          500: '#ec4fff',
          600: '#d636e5',
          700: '#b322c2',
          800: '#931e9e',
          900: '#7a1c81',
        },
        'aurora': {
          northern: '#00ff88',
          borealis: '#ff0088',
          cosmic: '#8800ff',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'sphere-gradient': 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'sphere-breathe': 'breathe 4s ease-in-out infinite',
        'particle-float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
        'aurora-flow': 'aurora 8s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)' },
          '66%': { transform: 'translateY(10px) rotate(240deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255,255,255,0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.4)' },
        },
        aurora: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(255, 255, 255, 0.5)',
        'plasma': '0 0 30px rgba(236, 79, 255, 0.6)',
      },
    },
  },
  plugins: [],
}