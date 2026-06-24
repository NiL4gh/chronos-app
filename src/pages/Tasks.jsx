import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { tasks as initialTasks, projects, teamMembers } from '../data/mockData';
import { Play, Check, X, Clock, Circle, AlertCircle, CheckCircle2, Loader, Plus, ArrowUpDown } from 'lucide-react';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function Tasks() {
  const { activeRole, startTimer, triggerToast, taskList } = useOutletContext();
  const allTasks = taskList || initialTasks;

  const [selectedTask, setSelectedTask] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isEmployee = activeRole === 'employee';

  const [sortKey, setSortKey] = useState('status');
  const [sortDir, setSortDir] = useState('asc');
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const baseTasks = useMemo(() => allTasks.map(t => ({
    ...t,
    status: statusOverrides[t.id] || t.status
  })), [allTasks, statusOverrides]);

  const myTasks = isEmployee
    ? baseTasks.filter(t => t.assignedTo === 'u1')
    : baseTasks;

  const filteredTasks = useMemo(() => myTasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (!isEmployee && filterMember !== 'all' && t.assignedTo !== filterMember) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [myTasks, filterStatus, filterPriority, filterMember, searchQuery, isEmployee]);

  const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
  const STATUS_ORDER   = { 'in-progress': 0, todo: 1, done: 2 };

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let aVal, bVal;
      if (sortKey === 'title')    { aVal = a.title; bVal = b.title; }
      if (sortKey === 'project')  { aVal = a.projectName || ''; bVal = b.projectName || ''; }
      if (sortKey === 'priority') { aVal = PRIORITY_ORDER[a.priority] ?? 99; bVal = PRIORITY_ORDER[b.priority] ?? 99; }
      if (sortKey === 'status')   { aVal = STATUS_ORDER[a.status] ?? 99; bVal = STATUS_ORDER[b.status] ?? 99; }
      if (sortKey === 'logged')   { aVal = a.timeLogged || 0; bVal = b.timeLogged || 0; }
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredTasks, sortKey, sortDir]);

  const PRIORITY_META = {
    urgent: { color: 'rgb(220,38,38)',    label: 'Urgent' },
    high:   { color: 'rgb(217,119,6)',    label: 'High' },
    medium: { color: 'var(--accent)',     label: 'Medium' },
    low:    { color: 'var(--text-muted)', label: 'Low' },
  };

  const STATUS_META_TASK = {
    'in-progress': { variant: 'warning', label: 'In Progress' },
    todo:          { variant: 'neutral',  label: 'To Do' },
    done:          { variant: 'success',  label: 'Done' },
  };

  const cycleStatus = (taskId) => {
    const current = statusOverrides[taskId] ||
      allTasks.find(t => t.id === taskId)?.status || 'todo';
    const next = current === 'todo' ? 'in-progress'
      : current === 'in-progress' ? 'done' : 'todo';
    setStatusOverrides(prev => ({ ...prev, [taskId]: next }));
  };

  const todoCount = myTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = myTasks.filter(t => t.status === 'in-progress').length;

  return (
    <div className="px-5 py-5 max-w-none space-y-6">

      {/* Page Header */}
      <div className="shrink-0 select-none">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Tasks Workspace</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage task priority levels, assignees, and focus sessions.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 select-none">
        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Loader size={14} className="animate-spin text-[var(--text-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Active Tasks</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{myTasks.filter(t => t.status !== 'done').length}</p>
          </div>
        </div>

        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">High Priority Focus</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{myTasks.filter(t => t.priority === 'high' && t.status !== 'done').length}</p>
          </div>
        </div>

        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--text-muted)]" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Focus Hours Logged</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{myTasks.reduce((sum, t) => sum + t.timeLogged, 0).toFixed(1)}h</p>
          </div>
        </div>

        <div className="glass-card py-4 px-5 flex items-center justify-between min-h-[96px] lift-on-hover transition-all">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Completed Today</p>
            </div>
            <p className="text-3xl font-black font-mono text-[var(--text-primary)] mt-1">{myTasks.filter(t => t.status === 'done').length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[var(--text-muted)] font-medium mr-1">
          {isEmployee ? 'Mine · ' : ''}{todoCount} to do · {inProgressCount} in progress
        </span>

        <div className="flex items-center bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-lg p-0.5">
          {['all', 'todo', 'in-progress', 'done'].map((status) => {
            const labels = { all: 'All', todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)]"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {!isEmployee && (
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="all">All Members</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--border-focus)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-44"
        />
      </div>

      {/* Tasks data table */}
      <div
        className="overflow-hidden rounded-xl"
        style={{ border: '1px solid var(--border-default)' }}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-default)' }}>
              {[
                { key: 'title',    label: 'TASK' },
                { key: 'project',  label: 'PROJECT' },
                { key: 'priority', label: 'PRIORITY' },
                { key: 'status',   label: 'STATUS' },
                { key: 'logged',   label: 'LOGGED' },
                { key: null,       label: 'ASSIGNEE' },
                { key: null,       label: '' },
              ].map(({ key, label }) => (
                <th
                  key={label + (key || '')}
                  className={`text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest ${key ? 'cursor-pointer' : ''}`}
                  style={{ color: 'var(--text-muted)' }}
                  onClick={key ? () => toggleSort(key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {key && <ArrowUpDown size={10} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No tasks match your filters.
                </td>
              </tr>
            ) : sortedTasks.map(task => {
              const priorityMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
              const statusMeta   = STATUS_META_TASK[task.status] || STATUS_META_TASK.todo;
              const isSelected   = selectedTask?.id === task.id;
              const proj = projects.find(p => p.id === task.projectId);
              return (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(isSelected ? null : task)}
                  className="cursor-pointer transition-colors border-b"
                  style={{
                    borderColor: 'var(--border-default)',
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-sunken)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface)';
                  }}
                >
                  {/* TASK */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); cycleStatus(task.id); }}
                        className="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                        style={{
                          borderColor: task.status === 'done' ? 'rgb(5,150,105)' : 'var(--border-strong)',
                          background: task.status === 'done' ? 'rgb(5,150,105)' : 'transparent',
                        }}
                        title="Cycle status"
                      >
                        {task.status === 'done' && <Check size={9} style={{ color: 'white' }} />}
                      </button>
                      <span
                        className="font-medium truncate max-w-[220px]"
                        style={{
                          color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                  </td>

                  {/* PROJECT */}
                  <td className="px-4 py-3">
                    {proj ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: proj.color || 'var(--accent)' }} />
                        <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>{proj.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>—</span>
                    )}
                  </td>

                  {/* PRIORITY */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold" style={{ color: priorityMeta.color }}>
                      {priorityMeta.label}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  </td>

                  {/* LOGGED */}
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {task.timeLogged ? `${task.timeLogged}h` : '—'}
                  </td>

                  {/* ASSIGNEE */}
                  <td className="px-4 py-3">
                    {task.assignedToName ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={task.assignedToName} size="sm" />
                        <span className="text-xs truncate max-w-[80px]" style={{ color: 'var(--text-secondary)' }}>
                          {task.assignedToName.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>—</span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    {!isEmployee && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startTimer(task.title, task.projectId, task.id);
                          triggerToast('Timer started', task.title, 'success');
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-sunken)]"
                        style={{ color: 'var(--text-muted)' }}
                        title={`Start timer for ${task.title}`}
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
