export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }) {
  return (
    <thead>
      <tr className="border-b border-neutral-800">
        {children}
      </tr>
    </thead>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 ${className}`}>
      {children}
    </th>
  )
}

export function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-neutral-800/60">
      {children}
    </tbody>
  )
}

export function Tr({ children, className = '' }) {
  return (
    <tr className={`hover:bg-neutral-800/40 transition-colors duration-100 group ${className}`}>
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm text-neutral-300 ${className}`}>
      {children}
    </td>
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-4">
          <Icon size={20} className="text-neutral-600" />
        </div>
      )}
      <p className="text-sm font-medium text-neutral-400">{title}</p>
      {description && (
        <p className="text-xs text-neutral-600 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  )
}
