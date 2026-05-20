import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Clock, DollarSign, AlertCircle, ChevronDown, 
  ChevronUp, CheckCircle2, TrendingUp, Calendar, AlertTriangle,
  Timer, Play, Square, Plus, Zap, X
} from 'lucide-react';

import { 
  teamMembers, 
  projects, 
  timeLogs, 
  invoices 
} from '../data/mockData';

import TrackingSourceBadge from '../components/ui/TrackingSourceBadge';
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { 
    activeRole, 
    triggerToast, 
    timerRunning, 
    timerSeconds, 
    timerTaskLabel, 
    timerProjectId, 
    startTimer, 
    stopTimer 
  } = useOutletContext();
  const role = activeRole;
  const handleToast = triggerToast;

  const navigate = useNavigate();
  const [timerTask, setTimerTask] = useState('');
  
  // Find projects Niloy (u1) is member of
  const myProjects = useMemo(() => projects.filter(p => p.members.includes('u1')), []);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    if (myProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(myProjects[0].id);
    }
  }, [myProjects, selectedProjectId]);

  const ME = useMemo(() => teamMembers.find(m => m.id === 'u1'), []);
  const myLogs = useMemo(() => timeLogs.filter(l => l.userId === 'u1'), []);
  const TODAY = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayLogs = useMemo(() => myLogs.filter(l => l.date === TODAY), [myLogs, TODAY]);
  
  const hoursToday = useMemo(() => {
    const sum = todayLogs.reduce((acc, l) => acc + l.duration, 0);
    return Number(sum.toFixed(1));
  }, [todayLogs]);
  
  const dailyGoal = 8;
  const todayGoalPct = Math.min(100, Math.round((hoursToday / dailyGoal) * 100));

  const weekLogs = useMemo(() => {
    return myLogs.filter(l => {
      const d = new Date(l.date + 'T00:00:00');
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      monday.setHours(0,0,0,0);
      return d >= monday;
    });
  }, [myLogs]);

  const hoursWeek = useMemo(() => {
    const sum = weekLogs.reduce((acc, l) => acc + l.duration, 0);
    return Number(sum.toFixed(1));
  }, [weekLogs]);

  const weekGoal = ME?.availableHoursPerWeek || 40;
  const weekGoalPct = Math.min(100, Math.round((hoursWeek / weekGoal) * 100));

  const currentProject = useMemo(() => {
    return myProjects.find(p => p.id === (timerProjectId || myProjects[0]?.id));
  }, [myProjects, timerProjectId]);

  const billableToday = useMemo(() => {
    const sum = todayLogs.filter(l => l.billable).reduce((acc, l) => acc + l.duration, 0);
    return Number(sum.toFixed(1));
  }, [todayLogs]);

  const recentLogs = useMemo(() => {
    return [...myLogs].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [myLogs]);

  const hasGap = useMemo(() => {
    const totalLoggedToday = hoursToday;
    const currentHour = new Date().getHours();
    const expectedByNow = Math.min(8, Math.max(0, currentHour - 9));
    const gapHours = Math.max(0, expectedByNow - totalLoggedToday);
    return gapHours > 0.5;
  }, [hoursToday]);

  const gapHours = useMemo(() => {
    const totalLoggedToday = hoursToday;
    const currentHour = new Date().getHours();
    const expectedByNow = Math.min(8, Math.max(0, currentHour - 9));
    return Math.max(0, expectedByNow - totalLoggedToday);
  }, [hoursToday]);

  const dailyBreakdown = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0,0,0,0);

    const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = weekLogs.filter(l => l.date === dateStr);
      const hours = dayLogs.reduce((sum, l) => sum + l.duration, 0);
      const pct = Math.min(100, (hours / dailyGoal) * 100);
      return {
        label: DAY_LABELS[i],
        hours,
        pct,
        dateStr
      };
    });
  }, [weekLogs, dailyGoal]);

  const dateStr = useMemo(() => {
    const d = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }, []);

  const projectListStr = useMemo(() => {
    return myProjects.slice(0, 2).map(p => p.name).join(' · ');
  }, [myProjects]);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const [cadence, setCadence] = useState('Week');
  
  // KPI Expansion State
  const [expandedKpi, setExpandedKpi] = useState(null);
  
  // Chart Selection State
  const [selectedChartDay, setSelectedChartDay] = useState(null);
  
  // Team Pulse Selection State
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  // Helper functions
  const handleKpiClick = (kpiId) => {
    setExpandedKpi(expandedKpi === kpiId ? null : kpiId);
  };

  const handleMemberClick = (memberId) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
  };

  const handleBarClick = (dayStr) => {
    setSelectedChartDay(selectedChartDay === dayStr ? null : dayStr);
  };

  // Process data based on cadence
  // (In a real app, this would dynamically calculate based on 'Today', 'Week', 'Month')
  // For the UI simulation, we will compute some base values and scale them based on cadence.
  const cadenceMultiplier = cadence === 'Today' ? 0.2 : cadence === 'Week' ? 1 : 4.2;
  
  const metrics = {
    hours: (142.5 * cadenceMultiplier).toFixed(1),
    utilization: 82, // percentage
    revenue: (12400 * cadenceMultiplier).toFixed(0),
    uninvoiced: (32 * cadenceMultiplier).toFixed(1)
  };

  // Generate chart data dynamically (7 days for week, 30 for month, 24 for today (hourly))
  const chartBars = useMemo(() => {
    const bars = [];
    const count = cadence === 'Today' ? 12 : cadence === 'Week' ? 7 : 30;
    const today = new Date();
    // Seeded pseudo-random based on date index for consistency
    const seed = (i) => {
      const x = Math.sin(i * 127.1 + count * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      if (cadence === 'Today') {
        d.setHours(d.getHours() - i);
        bars.push({
          label: `${d.getHours()}:00`,
          value: seed(i) * 5 + 1,
          dateStr: d.toISOString(),
        });
      } else {
        d.setDate(d.getDate() - i);
        bars.push({
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: seed(i) * 8 + 2,
          dateStr: d.toISOString().split('T')[0],
        });
      }
    }
    return bars;
  }, [cadence]);

  const maxChartValue = Math.max(...chartBars.map(b => b.value), 10);

  if (role !== 'admin') {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 space-y-8 animate-fade-in">
        {/* SECTION 1 — Page Header */}
        <div className="flex justify-between items-center pb-2">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">
            My Dashboard
          </h1>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <Calendar size={12} />
            {dateStr}
          </div>
        </div>

        {/* SECTION 2 — Gap Alert Banner */}
        {hasGap && (
          <div 
            className="glass-card flex items-center justify-between p-4 rounded-xl border-l-[3px] border-l-amber-400"
            style={{ background: 'var(--accent-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={18} />
              <span className="text-sm font-medium text-[var(--accent-text)]">
                You have ~{gapHours.toFixed(1)}h unlogged today. Want to add an entry?
              </span>
            </div>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => {
                if (triggerToast) {
                  triggerToast('Open the Manual Entry drawer to log missing time.', 'info');
                }
              }}
            >
              + Log Missing Time
            </Button>
          </div>
        )}

        {/* SECTION 3 — Hero Timer Card */}
        <div 
          className="glass-card rounded-2xl p-8"
          style={{
            borderLeft: timerRunning ? '4px solid #10b981' : '1px solid var(--border-default)',
            boxShadow: timerRunning ? '0 0 20px rgba(16,185,129,0.1)' : 'var(--shadow-sm)'
          }}
        >
          {!timerRunning ? (
            <div className="flex flex-col items-center gap-5 text-center max-w-sm mx-auto">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Ready to Track
                </span>
              </div>
              <div className="text-5xl font-sans font-bold tabular-nums text-[var(--text-primary)] tracking-tight">
                00:00:00
              </div>
              <div className="w-full space-y-3">
                <Input
                  value={timerTask}
                  onChange={e => setTimerTask(e.target.value)}
                  placeholder="What are you working on?"
                  className="w-full text-center"
                />
                <Select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full text-center"
                >
                  {myProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>
              <button
                onClick={() => startTimer(timerTask || 'Working...', selectedProjectId)}
                className="timer-cta-pulse press-on-click w-full py-3 rounded-xl font-semibold text-base text-white transition-all duration-150"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 2px 8px rgba(245,158,11,0.35)'
                }}
              >
                Start Timer
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 text-center max-w-sm mx-auto">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 timer-glow-emerald flex-shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  Tracking Now
                </span>
              </div>
              <div className="text-5xl font-sans font-bold tabular-nums text-emerald-600 tracking-tight">
                {formatTimer(timerSeconds)}
              </div>
              <div>
                <div className="text-base font-semibold text-[var(--text-primary)]">
                  {timerTaskLabel || 'Working...'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1.5">
                  {currentProject ? currentProject.name : 'No Project'}
                </div>
              </div>
              <button
                onClick={() => stopTimer()}
                className="w-full py-3 rounded-xl font-semibold text-base transition-all duration-200 press-on-click"
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: 'rgb(220,38,38)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              >
                Stop Timer
              </button>
            </div>
          )}
        </div>

        {/* SECTION 4 — Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Card 1: Today */}
          <div className="glass-card glass-interactive rounded-xl p-4 lift-on-hover">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">
              Today
            </div>
            <div className="text-2xl font-black font-sans text-[var(--text-primary)]">
              {hoursToday.toFixed(1)}h
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {dailyGoal}h goal
            </div>
            <div className="mt-3">
              <ProgressBar value={todayGoalPct} />
            </div>
          </div>

          {/* Card 2: This Week */}
          <div className="glass-card glass-interactive rounded-xl p-4 lift-on-hover">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">
              This Week
            </div>
            <div className="text-2xl font-black font-sans text-[var(--text-primary)]">
              {hoursWeek.toFixed(1)}h
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {weekGoal}h goal
            </div>
            <div className="mt-3">
              <ProgressBar value={weekGoalPct} />
            </div>
          </div>

          {/* Card 3: Billable Today */}
          <div className="glass-card glass-interactive rounded-xl p-4 lift-on-hover">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">
              Billable Today
            </div>
            <div className="text-2xl font-black font-sans text-[var(--text-primary)]">
              {billableToday.toFixed(1)}h
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              {todayLogs.length} {todayLogs.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>

          {/* Card 4: My Projects */}
          <div className="glass-card glass-interactive rounded-xl p-4 lift-on-hover">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">
              My Projects
            </div>
            <div className="text-2xl font-black font-sans text-[var(--text-primary)]">
              {myProjects.length}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate" title={projectListStr}>
              {projectListStr}
            </div>
          </div>
        </div>

        {/* SECTION 5 — Two-Column Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Today's Entries */}
          <div className="glass-card rounded-xl p-5 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Today's Entries
                </h2>
                <span 
                  className="text-xs font-medium rounded-full px-2.5 py-0.5"
                  style={{
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--accent-text)',
                  }}
                >
                  {todayLogs.length} {todayLogs.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {todayLogs.length === 0 ? (
                <EmptyState 
                  icon={Clock} 
                  title="No entries logged today yet." 
                />
              ) : (
                <div className="space-y-1">
                  {todayLogs.map(log => {
                    const projColor = projects.find(p => p.id === log.projectId)?.color || '#a8a29e';
                    return (
                      <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border-default)] last:border-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: projColor }}
                        />
                        <span className="text-sm font-medium text-[var(--text-primary)] flex-1 truncate">
                          {log.task}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] truncate max-w-[120px]">
                          {log.projectName}
                        </span>
                        <span className="text-xs font-sans tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                          {log.startTime} – {log.endTime}
                        </span>
                        <span className="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">
                          {log.duration.toFixed(1)}h
                        </span>
                        <TrackingSourceBadge source={log.source} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {todayLogs.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => navigate('/my-time')} 
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
                >
                  View all in My Time →
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Weekly Progress */}
          <div className="glass-card rounded-xl p-5 lg:col-span-1">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Week Progress
            </h2>
            <div className="flex justify-center my-6">
              <CircularProgress 
                value={hoursWeek} 
                max={weekGoal} 
                size={120} 
                strokeWidth={8} 
                label={`${weekGoalPct}%`} 
              />
            </div>
            <div className="text-sm text-center text-[var(--text-secondary)] font-medium mb-6">
              {hoursWeek.toFixed(1)}h of {weekGoal}h
            </div>

            <div className="space-y-3 mt-6">
              {dailyBreakdown.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-4 text-[10px] font-bold text-[var(--text-muted)] text-center">
                    {day.label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--border-default)] overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${day.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-[10px] font-mono text-[var(--text-secondary)] text-right">
                    {day.hours > 0 ? `${day.hours.toFixed(1)}h` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 6 — Team Activity */}
        <div className="glass-card flex flex-col overflow-hidden rounded-xl">
          <div className="p-5 border-b border-[var(--border-default)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Team Activity</h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {teamMembers.filter(m => m.id !== 'u1').slice(0, 4).map(member => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-sunken)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[var(--border-default)] flex items-center justify-center font-bold text-xs text-[var(--text-secondary)] shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {member.status === 'active' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-emerald-500"></span>
                    )}
                    {member.status === 'idle' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)] bg-amber-500"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{member.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">
                      {member.status === 'active' ? `Working on ${member.currentTask || 'a task'}` : 'Offline / Idle'}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-[var(--text-primary)]">{member.currentProject || 'No Project'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Overview of team performance and financial health.
          </p>
        </div>
        
        {/* CADENCE TOGGLE */}
        <div className="glass-interactive flex items-center p-1 rounded-full border border-[var(--border-default)]">
          {['Today', 'Week', 'Month'].map(t => (
            <button
              key={t}
              onClick={() => setCadence(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                cadence === t 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {/* Total Hours */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('hours')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Total Hours</h3>
            <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {metrics.hours}
            </div>
          </div>
          
          {expandedKpi === 'hours' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Project Breakdown</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Brand Redesign</span>
                  <span className="font-medium text-[var(--text-primary)]">45h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">API Gateway</span>
                  <span className="font-medium text-[var(--text-primary)]">32h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Internal Comms</span>
                  <span className="font-medium text-[var(--text-primary)]">12h</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Utilization Rate */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('utilization')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +5%
              </span>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Utilization Rate</h3>
            <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {metrics.utilization}%
            </div>
          </div>
          
          {expandedKpi === 'utilization' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Top Performers</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Daniel Osei</span>
                  <span className="font-medium text-emerald-500">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Priya Sharma</span>
                  <span className="font-medium text-emerald-500">88%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Marcus Webb</span>
                  <span className="font-medium text-amber-500">71%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Est. Revenue */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('revenue')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Est. Revenue</h3>
            <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              ${metrics.revenue}
            </div>
          </div>
          
          {expandedKpi === 'revenue' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Top Clients</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">CloudScale Inc</span>
                  <span className="font-medium text-[var(--text-primary)]">$8,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Acme Corp</span>
                  <span className="font-medium text-[var(--text-primary)]">$3,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">DataStream</span>
                  <span className="font-medium text-[var(--text-primary)]">$700</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Uninvoiced Hours */}
        <div className="glass-card flex flex-col relative overflow-hidden transition-all duration-300 border-red-500/20">
          <div 
            className="p-5 flex-1 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
            onClick={() => handleKpiClick('uninvoiced')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Uninvoiced Hours</h3>
            <div className="text-3xl font-bold text-red-500 tracking-tight">
              {metrics.uninvoiced}
            </div>
          </div>
          
          {expandedKpi === 'uninvoiced' && (
            <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-sunken)] animate-fade-in">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToast("Generating invoice draft...", "success");
                }}
                className="w-full py-2 bg-[var(--text-primary)] dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium lift-on-hover press-on-click"
              >
                Create Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE SECTION: CHART + NEEDS ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BAR CHART SECTION */}
        <div className="glass-card lg:col-span-2 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Activity Overview</h2>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
                Billable
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-neutral-300"></div>
                Internal
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-2 h-48 relative border-b border-[var(--border-default)] pb-2">
            {chartBars.map((bar, idx) => (
              <div 
                key={idx} 
                className="flex-1 flex flex-col justify-end items-center group cursor-pointer h-full"
                onClick={() => handleBarClick(bar.dateStr)}
              >
                <div 
                  className={`w-full max-w-[32px] rounded-t-sm transition-all duration-300 animate-bar-grow ${
                    selectedChartDay === bar.dateStr ? 'bg-amber-400' : 'bg-amber-500/80 group-hover:bg-amber-400'
                  }`}
                  style={{ height: `${(bar.value / maxChartValue) * 100}%`, animationDelay: `${idx * 0.05}s` }}
                ></div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] opacity-70 group-hover:opacity-100">
                  {bar.label}
                </div>
              </div>
            ))}
          </div>

          {/* INLINE CHART DETAILS */}
          {selectedChartDay && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--bg-sunken)] border border-[var(--border-default)] animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Activity for {selectedChartDay}</h3>
                <button onClick={() => setSelectedChartDay(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {timeLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex justify-between items-center text-sm p-2 hover:bg-[var(--bg-sunken)] rounded-md transition-colors">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{log.task}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{log.projectName} • {log.userName}</p>
                    </div>
                    <div className="font-medium text-amber-500">{log.duration}h</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* NEEDS ATTENTION WIDGET */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-status-pulse" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Needs Attention</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 lift-on-hover cursor-pointer transition-all duration-300">
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Overdue Invoice</h3>
              <p className="text-xs text-[var(--text-secondary)]">Meridian Finance (INV-2025-040) is 15 days overdue.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 lift-on-hover cursor-pointer transition-all duration-300">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">Budget Alert</h3>
              <p className="text-xs text-[var(--text-secondary)]">Brand Redesign project has consumed 85% of allocated hours.</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 lift-on-hover cursor-pointer transition-all duration-300">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">Missing Time Logs</h3>
              <p className="text-xs text-[var(--text-secondary)]">Aiko Tanaka has 0 logged hours this week.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM PULSE SECTION */}
      <div className="glass-card flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[var(--border-default)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Team Pulse</h2>
        </div>
        <div className="divide-y divide-[var(--border-default)]">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex flex-col hover:bg-[var(--bg-sunken)] transition-colors cursor-pointer" onClick={() => handleMemberClick(member.id)}>
              <div className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[var(--border-default)] flex items-center justify-center font-bold text-[var(--text-secondary)] shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {member.status === 'active' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-emerald-500 animate-status-pulse"></span>
                    )}
                    {member.status === 'idle' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-amber-500"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{member.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{member.role}</p>
                  </div>
                </div>
                
                <div className="hidden md:block flex-1 max-w-xs mx-8">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">Utilization</span>
                    <span className={`font-medium ${member.activityLevel > 80 ? 'text-emerald-500' : member.activityLevel > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                      {member.activityLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--border-default)] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${member.activityLevel > 80 ? 'bg-emerald-500' : member.activityLevel > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${member.activityLevel}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-4">
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{member.hoursWeek}h</div>
                    <div className="text-xs text-[var(--text-secondary)]">this week</div>
                  </div>
                  {expandedMemberId === member.id ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
                </div>
              </div>
              
              {/* INLINE EXPANSION PANEL */}
              {expandedMemberId === member.id && (
                <div className="px-6 py-4 bg-[var(--bg-sunken)] animate-fade-in border-t border-[var(--border-default)]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Current Activity</h4>
                      <p className="text-sm text-[var(--text-primary)]">{member.currentTask || 'No active task'}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{member.currentProject || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Metrics</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">Hourly Rate</span>
                          <span className="font-medium text-[var(--text-primary)]">${member.hourlyRate || 0}/hr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">Capacity</span>
                          <span className="font-medium text-[var(--text-primary)]">{member.availableHoursPerWeek || 40}h/week</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToast(`Message sent to ${member.name}`, "success");
                        }}
                        className="px-4 py-2 bg-[var(--border-default)] text-[var(--text-primary)] rounded-lg text-sm font-medium lift-on-hover press-on-click"
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
