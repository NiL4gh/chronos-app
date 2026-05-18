import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] ${className}`}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return (
    <tbody style={{ '--divider': 'var(--border-subtle)' }}>
      {children}
    </tbody>
  );
}

export function Tr({ children, className = '', onClick, interactive = false }) {
  return (
    <tr
      className={[
        'transition-colors duration-100',
        interactive || onClick ? 'cursor-pointer' : '',
        onClick ? 'hover:bg-white/5' : '',
        className,
      ].join(' ')}
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm text-[var(--text-secondary)] ${className}`}>
      {children}
    </td>
  );
}
