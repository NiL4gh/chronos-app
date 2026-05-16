export default function Card({ children, className = '', elevated = false, padding = 'p-6' }) {
  const base = elevated
    ? 'rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl shadow-black/40'
    : 'rounded-xl border border-neutral-800 bg-neutral-900'

  return (
    <div className={`${base} ${padding} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base font-medium text-neutral-100 ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs text-neutral-500 mt-0.5 ${className}`}>
      {children}
    </p>
  )
}
