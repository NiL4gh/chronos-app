import React, { useState } from 'react';

export default function Input({ className = '', ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input 
      {...props}
      className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-[var(--text-muted)] ${className}`} 
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-default)'}`,
        color: 'var(--text-primary)',
        colorScheme: 'inherit',
        boxShadow: focused ? '0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
      }}
      onFocus={(e) => {
        setFocused(true);
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (props.onBlur) props.onBlur(e);
      }}
      onClick={(e) => {
        if (props.type === 'date') {
          try { e.target.showPicker(); } catch (err) {}
        }
        if (props.onClick) props.onClick(e);
      }}
    />
  );
}

export function Select({ children, className = '', ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select 
      {...props}
      className={`rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-150 cursor-pointer ${className}`} 
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-default)'}`,
        color: 'var(--text-primary)',
        colorScheme: 'inherit',
        boxShadow: focused ? '0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
      }}
      onFocus={(e) => {
        setFocused(true);
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (props.onBlur) props.onBlur(e);
      }}
    >
      {children}
    </select>
  );
}
