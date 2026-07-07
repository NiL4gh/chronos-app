import React from 'react';
import { Clock, Play } from 'lucide-react';
import TrackingSourceBadge from '../ui/TrackingSourceBadge';
import EmptyState from '../ui/EmptyState';
import { getProjectColor, parseTimeToMinutes } from '../../lib/myTimeHelpers';

/**
 * Streaming timeline view — grouped daily log entries with resume actions
 * and unlogged-gap quick-allocate prompts.
 *
 * Extracted from MyTime.jsx renderTimeStream (lines 304–467).
 */
export default function TimeStream({ listDaysWithLogs, startTimer, triggerToast, projects, setDrawerEntry, setDrawerOpen }) {
  if (listDaysWithLogs.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No entries this week"
        description="Start the timer above or log time manually."
      />
    );
  }

  return (
    <div className="space-y-6">
      {listDaysWithLogs.map(({ dateStr, logs: dayLogs }) => {
        const dayTotalHours = dayLogs.reduce(
          (sum, log) => sum + (Number(log.duration) || 0), 0
        );
        const dateObj = new Date(dateStr + 'T00:00:00');
        const isToday = dateObj.toDateString() === new Date().toDateString();
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const dateLabel = dateObj.toLocaleDateString('en-US', {
          month: 'short', day: 'numeric'
        });

        return (
          <div key={dateStr}>
            {/* Day header */}
            <div className="flex items-baseline justify-between mb-3 select-none">
              <div className="flex items-baseline gap-2">
                <h3 className={`text-sm font-bold ${
                  isToday ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}>
                  {isToday ? 'Today' : dayName}
                </h3>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {dateLabel}
                </span>
                {isToday && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-400/10 text-amber-700 border border-amber-400/20 select-none">
                    Today
                  </span>
                )}
              </div>
              <span className="text-sm font-black font-mono text-[var(--text-secondary)] tabular-nums">
                {dayTotalHours.toFixed(1)}h
              </span>
            </div>

            {/* Entry rows & gaps allocator */}
            <div className="space-y-2">
              {(() => {
                const sortedLogs = [...dayLogs].sort((a, b) => {
                  if (!a.startTime || !b.startTime) return 0;
                  return a.startTime.localeCompare(b.startTime);
                });

                return sortedLogs.map((log, idx) => {
                  const projectColor = getProjectColor(log.projectId);

                  // Check if there is an unlogged gap between this entry and the next
                  const currentEnd = parseTimeToMinutes(log.endTime);
                  const nextStart = sortedLogs[idx + 1] ? parseTimeToMinutes(sortedLogs[idx + 1].startTime) : 0;
                  const gapMinutes = nextStart - currentEnd;
                  const hasGap = sortedLogs[idx + 1] && gapMinutes > 15;

                  return (
                    <React.Fragment key={log.id}>
                      {/* Interactive Timeline Card */}
                      <div className="glass-card rounded-xl overflow-hidden shadow-sm transition-all duration-200 border-l-[3px]" style={{ borderLeftColor: projectColor }}>
                        <div
                          className="flex items-center gap-4 px-4 py-3 select-none"
                        >
                          {/* Task + project */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">
                              {log.task || '(No description)'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-[var(--text-muted)] truncate">
                                {log.projectName}
                              </span>
                              {log.startTime && log.endTime && (
                                <>
                                  <span className="text-[var(--text-muted)] text-xs">·</span>
                                  <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                                    {log.startTime} – {log.endTime}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* CTAs: Resume */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startTimer(log.task || 'Focus session', log.projectId);
                                triggerToast('Timer started', log.task || 'Focus session', 'success');
                              }}
                              className="p-1 rounded bg-[var(--bg-sunken)] hover:bg-[var(--border-default)] text-[var(--text-muted)] hover:text-amber-600 transition-colors flex items-center justify-center shrink-0 w-7 h-7 cursor-pointer"
                              title="Resume this task"
                            >
                              <Play size={12} fill="currentColor" />
                            </button>
                          </div>

                          {/* Source badge */}
                          <TrackingSourceBadge source={log.source} />

                          {/* Duration */}
                          <span className="text-base font-black font-mono tabular-nums text-[var(--text-primary)] shrink-0 w-12 text-right">
                            {(Number(log.duration) || 0).toFixed(1)}h
                          </span>
                        </div>

                      </div>

                      {/* Unlogged Gaps allocator block */}
                      {hasGap && (
                        <div className="my-2.5 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-sunken)]/30 hover:border-[var(--border-strong)] flex items-center justify-between text-xs select-none transition-colors">
                          <span className="text-[var(--text-muted)] font-mono">
                            {log.endTime} – {sortedLogs[idx + 1].startTime} · Unlogged Gap ({(gapMinutes / 60).toFixed(1)}h)
                          </span>
                          <button
                            onClick={() => {
                              setDrawerEntry({
                                task: '',
                                projectId: projects[0]?.id || '',
                                date: dateStr,
                                startTime: log.endTime,
                                endTime: sortedLogs[idx + 1].startTime,
                                billable: false,
                              });
                              setDrawerOpen(true);
                            }}
                            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                          >
                            + Quick Allocate
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
