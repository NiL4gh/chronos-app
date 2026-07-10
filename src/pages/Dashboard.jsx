import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTimer } from '../components/layout/TimerContext.jsx';
import {
  Clock, BarChart3, TrendingUp, CheckCircle2, Users,
  MoreHorizontal, Paperclip, Wrench, Mic, ArrowRight,
  Play, Square, AlertTriangle, ChevronDown, ChevronUp, ArrowUp, ArrowDown,
  Plus, Trash2, LayoutDashboard, Circle, Loader
} from 'lucide-react';

import { teamMembers, projects, timeLogs, tasks } from '../data/mockData';
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge';
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import DateTimePicker from '../components/ui/DateTimePicker';

// Project Color Map fallbacks
const PROJECT_COLORS = [
  '#f59e0b', '#10b981', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

function getProjectColor(projectId) {
  const proj = projects.find(p => p.id === projectId);
  return proj?.color || PROJECT_COLORS[0];
}

// Date helper utilities
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
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

// ── All available panels (cross-page) ────────────────────────────────────────
const ALL_PANELS = [
  { id: 'hero-timer',      title: 'Timer',             page: 'Dashboard' },
  { id: 'stats-row',       title: 'My Stats',          page: 'Dashboard' },
  { id: 'week-progress',   title: 'Week Progress',     page: 'Dashboard' },
  { id: 'today-entries',   title: "Today's Entries",   page: 'Dashboard' },
  { id: 'gap-alert',       title: 'Gap Alert',         page: 'Dashboard' },
  { id: 'team-activity',   title: 'Team Activity',     page: 'Team'      },
  { id: 'active-projects', title: 'Active Projects',   page: 'Projects'  },
];

const DEFAULT_LAYOUT = ['hero-timer', 'stats-row', 'today-entries', 'week-progress', 'team-activity'];

export default function Dashboard() {
  const {
    activeRole,
    role,
    triggerToast,
    timerRunning,
    timerTaskLabel,
    timerProjectId,
    startTimer,
    stopTimer,
    logs,
    currentWeekStart,
    setCurrentWeekStart,
    selectedDate,
    setSelectedDate,
  } = useOutletContext();

  const { timerSeconds } = useTimer();

  const currentRole = activeRole || role || 'admin';
  const navigate = useNavigate();

  // Dynamic logs filters
  const adminWeekLogs = useMemo(() => {
    const monday = new Date(currentWeekStart);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return (logs || timeLogs).filter(l => {
      const logDate = new Date(l.date + 'T00:00:00');
      return logDate >= monday && logDate <= sunday;
    });
  }, [logs, currentWeekStart]);

  // ── Employee states & hooks ────────────────────────────────────────────────
  const [timerTask, setTimerTask] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const myProjects = useMemo(() => projects.filter(p => p.members.includes('u1')), []);
  useEffect(() => {
    if (myProjects.length > 0 && !selectedProjectId) setSelectedProjectId(myProjects[0].id);
  }, [myProjects, selectedProjectId]);

  const ME = useMemo(() => teamMembers.find(m => m.id === 'u1'), []);
  const myLogs = useMemo(() => (logs || timeLogs).filter(l => l.userId === 'u1'), [logs]);
  const TODAY = useMemo(() => selectedDate || new Date().toISOString().slice(0, 10), [selectedDate]);
  const todayLogs = useMemo(() => myLogs.filter(l => l.date === TODAY), [myLogs, TODAY]);

  const hoursToday = useMemo(() => +todayLogs.reduce((a, l) => a + l.duration, 0).toFixed(1), [todayLogs]);
  const dailyGoal = 8;
  const todayGoalPct = Math.min(100, Math.round((hoursToday / dailyGoal) * 100));

  const weekLogs = useMemo(() => {
    const monday = new Date(currentWeekStart);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return myLogs.filter(l => {
      const logDate = new Date(l.date + 'T00:00:00');
      return logDate >= monday && logDate <= sunday;
    });
  }, [myLogs, currentWeekStart]);

  const hoursWeek = useMemo(() => +weekLogs.reduce((a, l) => a + l.duration, 0).toFixed(1), [weekLogs]);
  const weekGoal = ME?.availableHoursPerWeek || 40;
  const weekGoalPct = Math.min(100, Math.round((hoursWeek / weekGoal) * 100));

  const billableToday = useMemo(() => +todayLogs.filter(l => l.billable).reduce((a, l) => a + l.duration, 0).toFixed(1), [todayLogs]);

  const currentProject = useMemo(() => myProjects.find(p => p.id === (timerProjectId || myProjects[0]?.id)), [myProjects, timerProjectId]);
  const projectListStr = useMemo(() => myProjects.slice(0, 2).map(p => p.name).join(' · '), [myProjects]);

  const hasGap = useMemo(() => {
    const isToday = TODAY === new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();
    const expectedByNow = isToday ? Math.min(8, Math.max(0, currentHour - 9)) : 8;
    return Math.max(0, expectedByNow - hoursToday) > 0.5;
  }, [hoursToday, TODAY]);

  const gapHours = useMemo(() => {
    const isToday = TODAY === new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();
    const expectedByNow = isToday ? Math.min(8, Math.max(0, currentHour - 9)) : 8;
    return Math.max(0, expectedByNow - hoursToday);
  }, [hoursToday, TODAY]);

  const dailyBreakdown = useMemo(() => {
    const monday = new Date(currentWeekStart);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const hours = weekLogs.filter(l => l.date === dateStr).reduce((s, l) => s + l.duration, 0);
      return { label: ['M','T','W','T','F','S','S'][i], hours, pct: Math.min(100, (hours / dailyGoal) * 100), dateStr };
    });
  }, [weekLogs, dailyGoal, currentWeekStart]);

  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos-dashboard-layout-v3');
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
    } catch { return DEFAULT_LAYOUT; }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [panelSizes, setPanelSizes] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos-dashboard-panel-sizes-v3');
      return saved ? JSON.parse(saved) : {
        'hero-timer': 'large',
        'stats-row': 'large',
        'today-entries': 'medium',
        'week-progress': 'medium',
        'team-activity': 'medium',
        'active-projects': 'medium',
        'gap-alert': 'large',
        'activity': 'medium',
        'attention': 'medium',
        'pulse': 'medium',
        'myday': 'medium',
        'logs': 'large',
      };
    } catch {
      return {
        'hero-timer': 'large',
        'stats-row': 'large',
        'today-entries': 'medium',
        'week-progress': 'medium',
        'team-activity': 'medium',
        'active-projects': 'medium',
        'gap-alert': 'large',
        'activity': 'medium',
        'attention': 'medium',
        'pulse': 'medium',
        'myday': 'medium',
        'logs': 'large',
      };
    }
  });

  // ─── Admin View states & hooks ─────────────────────────────────────────────
  const [cadence, setCadence] = useState('Week');
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [chartType, setChartType] = useState('Bar'); // 'Bar' | 'Wave'

  // Unified Admin Layout State (persisted to localStorage)
  const [adminLayout, setAdminLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos-admin-layout-v3');
      return saved ? JSON.parse(saved) : ['activity', 'attention', 'pulse', 'myday', 'logs'];
    } catch {
      return ['activity', 'attention', 'pulse', 'myday', 'logs'];
    }
  });

  const saveAdminLayout = (newLayout) => {
    setAdminLayout(newLayout);
    localStorage.setItem('chronos-admin-layout-v3', JSON.stringify(newLayout));
  };

  const moveAdminPanel = (idx, dir) => {
    const nl = [...adminLayout];
    if (dir === 'up' && idx > 0) [nl[idx], nl[idx-1]] = [nl[idx-1], nl[idx]];
    if (dir === 'down' && idx < nl.length - 1) [nl[idx], nl[idx+1]] = [nl[idx+1], nl[idx]];
    saveAdminLayout(nl);
  };

  const removeAdminPanel = (panelId) => {
    saveAdminLayout(adminLayout.filter(id => id !== panelId));
  };

  const addAdminPanel = (panelId) => {
    if (!adminLayout.includes(panelId)) {
      saveAdminLayout([...adminLayout, panelId]);
    }
  };

  const [isAdminEditing, setIsAdminEditing] = useState(false);

  // Cadence timing multiplier
  const cadenceMultiplier = useMemo(() => {
    return cadence === 'Today' ? 0.2 : cadence === 'Week' ? 1 : 4.2;
  }, [cadence]);

  // Derived metrics data dynamically computed from logs
  const metrics = useMemo(() => {
    const totalHours = adminWeekLogs.reduce((sum, l) => sum + (Number(l.duration) || 0), 0);
    const billableHours = adminWeekLogs.filter(l => l.billable).reduce((sum, l) => sum + (Number(l.duration) || 0), 0);
    const utilization = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;
    
    // Calculate uninvoiced as approximately 60% of billable hours
    const uninvoicedHours = billableHours * 0.6;
    
    // Count active team members who have logged hours this week
    const activeMembers = new Set(adminWeekLogs.map(l => l.userId)).size;
    
    return {
      hours: totalHours.toFixed(1),
      utilization,
      billableRatio: utilization,
      uninvoiced: uninvoicedHours.toFixed(1),
      activeMembers,
      activeTasks: new Set(adminWeekLogs.map(l => l.task)).size || 12
    };
  }, [adminWeekLogs]);

  // Timer formatter (HH:MM:SS)
  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Active Project derived from active timer ID
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === timerProjectId);
  }, [timerProjectId]);

  // Tasks belonging to logged in employee (u1) or all if admin
  const myDayTasks = useMemo(() => {
    const list = currentRole === 'employee'
      ? tasks.filter(t => t.assignedTo === 'u1')
      : tasks;
    return list.slice(0, 5);
  }, [currentRole]);

  // Helper to query if a timelog exists for a task title today
  const getTaskDurationToday = (taskTitle) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const logsForTask = (logs || timeLogs).filter(l =>
      l.task === taskTitle &&
      l.date === todayStr &&
      (currentRole === 'employee' ? l.userId === 'u1' : true)
    );
    if (logsForTask.length > 0) {
      const total = logsForTask.reduce((sum, l) => sum + l.duration, 0);
      return `${total.toFixed(1)}h`;
    }
    return 'No Record';
  };

  // Complete checklist task complete handler
  const toggleTaskCompleted = (taskId) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // SVG Chart Bars generation data
  // SVG Chart Bars generation data dynamically computed from actual logs of the week
  const chartBars = useMemo(() => {
    const monday = new Date(currentWeekStart);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = adminWeekLogs.filter(l => l.date === dateStr);
      const hours = dayLogs.reduce((sum, l) => sum + (Number(l.duration) || 0), 0);
      const billable = dayLogs.filter(l => l.billable).reduce((sum, l) => sum + (Number(l.duration) || 0), 0);
      const label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
      return {
        label,
        value: hours || 0.1, // small fallback so bar renders minimally or is selectable
        billableValue: billable,
        dateStr
      };
    });
  }, [adminWeekLogs, currentWeekStart]);

  const maxChartValue = useMemo(() => {
    return Math.max(...chartBars.map(b => b.value), 10);
  }, [chartBars]);

  // SVG Cubic-bezier points calculations
  const svgPoints = useMemo(() => {
    const count = chartBars.length;
    return chartBars.map((bar, idx) => {
      const x = ((idx + 0.5) / count) * 100;
      const y = 100 - (bar.value / maxChartValue) * 80;
      return { x, y };
    });
  }, [chartBars, maxChartValue]);

  const bezierPath = useMemo(() => {
    if (svgPoints.length === 0) return '';
    let path = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 0; i < svgPoints.length - 1; i++) {
      const p0 = svgPoints[i];
      const p1 = svgPoints[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [svgPoints]);

  const areaPath = useMemo(() => {
    if (!bezierPath) return '';
    const count = chartBars.length;
    const firstX = (0.5 / count) * 100;
    const lastX = ((count - 0.5) / count) * 100;
    return `${bezierPath} L ${lastX} 100 L ${firstX} 100 Z`;
  }, [bezierPath, chartBars]);

  const saveLayout = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem('chronos-dashboard-layout-v3', JSON.stringify(newLayout));
  };

  const movePanel = (idx, dir) => {
    const nl = [...layout];
    if (dir === 'up' && idx > 0) [nl[idx], nl[idx-1]] = [nl[idx-1], nl[idx]];
    if (dir === 'down' && idx < nl.length - 1) [nl[idx], nl[idx+1]] = [nl[idx+1], nl[idx]];
    saveLayout(nl);
  };

  const removePanel = (idx) => saveLayout(layout.filter((_, i) => i !== idx));
  const addPanel = (id) => { if (!layout.includes(id)) saveLayout([...layout, id]); };

  // ── Render employee panel content ──────────────────────────────────────────
  const renderPanel = (id) => {
    switch (id) {
      case 'gap-alert':
        if (!hasGap) return null;
        return (
          <div className="glass-card flex items-center justify-between p-4 border-l-4 border-l-amber-400 animate-fade-in" style={{ background: 'var(--accent-subtle)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500 shrink-0" size={16} />
              <span className="text-sm font-medium text-[var(--accent-text)]">~{gapHours.toFixed(1)}h unlogged today</span>
            </div>
            <Button variant="primary" size="sm" onClick={() => triggerToast?.('Open the Manual Entry drawer to log missing time.', 'info')}>
              + Log Time
            </Button>
          </div>
        );

      case 'hero-timer':
        return (
          <div className="glass-card p-6 animate-fade-in" style={{
            borderLeft: timerRunning ? '3px solid #10b981' : '3px solid var(--border-strong)',
          }}>
            {!timerRunning ? (
              <div className="flex flex-col items-center gap-4 text-center max-w-xs mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Ready to Track</span>
                <div className="text-5xl font-mono font-bold tabular-nums text-[var(--text-primary)] tracking-tight">00:00:00</div>
                <div className="w-full space-y-2.5">
                  <Input value={timerTask} onChange={e => setTimerTask(e.target.value)} placeholder="What are you working on?" className="w-full text-center text-sm" />
                  <Select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full text-sm">
                    {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </div>
                <button
                  onClick={() => startTimer(timerTask || 'Working...', selectedProjectId)}
                  className="timer-cta-pulse press-on-click w-full py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', boxShadow: '0 2px 8px rgba(245,158,11,0.35)' }}
                >
                  Start Timer
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center max-w-xs mx-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 timer-glow-emerald" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Tracking Now</span>
                </div>
                <div className="text-5xl font-mono font-bold tabular-nums text-emerald-600 tracking-tight">{formatTimer(timerSeconds)}</div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{timerTaskLabel || 'Working...'}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">{currentProject?.name || 'No Project'}</div>
                </div>
                <button
                  onClick={() => stopTimer()}
                  className="w-full py-3 rounded-xl font-semibold text-sm press-on-click"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgb(220,38,38)' }}
                >
                  Stop Timer
                </button>
              </div>
            )}
          </div>
        );

      case 'stats-row':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
            {[
              { label: 'Today', value: `${hoursToday}h`, sub: `${dailyGoal}h goal`, pct: todayGoalPct },
              { label: 'This Week', value: `${hoursWeek}h`, sub: `${weekGoal}h goal`, pct: weekGoalPct },
              { label: 'Billable', value: `${billableToday}h`, sub: `${todayLogs.length} entries` },
              { label: 'Projects', value: myProjects.length, sub: projectListStr || 'No projects' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 glass-interactive">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">{s.label}</p>
                <p className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{s.value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{s.sub}</p>
                {s.pct !== undefined && (
                  <div className="progress-track mt-2.5">
                    <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'today-entries':
        return (
          <div className="glass-card overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Today's Entries</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full font-mono" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)' }}>
                {todayLogs.length} {todayLogs.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            {todayLogs.length === 0 ? (
              <div className="p-6"><EmptyState icon={Clock} title="No entries yet today." /></div>
            ) : (
              <div className="divide-y divide-[var(--border-default)]">
                {todayLogs.map(log => {
                  const projColor = projects.find(p => p.id === log.projectId)?.color || '#a8a29e';
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-sunken)] transition-colors text-xs">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: projColor }} />
                      <span className="font-medium text-[var(--text-primary)] flex-1 truncate">{log.task}</span>
                      <span className="text-[10px] text-[var(--text-muted)] hidden sm:block">{log.projectName}</span>
                      <span className="font-mono text-[var(--text-secondary)] whitespace-nowrap">{log.startTime} – {log.endTime}</span>
                      <span className="font-mono font-bold text-[var(--text-primary)] whitespace-nowrap">{log.duration.toFixed(1)}h</span>
                      <TrackingSourceBadge source={log.source} />
                    </div>
                  );
                })}
              </div>
            )}
            {todayLogs.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[var(--border-default)]">
                <button onClick={() => navigate('/my-time')} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                  View all in My Time →
                </button>
              </div>
            )}
          </div>
        );

      case 'week-progress':
        return (
          <div className="glass-card p-4 animate-fade-in">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Week Progress</h2>
            <div className="flex items-center gap-6">
              <CircularProgress value={hoursWeek} max={weekGoal} size={88} strokeWidth={7} label={`${weekGoalPct}%`} />
              <div className="flex-1 space-y-2">
                {dailyBreakdown.map((day, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] w-3">{day.label}</span>
                    <div className="flex-1 progress-track">
                      <div className="progress-fill" style={{ width: `${day.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] w-7 text-right">{day.hours > 0 ? `${day.hours.toFixed(1)}h` : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-[var(--text-muted)] mt-3">{hoursWeek}h of {weekGoal}h this week</p>
          </div>
        );

      case 'team-activity':
        return (
          <div className="glass-card overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Activity</h2>
              <button onClick={() => navigate('/team')} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">View all →</button>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {teamMembers.filter(m => m.id !== 'u1').slice(0, 5).map(member => (
                <div key={member.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--bg-sunken)] transition-colors text-xs">
                  <div className="relative shrink-0">
                    <Avatar name={member.name} size="sm" />
                    {member.status === 'active' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-emerald-500" />}
                    {member.status === 'idle' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--text-primary)] truncate">{member.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">{member.status === 'active' ? member.currentTask || 'Working...' : 'Offline'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-[var(--text-primary)]">{member.hoursWeek}h</div>
                    <div className="text-[10px] text-[var(--text-muted)]">this week</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'active-projects':
        return (
          <div className="glass-card overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Active Projects</h2>
              <button onClick={() => navigate('/projects')} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">View all →</button>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {myProjects.slice(0, 4).map(proj => {
                const logged = timeLogs.filter(l => l.projectId === proj.id).reduce((a, l) => a + l.duration, 0);
                const pct = proj.goalHours ? Math.min(100, Math.round((logged / proj.goalHours) * 100)) : 0;
                return (
                  <div key={proj.id} className="px-4 py-3 hover:bg-[var(--bg-sunken)] transition-colors text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                        <span className="font-medium text-[var(--text-primary)] truncate">{proj.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[var(--text-primary)]">{logged.toFixed(0)}h</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: proj.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default: return null;
    }
  };

  // ── Render admin panel content ──────────────────────────────────────────────
  const renderAdminPanel = (id) => {
    switch (id) {
      case 'activity':
        return (
          <div className="glass-card p-5 flex flex-col min-h-[300px] h-64 transition-all">
            <div className="flex items-center justify-between mb-4 select-none shrink-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Activity Overview</h2>
              <div className="flex items-center gap-4 select-none shrink-0">
                {/* Segmented Chart Type Toggle */}
                <div className="flex items-center bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-md p-0.5">
                  {['Bar', 'Wave'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setChartType(mode)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${
                        chartType === mode 
                          ? 'bg-white shadow-sm text-[var(--text-primary)]' 
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {mode === 'Bar' ? 'Bars' : 'Trend'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
                    Billable
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-[var(--border-strong)] inline-block" />
                    Internal
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Overlay Area Curve + Vertical bar chart columns */}
            <div className="flex-1 relative h-36 border-b border-[var(--border-default)] pb-1 mb-3">
              
              {/* SVG Overlay Curve with Bezier curve path string (Wave mode only) */}
              {chartType === 'Wave' && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area shape */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-500" />
                  )}

                  {/* Curve line */}
                  {bezierPath && (
                    <path
                      d={bezierPath}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeOpacity="0.7"
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  )}
                </svg>
              )}

              {/* Chart presentation layout */}
              <div className="absolute inset-0 z-0 flex flex-col justify-between pb-1 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full border-t border-dashed border-[var(--border-default)]/70 h-0" />
                ))}
              </div>
              <div className="absolute inset-0 flex items-end gap-1 pb-1 z-10">
                {chartBars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative z-20"
                    onClick={() => triggerToast?.(`Activity — ${bar.label}`, `${bar.value.toFixed(1)}h logged`, 'info')}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-150 bg-[var(--text-primary)] text-[var(--text-inverse)] text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-30 pointer-events-none">
                      {bar.label}: {bar.value.toFixed(1)}h {chartType === 'Bar' && `(${(bar.value * 0.76).toFixed(1)}h billable)`}
                    </div>

                    {chartType === 'Bar' ? (
                      /* Stacked bar (Amber = Billable, Gray = Internal) */
                      <div
                        className="w-full flex flex-col-reverse rounded-t overflow-hidden transition-all duration-300 animate-bar-grow"
                        style={{
                          height: `${(bar.value / maxChartValue) * 100}%`,
                          maxWidth: '16px',
                          margin: '0 auto',
                          animationDelay: `${idx * 0.02}s`
                        }}
                      >
                        <div className="w-full bg-amber-500/70 group-hover:bg-amber-500 transition-colors duration-200" style={{ height: '76%' }} />
                        <div className="w-full bg-[var(--border-strong)]/70 group-hover:bg-[var(--text-muted)] transition-colors duration-200" style={{ height: '24%' }} />
                      </div>
                    ) : (
                      /* Wave Hover Dot Selector Indicator */
                      <div 
                        className="w-2.5 h-2.5 rounded-full bg-amber-500 scale-0 group-hover:scale-100 transition-all absolute border-2 border-white dark:border-[var(--bg-surface)]"
                        style={{
                          bottom: `calc(${(bar.value / maxChartValue) * 80}% - 5px)`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* X axis labels */}
            <div className="flex items-end gap-1 px-0 shrink-0 select-none">
              {chartBars.map((bar, idx) => (
                <div key={idx} className="flex-1 text-center">
                  <span className="text-[9px] text-[var(--text-muted)] truncate block">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'attention':
        return (
          <div className="glass-card p-5 flex flex-col gap-3 h-full transition-all">
            <div className="flex items-center gap-2 mb-1 select-none shrink-0">
              <AlertTriangle size={14} className="text-red-500" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Needs Attention</h2>
            </div>
            <div className="p-3 rounded-lg border border-red-200/50 bg-red-50/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-red-600 mb-1">Missing Time Logs</h3>
                  <p className="text-[11px] text-red-900/70">Aiko Tanaka has 0 logged hours this week.</p>
                </div>
                <button onClick={() => navigate('/team')} className="px-2 py-1 bg-white border border-red-200 rounded text-[10px] font-semibold text-red-700 hover:bg-red-50 transition-colors shrink-0 shadow-sm">View</button>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-amber-200/50 bg-amber-50/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-amber-700 mb-1">Hours Goal Alert</h3>
                  <p className="text-[11px] text-amber-900/70">Brand Redesign project is at 85% of allocated hours.</p>
                </div>
                <button onClick={() => navigate('/projects')} className="px-2 py-1 bg-white border border-amber-200 rounded text-[10px] font-semibold text-amber-700 hover:bg-amber-50 transition-colors shrink-0 shadow-sm">View</button>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-sunken)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1">Deadline Approaching</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">API Gateway v2 is due in 3 days with 12h remaining.</p>
                </div>
                <button onClick={() => navigate('/projects')} className="px-2 py-1 bg-white border border-[var(--border-default)] rounded text-[10px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] transition-colors shrink-0 shadow-sm">View</button>
              </div>
            </div>
          </div>
        );

      case 'pulse':
        return (
          <div className="glass-card overflow-hidden flex flex-col min-h-[360px] transition-all">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)] shrink-0 select-none">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Pulse</h2>
            </div>
            <div className="divide-y divide-[var(--border-default)] overflow-y-auto">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`cursor-pointer transition-colors ${expandedMemberId === member.id ? 'bg-[var(--bg-sunken)]' : 'hover:bg-[var(--bg-sunken)]'}`}
                  style={{ borderLeft: expandedMemberId === member.id ? '3px solid var(--accent)' : '3px solid transparent' }}
                  onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                >
                  <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0 select-none">
                        <Avatar name={member.name} size="sm" />
                        {member.status === 'active' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-emerald-500" />}
                        {member.status === 'idle' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-amber-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{member.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">{member.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 select-none">
                      <div className="text-right">
                        <div className="text-sm font-bold text-[var(--text-primary)]">{member.hoursWeek}h</div>
                        <div className="text-[10px] text-[var(--text-muted)]">this week</div>
                      </div>
                      {expandedMemberId === member.id ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
                    </div>
                  </div>

                  {expandedMemberId === member.id && (
                    <div className="px-4 py-3 border-t border-[var(--border-default)] bg-[var(--bg-sunken)] animate-fade-in text-xs space-y-2 select-none">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Active Task</p>
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{member.currentTask !== 'Offline' ? member.currentTask : 'Idle'}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{member.currentProject || 'Internal'}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Capacity</p>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">{member.hoursWeek}h / {member.availableHoursPerWeek || 40}h</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerToast?.(`Message sent to ${member.name}`, 'Pinged teammate successfully.', 'success');
                          }}
                          className="px-2 py-1 rounded bg-white border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] font-semibold text-[10px] transition-colors shadow-sm"
                        >
                          Ping
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'myday':
        return (
          <div className="glass-card p-5 flex flex-col min-h-[360px] transition-all">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)] shrink-0 select-none">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">My Day</h2>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-default)]/30 py-1">
              {myDayTasks.map((task) => {
                const isCompleted = completedTasks.has(task.id);
                const durationToday = getTaskDurationToday(task.title);

                return (
                  <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    
                    {/* Checkbox and Label */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-[var(--border-default)] hover:border-emerald-400 bg-transparent'
                        }`}
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted && (
                          <span className="text-[9px] font-bold leading-none">✓</span>
                        )}
                      </button>
                      <span className={`text-sm truncate ${
                        isCompleted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)] font-medium'
                      }`} title={task.title}>
                        {task.title}
                      </span>
                    </div>

                    {/* Connector dot line */}
                    <div className="hidden sm:block flex-1 border-b border-dashed border-[var(--border-default)] mx-3 h-3 opacity-60" />

                    {/* Right hand logging stats & Start button */}
                    <div className="flex items-center gap-3.5 shrink-0 select-none">
                      {/* Logged hours today */}
                      <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-sunken)] px-1.5 py-0.5 rounded">
                        {durationToday}
                      </span>

                      {/* Timer controls */}
                      {timerRunning && timerTaskLabel === task.title ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Running
                          </span>
                          <button
                            onClick={() => {
                              if (stopTimer) stopTimer();
                            }}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            title="Stop Timer"
                          >
                            <Square size={12} fill="currentColor" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const projId = task.projectId || projects[0]?.id;
                            if (startTimer) {
                              startTimer(task.title, projId);
                              triggerToast('Timer Started', `Started tracking: ${task.title}`, 'success');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          Start <Play size={9} fill="currentColor" className="mt-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom input row */}
            <div className="mt-4 pt-3 border-t border-[var(--border-default)] shrink-0">
              <input
                type="text"
                placeholder="Add task in my day (e.g. Pay utilities bill by friday)"
                className="w-full text-xs bg-transparent border-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0 p-0"
                readOnly
              />
              <div className="flex items-center justify-between mt-2.5 select-none">
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">Press Enter to add</span>
                {/* Submit send button */}
                <button
                  onClick={() => triggerToast?.('Add task', 'Task insertion is simulated in this mockup.', 'info')}
                  className="w-7 h-7 rounded-lg bg-[var(--bg-sunken)] hover:bg-[var(--border-default)] text-[var(--text-primary)] flex items-center justify-center transition-colors shadow-sm"
                >
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'logs':
        return (
          <div className="glass-card overflow-hidden min-h-[300px] transition-all">
            <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between select-none shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Time Logs</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Overview of recent activity</p>
              </div>
              <button
                onClick={() => navigate('/my-time')}
                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                View all entries →
              </button>
            </div>

            {/* Table container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--bg-sunken)] text-[var(--text-muted)] border-b border-[var(--border-default)] font-semibold select-none">
                    <th className="px-5 py-3">Task</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]/40">
                  {(logs || timeLogs).slice(0, 8).map((log, idx) => {
                    const projectColor = getProjectColor(log.projectId);
                    const initials = log.userName ? log.userName.split(' ').map(n => n[0]).join('') : 'U';

                    return (
                      <tr
                        key={log.id}
                        className={`hover:bg-[var(--bg-sunken)]/40 transition-colors ${idx % 2 === 1 ? 'bg-[var(--bg-sunken)]/20' : ''}`}
                      >
                        {/* Task title */}
                        <td className="px-5 py-3 font-medium text-[var(--text-primary)]">
                          {log.task || '(No task description)'}
                        </td>

                        {/* Project colored badge */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: projectColor }} />
                            <span className="text-[var(--text-secondary)]">{log.projectName}</span>
                          </div>
                        </td>

                        {/* User profile identifier */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-default)] flex items-center justify-center text-[9px] font-bold text-[var(--text-secondary)] select-none">
                              {initials}
                            </div>
                            <span className="text-[var(--text-secondary)]">{log.userName || 'Priya Sharma'}</span>
                          </div>
                        </td>

                        {/* Log Date */}
                        <td className="px-5 py-3 text-[var(--text-muted)] font-mono">
                          {log.date}
                        </td>

                        {/* Clock range */}
                        <td className="px-5 py-3 text-[var(--text-muted)] font-mono">
                          {log.startTime} – {log.endTime}
                        </td>

                        {/* Sum hours */}
                        <td className="px-5 py-3 text-right font-mono font-bold text-[var(--text-primary)]">
                          {log.duration.toFixed(1)}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      default: return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (currentRole !== 'admin') {
    const hiddenPanels = ALL_PANELS.filter(p => !layout.includes(p.id));

    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10 animate-fade-in">
        
        {/* ── NEW CLEAN HEADER ── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shrink-0 relative z-40">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">My Dashboard</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Your personal performance metrics and daily workspace track.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isEditing ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <LayoutDashboard size={13} className="mr-1.5" />
              {isEditing ? 'Done' : 'Customize'}
            </Button>
          </div>
        </div>

        {/* Panel picker (edit mode) */}
        {isEditing && hiddenPanels.length > 0 && (
          <div className="glass-card p-3 mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-[var(--text-muted)] font-medium">Add panel:</span>
            {hiddenPanels.map(p => (
              <button
                key={p.id}
                onClick={() => addPanel(p.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}
              >
                <Plus size={11} /> {p.title}
                <span className="text-[10px] opacity-60 ml-1">({p.page})</span>
              </button>
            ))}
          </div>
        )}

        {/* Panel grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {layout.map((panelId, idx) => {
            const content = renderPanel(panelId);
            if (!content && !isEditing) return null;
            const panelMeta = ALL_PANELS.find(p => p.id === panelId);
            const size = panelSizes[panelId] || 'medium';
            const gridSpan = size === 'small' ? 'col-span-12 md:col-span-4' : size === 'medium' ? 'col-span-12 md:col-span-6' : 'col-span-12';
            
            return (
              <div
                key={panelId}
                className={`${gridSpan} ${
                  isEditing ? 'relative border border-dashed border-amber-400/50 rounded-xl p-2 bg-amber-400/5' : ''
                }`}
              >
                {isEditing && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 pb-2 gap-2 border-b border-amber-400/20 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{panelMeta?.title}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">({size})</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Size controllers */}
                      <div className="flex items-center bg-[var(--bg-sunken)] p-0.5 rounded-lg border border-[var(--border-default)]">
                        {['small', 'medium', 'large'].map(sz => (
                          <button
                            key={sz}
                            onClick={() => {
                              const newSizes = { ...panelSizes, [panelId]: sz };
                              setPanelSizes(newSizes);
                              localStorage.setItem('chronos-dashboard-panel-sizes-v2', JSON.stringify(newSizes));
                            }}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize transition-all ${
                              (panelSizes[panelId] || 'medium') === sz
                                ? 'bg-amber-400 text-neutral-950 font-extrabold shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-0.5 border-l pl-2 border-[var(--border-default)]">
                        <button onClick={() => movePanel(idx, 'up')} disabled={idx === 0} className="p-1 text-[var(--text-muted)] hover:text-amber-500 disabled:opacity-30 transition-colors">
                          <ArrowUp size={12} />
                        </button>
                        <button onClick={() => movePanel(idx, 'down')} disabled={idx === layout.length - 1} className="p-1 text-[var(--text-muted)] hover:text-amber-500 disabled:opacity-30 transition-colors">
                          <ArrowDown size={12} />
                        </button>
                        <button onClick={() => removePanel(idx)} className="p-1 text-red-400 hover:text-red-500 transition-colors ml-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {content || (isEditing && <div className="p-4 text-center text-xs text-[var(--text-muted)] italic">Panel hidden (no data)</div>)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const ALL_ADMIN_PANELS = [
    { id: 'activity', title: 'Activity Overview' },
    { id: 'attention', title: 'Needs Attention' },
    { id: 'pulse', title: 'Team Pulse' },
    { id: 'myday', title: 'My Day' },
    { id: 'logs', title: 'Recent Time Logs' },
  ];
  const hiddenAdminPanels = ALL_ADMIN_PANELS.filter(p => !adminLayout.includes(p.id));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10 animate-fade-in">
      
      {/* ── NEW CLEAN HEADER ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none shrink-0 relative z-40">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Command Center</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Team performance overview and telemetry insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-lg p-0.5 shrink-0 self-center">
            {['Today', 'Week', 'Month'].map(t => (
              <button
                key={t}
                onClick={() => setCadence(t)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 ${cadence === t ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            variant={isAdminEditing ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsAdminEditing(!isAdminEditing)}
          >
            <LayoutDashboard size={13} className="mr-1.5" />
            {isAdminEditing ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Panel picker (edit mode) */}
      {isAdminEditing && hiddenAdminPanels.length > 0 && (
        <div className="glass-card p-3 mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[var(--text-muted)] font-medium">Add panel:</span>
          {hiddenAdminPanels.map(p => (
            <button
              key={p.id}
              onClick={() => addAdminPanel(p.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' }}
            >
              <Plus size={11} /> {p.title}
            </button>
          ))}
        </div>
      )}

      {/* ── ACTIVE TIMER BANNER ────────────────────────────── */}
      {timerRunning && (
        <div
          className="w-full rounded-xl shrink-0 flex items-center px-5 gap-4 h-14 select-none animate-fade-in"
          style={{ background: '#1c1917' }}
        >
          {/* Pulsing red recorder indicator */}
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xl font-mono font-semibold tabular-nums text-white">
              {formatTimer(timerSeconds)}
            </span>
          </div>

          <div className="h-5 w-px bg-white/20" />

          {/* Label and Project tag details */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
            <span className="text-sm font-medium text-white/85 truncate max-w-[240px]" title={timerTaskLabel}>
              {timerTaskLabel || 'Working...'}
            </span>
            {activeProject && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-amber-300"
                style={{ backgroundColor: `${activeProject.color}25`, border: `1px solid ${activeProject.color}40` }}
              >
                {activeProject.name}
              </span>
            )}
          </div>

          {/* Stop trigger button */}
          <button
            onClick={() => {
              if (stopTimer) stopTimer();
            }}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all shrink-0"
            title="Stop Timer"
          >
            <Square size={12} fill="currentColor" />
          </button>
        </div>
      )}

      {/* ── KPI CARDS ROW (Compact & Dynamic) ────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Total Hours */}
        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--text-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Total Hours</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{metrics.hours}h</p>
          </div>
          {/* Inline circular progress */}
          <div className="relative flex items-center justify-center select-none shrink-0 w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-default)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none" stroke="var(--accent)" strokeWidth="3.5"
                strokeDasharray="100" strokeDashoffset={100 - Math.min(100, Math.round((Number(metrics.hours) / 160) * 100))} strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-[8px] font-bold text-[var(--text-primary)]">{Math.min(100, Math.round((Number(metrics.hours) / 160) * 100))}%</span>
          </div>
        </div>

        {/* Billable utilization */}
        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <BarChart3 size={14} className="text-[var(--text-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Billable Util.</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{metrics.utilization}%</p>
          </div>
          {/* Inline circular progress */}
          <div className="relative flex items-center justify-center select-none shrink-0 w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-default)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none" stroke="var(--accent)" strokeWidth="3.5"
                strokeDasharray="100" strokeDashoffset={100 - metrics.utilization} strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-[8px] font-bold text-[var(--text-primary)]">{metrics.utilization}%</span>
          </div>
        </div>

        {/* Uninvoiced Hours */}
        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[var(--text-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Uninvoiced</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{metrics.uninvoiced}h</p>
          </div>
          {/* Inline circular progress */}
          <div className="relative flex items-center justify-center select-none shrink-0 w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-default)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none" stroke="var(--accent)" strokeWidth="3.5"
                strokeDasharray="100" strokeDashoffset={40} strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-[8px] font-bold text-[var(--text-primary)]">60%</span>
          </div>
        </div>

        {/* Active Members */}
        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-[var(--text-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Active Team</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{metrics.activeMembers} / 8</p>
          </div>
          {/* Inline circular progress */}
          <div className="relative flex items-center justify-center select-none shrink-0 w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-default)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none" stroke="var(--accent)" strokeWidth="3.5"
                strokeDasharray="100" strokeDashoffset={100 - Math.min(100, Math.round((metrics.activeMembers / 8) * 100))} strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-[8px] font-bold text-[var(--text-primary)]">{metrics.activeMembers}/8</span>
          </div>
        </div>
      </div>

      {/* ── MAIN 12-COLUMN GRID ────────────────────────────── */}
      <div className="grid grid-cols-12 gap-5 mt-5">
        {adminLayout.map((panelId, idx) => {
          const content = renderAdminPanel(panelId);
          if (!content && !isAdminEditing) return null;
          const panelMeta = ALL_ADMIN_PANELS.find(p => p.id === panelId);
          const size = panelSizes[panelId] || (panelId === 'activity' ? 'large' : 'medium');
          const gridSpan = size === 'small' ? 'col-span-12 md:col-span-4' : size === 'medium' ? 'col-span-12 md:col-span-6' : 'col-span-12';
          
          return (
            <div
              key={panelId}
              className={`${gridSpan} ${
                isAdminEditing ? 'relative border border-dashed border-amber-400/50 rounded-xl p-2 bg-amber-400/5' : ''
              }`}
            >
              {isAdminEditing && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 pb-2 gap-2 border-b border-amber-400/20 mb-2 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{panelMeta?.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">({size})</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Size controllers */}
                    <div className="flex items-center bg-[var(--bg-sunken)] p-0.5 rounded-lg border border-[var(--border-default)]">
                      {['small', 'medium', 'large'].map(sz => (
                        <button
                          key={sz}
                          onClick={() => {
                            const newSizes = { ...panelSizes, [panelId]: sz };
                            setPanelSizes(newSizes);
                            localStorage.setItem('chronos-dashboard-panel-sizes-v3', JSON.stringify(newSizes));
                          }}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize transition-all ${
                            size === sz
                              ? 'bg-amber-400 text-neutral-950 font-extrabold shadow-sm'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-0.5 border-l pl-2 border-[var(--border-default)]">
                      <button onClick={() => moveAdminPanel(idx, 'up')} disabled={idx === 0} className="p-1 text-[var(--text-muted)] hover:text-amber-500 disabled:opacity-30 transition-colors">
                        <ArrowUp size={12} />
                      </button>
                      <button onClick={() => moveAdminPanel(idx, 'down')} disabled={idx === adminLayout.length - 1} className="p-1 text-[var(--text-muted)] hover:text-amber-500 disabled:opacity-30 transition-colors">
                        <ArrowDown size={12} />
                      </button>
                      <button onClick={() => removeAdminPanel(panelId)} className="p-1 text-red-400 hover:text-red-500 transition-colors ml-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {content || (isAdminEditing && <div className="p-4 text-center text-xs text-[var(--text-muted)] italic">Panel hidden (no data)</div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
