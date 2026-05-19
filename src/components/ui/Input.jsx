import React, { useState } from 'react';

export default function Input({ className = '', ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input 
      className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-[var(--text-muted)] ${className}`} 
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-default)'}`,
        color: 'var(--text-primary)',
        colorScheme: 'light',
        boxShadow: focused ? '0 0 0 2px rgba(245, 158, 11, 0.2)' : 'none',
      }}
      onFocus={(e) => {
        setFocused(true);
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (props.onBlur) props.onBlur(e);
      }}
      {...props} 
    />
  );
}

export function Select({ children, className = '', ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select 
      className={`rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-150 cursor-pointer ${className}`} 
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-default)'}`,
        color: 'var(--text-primary)',
        boxShadow: focused ? '0 0 0 2px rgba(245, 158, 11, 0.2)' : 'none',
      }}
      onFocus={(e) => {
        setFocused(true);
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (props.onBlur) props.onBlur(e);
      }}
      {...props}
    >
      {children}
    </select>
  );
}
