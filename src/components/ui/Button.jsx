import { forwardRef } from 'react'

const variantClasses = {
  primary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
  danger:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
  success:
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',
  lg: 'px-5 py-2.5 text-base',
}

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', ...props },
  ref
) {
  const base = variantClasses[variant] ?? variantClasses.primary
  const sizeOverride = size !== 'md' ? sizeClasses[size] : ''

  return (
    <button ref={ref} className={`${base} ${sizeOverride} ${className}`} {...props}>
      {children}
    </button>
  )
})

export default Button
