import React from 'react';

export default function Card({ children, padding = 'p-6', className = '', interactive = false, onClick }) {
  const interactiveClass = interactive ? 'glass-interactive cursor-pointer' : '';

  return (
    <div
      className={`glass-card ${padding} ${interactiveClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div 
      className={`flex items-center justify-between mb-4 ${className}`}
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 
      className={`text-base font-medium ${className}`}
      style={{ color: 'var(--text-primary)' }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p 
      className={`text-sm mt-1 ${className}`}
      style={{ color: 'var(--text-tertiary)' }}
    >
      {children}
    </p>
  );
}
