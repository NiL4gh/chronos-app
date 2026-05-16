/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['DM Sans', 'sans-serif'],
      },
      colors: {
        // All base neutral/accent colors are standard Tailwind.
        // Custom semantic aliases for convenience:
        surface: {
          DEFAULT: '#171717',  // neutral-900
          elevated: '#262626', // neutral-800
          overlay: '#0a0a0a',  // neutral-950
        },
        accent: {
          DEFAULT: '#8b5cf6', // violet-500
          hover: '#a78bfa',   // violet-400
          muted: 'rgba(139,92,246,0.15)',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'elevated': '0 10px 40px rgba(0,0,0,0.5)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
