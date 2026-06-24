import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search, Grid3X3, List, Mail, Clock, Activity,
  X, BarChart2, FolderKanban, Calendar, TrendingUp,
  CheckCircle2, Circle, Users, UserPlus,
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
  active:  'var(--success-text)',
  idle:    'var(--warning-text)',
  offline: 'var(--text-disabled)',
};

// ─── Stat summary card ────────────────────────────────────
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Icon size={14} className="text-[var(--text-muted)]" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        </div>
        <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{value}</p>
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
      className={`glass-card p-5 flex flex-col gap-4 transition-all duration-200 cursor-pointer lift-on-hover border-l-[3px] ${
        selected
          ? 'bg-[var(--accent-subtle)] shadow-md'
          : 'hover:border-l-neutral-300'
      }`}
      onClick={(e) => { e.preventDefault(); onClickName(); }}
      style={{
        borderLeftColor: selected ? 'var(--accent)' : 'transparent',
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
function MemberTableRow({ member, selected, onClickName, onClickStatus, idx }) {
  const statusInfo = STATUS_PILL[member.status] || STATUS_PILL.offline;
  const [hover, setHover] = useState(false);

  const bg = selected
    ? 'var(--bg-active)'
    : hover
      ? 'var(--bg-sunken)'
      : idx % 2 === 1
        ? 'var(--bg-sunken)'
        : 'transparent';

  return (
    <div
      className={`flex items-center gap-4 px-5 py-3.5 transition-colors duration-100 cursor-pointer border-l-4 border-solid ${
        selected ? 'border-l-amber-500' : 'border-l-transparent'
      }`}
      onClick={(e) => { e.preventDefault(); onClickName(); }}
      style={{
        borderBottom: '1px solid var(--border-default)',
        background: bg,
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

        {activeTab === 'Overview' && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Today', value: `${member.hoursToday}h` },
                { label: 'This Week', value: `${member.hoursWeek}h` },
                { label: 'Billable', value: `${billableRatio}%` },
                { label: 'Entries', value: memberLogs.length },
                { label: 'Capacity', value: member.availableHoursPerWeek ? `${member.availableHoursPerWeek}h` : '40h' },
              ].map(({ label, value }) => (
                <div key={label} className="glass-card rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-base font-bold font-sans tabular-nums mt-1"
                    style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Activity Level
                </p>
                <span className="text-sm font-sans tabular-nums font-bold" style={{ color: 'var(--text-primary)' }}>
                  {member.activityLevel}%
                </span>
              </div>
              <ActivityBar value={member.activityLevel} />
            </div>

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

        {activeTab === 'Time Logs' && (
          <div className="space-y-3">
            {memberLogs.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No time logs recorded.
              </p>
            ) : memberLogs.map(log => (
              <div key={log.id} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{log.task}</p>
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
                  {log.billable && <CheckCircle2 size={14} className="text-emerald-600" />}
                </div>
              </div>
            ))}
          </div>
        )}

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
                <div key={proj.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: proj.color }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{proj.name}</p>
                    <Badge variant={proj.status === 'active' ? 'success' : proj.status === 'paused' ? 'warning' : 'neutral'}>
                      {proj.status}
                    </Badge>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{proj.client}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Progress</span>
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
  const { activeRole, triggerToast, logs } = useOutletContext();

  const memberHours = useMemo(() => {
    const map = {};
    (logs || timeLogs).forEach(log => {
      map[log.userId] = (map[log.userId] || 0) + log.duration;
    });
    return map;
  }, [logs]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return teamMembers;
    const q = searchQuery.toLowerCase();
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="px-5 py-5 max-w-none space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Team</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {teamMembers.length} members
          </p>
        </div>
        <button
          onClick={() => triggerToast('Invites coming soon', '', 'info')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <UserPlus size={14} />
          Invite members
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search members..."
          className="flex-1 text-sm bg-transparent focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Data table */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ border: '1px solid var(--border-default)' }}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
              {['MEMBER', 'ROLE', 'STATUS', 'WORK HOURS'].map(col => (
                <th
                  key={col}
                  className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No members match your search.
                </td>
              </tr>
            ) : filteredMembers.map(member => {
              const statusInfo = STATUS_PILL[member.status] || STATUS_PILL.offline;
              const logged = memberHours[member.id] || 0;
              const target = member.weeklyTarget || 40;
              const pct = Math.min(100, Math.round((logged / target) * 100));
              return (
                <tr
                  key={member.id}
                  className="border-b transition-colors"
                  style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-sunken)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                >
                  {/* MEMBER */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <Avatar name={member.name} size="sm" />
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                          style={{ background: DOT_COLOR[member.status], borderColor: 'var(--bg-surface)' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{member.email || ''}</p>
                      </div>
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {member.role || '—'}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-3.5">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </td>

                  {/* WORK HOURS */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 100 ? 'rgb(5,150,105)' : 'var(--accent)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {logged.toFixed(1)}h / {target}h
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Invite row */}
        <div
          className="px-5 py-3 flex items-center gap-2 cursor-pointer transition-colors"
          style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-sunken)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
          onClick={() => triggerToast('Invites coming soon', '', 'info')}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center flex-shrink-0"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            <UserPlus size={13} style={{ color: 'var(--text-muted)' }} />
          </div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Invite a team member...</span>
        </div>
      </div>
    </div>
  );
}
