function getActivityColor(value) {
  if (value >= 70) return 'bg-emerald-500'
  if (value >= 35) return 'bg-amber-500'
  return 'bg-red-500'
}

function getProgressColor(value) {
  if (value >= 85) return 'bg-emerald-500'
  if (value >= 50) return 'bg-violet-500'
  return 'bg-amber-500'
}

export function ActivityBar({ value = 0, className = '' }) {
  const color = getActivityColor(value)
  return (
    <div className={`h-1 w-full rounded-full bg-neutral-800 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, label, showPercent = true, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const color = getProgressColor(pct)

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-neutral-500">{label}</span>}
          {showPercent && (
            <span className="text-xs font-mono text-neutral-400">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function CircularProgress({ value = 0, max = 100, size = 80, strokeWidth = 6, label, sublabel }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const trackColor = '#262626'
  const progressColor = pct >= 85 ? '#10b981' : pct >= 50 ? '#8b5cf6' : '#f59e0b'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-sm font-semibold text-neutral-100 font-mono">{label}</span>}
        {sublabel && <span className="text-xs text-neutral-600">{sublabel}</span>}
      </div>
    </div>
  )
}

export default ProgressBar
