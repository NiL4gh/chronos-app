import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: 'rgba(255,200,120,0.06)',
          border: '1px solid var(--border-default)',
          boxShadow: 'inset 0 1px 0 rgba(255,200,120,0.08)',
        }}
      >
        {Icon && <Icon size={22} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
      {description && (
        <p className="text-xs mt-1.5 max-w-[260px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
