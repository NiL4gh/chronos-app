import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function SlideOutDrawer({ isOpen, onClose, title, children, footer, headerAction }) {
  const [hoverClose, setHoverClose] = useState(false);
  
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <div className="flex items-center gap-2">
            {headerAction}
            <button
              onClick={onClose}
              onMouseEnter={() => setHoverClose(true)}
              onMouseLeave={() => setHoverClose(false)}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150"
              style={{
                color: hoverClose ? 'var(--text-primary)' : 'var(--text-muted)',
                background: hoverClose ? 'var(--bg-sunken)' : 'transparent'
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body - Callers must structure their own sticky footer if footer content is passed through children */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-[var(--border-default)] px-6 py-4 flex items-center justify-end gap-3" style={{ background: 'var(--bg-surface)' }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
