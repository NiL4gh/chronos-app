import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Play, Square, Timer } from 'lucide-react';
import Button from '../ui/Button.jsx';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard',   subtitle: 'Team overview & activity' },
  '/team':      { title: 'Team',         subtitle: 'Members & activity' },
  '/projects':  { title: 'Projects',     subtitle: 'Goals & progress' },
  '/reports':   { title: 'Reports',      subtitle: 'Time & billing analytics' },
  '/invoices':  { title: 'Invoices',     subtitle: 'Billing & payments' },
  '/my-time':   { title: 'My Time',      subtitle: 'Personal tracker' },
  '/settings':  { title: 'Settings',     subtitle: 'Workspace configuration' },
};

function formatTimer(s) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

export default function Topbar({
  onOpenCommandPalette,
  onOpenDrawer,
  timerRunning,
  timerSeconds,
  timerTaskLabel,
  onStopTimer,
  onStartTimer,
}) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: 'Chronos', subtitle: '' };

  return (
    <header
      className="flex items-center justify-between px-6 h-14 shrink-0"
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(26, 20, 16, 0.80)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Left — page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
            {meta.title}
          </h1>
          {meta.subtitle && (
            <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>
              {meta.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-disabled)',
            width: '220px',
          }}
          aria-label="Open command palette"
        >
          <Search size={13} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <span className="flex-1 text-left text-xs truncate" style={{ color: 'var(--text-disabled)' }}>
            Search…
          </span>
          <kbd
            className="text-[10px] font-mono px-1 py-0.5 rounded"
            style={{
              background: 'rgba(255,200,120,0.06)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-disabled)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Live timer pill — shown when running */}
        {timerRunning && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl animate-glow-pulse"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.30)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot" />
            <span className="font-mono text-xs font-semibold text-amber-300 tabular-nums">
              {formatTimer(timerSeconds)}
            </span>
            {timerTaskLabel && (
              <span className="text-xs max-w-[80px] truncate" style={{ color: 'var(--text-muted)' }}>
                {timerTaskLabel}
              </span>
            )}
            <button
              onClick={onStopTimer}
              className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Stop timer"
            >
              <Square size={10} />
            </button>
          </div>
        )}

        {/* Timer action group */}
        {!timerRunning ? (
          <Button variant="primary" size="sm" onClick={onStartTimer}>
            <Play size={13} />
            Start Timer
          </Button>
        ) : null}

        {/* Manual entry */}
        <Button variant="secondary" size="sm" onClick={onOpenDrawer}>
          Manual Entry
        </Button>

        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400"
            style={{ boxShadow: '0 0 6px rgba(245,158,11,0.60)' }}
          />
        </button>
      </div>
    </header>
  );
}
