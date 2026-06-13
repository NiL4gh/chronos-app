/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // "mono" intentionally also resolves to Inter, with tabular figures, so
        // existing `font-mono` usages render aligned numbers in the UI typeface.
        mono: [['Inter', '-apple-system', 'sans-serif'], { fontFeatureSettings: '"tnum"' }],
      },
      colors: {
        canvas:   'var(--bg-canvas)',
        surface:  'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        sunken:   'var(--bg-sunken)',
        hover:    'var(--bg-hover)',
        accent:        'var(--accent)',
        'accent-hover':'var(--accent-hover)',
        'accent-on':   'var(--accent-on)',
        'accent-subtle':'var(--accent-subtle)',
        success: 'var(--success-text)',
        danger:  'var(--danger-text)',
        info:    'var(--info-text)',
      },
      borderColor: {
        'default':  'var(--border-default)',
        'strong':   'var(--border-strong)',
        'focus':    'var(--border-focus)',
        'accent':   'var(--accent)',
      },
      textColor: {
        'primary':   'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'tertiary':  'var(--text-tertiary)',
        'muted':     'var(--text-muted)',
        'disabled':  'var(--text-disabled)',
        'accent':    'var(--accent-text)',
      },
      boxShadow: {
        'glow-amber':  '0 0 24px rgba(245, 158, 11, 0.25)',
        'glow-amber-lg': '0 0 40px rgba(245, 158, 11, 0.35)',
        'glass':       '0 4px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,200,120,0.06)',
        'glass-lg':    '0 8px 40px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,200,120,0.08)',
      },
      backdropBlur: {
        'xs': '4px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':         'fade-in 0.20s ease-out forwards',
        'slide-up':        'slide-up 0.25s ease-out forwards',
        'slide-in-right':  'slide-in-right 0.20s ease-out forwards',
        'slide-in-left':   'slide-in-left 0.20s ease-out forwards',
        'glow-pulse':      'glow-pulse 2s ease-in-out infinite',
        'pulse-dot':       'pulse-dot 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'calendar-next':   'calendar-slide-next 0.12s ease-out forwards',
        'calendar-prev':   'calendar-slide-prev 0.12s ease-out forwards',
        'bar-grow': 'bar-grow 0.5s ease-out forwards',
        'status-pulse': 'status-pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(245,158,11,0.20)' },
          '50%':       { boxShadow: '0 0 28px rgba(245,158,11,0.50)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
        'calendar-slide-next': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'calendar-slide-prev': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'bar-grow': {
          'from': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          'to':   { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        'status-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
