import React from 'react';

const SIZES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

// Warm-tinted avatar palette — amber/terracotta/sage tones (optimized for high-contrast light mode)
const WARM_COLORS = [
  'bg-amber-500/10 text-amber-800 border-amber-200/60',
  'bg-orange-500/10 text-orange-800 border-orange-200/60',
  'bg-rose-500/10 text-rose-800 border-rose-200/60',
  'bg-emerald-500/10 text-emerald-800 border-emerald-200/60',
  'bg-sky-500/10 text-sky-800 border-sky-200/60',
  'bg-violet-500/10 text-violet-800 border-violet-200/60',
  'bg-teal-500/10 text-teal-800 border-teal-200/60',
  'bg-pink-500/10 text-pink-800 border-pink-200/60',
];

function hashName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % WARM_COLORS.length;
  }
  return h;
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const colorClass = WARM_COLORS[hashName(name)];
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full border flex items-center justify-center font-semibold shrink-0 select-none ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
