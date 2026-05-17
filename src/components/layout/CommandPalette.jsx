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

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.sub.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  const handleSelect = (item) => {
    navigate(item.route);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl shadow-black/60 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <Search size={15} className="text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, members..."
            className="flex-1 bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none"
          />
          <kbd className="font-mono text-xs text-neutral-600 border border-neutral-700 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-neutral-600">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul className="py-1.5">
              {filtered.map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/60 transition-colors duration-100 text-left"
                  >
                    <div className="w-7 h-7 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                      <item.icon size={13} className="text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 truncate">{item.label}</p>
                      <p className="text-xs text-neutral-500 truncate">{item.sub}</p>
                    </div>
                    <span className="text-xs text-neutral-600 shrink-0">{item.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-neutral-800">
          <span className="text-xs text-neutral-700">↵ to navigate</span>
          <span className="text-xs text-neutral-700">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
