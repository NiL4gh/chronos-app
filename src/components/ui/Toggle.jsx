export default function Toggle({ checked, onChange, label, description, size = 'md' }) {
  const sizeClasses = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  }

  const sizes = sizeClasses[size] ?? sizeClasses.md

  return (
    <div className="flex items-start gap-3">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-2 focus:ring-offset-neutral-900
          ${sizes.track}
          ${checked ? 'bg-violet-500' : 'bg-neutral-700'}
        `}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out
            ${sizes.thumb}
            ${checked ? sizes.translate : 'translate-x-0.5'}
          `}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm font-medium text-neutral-200">{label}</span>
          )}
          {description && (
            <span className="text-xs text-neutral-500">{description}</span>
          )}
        </div>
      )}
    </div>
  )
}
