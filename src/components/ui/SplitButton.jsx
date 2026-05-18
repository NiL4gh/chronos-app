import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileText, FileDown, Table2 } from 'lucide-react';

export default function SplitButton({ onExport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handle = (label) => {
    setOpen(false);
    onExport?.(label);
  };

  const btnBase = [
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold',
    'bg-amber-400 hover:bg-amber-300 text-neutral-950',
    'transition-all duration-150',
    'shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:shadow-[0_0_24px_rgba(245,158,11,0.40)]',
  ].join(' ');

  return (
    <div ref={ref} className="relative inline-flex rounded-xl overflow-visible">
      {/* Primary action */}
      <button
        className={`${btnBase} rounded-l-xl border-r border-amber-300/30`}
        onClick={() => handle('CSV')}
      >
        <Download size={14} />
        Export to CSV
      </button>

      {/* Chevron trigger */}
      <button
        className={`${btnBase} rounded-r-xl px-2.5`}
        onClick={() => setOpen((v) => !v)}
        aria-label="More export options"
      >
        <ChevronDown size={14} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 z-20 overflow-hidden animate-slide-up"
          style={{
            background: 'rgba(42, 34, 26, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-interactive)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
          }}
        >
          {[
            { icon: FileText, label: 'Export to CSV' },
            { icon: FileDown, label: 'Export to PDF' },
            { icon: Table2,   label: 'Export to Excel' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => handle(label)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors duration-100"
            >
              <Icon size={13} style={{ color: 'var(--text-muted)' }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );}
