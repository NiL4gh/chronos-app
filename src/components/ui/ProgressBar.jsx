import React from 'react';

// ActivityBar — color by activity value 0–100
export function ActivityBar({ value = 0, className = '' }) {
  return (
    <div
      title={`${value}% Activity (Requires Desktop App)`}
      className={`progress-track ${className}`}
    >
      <div
        className="progress-fill"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: value > 75 ? 'var(--success-text)'
                    : value > 40 ? 'var(--warning-text)'
                    : 'var(--danger-text)',
        }}
      />
    </div>
  );
}

// ProgressBar — color by % of goal achieved
export function ProgressBar({ value = 0, max = 100, className = '' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className={`progress-track ${className}`}>
      <div
        className="progress-fill"
        style={{
          width: `${Math.min(100, pct)}%`,
          background: pct >= 85 ? 'var(--success-text)'
                    : pct >= 50 ? 'var(--warning-text)'
                    : 'var(--danger-text)',
        }}
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
    pct >= 85 ? 'var(--success-text)' :
    pct >= 50 ? 'var(--warning-text)' :
    'var(--danger-text)';

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
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
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
