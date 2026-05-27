import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { tasks as allTasks, projects, teamMembers } from '../data/mockData';
import { Play, Check, X, Clock, ChevronRight, Circle, AlertCircle, CheckCircle2, Loader } from 'lucide-react';

const truncate = (str, n) => {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
};

export default function Tasks() {
  const { activeRole, startTimer } = useOutletContext();

  // State
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isEmployee = activeRole === 'employee';

  // Compute base tasks with local status overrides
  const baseTasks = useMemo(() => allTasks.map(t => ({
    ...t,
    status: statusOverrides[t.id] || t.status
  })), [statusOverrides]);

  // Filter tasks based on role assignment
  const myTasks = isEmployee
    ? baseTasks.filter(t => t.assignedTo === 'u1')
    : baseTasks;

  // Apply other status, priority, member, and search query filters
  const filteredTasks = useMemo(() => myTasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus)
      return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority)
      return false;
    if (!isEmployee && filterMember !== 'all' && t.assignedTo !== filterMember)
      return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  }), [myTasks, filterStatus, filterPriority, filterMember, searchQuery, isEmployee]);

  // Sync selected task with latest data
  const currentSelectedTask = selectedTask
    ? baseTasks.find(t => t.id === selectedTask.id)
    : null;

  // Cycle Status handler: todo -> in-progress -> done -> todo
  const cycleStatus = (taskId) => {
    const current = statusOverrides[taskId] ||
      allTasks.find(t => t.id === taskId)?.status || 'todo';
    const next = current === 'todo' ? 'in-progress'
      : current === 'in-progress' ? 'done' : 'todo';
    setStatusOverrides(prev => ({ ...prev, [taskId]: next }));
  };

  // Header metric counts
  const todoCount = myTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = myTasks.filter(t => t.status === 'in-progress').length;

  const today = new Date().toISOString().split('T')[0];

  const groups = [
    { id: 'in-progress', label: 'In Progress' },
    { id: 'todo', label: 'To Do' },
    { id: 'done', label: 'Done' }
  ];

  return (
    <div className="px-6 py-5 max-w-none">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Tasks</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {isEmployee ? 'Assigned to me · ' : ''}
          {todoCount} to do · {inProgressCount} in progress
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {/* Status Pills */}
        {['all', 'todo', 'in-progress', 'done'].map((status) => {
          const labels = { all: 'All', todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--text-active)] text-white'
                  : 'bg-white border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {labels[status]}
            </button>
          );
        })}

        {/* Priority Select */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-white text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)]"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Member Select (Admin Only) */}
        {!isEmployee && (
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-white text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="all">All Members</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        )}

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="ml-auto text-sm px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-white focus:outline-none focus:border-[var(--border-focus)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-48"
        />
      </div>

      {/* MAIN CONTENT Split Panel */}
      <div className="flex gap-6">
        {/* TASK LIST PANEL */}
        <div
          className={`flex-1 min-w-0 transition-all duration-200 ${
            currentSelectedTask ? 'hidden md:block md:w-[55%] md:flex-none' : 'w-full'
          }`}
        >
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <CheckCircle2 size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tasks found</p>
            </div>
          ) : (
            groups.map((group) => {
              const groupTasks = filteredTasks.filter(t => t.status === group.id);
              if (groupTasks.length === 0) return null;
              return (
                <div key={group.id} className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] px-1 py-2 mt-4 first:mt-0">
                    {group.label} · {groupTasks.length}
                  </div>
                  <div className="space-y-0.5">
                    {groupTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(
                          selectedTask?.id === task.id ? null : task
                        )}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)] cursor-pointer transition-colors hover:bg-[var(--bg-sunken)] border-l-2 ${
                          selectedTask?.id === task.id
                            ? 'bg-[var(--bg-active)] border-l-amber-400'
                            : 'border-l-transparent'
                        }`}
                      >
                        {/* Status Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cycleStatus(task.id);
                          }}
                          className="focus:outline-none flex-shrink-0"
                        >
                          {task.status === 'todo' && (
                            <Circle
                              size={16}
                              className="text-[var(--border-strong)] hover:text-amber-400 transition-colors"
                            />
                          )}
                          {task.status === 'in-progress' && (
                            <Loader size={16} className="text-amber-400 animate-spin" />
                          )}
                          {task.status === 'done' && (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          )}
                        </button>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm font-medium block truncate ${
                              task.status === 'done'
                                ? 'line-through text-[var(--text-muted)]'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-muted)] mt-0.5">
                            <span>{task.projectName}</span>
                            <span>·</span>
                            {!isEmployee && (
                              <>
                                <span>{task.assignedToName}</span>
                                <span>·</span>
                              </>
                            )}
                            <span
                              className={
                                task.status !== 'done' && task.dueDate && task.dueDate < today
                                  ? 'text-red-500 font-medium'
                                  : ''
                              }
                            >
                              Due {task.dueDate}
                            </span>
                          </div>
                        </div>

                        {/* Priority Dot */}
                        <div className="flex-shrink-0">
                          {task.priority === 'high' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 block" />
                          )}
                          {task.priority === 'medium' && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 block" />
                          )}
                          {task.priority === 'low' && (
                            <span className="w-2 h-2 rounded-full bg-[var(--border-strong)] flex-shrink-0 block" />
                          )}
                        </div>

                        {/* Time Logged */}
                        {task.timeLogged > 0 && (
                          <span className="text-xs font-mono text-[var(--text-muted)] flex-shrink-0">
                            {task.timeLogged}h
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* TASK DETAIL PANEL */}
        {currentSelectedTask && (
          <div className="w-full md:w-[400px] flex-shrink-0">
            <div className="glass-card p-6 sticky top-6">
              {/* Header Row */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <span>Tasks</span>
                  <ChevronRight size={12} />
                  <span className="truncate">{truncate(currentSelectedTask.title, 30)}</span>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-sunken)] text-[var(--text-muted)] flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Task Title & Project */}
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1 leading-snug">
                {currentSelectedTask.title}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-5">
                {currentSelectedTask.projectName}
              </p>

              {/* Actions row */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() =>
                    startTimer(currentSelectedTask.title, currentSelectedTask.projectId)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-semibold transition-colors"
                >
                  <Play size={14} />
                  <span>Start Timer</span>
                </button>
                <button
                  onClick={() =>
                    setStatusOverrides((prev) => ({ ...prev, [currentSelectedTask.id]: 'done' }))
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-sunken)] text-[var(--text-secondary)] text-sm font-medium transition-colors"
                >
                  <Check size={14} />
                  <span>Mark Done</span>
                </button>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Status */}
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Status
                  </div>
                  <div className="text-sm text-[var(--text-primary)] flex items-center gap-1.5 font-medium">
                    {currentSelectedTask.status === 'todo' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)]" />
                        <span>To Do</span>
                      </>
                    )}
                    {currentSelectedTask.status === 'in-progress' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>In Progress</span>
                      </>
                    )}
                    {currentSelectedTask.status === 'done' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-emerald-700">Done</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Priority
                  </div>
                  <div className="text-sm text-[var(--text-primary)] flex items-center gap-1.5 font-medium">
                    {currentSelectedTask.priority === 'high' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-red-600">High</span>
                      </>
                    )}
                    {currentSelectedTask.priority === 'medium' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-amber-700">Medium</span>
                      </>
                    )}
                    {currentSelectedTask.priority === 'low' && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)]" />
                        <span>Low</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Due Date
                  </div>
                  <div
                    className={`text-sm ${
                      currentSelectedTask.status !== 'done' &&
                      currentSelectedTask.dueDate &&
                      currentSelectedTask.dueDate < today
                        ? 'text-red-600 font-semibold'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {currentSelectedTask.dueDate || 'No due date'}
                    {currentSelectedTask.status !== 'done' &&
                      currentSelectedTask.dueDate &&
                      currentSelectedTask.dueDate < today && (
                        <span className="text-xs ml-1 font-normal">(Overdue)</span>
                      )}
                  </div>
                </div>

                {/* Time Logged */}
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Time Logged
                  </div>
                  <div className="text-sm text-[var(--text-primary)] font-mono">
                    {currentSelectedTask.timeLogged}h
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Assigned To
                  </div>
                  <div className="text-sm text-[var(--text-primary)] truncate">
                    {currentSelectedTask.assignedToName}
                  </div>
                </div>

                {/* Project */}
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Project
                  </div>
                  <div className="text-sm text-[var(--text-primary)] truncate">
                    {currentSelectedTask.projectName}
                  </div>
                </div>
              </div>

              {/* Description */}
              {currentSelectedTask.description && (
                <div className="border-t border-[var(--border-default)] pt-4 mt-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">
                    Description
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-1">
                    {currentSelectedTask.description}
                  </p>
                </div>
              )}

              {/* Time logged estimate progress */}
              {currentSelectedTask.timeLogged > 0 && (
                <div className="border-t border-[var(--border-default)] pt-4 mt-4">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    <span>Progress</span>
                    <span className="font-mono">
                      {currentSelectedTask.timeLogged}h / 8h est.
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-sunken)] rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (currentSelectedTask.timeLogged / 8) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
