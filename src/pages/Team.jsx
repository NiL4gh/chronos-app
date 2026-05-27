import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search, Grid3X3, List, Mail, Clock, Activity,
  X, BarChart2, FolderKanban, Calendar, TrendingUp,
  CheckCircle2, Circle, Users,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
import { ActivityBar, ProgressBar } from '../components/ui/ProgressBar.jsx';
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge.jsx';
import { teamMembers, timeLogs, projects } from '../data/mockData.js';

// ─── Helpers ──────────────────────────────────────────────
const STATUS_PILL = {
  active:  { variant: 'success', label: 'Active' },
  idle:    { variant: 'warning', label: 'Idle' },
  offline: { variant: 'neutral', label: 'Offline' },
};
const DOT_COLOR = {
  active:  '#10b981',
  idle:    '#f59e0b',
  offline: 'var(--text-disabled)',
};

// ─── Stat summary card ────────────────────────────────────
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <Icon size={16} className="text-[var(--text-muted)]" />
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2">{label}</p>
        <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight font-sans tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ─── Member Grid Card ─────────────────────────────────────
function MemberGridCard({ member, selected, onClickName, onClickStatus, onClickProject, onClickLogs }) {
  const statusInfo = STATUS_PILL[member.status] || STATUS_PILL.offline;
  const memberProjects = projects.filter(p => p.members.includes(member.id));
  const [hoverMsg, setHoverMsg] = useState(false);
  const [hoverLogs, setHoverLogs] = useState(false);

  return (
    <div
      className={`glass-card glass-interactive p-5 flex flex-col gap-4 transition-all duration-200 cursor-pointer ${selected ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)]' : ''}`}
      onClick={(e) => { e.preventDefault(); onClickName(); }}
      style={{
        border: selected
          ? '1px solid var(--accent-border)'
          : '1px solid var(--border-default)',
        boxShadow: selected
          ? 'var(--shadow-md)'
          : undefined,
      }}
    >
      {/* Top — avatar + name + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <Avatar name={member.name} size="md" />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: DOT_COLOR[member.status],
                borderColor: 'var(--bg-surface)',
              }}
            />
          </div>
          <div className="min-w-0">
            {/* Name — zone click → profile overview */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickName(); }}
              className="text-sm font-medium text-left block truncate hover:text-amber-600 transition-colors duration-100"
              style={{ color: 'var(--text-primary)' }}
            >
              {member.name}
            </button>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {member.role}
            </p>
          </div>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickStatus(); }} className="shrink-0">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </button>
      </div>

      {/* Current task */}
      <div
        className="rounded-full px-4 py-2.5 flex items-center justify-between"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden w-full">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${member.status === 'active' ? 'bg-emerald-500 timer-glow-emerald' : 'bg-[var(--text-disabled)]'}`} />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickProject(); }}
            className="text-xs font-medium text-left truncate w-full hover:text-amber-600 transition-colors duration-100"
            style={{ color: member.currentTask !== 'Offline' ? 'var(--text-primary)' : 'var(--text-disabled)' }}
          >
            {member.currentTask !== 'Offline' ? member.currentTask : 'Idle / Offline'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold mb-1"
            style={{ color: 'var(--text-muted)' }}>Today</p>
          <p className="text-sm font-sans tabular-nums font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {member.hoursToday}h
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold mb-1"
            style={{ color: 'var(--text-muted)' }}>This Week</p>
          <p className="text-sm font-sans tabular-nums font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {member.hoursWeek}h
          </p>
        </div>
      </div>

      {/* Activity bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs uppercase tracking-wider font-semibold"
            style={{ color: 'var(--text-muted)' }}>Activity</p>
          <span className="text-xs font-sans tabular-nums font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {member.activityLevel}%
          </span>
        </div>
        <ActivityBar value={member.activityLevel} />
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`mailto:${member.email}`); }}
          onMouseEnter={() => setHoverMsg(true)}
          onMouseLeave={() => setHoverMsg(false)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: 'var(--bg-sunken)',
            color: hoverMsg ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-default)'
          }}
        >
          <Mail size={14} /> Message
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); (onClickLogs || onClickName)(); }}
          onMouseEnter={() => setHoverLogs(true)}
          onMouseLeave={() => setHoverLogs(false)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: 'var(--bg-sunken)',
            color: hoverLogs ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
          }}
        >
          <BarChart2 size={14} /> View Logs
        </button>
      </div>
    </div>
  );
}

// ─── Member Table Row ─────────────────────────────────────
function MemberTableRow({ member, selected, onClickName, onClickStatus }) {
  const statusInfo = STATUS_PILL[member.status] || STATUS_PILL.offline;
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`flex items-center gap-4 px-5 py-3 transition-colors duration-100 rounded-xl mx-0 cursor-pointer ${selected ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)]' : ''}`}
      onClick={(e) => { e.preventDefault(); onClickName(); }}
      style={{
        borderBottom: '1px solid var(--border-default)',
        background: selected ? 'var(--accent-subtle)' : hover ? 'var(--bg-sunken)' : 'transparent',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative shrink-0">
        <Avatar name={member.name} size="sm" />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: DOT_COLOR[member.status], borderColor: 'var(--bg-surface)' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickName(); }}
          className="text-sm font-bold text-left block hover:text-amber-600 transition-colors duration-100"
          style={{ color: 'var(--text-primary)' }}
        >
          {member.name}
        </button>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{member.role}</p>
      </div>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickStatus(); }} className="shrink-0">
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </button>
      <p className="text-xs font-sans tabular-nums font-semibold w-20 text-right shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {member.hoursToday}h today
      </p>
      <p className="text-xs font-sans tabular-nums font-semibold w-20 text-right shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {member.hoursWeek}h week
      </p>
      <div className="w-32 shrink-0 ml-4">
        <ActivityBar value={member.activityLevel} />
      </div>
    </div>
  );
}

// ─── Inline Member Detail Panel ───────────────────────────
function MemberDetailPanel({ member, initialTab, onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'Overview');
  const tabs = ['Overview', 'Time Logs', 'Projects'];

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const memberLogs = timeLogs.filter(l => l.userId === member.id);
  const memberProjects = projects.filter(p => p.members.includes(member.id));
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = memberLogs.filter(l => l.date === todayStr);
  const billableHours = memberLogs.filter(l => l.billable).reduce((s, l) => s + l.duration, 0);
  const totalHours = memberLogs.reduce((s, l) => s + l.duration, 0);
  const billableRatio = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

  return (
    <div
      className="flex flex-col h-full animate-slide-in-right overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
      }}
    >
      {/* Breadcrumb Header */}
      <div className="px-6 py-2.5 flex items-center gap-2 border-b border-[var(--border-default)] shrink-0">
        <button onClick={onClose} className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Team</button>
        <span className="text-[var(--text-disabled)] text-xs">/</span>
        <span className="text-xs font-medium text-[var(--text-secondary)]">{member.name}</span>
      </div>

      {/* Header */}
      <div
        className="flex items-start justify-between px-6 py-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={member.name} size="lg" />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
              style={{
                background: DOT_COLOR[member.status],
                borderColor: 'var(--bg-surface)',
              }}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {member.name}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{member.role}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-disabled)' }}>{member.email}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-4 px-6 pt-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-2 pb-3 text-sm font-medium transition-colors"
              style={{
                color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-base" style={{ background: 'transparent' }}>

        {/* ── Overview tab ── */}
        {activeTab === 'Overview' && (
          <>
            {/* Metric cards — 3-col compact grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Today', value: `${member.hoursToday}h` },
                { label: 'This Week', value: `${member.hoursWeek}h` },
                { label: 'Billable', value: `${billableRatio}%` },
                { label: 'Entries', value: memberLogs.length },
                { label: 'Rate', value: member.hourlyRate ? `$${member.hourlyRate}/h` : '$85/h' },
                { label: 'Capacity', value: member.availableHoursPerWeek ? `${member.availableHoursPerWeek}h` : '40h' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="glass-card rounded-xl p-3"
                >
                  <p className="text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-base font-bold font-sans tabular-nums mt-1"
                    style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Activity level */}
            <div className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Activity Level
                </p>
                <span className="text-sm font-sans tabular-nums font-bold"
                  style={{ color: 'var(--text-primary)' }}>
                  {member.activityLevel}%
                </span>
              </div>
              <ActivityBar value={member.activityLevel} />
            </div>

            {/* Current project */}
            {member.currentProject && (
              <div className="glass-card rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                  style={{ color: 'var(--text-muted)' }}>Current Project</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {member.currentProject}
                </p>
                {member.currentTask !== 'Offline' && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {member.currentTask}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Time Logs tab ── */}
        {activeTab === 'Time Logs' && (
          <div className="space-y-3">
            {memberLogs.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No time logs recorded.
              </p>
            ) : memberLogs.map(log => (
              <div
                key={log.id}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {log.task}
                  </p>
                  <TrackingSourceBadge source={log.source} />
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{log.projectName}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm font-sans tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {log.startTime}–{log.endTime}
                  </span>
                  <span className="text-sm font-sans tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {log.duration}h
                  </span>
                  {log.billable && (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Projects tab ── */}
        {activeTab === 'Projects' && (
          <div className="space-y-3">
            {memberProjects.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Not assigned to any projects.
              </p>
            ) : memberProjects.map(proj => {
              const pct = proj.goalHours > 0
                ? Math.round((proj.loggedHours / proj.goalHours) * 100)
                : 0;
              return (
                <div
                  key={proj.id}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: proj.color }}
                    />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {proj.name}
                    </p>
                    <Badge variant={proj.status === 'active' ? 'success' : proj.status === 'paused' ? 'warning' : 'neutral'}>
                      {proj.status}
                    </Badge>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{proj.client}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold"
                      style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span className="text-sm font-sans tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {proj.loggedHours}h / {proj.goalHours}h
                    </span>
                  </div>
                  <ProgressBar value={proj.loggedHours} max={proj.goalHours} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Team Page ────────────────────────────────────────────
export default function Team() {
  const { activeRole, triggerToast } = useOutletContext();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailTab, setDetailTab] = useState('Overview');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.currentProject?.toLowerCase() || '').includes(q)
    );
  }, [query]);

  const openDetail = (member, tab = 'Overview') => {
    setSelectedMember(member);
    setDetailTab(tab);
  };

  const closeDetail = () => setSelectedMember(null);

  // Stats
  const activeCount  = teamMembers.filter(m => m.status === 'active').length;
  const idleCount    = teamMembers.filter(m => m.status === 'idle').length;
  const avgHours     = (teamMembers.reduce((s, m) => s + m.hoursWeek, 0) / teamMembers.length).toFixed(1);

  return (
    <div className="px-4 md:px-6 py-4 md:py-5 animate-fade-in h-full" style={{ background: 'transparent' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Team</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {activeCount} active · {teamMembers.length} total members
        </p>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={Users}    label="Total Members" value={teamMembers.length} />
        <StatCard icon={Activity} label="Active Now"     value={activeCount} />
        <StatCard icon={Clock}    label="Idle"           value={idleCount} />
        <StatCard icon={TrendingUp} label="Avg Hrs/Week" value={`${avgHours}h`} />
      </div>

      {/* ── Main split layout ── */}
      <div
        className="flex flex-col md:flex-row gap-0 overflow-hidden rounded-2xl"
        style={{
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          height: 'calc(100vh - 220px)',
        }}
      >
        {/* Left — member list */}
        <div
          className={`flex flex-col transition-all duration-300 ease-in-out bg-base w-full ${selectedMember ? 'md:w-[45%]' : 'md:w-full'}`}
          style={{
            borderRight: selectedMember ? '1px solid var(--border-default)' : 'none',
            minWidth: 0,
            background: 'var(--bg-base)'
          }}
        >
          {/* Toolbar */}
          <div
            className="flex items-center gap-4 px-5 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{ color: 'var(--text-muted)' }}
              />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search members…"
                className="w-full pl-10 pr-4 py-2"
              />
            </div>

            {/* View toggle */}
            <div
              className="flex rounded-lg overflow-hidden shrink-0"
              style={{ border: '1px solid var(--border-default)' }}
            >
              {[
                { mode: 'grid', icon: Grid3X3 },
                { mode: 'list', icon: List },
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="w-10 h-10 flex items-center justify-center transition-all duration-150"
                  style={{
                    background: viewMode === mode ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                    color: viewMode === mode ? 'var(--accent-text)' : 'var(--text-muted)',
                    border: viewMode === mode ? '1px solid var(--accent-border)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== mode) e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== mode) e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            {/* Invite button */}
            <button
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-text)',
              }}
              onClick={() => triggerToast?.('Coming soon', 'Invite flow is in Phase 2.', 'info')}
            >
              + Invite
            </button>
          </div>

          {/* Member list */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'grid' ? (
              <div
                className={`p-5 grid gap-5 ${selectedMember ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
              >
                {filtered.map(member => (
                  <MemberGridCard
                    key={member.id}
                    member={member}
                    selected={selectedMember?.id === member.id}
                    onClickName={() => openDetail(member, 'Overview')}
                    onClickStatus={() => openDetail(member, 'Overview')}
                    onClickProject={() => openDetail(member, 'Projects')}
                    onClickLogs={() => openDetail(member, 'Time Logs')}
                  />
                ))}
              </div>
            ) : (
              <div className="py-2 overflow-x-auto w-full">
                <div className="min-w-[800px]">
                  {filtered.map(member => (
                  <MemberTableRow
                    key={member.id}
                    member={member}
                    selected={selectedMember?.id === member.id}
                    onClickName={() => openDetail(member, 'Overview')}
                    onClickStatus={() => openDetail(member, 'Overview')}
                  />
                ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — inline detail panel */}
        {selectedMember && (
          <div
            className="w-full md:flex-1 min-w-0 overflow-hidden"
          >
            <MemberDetailPanel
              member={selectedMember}
              initialTab={detailTab}
              onClose={closeDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
}
