import React from 'react';
import { Play, Square } from 'lucide-react';
import { getProjectColor } from '../../lib/myTimeHelpers';

export default function FocusWorkspace({ timerRunning, timerSeconds, timerProjectId, timerTaskLabel, projects, filteredLogs, startTimer, stopTimer, triggerToast }) {
  if (timerRunning) {
    return (
      <div className="glass-elevated rounded-2xl border border-emerald-500/20 overflow-hidden shadow-lg p-5 flex flex-col items-center">
        {/* Row 1: Massive Hero Monospace Ticker */}
        <div className="text-center select-none mb-5">
          <span className="text-5xl font-bold font-mono tracking-tight text-[var(--text-primary)] leading-none timer-glow-emerald">
            {String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}:
            {String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0')}:
            {String(timerSeconds % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Row 2: Interactive Wings Grid */}
        <div className="w-full grid grid-cols-3 items-center gap-4 pt-3 border-t border-[var(--border-default)]/30">
          {/* Left Wing: Project color & Auto badge */}
          <div className="flex items-center gap-2 select-none justify-start">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getProjectColor(timerProjectId) }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                {projects.find(p => p.id === timerProjectId)?.name || 'No project'}
              </span>
            </div>
          </div>

          {/* Center Stage: Physics-based Stop Trigger */}
          <div className="flex justify-center">
            <button
              onClick={stopTimer}
              className="shrink-0 flex items-center justify-center transition-all duration-200 press-on-click p-3"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--danger-text)',
                color: 'var(--accent-on)',
                boxShadow: '0 4px 12px color-mix(in srgb, var(--danger-text) 30%, transparent)',
              }}
              title="Stop Focus session"
            >
              <Square size={13} fill="currentColor" />
            </button>
          </div>

          {/* Right Wing: Live Task Context */}
          <div className="flex flex-col min-w-0 items-end text-right justify-end">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 select-none">
              Active Session
            </span>
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-full">
              {timerTaskLabel || 'Focus Session'}
            </span>
          </div>
        </div>

        {/* Subtle bottom progress shimmering meter */}
        <div className="w-full h-0.5 bg-gradient-to-r from-emerald-400/20 via-emerald-400/60 to-emerald-400/20 mt-4 rounded-full animate-pulse" />
      </div>
    );
  }

  // ── HERO STOPPED STATE ─────────────────────────────────
  return (
    <div className="glass-elevated rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-md p-5 flex flex-col items-center">
      {/* Timer display */}
      <div className="text-center select-none mb-5">
        <span className="text-5xl font-bold font-mono tracking-tight text-[var(--text-muted)] leading-none">
          00:00:00
        </span>
      </div>

      {/* Start button */}
      <div className="w-full grid grid-cols-3 items-center pt-3 border-t border-[var(--border-default)]/30">
        <div />
        <div className="flex justify-center select-none">
          <button
            onClick={() => {
              startTimer('Focus session', projects[0]?.id || '');
              triggerToast('Timer started', 'Focus session', 'success');
            }}
            className="shrink-0 flex items-center justify-center timer-cta-pulse press-on-click transition-all duration-200"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-on)',
              border: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            aria-label="Start timer"
          >
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </button>
        </div>
        <div />
      </div>

      {/* Quick re-use chips */}
      {filteredLogs.length > 0 && (
        <div className="w-full mt-4 pt-3 border-t border-[var(--border-default)]/20 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0">
            Quick Log
          </span>
          {filteredLogs.slice(0, 4).map(log => (
            <button
              key={log.id}
              onClick={() => {
                startTimer(log.task || 'Focus session', log.projectId);
                triggerToast('Timer started', log.task || 'Focus session', 'success');
              }}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-sunken)]/60 hover:bg-[var(--bg-sunken)] text-[10px] text-[var(--text-secondary)] font-bold transition-all press-on-click"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: getProjectColor(log.projectId) }}
              />
              <span className="truncate max-w-[85px]">{log.task || 'Session'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
