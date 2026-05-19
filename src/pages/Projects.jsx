import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus, Search, CheckCircle2, PauseCircle, Circle,
  Target, Users, DollarSign, Calendar, ChevronDown,
  X, TrendingUp, Clock, Edit3, Check,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Input, { Select } from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { FolderKanban } from 'lucide-react';
import { projects as initialProjects, teamMembers } from '../data/mockData.js';

// ─── Helpers ──────────────────────────────────────────────
const STATUS_FILTERS = ['All', 'Active', 'Paused', 'Completed'];

const STATUS_META = {
  active:    { variant: 'success', label: 'Active',    icon: CheckCircle2 },
  paused:    { variant: 'warning', label: 'Paused',    icon: PauseCircle  },
  completed: { variant: 'neutral', label: 'Completed', icon: CheckCircle2 },
};

const CADENCE_OPTIONS = ['daily', 'weekly', 'monthly', 'project'];

function goalLabel(type, hours) {
  const map = { daily: 'day', weekly: 'week', monthly: 'month', project: 'total' };
  return `${hours}h / ${map[type] || 'period'}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDue(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent-border)',
        }}
      >
        <Icon size={18} style={{ color: 'var(--accent)' }} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-semibold font-mono mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-disabled)' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Goal Ring (clickable) ────────────────────────────────
function GoalRing({ project, onClickRing }) {
  const pct = project.goalHours > 0
    ? Math.round((project.loggedHours / project.goalHours) * 100)
    : 0;
  const label = `${pct}%`;

  return (
    <button
      onClick={onClickRing}
      className="relative flex flex-col items-center gap-1 group"
      title="Click to edit goal"
    >
      <CircularProgress value={project.loggedHours} max={project.goalHours} size={72} strokeWidth={5} label={label} />
      <span
        className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-1"
        style={{ color: 'var(--accent)' }}
      >
        Edit goal
      </span>
    </button>
  );
}

// ─── Inline Goal Editor ───────────────────────────────────
function GoalEditor({ project, onSave, onCancel }) {
  const [goalHours, setGoalHours] = useState(project.goalHours);
  const [goalType, setGoalType]   = useState(project.goalType);

  return (
    <div
      className="rounded-xl p-5 animate-slide-up mt-2"
      style={{
        background: 'var(--bg-sunken)',
        border: '1px solid var(--border-default)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-secondary)' }}>
        Edit Goal
      </p>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wider font-semibold block mb-2"
            style={{ color: 'var(--text-muted)' }}>
            Target Hours
          </label>
          <Input
            type="number"
            min="1"
            value={goalHours}
            onChange={e => setGoalHours(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wider font-semibold block mb-2"
            style={{ color: 'var(--text-muted)' }}>
            Cadence
          </label>
          <Select
            value={goalType}
            onChange={e => setGoalType(e.target.value)}
            className="w-full"
          >
            {CADENCE_OPTIONS.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 mt-7">
          <Button
            variant="primary"
            onClick={() => onSave({ goalHours, goalType })}
            className="w-10 h-10 !p-0 flex items-center justify-center"
          >
            <Check size={16} />
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-10 h-10 !p-0 flex items-center justify-center"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────
function ProjectCard({ project, selected, onSelect, onGoalSave, triggerToast }) {
  const [editingGoal, setEditingGoal] = useState(false);

  const statusMeta = STATUS_META[project.status] || STATUS_META.active;
  const members    = teamMembers.filter(m => project.members.includes(m.id));
  const days       = daysUntil(project.dueDate);
  const dueSoon    = days !== null && days >= 0 && days <= 7;
  const overdue    = days !== null && days < 0;
  const budgetPct  = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

  const handleGoalSave = (newGoal) => {
    onGoalSave(project.id, newGoal);
    setEditingGoal(false);
    triggerToast?.('Goal updated', `${project.name} goal set to ${newGoal.goalHours}h/${newGoal.goalType}.`, 'success');
  };

  const getHealthFlag = (project) => {
    const budgetPct = project.spent / project.budget;
    const goalPct = project.loggedHours / project.goalHours;
    const daysUntilDue = Math.ceil(
      (new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (budgetPct >= 0.9) return { label: 'Over Budget', color: 'danger' };
    if (budgetPct >= 0.8) return { label: 'Budget Risk', color: 'warning' };
    if (daysUntilDue <= 7 && goalPct < 0.8)
      return { label: 'Due Soon', color: 'warning' };
    if (daysUntilDue < 0) return { label: 'Overdue', color: 'danger' };
    return null;
  };

  const healthFlag = getHealthFlag(project);

  return (
    <div
      className="glass-card glass-interactive flex flex-col gap-5 p-6 transition-all duration-200 cursor-pointer"
      style={{
        border: selected
          ? '1px solid var(--accent-border)'
          : '1px solid var(--border-default)',
        boxShadow: selected ? 'var(--shadow-md)' : undefined,
      }}
      onClick={() => !editingGoal && onSelect(project)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: project.color }}
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {project.name}
            </h3>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {project.client}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {healthFlag && (
            <Badge variant={healthFlag.color}>{healthFlag.label}</Badge>
          )}
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </div>
      </div>

      {/* Goal ring + progress */}
      <div className="flex items-center gap-5">
        <div onClick={e => { e.stopPropagation(); setEditingGoal(v => !v); }}>
          <GoalRing project={project} onClickRing={() => {}} />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold"
                style={{ color: 'var(--text-muted)' }}>Goal Progress</span>
              <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {project.loggedHours}h / {goalLabel(project.goalType, project.goalHours)}
              </span>
            </div>
            <ProgressBar value={project.loggedHours} max={project.goalHours} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold"
                style={{ color: 'var(--text-muted)' }}>Budget</span>
              <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>
                ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={project.spent} max={project.budget} />
          </div>
        </div>
      </div>

      {/* Inline goal editor */}
      {editingGoal && (
        <div onClick={e => e.stopPropagation()}>
          <GoalEditor
            project={project}
            onSave={handleGoalSave}
            onCancel={() => setEditingGoal(false)}
          />
        </div>
      )}

      {/* Footer — members + due date */}
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        {/* Member avatar cluster — click zone */}
        <div
          className="flex items-center"
          onClick={e => { e.stopPropagation(); onSelect(project); }}
        >
          {members.slice(0, 4).map((m, i) => (
            <div
              key={m.id}
              className="rounded-full border-2 transition-transform duration-100 hover:scale-110 hover:z-10"
              style={{
                marginLeft: i > 0 ? '-8px' : 0,
                borderColor: 'var(--bg-surface)',
                zIndex: members.length - i,
                position: 'relative',
              }}
              title={m.name}
            >
              <Avatar name={m.name} size="sm" />
            </div>
          ))}
          {members.length > 4 && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                marginLeft: '-8px',
                background: 'var(--bg-sunken)',
                border: '2px solid var(--bg-surface)',
                color: 'var(--text-muted)',
              }}
            >
              +{members.length - 4}
            </div>
          )}
        </div>

        {/* Due date */}
        <div className="flex items-center gap-1.5">
          <Calendar size={14} style={{ color: overdue ? '#dc2626' : dueSoon ? 'var(--accent)' : 'var(--text-disabled)' }} />
          <span
            className="text-xs"
            style={{
              color: overdue ? '#dc2626' : dueSoon ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: (overdue || dueSoon) ? '600' : '500',
            }}
          >
            {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${formatDue(project.dueDate)}`}
          </span>
        </div>
      </div>

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-md font-medium"
              style={{
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project Detail Panel ─────────────────────────────────
function ProjectDetailPanel({ project, onClose }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Team', 'Budget'];

  const members    = teamMembers.filter(m => project.members.includes(m.id));
  const budgetPct  = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;
  const goalPct    = project.goalHours > 0 ? Math.round((project.loggedHours / project.goalHours) * 100) : 0;
  const days       = daysUntil(project.dueDate);
  const statusMeta = STATUS_META[project.status] || STATUS_META.active;

  return (
    <div
      className="flex flex-col h-full animate-slide-in-right overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 shrink-0"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ background: project.color }}
            />
            <div className="min-w-0">
              <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {project.name}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{project.client}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
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
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>
        )}
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-base" style={{ background: 'var(--bg-base)' }}>

        {/* ── Overview tab ── */}
        {activeTab === 'Overview' && (
          <>
            {/* Key stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Logged Hours',  value: `${project.loggedHours}h` },
                { label: 'Goal Hours',    value: goalLabel(project.goalType, project.goalHours) },
                { label: 'Due Date',      value: formatDue(project.dueDate) },
                { label: 'Goal Progress', value: `${goalPct}%` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="glass-card rounded-xl p-4"
                >
                  <p className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-lg font-semibold font-mono mt-2"
                    style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Goal progress */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Goal Progress
                </p>
                <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {project.loggedHours}h / {project.goalHours}h
                </span>
              </div>
              <ProgressBar value={project.loggedHours} max={project.goalHours} />
            </div>

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold mb-3"
                  style={{ color: 'var(--text-muted)' }}>Tags</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{
                        background: 'var(--bg-sunken)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Team tab ── */}
        {activeTab === 'Team' && (
          <div className="space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No members assigned.
              </p>
            ) : members.map(m => (
              <div
                key={m.id}
                className="flex items-center gap-4 rounded-xl p-4 transition-colors duration-150"
                style={{
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-sunken)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar name={m.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.role}</p>
                </div>
                <Badge variant={m.status === 'active' ? 'success' : m.status === 'idle' ? 'warning' : 'neutral'}>
                  {m.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* ── Budget tab ── */}
        {activeTab === 'Budget' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Budget', value: `$${project.budget.toLocaleString()}` },
                { label: 'Spent',        value: `$${project.spent.toLocaleString()}` },
                { label: 'Remaining',    value: `$${(project.budget - project.spent).toLocaleString()}` },
                { label: 'Used',         value: `${budgetPct}%` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="glass-card rounded-xl p-4"
                >
                  <p className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-lg font-semibold font-mono mt-2"
                    style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Budget Utilisation
                </p>
                <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {budgetPct}%
                </span>
              </div>
              <ProgressBar value={project.spent} max={project.budget} />
              {budgetPct >= 85 && (
                <p className="text-sm mt-3 text-amber-600 font-medium">
                  ⚠ Budget nearly exhausted
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Projects Page ────────────────────────────────────────
export default function Projects() {
  const { activeRole, triggerToast } = useOutletContext();
  const isAdmin = activeRole === 'admin';

  const [projectData, setProjectData]       = useState(initialProjects);
  const [statusFilter, setStatusFilter]     = useState('All');
  const [query, setQuery]                   = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const handleGoalSave = (projectId, { goalHours, goalType }) => {
    setProjectData(prev =>
      prev.map(p => p.id === projectId ? { ...p, goalHours, goalType } : p)
    );
  };

  const filtered = useMemo(() => {
    return projectData.filter(p => {
      const matchStatus = statusFilter === 'All' || p.status === statusFilter.toLowerCase();
      const matchQuery  = !query || p.name.toLowerCase().includes(query.toLowerCase()) ||
                          p.client.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [projectData, statusFilter, query]);

  // Summary stats
  const active    = projectData.filter(p => p.status === 'active').length;
  const totalBudget = projectData.reduce((s, p) => s + p.budget, 0);
  const totalSpent  = projectData.reduce((s, p) => s + p.spent, 0);
  const totalLogged = projectData.reduce((s, p) => s + p.loggedHours, 0);

  return (
    <div className="px-8 py-6 animate-fade-in h-full flex flex-col gap-6" style={{ background: 'var(--bg-base)' }}>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard icon={FolderKanban} label="Total Projects" value={projectData.length} />
        <StatCard icon={CheckCircle2} label="Active"         value={active} />
        <StatCard icon={Clock}        label="Hours Logged"   value={`${totalLogged}h`} />
        <StatCard icon={DollarSign}   label="Budget Used"
          value={`$${totalSpent.toLocaleString()}`}
          sub={`of $${totalBudget.toLocaleString()}`}
        />
      </div>

      {/* ── Main split layout ── */}
      <div
        className="flex gap-0 overflow-hidden rounded-2xl flex-1"
        style={{
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          minHeight: '500px',
        }}
      >
        {/* Left — project grid */}
        <div
          className="flex flex-col transition-all duration-300 ease-in-out bg-base"
          style={{
            width: selectedProject ? '55%' : '100%',
            borderRight: selectedProject ? '1px solid var(--border-default)' : 'none',
            minWidth: 0,
            background: 'var(--bg-base)',
          }}
        >
          {/* Toolbar */}
          <div
            className="flex items-center gap-4 px-5 py-4 shrink-0 flex-wrap"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            {/* Status filter tabs */}
            <div className="flex gap-2">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: statusFilter === f ? 'var(--accent-subtle)' : 'transparent',
                    color: statusFilter === f ? 'var(--accent-text)' : 'var(--text-muted)',
                    border: statusFilter === f ? '1px solid var(--accent-border)' : '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (statusFilter !== f) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-sunken)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (statusFilter !== f) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{ color: 'var(--text-muted)' }}
              />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-full pl-10 pr-4 py-2"
              />
            </div>

            {/* New project button — admin only */}
            {isAdmin && (
              <Button
                variant="primary"
                className="shrink-0 flex items-center gap-2 !px-4 !py-2"
                onClick={() => triggerToast?.('Coming soon', 'Project creation is in Phase 2.', 'info')}
              >
                <Plus size={16} /> New Project
              </Button>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {filtered.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects found"
                description="Try adjusting your filters or search query."
              />
            ) : (
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: selectedProject
                    ? 'repeat(1, 1fr)'
                    : 'repeat(auto-fill, minmax(340px, 1fr))',
                }}
              >
                {filtered.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    selected={selectedProject?.id === project.id}
                    onSelect={setSelectedProject}
                    onGoalSave={handleGoalSave}
                    triggerToast={triggerToast}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — inline detail panel */}
        {selectedProject && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <ProjectDetailPanel
              project={projectData.find(p => p.id === selectedProject.id) || selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
