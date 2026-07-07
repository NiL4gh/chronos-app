import React from 'react';
import { ChevronLeft, ChevronRight, List, CalendarDays, LayoutGrid, Table2, Activity, Plus } from 'lucide-react';
import { getMonday } from '../../lib/myTimeHelpers';

export default function MyTimeNavbar({
  navigationScale, setNavigationScale, currentWeekStart, setCurrentWeekStart,
  goToPrev, goToNext, goToToday, isCurrentPeriod, weekNumber, formatRangeLabel,
  dateJumpRef, dateJumpOpen, setDateJumpOpen, DateTimePicker,
  activeView, setActiveView, sidebarExpanded, setSidebarExpanded, setDrawerOpen,
}) {
  return (
    <div className="h-12 border-b border-[var(--border-default)] px-5 flex items-center gap-4 bg-[var(--bg-surface)] shrink-0 select-none">

      {/* Left cluster: ← [Week|Month] → */}
      <div className="flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-sunken)] p-0.5 gap-0.5 shrink-0">
        <button
          onClick={goToPrev}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all press-on-click"
        >
          <ChevronLeft size={13} strokeWidth={2.5} />
        </button>
        {['week', 'month'].map(scale => (
          <button
            key={scale}
            onClick={() => {
              setNavigationScale(scale);
              if (scale === 'month') {
                setCurrentWeekStart(new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1));
              } else {
                setCurrentWeekStart(getMonday(currentWeekStart));
              }
            }}
            className={`px-2.5 h-7 text-[10px] font-semibold rounded-md transition-all capitalize ${
              navigationScale === scale
                ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {scale}
          </button>
        ))}
        <button
          onClick={goToNext}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all press-on-click"
        >
          <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Center: date range label + jump + This Week/Month */}
      <div ref={dateJumpRef} className="relative flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setDateJumpOpen(v => !v)}
          className="text-sm font-bold text-[var(--text-primary)] tracking-tight hover:text-[var(--accent-text)] transition-colors truncate"
          title="Jump to date"
        >
          {formatRangeLabel()}
        </button>
        {navigationScale === 'week' && (
          <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-sunken)] px-1.5 py-0.5 rounded-md border border-[var(--border-default)] shrink-0">
            W{weekNumber}
          </span>
        )}
        {!isCurrentPeriod && (
          <button
            onClick={goToToday}
            className="shrink-0 px-2 h-6 text-[10px] font-semibold rounded-md transition-all press-on-click"
            style={{
              color: 'var(--accent-text)',
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
            }}
          >
            {navigationScale === 'week' ? '↩ This Week' : '↩ This Month'}
          </button>
        )}
        {dateJumpOpen && (
          <div className="absolute top-full mt-2 left-0 z-50">
            <DateTimePicker
              autoOpen
              value={currentWeekStart.toISOString().split('T')[0]}
              onChange={val => {
                const picked = new Date(val + 'T00:00:00');
                setCurrentWeekStart(navigationScale === 'month'
                  ? new Date(picked.getFullYear(), picked.getMonth(), 1)
                  : getMonday(picked)
                );
                setDateJumpOpen(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Right: view switcher + stats toggle + Log time */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-lg p-0.5">
          {[
            { key: 'list', icon: List, label: 'List' },
            { key: 'calendar', icon: CalendarDays, label: 'Calendar' },
            { key: 'timesheet', icon: LayoutGrid, label: 'Timesheet' },
            { key: 'table', icon: Table2, label: 'Table' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                activeView === key
                  ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]/50 hover:text-[var(--text-secondary)]'
              }`}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        {activeView === 'list' && (
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all press-on-click select-none border ${
              sidebarExpanded
                ? 'bg-[var(--bg-sunken)] border-[var(--border-strong)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)]'
            }`}
            title={sidebarExpanded ? 'Hide Stats' : 'Show Stats'}
          >
            <Activity size={14} />
          </button>
        )}

        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all press-on-click select-none"
        >
          <Plus size={13} />
          Log time
        </button>
      </div>
    </div>
  );
}
