import { useState, useEffect, useRef } from 'react';
import { Search, FolderKanban, Users } from 'lucide-react';
import { projects, teamMembers } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const allItems = [
  ...projects.map((p) => ({
    label: p.name,
    sub: p.client,
    type: 'Project',
    icon: FolderKanban,
    route: '/projects',
  })),
  ...teamMembers.map((m) => ({
    label: m.name,
    sub: m.role,
    type: 'Member',
    icon: Users,
    route: '/team',
  })),
];

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.sub.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  const handleSelect = (item) => {
    navigate(item.route);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4"
      style={{ background: 'rgba(240, 235, 230, 0.50)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden animate-fade-in"
        style={{
          background: 'var(--bg-surface)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search row */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, members…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="font-mono text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="py-1.5">
              {filtered.map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-100 text-left hover:bg-[var(--bg-sunken)]"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: 'var(--bg-sunken)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <item.icon size={13} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{item.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>↵ navigate</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ESC close</span>
        </div>
      </div>
    </div>
  );
}

