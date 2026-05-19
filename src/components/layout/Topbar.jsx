import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Play, Square, Plus } from 'lucide-react';

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
  
  const [hoverSearch, setHoverSearch] = useState(false);
  const [hoverBell, setHoverBell] = useState(false);
  
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const d = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    setDateStr(d.toLocaleDateString('en-US', options));
  }, []);

  return (
    <header
      className="px-6 flex items-center justify-between gap-4 h-16 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 1px 0 rgba(28,25,23,0.06), 0 4px 16px rgba(28,25,23,0.04)'
      }}
    >
      {/* LEFT ZONE — Page identity */}
      <div className="flex-shrink-0 flex flex-col items-start min-w-0">
        <h1 
          className="truncate"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2
          }}
        >
          {meta.title}
        </h1>
        <div 
          className="mt-1 text-xs font-medium rounded-full px-2.5 py-0.5"
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent-text)',
            lineHeight: 1
          }}
        >
          {dateStr}
        </div>
      </div>

      {/* CENTER ZONE — Search */}
      <div className="flex-1 max-w-sm mx-auto">
        <button
          onClick={onOpenCommandPalette}
          onMouseEnter={() => setHoverSearch(true)}
          onMouseLeave={() => setHoverSearch(false)}
          className="relative flex items-center w-full transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${hoverSearch ? 'var(--border-strong)' : 'var(--border-default)'}`,
            borderRadius: '10px',
            height: '36px',
            padding: '0 12px 0 36px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            boxShadow: hoverSearch ? '0 0 0 3px rgba(245,158,11,0.08)' : 'none'
          }}
          aria-label="Open command palette"
        >
          <Search size={13} style={{ color: 'var(--text-muted)', position: 'absolute', left: '12px' }} />
          <span className="truncate">Search…</span>
          <kbd
            className="absolute right-[10px] font-mono text-xs rounded px-1 py-0.5"
            style={{
              color: 'var(--text-disabled)',
              border: '1px solid var(--border-default)',
              lineHeight: 1
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* RIGHT ZONE — Timer CTA group */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {!timerRunning ? (
          <>
            <button
              onClick={onStartTimer}
              className="timer-cta-pulse press-on-click flex items-center justify-center gap-1.5 transition-all duration-150"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '36px',
                padding: '0 16px',
                color: 'white',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.01em',
                boxShadow: '0 2px 8px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
              }}
            >
              <Play size={13} fill="currentColor" />
              Start Timer
            </button>
            <button
              onClick={onOpenDrawer}
              title="Manual entry (N)"
              className="flex items-center justify-center transition-colors duration-150"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-sunken)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-surface)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Plus size={14} />
            </button>
          </>
        ) : (
          <>
            <div
              className="flex items-center gap-2 px-4"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '8px',
                height: '36px'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot flex-shrink-0" />
              <span 
                className="font-mono font-semibold text-sm tabular-nums"
                style={{ color: '#065f46', letterSpacing: '0.02em' }}
              >
                {formatTimer(timerSeconds)}
              </span>
            </div>
            <button
              onClick={onStopTimer}
              className="flex items-center justify-center transition-colors duration-150"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'rgb(185,28,28)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              }}
              aria-label="Stop timer"
            >
              <Square size={14} fill="currentColor" />
            </button>
          </>
        )}

        <button
          className="relative flex items-center justify-center transition-colors duration-150 ml-1"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'transparent',
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-sunken)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span
            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold flex items-center justify-center"
            style={{ fontSize: '9px' }}
          >
            3
          </span>
        </button>
      </div>
    </header>
  );
}
