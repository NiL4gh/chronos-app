import React from 'react';

const baseInput = [
  'w-full rounded-xl',
  'border border-[var(--border-default)]',
  'bg-white/5 backdrop-blur-sm',
  'px-3 py-2 text-sm',
  'text-[var(--text-primary)]',
  'placeholder:text-[var(--text-disabled)]',
  'outline-none',
  'focus:border-[var(--border-focus)] focus:ring-1 focus:ring-amber-400/20',
  'transition-all duration-150',
  '[color-scheme:dark]',
].join(' ');

const baseSelect = [
  'rounded-xl',
  'border border-[var(--border-default)]',
  'bg-[var(--bg-elevated)] backdrop-blur-sm',
  'px-3 py-2 text-sm',
  'text-[var(--text-primary)]',
  'outline-none',
  'focus:border-[var(--border-focus)] focus:ring-1 focus:ring-amber-400/20',
  'transition-all duration-150',
  'cursor-pointer',
  '[color-scheme:dark]',
].join(' ');

export default function Input({ className = '', ...props }) {
  return <input className={`${baseInput} ${className}`} {...props} />;
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${baseSelect} ${className}`} {...props}>
      {children}
    </select>
  );
}
