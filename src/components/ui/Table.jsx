import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead>
      {children}
    </thead>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      className={`text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] px-4 py-3 border-b border-[var(--border-default)] whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return (
    <tbody>
      {children}
    </tbody>
  );
}

export function Tr({ children, className = '', onClick, interactive = false, selected = false }) {
  return (
    <tr
      className={`border-b border-[var(--border-default)] transition-colors duration-100 hover:bg-[var(--bg-sunken)] last:border-0 ${selected ? 'bg-[var(--bg-active)]' : ''} ${interactive || onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm text-[var(--text-secondary)] align-middle ${className}`}>
      {children}
    </td>
  );
}
