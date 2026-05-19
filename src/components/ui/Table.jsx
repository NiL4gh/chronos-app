import React, { useState } from 'react';

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
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${className}`}
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-[var(--border-default)]">
      {children}
    </tbody>
  );
}

export function Tr({ children, className = '', onClick, interactive = false }) {
  const [hover, setHover] = useState(false);
  
  return (
    <tr
      className={`transition-colors duration-100 ${interactive || onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ background: hover && (interactive || onClick) ? 'var(--bg-sunken)' : 'transparent' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} style={{ color: 'var(--text-secondary)' }}>
      {children}
    </td>
  );
}
