import React from 'react';

// ActivityBar — color by activity value 0–100
export function ActivityBar({ value = 0, className = '' }) {
  const color =
    value > 75 ? 'bg-emerald-500' :
    value >= 40 ? 'bg-amber-400' :
    'bg-red-400';

  return (
    <div
      title={`${value}% Activity (Requires Desktop App)`}
      className={`h-1 w-full rounded-full overflow-hidden ${className}`}
      style={{ background: 'var(--bg-sunken)' }}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ProgressBar — color by % of goal achieved
export function ProgressBar({ value = 0, max = 100, className = '' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color =
    pct >= 85 ? 'bg-emerald-500' :
    pct >= 50 ? 'bg-amber-400' :
    'bg-red-400';

  return (
    <div
      className={`h-1.5 w-full rounded-full overflow-hidden ${className}`}
      style={{ background: 'var(--bg-sunken)' }}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

// CircularProgress — SVG ring with center label
export function CircularProgress({ value = 0, max = 100, size = 80, strokeWidth = 6, label = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const color =
    pct >= 85 ? '#10b981' :  // emerald-500
    pct >= 50 ? '#fbbf24' :  // amber-400
    '#f87171';               // red-400

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--border-default)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Center label — counter-rotate so text is upright */}
      <text
        x="50%" y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: 'center',
          fill: 'var(--text-primary)',
          fontSize: size * 0.22,
          fontFamily: 'ui-monospace, monospace',
          fontWeight: 600,
        }}
      >
        {label}
      </text>
    </svg>
  );
}
