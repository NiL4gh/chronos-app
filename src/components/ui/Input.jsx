import { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  { className = '', label, hint, error, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-neutral-400">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-neutral-600">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select(
  { className = '', label, children, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-neutral-400">{label}</label>
      )}
      <select
        ref={ref}
        className={`rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
})

export default Input
