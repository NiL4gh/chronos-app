const colorMap = [
  'bg-violet-500/20 text-violet-300',
  'bg-sky-500/20 text-sky-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-teal-500/20 text-teal-300',
  'bg-indigo-500/20 text-indigo-300',
  'bg-orange-500/20 text-orange-300',
]

function getColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorMap[Math.abs(hash) % colorMap.length]
}

function getInitials(name) {
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
}

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const sizeClass = sizeClasses[size] ?? sizeClasses.md
  const color = getColor(name ?? 'User')
  const initials = getInitials(name ?? 'U')

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold shrink-0 ${sizeClass} ${color} ${className}`}
    >
      {initials}
    </div>
  )
}
