import React, { forwardRef, useState } from 'react';

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', children, className = '', disabled = false, ...props },
  ref
) {
  const [hover, setHover] = useState(false);
  const baseClasses = 'inline-flex items-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: hover ? 'var(--accent-hover)' : 'var(--accent)',
          color: 'var(--accent-on)',
          border: 'none',
          boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)',
        };
      case 'secondary':
        return {
          background: hover ? 'var(--bg-sunken)' : 'var(--bg-surface)',
          color: hover ? 'var(--text-primary)' : 'var(--text-secondary)',
          border: '1px solid var(--border-strong)',
        };
      case 'ghost':
        return {
          background: hover ? 'var(--bg-sunken)' : 'transparent',
          color: hover ? 'var(--text-primary)' : 'var(--text-tertiary)',
          border: 'none',
        };
      case 'danger':
        return {
          background: 'var(--danger-bg)',
          color: 'var(--danger-text)',
          border: '1px solid var(--danger-border)',
          opacity: hover ? 0.8 : 1,
        };
      case 'success':
        return {
          background: 'var(--success-bg)',
          color: 'var(--success-text)',
          border: '1px solid var(--success-border)',
          opacity: hover ? 0.9 : 1,
        };
      default: return {};
    }
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${baseClasses} ${SIZES[size] || SIZES.md} ${className}`}
      style={getStyles()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
