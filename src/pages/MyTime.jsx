import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarDays, List,
  LayoutGrid, Table2, Plus, Clock, Settings2, CalendarCheck,
  Activity, Check, X
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import DateTimePicker from '../components/ui/DateTimePicker';
import EmptyState from '../components/ui/EmptyState';
import FocusWorkspace from '../components/mytime/FocusWorkspace';
import EntryPopover from '../components/mytime/EntryPopover';
import TimeStream from '../components/mytime/TimeStream';
import CalendarView from '../components/mytime/CalendarView';
import MyTimeNavbar from '../components/mytime/MyTimeNavbar';
import { getProjectColor, getMonday, addDays, getWeekNumber, parseTimeToMinutes, formatTimeStr, formatDayLabel } from '../lib/myTimeHelpers';

export default function MyTime() {
  const {
    timerRunning,
    timerSeconds,
    timerTaskLabel,
    timerProjectId,
    startTimer,
    stopTimer,
    activeRole,
    role,
    logs,
    setLogs,
    triggerToast,
    setDrawerOpen,
    currentWeekStart,
    setCurrentWeekStart,
    selectedDate,
    setSelectedDate,
    drawerEntry,
    setDrawerEntry
  } = useOutletContext();

  const currentRole = activeRole || role || 'admin';

  // State
  const [activeView, setActiveView] = useState('calendar');
  const [showCalendarPanel, setShowCalendarPanel] = useState(false);
  const [navigationScale, setNavigationScale] = useState('week'); // 'week' | 'month'
  const currentUserId = 'u1'; // Priya Sharma for employee role

  // Settings dropdown triggers
  const [completedTasksChecked, setCompletedTasksChecked] = useState(false);
  const [weekVisChecked, setWeekVisChecked] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const calendarPanelRef = useRef(null);

  // Click outside to dismiss calendar sync panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarPanelRef.current && !calendarPanelRef.current.contains(e.target)) {
        const toggleBtn = e.target.closest('[title="Calendar Sync & Settings"]');
        if (!toggleBtn) {
          setShowCalendarPanel(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Week Days Memo
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // ISO Week Number
  const weekNumber = useMemo(() => {
    return getWeekNumber(currentWeekStart);
  }, [currentWeekStart]);

  // Compute the visible date range based on navigationScale
  const [rangeStart, rangeEnd] = useMemo(() => {
    if (navigationScale === 'month') {
      const first = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
      first.setHours(0, 0, 0, 0);
      const last = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() + 1, 0);
      last.setHours(23, 59, 59, 999);
      return [first, last];
    }
    const start = new Date(currentWeekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }, [currentWeekStart, navigationScale]);

  // Filter logs to entries within the current range
  const filteredLogs = useMemo(() => {
    return (logs || []).filter(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      const inRange = logDate >= rangeStart && logDate <= rangeEnd;
      if (!inRange) return false;
      if (currentRole === 'employee') return log.userId === currentUserId;
      return true;
    });
  }, [logs, rangeStart, rangeEnd, currentRole]);

  // Dynamic filter for selected day
  const logsToRender = useMemo(() => {
    if (!selectedDate) return filteredLogs;
    return filteredLogs.filter(log => log.date === selectedDate);
  }, [filteredLogs, selectedDate]);

  // Metrics Memos
  const totalWeekHours = useMemo(() => {
    return filteredLogs.reduce((sum, log) => sum + (Number(log.duration) || 0), 0);
  }, [filteredLogs]);

  const totalTodayHours = useMemo(() => {
    const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return filteredLogs
      .filter(log => log.date === todayStr)
      .reduce((sum, log) => sum + (Number(log.duration) || 0), 0);
  }, [filteredLogs]);

  const billableWeekHours = useMemo(() => {
    return filteredLogs
      .filter(log => log.billable)
      .reduce((sum, log) => sum + (Number(log.duration) || 0), 0);
  }, [filteredLogs]);

  const totalWeekEntries = filteredLogs.length;

  const logsByDate = useMemo(() => {
    const map = new Map();
    // Pre-populate days of current week
    weekDays.forEach(day => {
      const key = day.toISOString().split('T')[0];
      map.set(key, []);
    });

    filteredLogs.forEach(log => {
      const key = log.date;
      if (map.has(key)) {
        map.get(key).push(log);
      } else {
        map.set(key, [log]);
      }
    });

    return map;
  }, [filteredLogs, weekDays]);

  const weekProgressPercent = useMemo(() => {
    return Math.min(100, (totalWeekHours / 40) * 100);
  }, [totalWeekHours]);

  // Navigation actions
  const goToPrev = () => {
    if (navigationScale === 'month') {
      setCurrentWeekStart(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    } else {
      setCurrentWeekStart(d => addDays(d, -7));
    }
  };

  const goToNext = () => {
    if (navigationScale === 'month') {
      setCurrentWeekStart(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    } else {
      setCurrentWeekStart(d => addDays(d, 7));
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentWeekStart(navigationScale === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : getMonday(now)
    );
  };

  const isCurrentPeriod = useMemo(() => {
    const now = new Date();
    if (navigationScale === 'month') {
      return currentWeekStart.getFullYear() === now.getFullYear() &&
        currentWeekStart.getMonth() === now.getMonth();
    }
    return currentWeekStart.getTime() === getMonday(now).getTime();
  }, [currentWeekStart, navigationScale]);

  const [dateJumpOpen, setDateJumpOpen] = useState(false);
  const dateJumpRef = useRef(null);

  useEffect(() => {
    if (!dateJumpOpen) return;
    const handler = (e) => {
      if (dateJumpRef.current && !dateJumpRef.current.contains(e.target)) {
        setDateJumpOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dateJumpOpen]);

  const formatRangeLabel = () => {
    if (navigationScale === 'month') {
      return currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    const now = getMonday(new Date());
    const isCurrentWeek = currentWeekStart.getTime() === now.getTime();
    if (isCurrentWeek) return 'This week';
    const start = weekDays[0];
    const end = weekDays[6];
    if (!start || !end) return '';
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const startYear = start.getFullYear();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const endYear = end.getFullYear();
    if (startYear !== endYear) {
      return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
    } else if (startMonth !== endMonth) {
      return `${startMonth} ${startDay} – ${endMonth} ${endDay} ${startYear}`;
    } else {
      return `${startMonth} ${startDay} – ${endDay} ${startYear}`;
    }
  };

  // Group list view items by date descending (most recent first)
  const listDaysWithLogs = useMemo(() => {
    const dates = [];
    const tempMap = new Map();
    logsToRender.forEach(log => {
      const key = log.date;
      if (!tempMap.has(key)) {
        tempMap.set(key, []);
      }
      tempMap.get(key).push(log);
    });
    tempMap.forEach((dayLogs, dateStr) => {
      dates.push({ dateStr, logs: dayLogs });
    });
    return dates.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [logsToRender]);

  // Timesheet aggregates task × day matrix rows
  const timesheetRows = useMemo(() => {
    const combinations = new Map();
    filteredLogs.forEach(log => {
      const key = `${log.task || ''}|${log.projectId}`;
      if (!combinations.has(key)) {
        combinations.set(key, {
          task: log.task || '(No task description)',
          projectId: log.projectId,
          projectName: log.projectName,
          dailyHours: [0, 0, 0, 0, 0, 0, 0],
          total: 0,
          logIds: [],
        });
      }
      const dayIndex = weekDays.findIndex(d => d.toISOString().split('T')[0] === log.date);
      if (dayIndex !== -1) {
        const data = combinations.get(key);
        const dur = Number(log.duration) || 0;
        data.dailyHours[dayIndex] += dur;
        data.total += dur;
        data.logIds.push(log.id);
      }
    });
    return Array.from(combinations.values());
  }, [filteredLogs, weekDays]);

  const timesheetColumnTotals = useMemo(() => {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    timesheetRows.forEach(row => {
      row.dailyHours.forEach((hours, idx) => {
        totals[idx] += hours;
      });
    });
    const grandTotal = totals.reduce((a, b) => a + b, 0);
    return { daily: totals, grandTotal };
  }, [timesheetRows]);

  // ─── CHRONOS BENTO WIDGETS SUB-RENDERERS ────────────────

  const renderActiveFocusWorkspace = () => (
    <FocusWorkspace
      timerRunning={timerRunning}
      timerSeconds={timerSeconds}
      timerProjectId={timerProjectId}
      timerTaskLabel={timerTaskLabel}
      projects={projects}
      filteredLogs={filteredLogs}
      startTimer={startTimer}
      stopTimer={stopTimer}
      triggerToast={triggerToast}
    />
  );

  // renderTimeStream → extracted to TimeStream.jsx

  const renderGoalCadenceDashboard = () => {
    const dailyTarget = parseFloat(localStorage.getItem('ws_dailyTarget') || '8');
    const weeklyTarget = parseFloat(localStorage.getItem('ws_weeklyTarget') || '40');
    return (
      <div className="glass-card p-4 border border-[var(--border-default)] space-y-4 select-none">
        <div className="flex items-center gap-1.5">
          <CalendarCheck size={14} className="text-[var(--text-muted)] shrink-0" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Goal Cadences</h4>
        </div>

        <div className="space-y-4">
          {/* Daily Goal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text-secondary)]">Daily Focus Target</span>
              <span className="font-mono text-[var(--text-primary)]">
                {totalTodayHours.toFixed(1)}h <span className="text-[var(--text-muted)]">/ {dailyTarget.toFixed(1)}h</span>
              </span>
            </div>
            <div className="progress-track h-2 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full progress-fill transition-all duration-500 ${
                  totalTodayHours >= dailyTarget ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (totalTodayHours / dailyTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text-secondary)]">Weekly Progress Goal</span>
              <span className="font-mono text-[var(--text-primary)]">
                {totalWeekHours.toFixed(1)}h <span className="text-[var(--text-muted)]">/ {weeklyTarget.toFixed(1)}h</span>
              </span>
            </div>
            <div className="progress-track h-2 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-fill transition-all duration-500 bg-amber-500"
                style={{ width: `${Math.min(100, (totalWeekHours / weeklyTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Project Goal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text-secondary)]">Chronos App Design Goal</span>
              <span className="font-mono text-[var(--text-primary)]">
                {filteredLogs
                  .filter(l => l.projectId === 'p2')
                  .reduce((sum, l) => sum + l.duration, 0)
                  .toFixed(1)}h <span className="text-[var(--text-muted)]">/ 12.0h</span>
              </span>
            </div>
            <div className="progress-track h-2 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-fill transition-all duration-500 bg-sky-500"
                style={{
                  width: `${Math.min(
                    100,
                    (filteredLogs.filter(l => l.projectId === 'p2').reduce((sum, l) => sum + l.duration, 0) / 12) * 100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sub-renderer for List View
  const renderListView = () => {
    return (
      <div className="flex min-h-0 h-full bg-[var(--bg-surface)] overflow-hidden">

        {/* ── Left: Journal column ───────────────────────── */}
        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5 space-y-5">
          {renderActiveFocusWorkspace()}
          <TimeStream
            listDaysWithLogs={listDaysWithLogs}
            startTimer={startTimer}
            triggerToast={triggerToast}
            projects={projects}
            setDrawerEntry={setDrawerEntry}
            setDrawerOpen={setDrawerOpen}
          />
        </div>

        {/* ── Right: Collapsible stats sidebar ───────────── */}
        <div
          className="shrink-0 flex h-full overflow-hidden transition-all duration-[250ms] ease-out"
          style={{ width: sidebarExpanded ? '320px' : '0px' }}
        >
          {/* Expanded panel */}
          {sidebarExpanded && (
            <div className="w-full flex flex-col h-full border-l border-[var(--border-default)] overflow-hidden">
              {/* Panel header */}
              <div className="h-10 px-4 flex items-center justify-between shrink-0 border-b border-[var(--border-default)] select-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  Stats & Goals
                </span>
                <button
                  onClick={() => setSidebarExpanded(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[var(--bg-sunken)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  title="Collapse panel"
                >
                  <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* Stat summary strip — always visible at top of sidebar */}
              <div className="grid grid-cols-2 gap-2 p-3 border-b border-[var(--border-default)] shrink-0">
                <div className="rounded-xl bg-[var(--bg-sunken)] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none">Today</p>
                  <p className="text-lg font-black font-mono text-[var(--text-primary)] leading-tight tabular-nums">
                    {totalTodayHours.toFixed(1)}h
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-sunken)] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none">This Week</p>
                  <p className="text-lg font-black font-mono text-[var(--text-primary)] leading-tight tabular-nums">
                    {totalWeekHours.toFixed(1)}h
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-sunken)] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none">Billable</p>
                  <p className="text-lg font-black font-mono text-[var(--text-primary)] leading-tight tabular-nums">
                    {billableWeekHours.toFixed(1)}h
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-sunken)] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none">Entries</p>
                  <p className="text-lg font-black font-mono text-[var(--text-primary)] leading-tight tabular-nums">
                    {totalWeekEntries}
                  </p>
                </div>
              </div>

              {/* Scrollable sidebar content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {renderGoalCadenceDashboard()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // renderCalendarView → extracted to CalendarView.jsx

  // Sub-renderer for Timesheet View
  const renderTimesheetView = () => {
    return (
      <div className="h-full w-full flex flex-col min-h-0 bg-[var(--bg-surface)] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_128px_64px_64px_64px_64px_64px_64px_64px_64px] gap-2 items-center px-6 py-3 bg-[var(--bg-sunken)] border-b border-[var(--border-default)] text-xs font-semibold text-[var(--text-muted)] select-none shrink-0">
          <div>Task</div>
          <div className="w-32">Project</div>
          {weekDays.map((day, idx) => {
            const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dayDate = day.getDate().toString().padStart(2, '0');
            const dayMonth = (day.getMonth() + 1).toString().padStart(2, '0');
            return (
              <div key={idx} className="w-16 text-center font-mono">
                {dayLabel}
                <div className="text-[10px] opacity-75">{dayDate}/{dayMonth}</div>
              </div>
            );
          })}
          <div className="w-16 text-right">Total</div>
        </div>

        {/* Scrollable Matrix Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-default)]">
          {timesheetRows.map((row, idx) => {
            const projectColor = getProjectColor(row.projectId);
            return (
              <div
                key={idx}
                className="grid grid-cols-[1fr_128px_64px_64px_64px_64px_64px_64px_64px_64px] gap-2 items-center px-6 py-3 hover:bg-[var(--bg-sunken)]/40 transition-colors text-sm"
              >
                {/* Task name */}
                <div className="text-[var(--text-primary)] font-medium truncate" title={row.task}>
                  <span className="truncate">{row.task}</span>
                </div>
                {/* Project badge */}
                <div className="w-32 truncate flex items-center gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: projectColor }} />
                  <span className="text-xs text-[var(--text-muted)] truncate" title={row.projectName}>
                    {row.projectName}
                  </span>
                </div>
                {/* Hour entries inputs matrix */}
                {row.dailyHours.map((hours, dayIdx) => (
                  <div key={dayIdx} className="w-16 flex justify-center shrink-0">
                    <div className={`text-center text-xs font-mono rounded px-2 py-1 w-12 border ${
                      hours > 0
                        ? 'bg-amber-100/60 text-amber-800 font-semibold border-amber-200/50'
                        : 'bg-[var(--bg-sunken)] border-transparent text-[var(--text-muted)] opacity-50'
                    }`}>
                      {hours > 0 ? `${hours.toFixed(1)}h` : '0h'}
                    </div>
                  </div>
                ))}
                {/* Row Total */}
                <div className="w-16 text-right font-mono font-bold text-[var(--text-primary)] shrink-0">
                  {row.total.toFixed(1)}h
                </div>
              </div>
            );
          })}

          {timesheetRows.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-surface)]">
              <EmptyState
                icon={Clock}
                title="No time entries for this week"
                description="Use the start timer tool at the top to track your activities."
              />
            </div>
          )}
        </div>

        {/* Footer controls row */}
        <div className="px-6 py-3 border-t border-[var(--border-default)] flex items-center gap-3 bg-[var(--bg-surface)] shrink-0 select-none">
          <button
            onClick={() => {
              triggerToast('Add row', 'Timesheet row creation is not implemented in this demo.', 'info');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] transition-colors border border-dashed border-[var(--border-default)]"
          >
            <Plus size={13} />
            Add row
          </button>
          <button
            onClick={() => {
              triggerToast('Copy last week', 'Copied rows from last week successfully.', 'success');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] transition-colors border border-[var(--border-default)]"
          >
            Copy last week
          </button>
        </div>

        {/* Column Totals bottom row */}
        <div className="grid grid-cols-[1fr_128px_64px_64px_64px_64px_64px_64px_64px_64px] gap-2 items-center px-6 py-4 bg-[var(--bg-sunken)]/70 border-t border-[var(--border-default)] text-sm font-bold text-[var(--text-primary)] shrink-0 select-none">
          <div>Total</div>
          <div className="w-32 shrink-0" />
          {timesheetColumnTotals.daily.map((hours, idx) => (
            <div key={idx} className="w-16 text-center font-mono shrink-0">
              {hours > 0 ? `${hours.toFixed(1)}h` : '0h'}
            </div>
          ))}
          <div className="w-16 text-right font-mono text-amber-600 shrink-0">
            {timesheetColumnTotals.grandTotal.toFixed(1)}h
          </div>
        </div>
      </div>
    );
  };

  // Sub-renderer for Table View (flat per-entry list)
  const renderTableView = () => {
    const allLogs = [...filteredLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const grouped = {};
    allLogs.forEach(log => {
      if (!grouped[log.date]) grouped[log.date] = [];
      grouped[log.date].push(log);
    });
    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    if (allLogs.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <EmptyState icon={Clock} title="No entries this week" description="Start the timer or log time manually to see entries here." />
        </div>
      );
    }

    return (
      <div className="h-full w-full overflow-auto bg-[var(--bg-surface)]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-sunken)', borderBottom: '1px solid var(--border-default)' }}>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              <th className="px-4 py-3 text-left">Task</th>
              <th className="px-4 py-3 text-left">Project</th>
              <th className="px-4 py-3 text-center">Start</th>
              <th className="px-4 py-3 text-center">End</th>
              <th className="px-4 py-3 text-center">Duration</th>
              <th className="px-4 py-3 text-center">Type</th>
              <th className="px-4 py-3 text-center">Billable</th>
            </tr>
          </thead>
          <tbody>
            {dates.map(date => (
              <React.Fragment key={date}>
                <tr>
                  <td colSpan={7} className="px-4 py-1.5 text-[11px] font-semibold text-[var(--text-muted)]" style={{ background: 'color-mix(in srgb, var(--bg-sunken) 60%, transparent)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </td>
                </tr>
                {grouped[date].map(log => {
                  const proj = projects.find(p => p.id === log.projectId);
                  return (
                    <tr
                      key={log.id}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--border-default)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-sunken)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setSelectedEntry({
                          log,
                          x: Math.min(rect.right + 8, window.innerWidth - 296),
                          y: Math.max(8, rect.top),
                        });
                      }}
                    >
                      <td className="px-4 py-2.5 text-[var(--text-primary)] font-medium max-w-[200px]">
                        <span className="truncate block">{log.task || <span className="text-[var(--text-muted)]">(No description)</span>}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: proj?.color || 'var(--border-strong)' }} />
                          <span className="text-[var(--text-secondary)] truncate text-xs">{log.projectName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-xs text-[var(--text-secondary)]">{log.startTime || '—'}</td>
                      <td className="px-4 py-2.5 text-center font-mono text-xs text-[var(--text-secondary)]">{log.endTime || '—'}</td>
                      <td className="px-4 py-2.5 text-center font-mono text-sm font-semibold text-[var(--text-primary)]">{(Number(log.duration) || 0).toFixed(1)}h</td>
                      <td className="px-4 py-2.5 text-center"><TrackingSourceBadge source={log.source} /></td>
                      <td className="px-4 py-2.5 text-center">
                        {log.billable
                          ? <Check size={14} className="text-emerald-500 mx-auto" />
                          : <span className="text-[var(--text-muted)] text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in relative -mx-6 -my-5">

      {/* ── Navigation Bar ───────────────────────────── */}
      <MyTimeNavbar
        navigationScale={navigationScale}
        setNavigationScale={setNavigationScale}
        currentWeekStart={currentWeekStart}
        setCurrentWeekStart={setCurrentWeekStart}
        goToPrev={goToPrev}
        goToNext={goToNext}
        goToToday={goToToday}
        isCurrentPeriod={isCurrentPeriod}
        weekNumber={weekNumber}
        formatRangeLabel={formatRangeLabel}
        dateJumpRef={dateJumpRef}
        dateJumpOpen={dateJumpOpen}
        setDateJumpOpen={setDateJumpOpen}
        DateTimePicker={DateTimePicker}
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        setDrawerOpen={setDrawerOpen}
      />

      {/* ── View Content Area ─────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === 'list' && renderListView()}
        {activeView === 'calendar' && (
          <CalendarView
            weekDays={weekDays}
            selectedDate={selectedDate}
            filteredLogs={filteredLogs}
            projects={projects}
            setDrawerEntry={setDrawerEntry}
            setDrawerOpen={setDrawerOpen}
            setSelectedEntry={setSelectedEntry}
          />
        )}
        {activeView === 'timesheet' && renderTimesheetView()}
        {activeView === 'table' && renderTableView()}
      </div>

      {/* Calendar entry popover */}
      <EntryPopover
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        setDrawerEntry={setDrawerEntry}
        setDrawerOpen={setDrawerOpen}
        deleteEntry={deleteEntry}
        logsToRender={logsToRender}
        setLogsToRender={setLogsToRender}
      />

      {/* Calendar sync panel (unchanged) */}
      {showCalendarPanel && (
        <div
          ref={calendarPanelRef}
          className="absolute top-14 right-5 z-40 w-72 glass-elevated rounded-2xl border border-[var(--border-default)] shadow-xl p-4 animate-fade-in"
        >
          {/* Heading */}
          <div className="flex gap-2.5 items-start mb-3 select-none">
            <span className="text-xl leading-none">🗓️</span>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Sync your calendar</h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-normal">
                Connect calendars to view events alongside your time log.
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Button variant="ghost" size="sm"
              className="w-full text-left flex items-center gap-2 border border-[var(--border-default)] hover:bg-[var(--bg-sunken)]"
              onClick={() => triggerToast('Calendar Sync', 'Google Calendar sync coming soon', 'info')}
            >
              <span className="text-sm">🗓</span> Connect Google Calendar
            </Button>
            <Button variant="ghost" size="sm"
              className="w-full text-left flex items-center gap-2 border border-[var(--border-default)] hover:bg-[var(--bg-sunken)]"
              onClick={() => triggerToast('Calendar Sync', 'Outlook Calendar sync coming soon', 'info')}
            >
              <span className="text-sm">📅</span> Connect Outlook Calendar
            </Button>
          </div>

          <div className="h-px bg-[var(--border-default)] my-3" />

          <div className="space-y-3.5 mb-4 select-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Completed tasks</span>
              <Toggle checked={completedTasksChecked} onChange={setCompletedTasksChecked} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">Week visualization</span>
              <Toggle checked={weekVisChecked} onChange={setWeekVisChecked} size="sm" />
            </div>
          </div>

          <div className="h-px bg-[var(--border-default)] my-3" />

          <button
            onClick={() => { triggerToast('Settings', 'Navigating to calendar settings...', 'info'); setShowCalendarPanel(false); }}
            className="w-full flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1 select-none"
          >
            <span className="flex items-center gap-1.5">
              <Settings2 size={12} /> Calendar settings
            </span>
            <span>→</span>
          </button>
        </div>
      )}

    </div>
  );
}


