import React from 'react';

const SIZES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

const SEMANTIC_PALETTES = [
  { background: 'var(--warning-bg)', color: 'var(--warning-text)', borderColor: 'var(--warning-border)' },
  { background: 'var(--success-bg)', color: 'var(--success-text)', borderColor: 'var(--success-border)' },
  { background: 'var(--info-bg)',    color: 'var(--info-text)',    borderColor: 'var(--info-border)'    },
  { background: 'var(--danger-bg)',  color: 'var(--danger-text)',  borderColor: 'var(--danger-border)'  },
];

function hashName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % SEMANTIC_PALETTES.length;
  }
  return h;
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const palette = SEMANTIC_PALETTES[hashName(name)];
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div
      className={`${sizeClass} rounded-full border flex items-center justify-center font-semibold shrink-0 select-none ${className}`}
      style={palette}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
