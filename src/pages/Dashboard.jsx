import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  BarChart3, Clock, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, TrendingUp, AlertTriangle, Timer, Play, Square,
  Plus, Zap, X, Trash2, ArrowUp, ArrowDown, LayoutDashboard,
  Target, Users, FolderKanban, ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';

import { teamMembers, projects, timeLogs } from '../data/mockData';
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge';
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

// ── All available panels (cross-page) ────────────────────────────────────────
const ALL_PANELS = [
  { id: 'hero-timer',      title: 'Timer',             page: 'Dashboard' },
  { id: 'stats-row',       title: 'My Stats',          page: 'Dashboard' },
  { id: 'week-progress',   title: 'Week Progress',     page: 'Dashboard' },
  { id: 'today-entries',   title: "Today's Entries",   page: 'Dashboard' },
  { id: 'gap-alert',       title: 'Gap Alert',         page: 'Dashboard' },
  { id: 'team-activity',   title: 'Team Activity',     page: 'Team'      },
  { id: 'active-projects', title: 'Active Projects',   page: 'Projects'  },
  { id: 'recent-timeline', title: 'Recent Timeline',   page: 'My Time'   },
];

const DEFAULT_LAYOUT = ['hero-timer', 'stats-row', 'today-entries', 'week-progress', 'team-activity'];

export default function Dashboard() {
  const {
    activeRole, triggerToast,
    timerRunning, timerSeconds, timerTaskLabel, timerProjectId,
    startTimer, stopTimer, logs
  } = useOutletContext();

  const role = activeRole;
  const navigate = useNavigate();
  const [timerTask, setTimerTask] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const myProjects = useMemo(() => projects.filter(p => p.members.includes('u1')), []);
  useEffect(() => {
    if (myProjects.length > 0 && !selectedProjectId) setSelectedProjectId(myProjects[0].id);
  }, [myProjects, selectedProjectId]);

  const ME = useMemo(() => teamMembers.find(m => m.id === 'u1'), []);
  const myLogs = useMemo(() => (logs || timeLogs).filter(l => l.userId === 'u1'), [logs]);
  const TODAY = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayLogs = useMemo(() => myLogs.filter(l => l.date === TODAY), [myLogs, TODAY]);

  const hoursToday = useMemo(() => +todayLogs.reduce((a, l) => a + l.duration, 0).toFixed(1), [todayLogs]);
  const dailyGoal = 8;
  const todayGoalPct = Math.min(100, Math.round((hoursToday / dailyGoal) * 100));

  const weekLogs = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return myLogs.filter(l => new Date(l.date + 'T00:00:00') >= monday);
  }, [myLogs]);

  const hoursWeek = useMemo(() => +weekLogs.reduce((a, l) => a + l.duration, 0).toFixed(1), [weekLogs]);
  const weekGoal = ME?.availableHoursPerWeek || 40;
  const weekGoalPct = Math.min(100, Math.round((hoursWeek / weekGoal) * 100));

  const billableToday = useMemo(() => +todayLogs.filter(l => l.billable).reduce((a, l) => a + l.duration, 0).toFixed(1), [todayLogs]);

  const currentProject = useMemo(() => myProjects.find(p => p.id === (timerProjectId || myProjects[0]?.id)), [myProjects, timerProjectId]);
  const projectListStr = useMemo(() => myProjects.slice(0, 2).map(p => p.name).join(' · '), [myProjects]);

  const hasGap = useMemo(() => {
    const currentHour = new Date().getHours();
    const expectedByNow = Math.min(8, Math.max(0, currentHour - 9));
    return Math.max(0, expectedByNow - hoursToday) > 0.5;
  }, [hoursToday]);

  const gapHours = useMemo(() => {
    const currentHour = new Date().getHours();
    const expectedByNow = Math.min(8, Math.max(0, currentHour - 9));
    return Math.max(0, expectedByNow - hoursToday);
  }, [hoursToday]);

  const dailyBreakdown = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const hours = weekLogs.filter(l => l.date === dateStr).reduce((s, l) => s + l.duration, 0);
      return { label: ['M','T','W','T','F','S','S'][i], hours, pct: Math.min(100, (hours / dailyGoal) * 100), dateStr };
    });
  }, [weekLogs, dailyGoal]);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // ── Admin state ────────────────────────────────────────────────────────────
  const [cadence, setCadence] = useState('Week');
  const [expandedKpi, setExpandedKpi] = useState(null);
  const [selectedChartDay, setSelectedChartDay] = useState(null);
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  const cadenceMultiplier = cadence === 'Today' ? 0.2 : cadence === 'Week' ? 1 : 4.2;
  const metrics = {
    hours: (142.5 * cadenceMultiplier).toFixed(1),
    utilization: 82,
    billableRatio: 76,
    activeTasks: 14
  };

  const chartBars = useMemo(() => {
    const count = cadence === 'Today' ? 12 : cadence === 'Week' ? 7 : 30;
    const today = new Date();
    const seed = (i) => { const x = Math.sin(i * 127.1 + count * 311.7) * 43758.5453; return x - Math.floor(x); };
    return Array.from({ length: count }, (_, idx) => {
      const i = count - 1 - idx;
      const d = new Date(today);
      if (cadence === 'Today') {
        d.setHours(d.getHours() - i);
        return { label: `${d.getHours()}:00`, value: seed(i) * 5 + 1, dateStr: d.toISOString() };
      } else {
        d.setDate(d.getDate() - i);
        return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), value: seed(i) * 8 + 2, dateStr: d.toISOString().split('T')[0] };
      }
    });
  }, [cadence]);

  const maxChartValue = Math.max(...chartBars.map(b => b.value), 10);

  // ── Employee customizable layout ───────────────────────────────────────────
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos-dashboard-layout-v2');
      return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
    } catch { return DEFAULT_LAYOUT; }
  });
  const [isEditing, setIsEditing] = useState(false);

  const saveLayout = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem('chronos-dashboard-layout-v2', JSON.stringify(newLayout));
  };

  const movePanel = (idx, dir) => {
    const nl = [...layout];
    if (dir === 'up' && idx > 0) [nl[idx], nl[idx-1]] = [nl[idx-1], nl[idx]];
    if (dir === 'down' && idx < nl.length - 1) [nl[idx], nl[idx+1]] = [nl[idx+1], nl[idx]];
    saveLayout(nl);
  };

  const removePanel = (idx) => saveLayout(layout.filter((_, i) => i !== idx));
  const addPanel = (id) => { if (!layout.includes(id)) saveLayout([...layout, id]); };

  // ── Render panel content ───────────────────────────────────────────────────
  const renderPanel = (id) => {
    switch (id) {
      case 'gap-alert':
        if (!hasGap) return null;
        return (
          <div className="glass-card flex items-center justify-between p-4 border-l-4 border-l-amber-400" style={{ background: 'var(--accent-subtle)' }}>
            <div className="flex items-center gap-2">
              <AlertCircle className="text-amber-500 shrink-0" size={16} />
              <span className="text-sm font-medium text-[var(--accent-text)]">~{gapHours.toFixed(1)}h unlogged today</span>
            </div>
            <Button variant="primary" size="sm" onClick={() => triggerToast?.('Open the Manual Entry drawer to log missing time.', 'info')}>
              + Log Time
            </Button>
          </div>
        );

      case 'hero-timer':
        return (
          <div className="glass-card p-6" style={{
            borderLeft: timerRunning ? '3px solid #10b981' : '3px solid var(--border-strong)',
          }}>
            {!timerRunning ? (
              <div className="flex flex-col items-center gap-4 text-center max-w-xs mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Ready to Track</span>
                <div className="text-5xl font-mono font-bold tabular-nums text-[var(--text-primary)] tracking-tight">00:00:00</div>
                <div className="w-full space-y-2.5">
                  <Input value={timerTask} onChange={e => setTimerTask(e.target.value)} placeholder="What are you working on?" className="w-full text-center" />
                  <Select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Today', value: `${hoursToday}h`, sub: `${dailyGoal}h goal`, pct: todayGoalPct },
              { label: 'This Week', value: `${hoursWeek}h`, sub: `${weekGoal}h goal`, pct: weekGoalPct },
              { label: 'Billable', value: `${billableToday}h`, sub: `${todayLogs.length} entries` },
              { label: 'Projects', value: myProjects.length, sub: projectListStr || 'No projects' },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 glass-interactive">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{s.value}</p>
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
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Today's Entries</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)' }}>
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
                    <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-sunken)] transition-colors">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: projColor }} />
                      <span className="text-sm font-medium text-[var(--text-primary)] flex-1 truncate">{log.task}</span>
                      <span className="text-xs text-[var(--text-muted)] hidden sm:block">{log.projectName}</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)] whitespace-nowrap">{log.startTime} – {log.endTime}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] whitespace-nowrap">{log.duration.toFixed(1)}h</span>
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
          <div className="glass-card p-4">
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
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Activity</h2>
              <button onClick={() => navigate('/team')} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">View all →</button>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {teamMembers.filter(m => m.id !== 'u1').slice(0, 5).map(member => (
                <div key={member.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--bg-sunken)] transition-colors">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-sunken)] border border-[var(--border-default)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {member.status === 'active' && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[var(--bg-surface)] bg-emerald-500" />}
                    {member.status === 'idle' && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[var(--bg-surface)] bg-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">{member.name}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{member.status === 'active' ? member.currentTask || 'Working...' : 'Offline'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[var(--text-primary)]">{member.hoursWeek}h</div>
                    <div className="text-[10px] text-[var(--text-muted)]">this week</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'active-projects':
        return (
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Active Projects</h2>
              <button onClick={() => navigate('/projects')} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">View all →</button>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {myProjects.slice(0, 4).map(proj => {
                const logged = timeLogs.filter(l => l.projectId === proj.id).reduce((a, l) => a + l.duration, 0);
                const pct = proj.goalHours ? Math.min(100, Math.round((logged / proj.goalHours) * 100)) : 0;
                return (
                  <div key={proj.id} className="px-4 py-3 hover:bg-[var(--bg-sunken)] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{proj.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{logged.toFixed(0)}h</span>
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

      case 'recent-timeline':
        return (
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h2>
              <button onClick={() => navigate('/my-time')} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Open My Time →</button>
            </div>
            <div className="divide-y divide-[var(--border-default)]">
              {myLogs.slice(0, 5).map(log => {
                const color = projects.find(p => p.id === log.projectId)?.color || '#f59e0b';
                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-sunken)] transition-colors">
                    <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{log.task}</div>
                      <div className="text-xs text-[var(--text-muted)]">{log.projectName} · {log.date}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)] shrink-0">{log.duration}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default: return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (role !== 'admin') {
    const hiddenPanels = ALL_PANELS.filter(p => !layout.includes(p.id));

    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">My Dashboard</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button
            variant={isEditing ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <LayoutDashboard size={13} className="mr-1.5" />
            {isEditing ? 'Done' : 'Customize'}
          </Button>
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
        <div className="space-y-4">
          {layout.map((panelId, idx) => {
            const content = renderPanel(panelId);
            if (!content && !isEditing) return null;
            const panelMeta = ALL_PANELS.find(p => p.id === panelId);
            return (
              <div
                key={panelId}
                className={isEditing ? 'relative border-2 border-dashed border-amber-400/50 rounded-xl p-1.5 bg-amber-400/5' : ''}
              >
                {isEditing && (
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{panelMeta?.title}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">from {panelMeta?.page}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
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
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Command Center</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Team performance overview</p>
        </div>
        <div className="flex items-center bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-lg p-0.5">
          {['Today', 'Week', 'Month'].map(t => (
            <button
              key={t}
              onClick={() => setCadence(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${cadence === t ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 'hours',       label: 'Total Hours',     value: metrics.hours,           icon: Clock,        color: 'amber',   trend: '+12%', detail: [['Brand Redesign','45h'],['API Gateway','32h'],['Internal Comms','12h']] },
          { id: 'utilization', label: 'Utilization',     value: `${metrics.utilization}%`,icon: BarChart3,    color: 'sky',     trend: '+5%',  detail: [['Daniel Osei','95%'],['Priya Sharma','88%'],['Marcus Webb','71%']] },
          { id: 'billable',    label: 'Billable Ratio',  value: `${metrics.billableRatio}%`,icon: TrendingUp, color: 'emerald', trend: null,   detail: [['Niloy Pal','100%'],['Daniel Osei','92%']] },
          { id: 'tasks',       label: 'Active Tasks',    value: metrics.activeTasks,     icon: CheckCircle2, color: 'sky',     trend: null,   detail: null },
        ].map(kpi => {
          const Icon = kpi.icon;
          const isExpanded = expandedKpi === kpi.id;
          const colorMap = { amber: ['bg-amber-500/10','text-amber-600'], sky: ['bg-sky-500/10','text-sky-600'], emerald: ['bg-emerald-500/10','text-emerald-600'] };
          const [bg, tc] = colorMap[kpi.color] || colorMap.amber;
          return (
            <div key={kpi.id} className="glass-card overflow-hidden cursor-pointer" onClick={() => setExpandedKpi(isExpanded ? null : kpi.id)}>
              <div className="p-4 hover:bg-[var(--bg-sunken)] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className={`icon-container ${bg} ${tc}`}><Icon size={16} /></div>
                  {kpi.trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5"><TrendingUp size={10} />{kpi.trend}</span>}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{kpi.value}</p>
              </div>
              {isExpanded && kpi.detail && (
                <div className="border-t border-[var(--border-default)] px-4 py-3 bg-[var(--bg-sunken)] animate-fade-in">
                  {kpi.detail.map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-1">
                      <span className="text-xs text-[var(--text-secondary)]">{k}</span>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {isExpanded && kpi.id === 'tasks' && (
                <div className="border-t border-[var(--border-default)] px-4 py-3 bg-[var(--bg-sunken)] animate-fade-in">
                  <button onClick={(e) => { e.stopPropagation(); navigate('/tasks'); }} className="w-full py-2 text-xs font-semibold bg-[var(--text-primary)] text-white rounded-lg press-on-click">
                    View Tasks
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bento: Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="glass-card lg:col-span-2 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Activity Overview</h2>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />Billable</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[var(--border-strong)] inline-block" />Internal</span>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-1 h-36 border-b border-[var(--border-default)] pb-1 mb-3">
            {chartBars.map((bar, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                onClick={() => setSelectedChartDay(selectedChartDay === bar.dateStr ? null : bar.dateStr)}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 animate-bar-grow ${selectedChartDay === bar.dateStr ? 'bg-amber-400' : 'bg-amber-500/70 group-hover:bg-amber-400'}`}
                  style={{ height: `${(bar.value / maxChartValue) * 100}%`, maxWidth: '24px', margin: '0 auto', animationDelay: `${idx * 0.03}s` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-end gap-1 px-0">
            {chartBars.map((bar, idx) => (
              <div key={idx} className="flex-1 text-center">
                <span className="text-[9px] text-[var(--text-muted)] truncate block">{bar.label}</span>
              </div>
            ))}
          </div>
          {selectedChartDay && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Activity — {selectedChartDay}</h3>
                <button onClick={() => setSelectedChartDay(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={12} /></button>
              </div>
              {timeLogs.slice(0, 3).map(log => (
                <div key={log.id} className="flex justify-between text-xs py-1">
                  <span className="text-[var(--text-secondary)] truncate">{log.task} · {log.userName}</span>
                  <span className="font-semibold text-amber-600 ml-2 shrink-0">{log.duration}h</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Needs Attention */}
        <div className="glass-card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-500" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Needs Attention</h2>
          </div>
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
            <h3 className="text-xs font-bold text-red-600 mb-1">Missing Time Logs</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Aiko Tanaka has 0 logged hours this week.</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
            <h3 className="text-xs font-bold text-amber-600 mb-1">Hours Goal Alert</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Brand Redesign project is at 85% of allocated hours.</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
            <h3 className="text-xs font-bold text-amber-600 mb-1">Deadline Approaching</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">API Gateway v2 is due in 3 days with 12h remaining.</p>
          </div>
        </div>
      </div>

      {/* Team Pulse */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border-default)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Pulse</h2>
        </div>
        <div className="divide-y divide-[var(--border-default)]">
          {teamMembers.map((member, idx) => (
            <div
              key={member.id}
              className={`cursor-pointer transition-colors ${expandedMemberId === member.id ? 'bg-[var(--bg-sunken)]' : 'hover:bg-[var(--bg-sunken)]'}`}
              style={{ borderLeft: expandedMemberId === member.id ? '3px solid var(--accent)' : '3px solid transparent' }}
              onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
            >
              <div className="px-5 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.5fr_2fr_1fr] items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={member.name} size="sm" />
                    {member.status === 'active' && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[var(--bg-surface)] bg-emerald-500" />}
                    {member.status === 'idle' && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[var(--bg-surface)] bg-amber-500" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{member.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{member.role}</div>
                  </div>
                </div>
                <div className="hidden md:block min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Project</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projects.find(p => p.name === member.currentProject)?.color || '#a8a29e' }} />
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate">{member.currentProject || 'Internal'}</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex-1 progress-track">
                    <div className={`progress-fill ${member.activityLevel > 80 ? '' : member.activityLevel > 40 ? 'progress-fill-emerald' : ''}`}
                      style={{ width: `${member.activityLevel}%`, background: member.activityLevel > 80 ? '#10b981' : member.activityLevel > 40 ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-secondary)] w-8 text-right">{member.activityLevel}%</span>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{member.hoursWeek}h</div>
                    <div className="text-[10px] text-[var(--text-muted)]">this week</div>
                  </div>
                  {expandedMemberId === member.id ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
                </div>
              </div>
              {expandedMemberId === member.id && (
                <div className="px-5 py-4 border-t border-[var(--border-default)] bg-[var(--bg-sunken)] animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Active Task</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{member.currentTask !== 'Offline' ? member.currentTask : 'Idle'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{member.currentProject || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Capacity</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{member.hoursWeek}h / {member.availableHoursPerWeek || 40}h</p>
                      <div className="progress-track mt-1.5">
                        <div className="progress-fill" style={{ width: `${Math.min(100, (member.hoursWeek / (member.availableHoursPerWeek || 40)) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerToast?.(`Message sent to ${member.name}`, 'success'); }}
                        className="btn-premium-pill press-on-click text-xs"
                      >
                        Ping {member.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
