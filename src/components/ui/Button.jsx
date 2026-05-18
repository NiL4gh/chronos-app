import React, { forwardRef } from 'react';

const VARIANTS = {
  primary: [
    'bg-amber-400 hover:bg-amber-300',
    'text-neutral-950',
    'font-semibold',
    'shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:shadow-[0_0_24px_rgba(245,158,11,0.40)]',
    'border border-amber-300/30',
  ].join(' '),

  secondary: [
    'backdrop-blur-sm bg-white/5 hover:bg-white/10',
    'border border-[var(--border-default)] hover:border-[var(--border-interactive)]',
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    'font-medium',
  ].join(' '),

  ghost: [
    'hover:bg-white/5',
    'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
    'font-medium',
  ].join(' '),

  danger: [
    'bg-red-400/10 hover:bg-red-400/20',
    'border border-red-400/20',
    'text-red-300',
    'font-medium',
  ].join(' '),

  success: [
    'bg-emerald-400/10 hover:bg-emerald-400/20',
    'border border-emerald-400/20',
    'text-emerald-300',
    'font-medium',
  ].join(' '),
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-xl',
};

const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', children, className = '', disabled = false, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={[
        'inline-flex items-center gap-2',
        'transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant] || VARIANTS.secondary,
        SIZES[size] || SIZES.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
