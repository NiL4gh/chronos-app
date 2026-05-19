import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileText, FileDown, Table2 } from 'lucide-react';

function DropdownItem({ icon: Icon, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors duration-100"
      style={{
        color: 'var(--text-secondary)',
        background: hover ? 'var(--bg-sunken)' : 'transparent'
      }}
    >
      <Icon size={13} style={{ color: 'var(--text-muted)' }} />
      {label}
    </button>
  );
}

export default function SplitButton({ onExport }) {
  const [open, setOpen] = useState(false);
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);
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

  const btnBase = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-150';

  return (
    <div ref={ref} className="relative inline-flex rounded-xl overflow-visible">
      {/* Primary action */}
      <button
        className={`${btnBase} rounded-l-xl`}
        onClick={() => handle('CSV')}
        onMouseEnter={() => setHoverLeft(true)}
        onMouseLeave={() => setHoverLeft(false)}
        style={{
          background: hoverLeft ? 'var(--accent-hover)' : 'var(--accent)',
          color: 'white',
        }}
      >
        <Download size={14} />
        Export to CSV
      </button>

      {/* Chevron trigger */}
      <button
        className={`${btnBase} rounded-r-xl px-2.5`}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHoverRight(true)}
        onMouseLeave={() => setHoverRight(false)}
        aria-label="More export options"
        style={{
          background: hoverRight ? 'var(--accent-hover)' : 'var(--accent)',
          color: 'white',
          borderLeft: '1px solid rgba(255,255,255,0.25)'
        }}
      >
        <ChevronDown size={14} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 z-20 overflow-hidden animate-slide-up"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {[
            { icon: FileText, label: 'Export to CSV' },
            { icon: FileDown, label: 'Export to PDF' },
            { icon: Table2,   label: 'Export to Excel' },
          ].map(({ icon, label }) => (
            <DropdownItem key={label} icon={icon} label={label} onClick={() => handle(label)} />
          ))}
        </div>
      )}
    </div>
  );
}
