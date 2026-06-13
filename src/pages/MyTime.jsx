import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarDays, List,
  LayoutGrid, Table2, Play, Square, Plus, Clock, Settings2, CalendarCheck,
  Activity
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import DateTimePicker from '../components/ui/DateTimePicker';
import { projects } from '../data/mockData';
import EmptyState from '../components/ui/EmptyState';

// Approved project hex colors fallback
const PROJECT_COLORS = [
  '#f59e0b', '#10b981', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

function getProjectColor(projectId) {
  const proj = projects.find(p => p.id === projectId);
  return proj?.color || PROJECT_COLORS[0];
}

// Helper date functions
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekNumber(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

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

  const [focusTask, setFocusTask] = useState('');
  const [focusProject, setFocusProject] = useState(projects[0]?.id || '');

  // State
  const [activeView, setActiveView] = useState('list');
  const [showCalendarPanel, setShowCalendarPanel] = useState(false);
  const [navigationScale, setNavigationScale] = useState('week'); // 'week' | 'month'
  const currentUserId = 'u1'; // Priya Sharma for employee role

  // Settings dropdown triggers
  const [completedTasksChecked, setCompletedTasksChecked] = useState(false);
  const [weekVisChecked, setWeekVisChecked] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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

  // Filter logs to entries within current week Mon-Sun
  const filteredLogs = useMemo(() => {
    return (logs || []).filter(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      const start = new Date(currentWeekStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const inWeek = logDate >= start && logDate <= end;
      if (!inWeek) return false;

      // Gate by employee role
      if (currentRole === 'employee') {
        return log.userId === currentUserId;
      }
      return true;
    });
  }, [logs, currentWeekStart, currentRole]);

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
      setCurrentWeekStart(d => {
        const newDate = new Date(d);
        newDate.setMonth(newDate.getMonth() - 1);
        return getMonday(newDate);
      });
      triggerToast('Date Adjusted', 'Moved back by 1 month', 'info');
    } else {
      setCurrentWeekStart(d => addDays(d, -7));
      triggerToast('Date Adjusted', 'Moved back by 1 week', 'info');
    }
  };

  const goToNext = () => {
    if (navigationScale === 'month') {
      setCurrentWeekStart(d => {
        const newDate = new Date(d);
        newDate.setMonth(newDate.getMonth() + 1);
        return getMonday(newDate);
      });
      triggerToast('Date Adjusted', 'Moved forward by 1 month', 'info');
    } else {
      setCurrentWeekStart(d => addDays(d, 7));
      triggerToast('Date Adjusted', 'Moved forward by 1 week', 'info');
    }
  };

  const goToToday = () => setCurrentWeekStart(getMonday(new Date()));

  const isCurrentWeek = useMemo(() => {
    const currentMonday = getMonday(new Date());
    return currentWeekStart.getTime() === currentMonday.getTime();
  }, [currentWeekStart]);

  const formatWeekLabel = () => {
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

  const renderActiveFocusWorkspace = () => {
    if (timerRunning) {
      // ── HERO RUNNING STATE: Premium B2B Cockpit HUD ──────────────────
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

    // ── HERO STOPPED STATE: Start Timer Cockpit HUD ─────────────────
    return (
      <div className="glass-elevated rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-md p-5 flex flex-col items-center">
        {/* Row 1: Ready Monospace Display */}
        <div className="text-center select-none mb-5">
          <span className="text-5xl font-bold font-mono tracking-tight text-[var(--text-muted)] leading-none">
            00:00:00
          </span>
        </div>

        {/* Row 2: Interactive Wings Grid */}
        <div className="w-full grid grid-cols-3 items-center gap-4 pt-3 border-t border-[var(--border-default)]/30">
          {/* Left Wing: Project picker & Telemetry Indicator */}
          <div className="flex flex-col gap-1.5 justify-start">
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: getProjectColor(focusProject) }}
              />
              <select
                value={focusProject}
                onChange={e => setFocusProject(e.target.value)}
                className="text-xs font-bold text-[var(--text-secondary)] bg-transparent focus:outline-none cursor-pointer max-w-[110px] truncate"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Stage: Start Action button */}
          <div className="flex justify-center select-none">
            <button
              onClick={() => {
                const label = focusTask.trim() || 'Focus session';
                const proj = focusProject || projects[0]?.id || '';
                startTimer(label, proj);
                setFocusTask('');
                triggerToast('Timer started', label, 'success');
              }}
              className="shrink-0 flex items-center justify-center p-3 rounded-full bg-amber-400 hover:bg-amber-300 transition-all duration-150 timer-cta-pulse press-on-click"
              style={{
                width: '42px',
                height: '42px',
                color: 'var(--text-primary)',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 35%, transparent)',
              }}
              title="Start live focus timer"
            >
              <Play size={14} fill="currentColor" className="ml-0.5" />
            </button>
          </div>

          {/* Right Wing: Task Description input */}
          <div className="flex justify-end min-w-0 flex-1">
            <input
              type="text"
              placeholder="What are you working on?"
              value={focusTask}
              onChange={e => setFocusTask(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && focusTask.trim()) {
                  const label = focusTask.trim();
                  const proj = focusProject || projects[0]?.id || '';
                  startTimer(label, proj);
                  setFocusTask('');
                  triggerToast('Timer started', label, 'success');
                }
              }}
              className="w-full max-w-[220px] h-9 bg-[var(--bg-sunken)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:bg-[var(--bg-surface)] rounded-xl px-3 text-xs font-semibold focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Quick re-use chips bar below */}
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
  };

  const renderTimeStream = () => {
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

                  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const cleanStr = String(timeStr).replace(/[^0-9:]/g, '');
    let [h, m] = cleanStr.split(':').map(Number);
    if (/pm/i.test(timeStr) && h < 12) h += 12;
    if (/am/i.test(timeStr) && h === 12) h = 0;
    return (h || 0) * 60 + (m || 0);
  };

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

                            {/* CTAs: Resume & Verify screenshot */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Resume past log */}
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
  };

  const renderGoalCadenceDashboard = () => {
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
                {totalTodayHours.toFixed(1)}h <span className="text-[var(--text-muted)]">/ 8.0h</span>
              </span>
            </div>
            <div className="progress-track h-2 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full progress-fill transition-all duration-500 ${
                  totalTodayHours >= 8 ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (totalTodayHours / 8) * 100)}%` }}
              />
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text-secondary)]">Weekly Progress Goal</span>
              <span className="font-mono text-[var(--text-primary)]">
                {totalWeekHours.toFixed(1)}h <span className="text-[var(--text-muted)]">/ 40.0h</span>
              </span>
            </div>
            <div className="progress-track h-2 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full progress-fill transition-all duration-500 bg-amber-500"
                style={{ width: `${Math.min(100, (totalWeekHours / 40) * 100)}%` }}
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
          {renderTimeStream()}
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

  // Sub-renderer for Calendar View
  const renderCalendarView = () => {
    const ROW_HEIGHT = 60; // 60px per hour
    return (
      <div className="h-full w-full flex flex-col min-h-0 bg-[var(--bg-surface)] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[64px_repeat(7,_1fr)] border-b border-[var(--border-default)] bg-[var(--bg-elevated)] shrink-0 select-none">
          <div className="w-16 h-12" /> {/* Empty corner */}
          {weekDays.map((day, idx) => {
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
          <div className="relative grid grid-cols-[64px_repeat(7,_1fr)]" style={{ height: `${17 * ROW_HEIGHT}px` }}>
            {/* Left side hour labels */}
            <div className="relative h-full w-16 select-none border-r border-[var(--border-default)]">
              {Array.from({ length: 17 }).map((_, i) => {
                const h = 7 + i;
                const displayHour = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
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
              {Array.from({ length: 17 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-b border-[var(--border-default)]/40"
                  style={{ top: `${(i + 1) * ROW_HEIGHT}px` }}
                />
              ))}
            </div>

            {/* Columns for the 7 days */}
            {weekDays.map((day, colIdx) => {
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
                    const clickHour = Math.floor(hourFraction) + 7; // Calendar starts at 7 AM
                    const clickMin = Math.floor((hourFraction % 1) * 60);

                    // Round to nearest 15 minute interval
                    const snappedMin = Math.round(clickMin / 15) * 15;
                    let finalHour = clickHour;
                    let finalMin = snappedMin;
                    if (finalMin === 60) {
                      finalHour += 1;
                      finalMin = 0;
                    }

                    const formatTimeStr = (h, m) => {
                      const hh = String(Math.min(23, Math.max(0, h))).padStart(2, '0');
                      const mm = String(Math.min(59, Math.max(0, m))).padStart(2, '0');
                      return `${hh}:${mm}`;
                    };

                    const startTimeStr = formatTimeStr(finalHour, finalMin);
                    const endTimeStr = formatTimeStr(finalHour + 1, finalMin); // default 1 hour block

                    setDrawerEntry({
                      task: '',
                      projectId: projects[0]?.id || '',
                      date: dateStr,
                      startTime: startTimeStr,
                      endTime: endTimeStr,
                      billable: false,
                    });
                    setDrawerOpen(true);
                  }}
                  className={`relative h-full border-l border-[var(--border-default)]/40 transition-colors cursor-crosshair hover:bg-[var(--bg-sunken)]/20 ${
                    isSelected ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.02]' : ''
                  }`}
                >
                  {/* Render time blocks for this day */}
                  {dayLogs.map(log => {
                    const parseHour = (timeStr) => {
                      if (!timeStr) return 7;
                      const str = String(timeStr);
                      const cleanStr = str.replace(/[^0-9:]/g, '');
                      const parts = cleanStr.split(':');
                      const h = Number(parts[0]) || 0;
                      const m = Number(parts[1]) || 0;
                      let finalH = h;
                      if (/pm/i.test(str) && h < 12) {
                        finalH += 12;
                      } else if (/am/i.test(str) && h === 12) {
                        finalH = 0;
                      }
                      return finalH + m / 60;
                    };
                    const startH = parseHour(log.startTime);
                    const endH = parseHour(log.endTime);
                    const duration = Number(log.duration) || (endH - startH);

                    if (startH >= 24 || startH + duration <= 7) return null;

                    const topOffset = (startH - 7) * ROW_HEIGHT;
                    const blockHeight = duration * ROW_HEIGHT;
                    const projectColor = getProjectColor(log.projectId);

                    return (
                      <div
                        key={log.id}
                        className="absolute left-1 right-1 rounded-md px-2 py-1 select-none overflow-hidden cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
                        style={{
                          top: `${Math.max(0, topOffset)}px`,
                          height: `${Math.max(20, blockHeight - 2)}px`,
                          backgroundColor: `${projectColor}20`,
                          borderLeft: `3px solid ${projectColor}`,
                          zIndex: 10,
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Isolate block selection from empty grid triggers
                          triggerToast('Time Entry Details', `${log.task || 'Time Entry'} (${(Number(log.duration) || 0).toFixed(1)}h)`, 'info');
                        }}
                      >
                        <div className="font-semibold text-[10px] leading-tight truncate" style={{ color: projectColor }}>
                          <span className="truncate">{log.task || '(No task description)'}</span>
                        </div>
                        <div className="text-[9px] opacity-85 leading-tight truncate mt-0.5" style={{ color: projectColor }}>
                          {log.startTime} – {log.endTime} ({(Number(log.duration) || 0).toFixed(1)}h)
                        </div>
                        {blockHeight > 45 && (
                          <div className="text-[9px] font-medium opacity-70 leading-tight truncate mt-0.5" style={{ color: projectColor }}>
                            {log.projectName}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Today's red/amber time line indicator */}
                  {isToday && (
                    <CurrentTimeIndicator rowHeight={ROW_HEIGHT} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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

  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in relative -mx-6 -my-5">

      {/* ── Week Navigation Bar ───────────────────────────── */}
      <div className="h-12 border-b border-[var(--border-default)] px-5 flex items-center justify-between bg-[var(--bg-surface)] shrink-0 select-none">

        {/* Left: week label + prev/next */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
              {formatWeekLabel()}
            </span>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-sunken)] px-1.5 py-0.5 rounded-md border border-[var(--border-default)]">
              W{weekNumber}
            </span>
          </div>

          {/* Prev / Today / Next */}
          <div className="flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-sunken)] p-0.5 gap-0.5">
            <button
              onClick={goToPrev}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all press-on-click"
            >
              <ChevronLeft size={13} strokeWidth={2.5} />
            </button>
            {!isCurrentWeek && (
              <button
                onClick={goToToday}
                className="px-2 h-7 text-[10px] font-semibold rounded-md text-amber-700 hover:bg-[var(--bg-surface)] transition-all press-on-click"
              >
                Today
              </button>
            )}
            <button
              onClick={goToNext}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all press-on-click"
            >
              <ChevronRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Right: view switcher */}
        <div className="flex items-center gap-2">
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

          {/* Stats toggle button */}
          {activeView === 'list' && (
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all press-on-click select-none border ${
                sidebarExpanded
                  ? 'bg-[var(--bg-sunken)] border-[var(--border-strong)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)]'
              }`}
              title={sidebarExpanded ? "Hide Stats Sidebar" : "Show Stats Sidebar"}
            >
              <Activity size={14} />
            </button>
          )}

          {/* Add entry button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all press-on-click select-none"
          >
            <Plus size={13} />
            Log time
          </button>
        </div>
      </div>

      {/* ── View Content Area ─────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === 'list' && renderListView()}
        {activeView === 'calendar' && renderCalendarView()}
        {activeView === 'timesheet' && renderTimesheetView()}
        {activeView === 'table' && renderTimesheetView()}
      </div>

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

// CurrentTimeIndicator component
function CurrentTimeIndicator({ rowHeight }) {
  const [offset, setOffset] = useState(-10);

  useEffect(() => {
    const calcOffset = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const currentH = h + m / 60;
      if (currentH >= 7 && currentH <= 24) {
        setOffset((currentH - 7) * rowHeight);
      } else {
        setOffset(-10);
      }
    };

    calcOffset();
    const interval = setInterval(calcOffset, 60000);
    return () => clearInterval(interval);
  }, [rowHeight]);

  if (offset < 0) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
      style={{ top: `${offset}px` }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 -ml-[4px]" />
      <div className="flex-1 h-[1px] bg-amber-500" />
    </div>
  );
}
