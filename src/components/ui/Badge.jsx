const variantClasses = {
  success:
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warning:
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20',
  danger:
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20',
  info:
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20',
  neutral:
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-neutral-700/50 text-neutral-400 border border-neutral-700',
  violet:
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const base = variantClasses[variant] ?? variantClasses.neutral
  return (
    <span className={`${base} ${className}`}>
      {children}
    </span>
  )
}
