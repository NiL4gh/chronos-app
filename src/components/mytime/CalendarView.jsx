import React from 'react';
import CurrentTimeIndicator from './CurrentTimeIndicator';
import { getProjectColor, formatTimeStr, parseHour } from '../../lib/myTimeHelpers';

const ROW_HEIGHT = 60; // 60px per hour
const CALENDAR_START = 0; // midnight
const CALENDAR_HOURS = 24;

/**
 * Calendar week grid with time entry blocks, overlap clustering,
 * click-to-create, and current-time indicator.
 *
 * Extracted from MyTime.jsx renderCalendarView (lines 615–863).
 */
export default function CalendarView({ weekDays, selectedDate, filteredLogs, projects, setDrawerEntry, setDrawerOpen, setSelectedEntry }) {
  const visibleDays = weekDays;

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-[var(--bg-surface)] overflow-hidden">
      {/* Header row */}
      <div
        className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)] shrink-0 select-none"
        style={{ display: 'grid', gridTemplateColumns: `64px repeat(${visibleDays.length}, 1fr)` }}
      >
        <div className="w-16 h-12" /> {/* Empty corner */}
        {visibleDays.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const isSelected = selectedDate === dateStr;
          const isToday = day.toDateString() === new Date().toDateString();
          const dayLetter = day.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = day.getDate();
          return (
            <div key={idx} className={`flex flex-col items-center justify-center h-12 border-l border-[var(--border-default)] transition-colors ${
              isSelected ? 'bg-amber-500/10 dark:bg-amber-500/5 font-extrabold' : ''
            }`}>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-amber-600' : 'text-[var(--text-muted)]'}`}>{dayLetter}</span>
              <span className={`text-sm font-bold flex items-center justify-center w-6 h-6 rounded-full mt-0.5 ${
                isToday ? 'bg-amber-500 text-white shadow-sm' : isSelected ? 'text-amber-600' : 'text-[var(--text-primary)]'
              }`}>
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable Time Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 relative bg-[var(--bg-surface)]">
        <div
          className="relative"
          style={{ display: 'grid', gridTemplateColumns: `64px repeat(${visibleDays.length}, 1fr)`, height: `${CALENDAR_HOURS * ROW_HEIGHT}px` }}
        >
          {/* Left side hour labels */}
          <div className="relative h-full w-16 select-none border-r border-[var(--border-default)]">
            {Array.from({ length: CALENDAR_HOURS }).map((_, i) => {
              const h = CALENDAR_START + i;
              const displayHour = h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
              return (
                <div
                  key={h}
                  className="absolute right-0 pr-3 text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-end"
                  style={{ top: `${i * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }}
                >
                  {displayHour}
                </div>
              );
            })}
          </div>

          {/* Sub-grid of horizontal hour lines */}
          <div className="absolute left-16 right-0 top-0 bottom-0 pointer-events-none">
            {Array.from({ length: CALENDAR_HOURS }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-b border-[var(--border-default)]/40"
                style={{ top: `${(i + 1) * ROW_HEIGHT}px` }}
              />
            ))}
          </div>

          {/* Columns for the visible days */}
          {visibleDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const isToday = day.toDateString() === new Date().toDateString();
            const dayLogs = filteredLogs.filter(log => log.date === dateStr);

            return (
              <div
                key={dateStr}
                onClick={(e) => {
                  // Calculate click Y relative to day column container
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickY = e.clientY - rect.top;
                  const hourFraction = clickY / ROW_HEIGHT;
                  const clickHour = Math.floor(hourFraction) + CALENDAR_START;
                  const clickMin = Math.floor((hourFraction % 1) * 60);

                  // Round to nearest 15 minute interval
                  const snappedMin = Math.round(clickMin / 15) * 15;
                  let finalHour = clickHour;
                  let finalMin = snappedMin;
                  if (finalMin === 60) {
                    finalHour += 1;
                    finalMin = 0;
                  }

                  const startTimeStr = formatTimeStr(finalHour, finalMin);
                  const endTimeStr = formatTimeStr(finalHour + 1, finalMin); // default 1 hour block

                  setDrawerEntry({
                    task: '',
                    projectId: projects[0]?.id || '',
                    date: dateStr,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    billable: true,
                  });
                  setDrawerOpen(true);
                }}
                className={`relative h-full border-l border-[var(--border-default)]/40 transition-colors cursor-crosshair hover:bg-[var(--bg-sunken)]/20 ${
                  isSelected ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.02]' : ''
                }`}
              >
                {/* Render time blocks for this day — with overlap column layout */}
                {(() => {
                  // Compute start/end/duration for each visible log
                  const laid = dayLogs.map(log => {
                    const startH = parseHour(log.startTime);
                    const endH = parseHour(log.endTime);
                    const duration = Number(log.duration) || Math.max(0.25, endH - startH);
                    return { log, startH, endH: startH + duration, duration };
                  }).filter(e => e.startH < CALENDAR_START + CALENDAR_HOURS && e.endH > CALENDAR_START);

                  // Sort by start time
                  const sorted = [...laid].sort((a, b) => a.startH - b.startH);

                  // Greedy column assignment
                  const colAssigned = sorted.map(() => -1);
                  const colEnds = [];

                  sorted.forEach((entry, i) => {
                    let col = colEnds.findIndex(end => end <= entry.startH);
                    if (col === -1) { col = colEnds.length; colEnds.push(entry.endH); }
                    else colEnds[col] = entry.endH;
                    colAssigned[i] = col;
                  });

                  // For each entry, count how many columns are active during its span
                  const totalCols = sorted.map((entry, i) => {
                    return colEnds.filter((_, ci) => {
                      const sameCluster = sorted.findIndex((e, ei) => colAssigned[ei] === ci);
                      return ci <= colAssigned[i] || (sameCluster !== -1 && sorted[sameCluster].startH < entry.endH && sorted[sameCluster].endH > entry.startH);
                    }).length;
                  });

                  // Simpler: just count max column index within overlapping group
                  const groupMaxCol = sorted.map((entry, i) => {
                    let max = colAssigned[i];
                    sorted.forEach((other, j) => {
                      if (other.startH < entry.endH && other.endH > entry.startH) {
                        max = Math.max(max, colAssigned[j]);
                      }
                    });
                    return max + 1; // total columns in overlap group
                  });

                  return sorted.map((entry, i) => {
                    const { log, startH, endH } = entry;
                    const visibleStartH = Math.max(startH, CALENDAR_START);
                    const visibleEndH = Math.min(endH, CALENDAR_START + CALENDAR_HOURS);
                    const topOffset = (visibleStartH - CALENDAR_START) * ROW_HEIGHT;
                    const blockHeight = (visibleEndH - visibleStartH) * ROW_HEIGHT;
                    const projectColor = getProjectColor(log.projectId);
                    const col = colAssigned[i];
                    const numCols = groupMaxCol[i];
                    const colW = 100 / numCols;
                    const gap = numCols > 1 ? 1 : 0; // px gap between columns

                    return (
                      <div
                        key={log.id}
                        className="absolute rounded-md px-1.5 py-1 select-none cursor-pointer transition-all hover:brightness-95 hover:shadow-md"
                        style={{
                          top: `${Math.max(0, topOffset)}px`,
                          height: `${Math.max(24, blockHeight - 2)}px`,
                          left: `calc(${col * colW}% + ${gap}px)`,
                          width: `calc(${colW}% - ${gap * 2}px)`,
                          backgroundColor: `${projectColor}20`,
                          borderLeft: `3px solid ${projectColor}`,
                          backgroundImage: log.source === 'manual'
                            ? 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)'
                            : undefined,
                          zIndex: 10,
                          overflow: 'hidden',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setSelectedEntry({
                            log,
                            x: Math.min(rect.right + 8, window.innerWidth - 296),
                            y: Math.max(8, rect.top),
                          });
                        }}
                      >
                        <div className="font-semibold text-[10px] leading-tight truncate" style={{ color: projectColor }}>
                          {log.task || '(No task description)'}
                        </div>
                        {blockHeight >= 36 && (
                          <div className="text-[9px] opacity-80 leading-tight truncate mt-0.5" style={{ color: projectColor }}>
                            {log.startTime} – {log.endTime}
                          </div>
                        )}
                        {blockHeight > 54 && (
                          <div className="text-[9px] font-medium opacity-70 leading-tight truncate mt-0.5" style={{ color: projectColor }}>
                            {log.projectName}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}

                {/* Today's red/amber time line indicator */}
                {isToday && (
                  <CurrentTimeIndicator rowHeight={ROW_HEIGHT} calendarStart={CALENDAR_START} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
