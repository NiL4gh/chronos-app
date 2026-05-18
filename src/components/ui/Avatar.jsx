import React from 'react';

const SIZES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

// Warm-tinted avatar palette — amber/terracotta/sage tones
const WARM_COLORS = [
  'bg-amber-500/20 text-amber-300 border-amber-400/30',
  'bg-orange-500/20 text-orange-300 border-orange-400/30',
  'bg-rose-500/20 text-rose-300 border-rose-400/30',
  'bg-emerald-600/20 text-emerald-300 border-emerald-400/30',
  'bg-sky-500/20 text-sky-300 border-sky-400/30',
  'bg-violet-500/20 text-violet-300 border-violet-400/30',
  'bg-teal-500/20 text-teal-300 border-teal-400/30',
  'bg-pink-500/20 text-pink-300 border-pink-400/30',
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
