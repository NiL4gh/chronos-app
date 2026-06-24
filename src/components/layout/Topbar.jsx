import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Play, Square, Plus, AlertCircle, CheckCircle2, Clock, Calendar, X, FolderOpen, Tag, DollarSign, Check } from 'lucide-react';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard',   subtitle: 'Team overview & activity' },
  '/team':      { title: 'Team',         subtitle: 'Members & activity' },
  '/projects':  { title: 'Projects',     subtitle: 'Goals & progress' },
  '/reports':   { title: 'Reports',      subtitle: 'Time & billing analytics' },
  '/invoices':  { title: 'Invoices',     subtitle: 'Billing & payments' },
  '/my-time':   { title: 'My Time',      subtitle: 'Personal tracker' },
  '/settings':  { title: 'Settings',     subtitle: 'Workspace configuration' },
};

function formatTimer(s) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

const MOCK_TAGS = ['Design', 'Development', 'Meeting', 'Review', 'Bug Fix'];

export default function Topbar({
  onOpenCommandPalette,
  onOpenDrawer,
  timerRunning,
  timerSeconds,
  timerTaskLabel,
  timerProjectId,
  timerTaskId,
  onStopTimer,
  onStartTimer,
  onUpdateTimer,
  projectList = [],
  taskList = [],
  addProject,
  addTask,
  triggerToast = () => {},
}) {
  const { pathname } = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [taskIdInput, setTaskIdInput] = useState('');
  const [tags, setTags] = useState([]);
  const [billable, setBillable] = useState(true);
  const [projectPopupOpen, setProjectPopupOpen] = useState(false);
  const [taskPopupOpen, setTaskPopupOpen] = useState(false);
  const [tagPopupOpen, setTagPopupOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const projectPopupRef = useRef(null);
  const taskPopupRef = useRef(null);
  const tagPopupRef = useRef(null);

  useEffect(() => {
    if (!projectPopupOpen) return;
    const handler = (e) => {
      if (projectPopupRef.current && !projectPopupRef.current.contains(e.target)) {
        setProjectPopupOpen(false);
        setProjectSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [projectPopupOpen]);

  useEffect(() => {
    if (!taskPopupOpen) return;
    const handler = (e) => {
      if (taskPopupRef.current && !taskPopupRef.current.contains(e.target)) {
        setTaskPopupOpen(false);
        setTaskSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [taskPopupOpen]);

  useEffect(() => {
    if (!tagPopupOpen) return;
    const handler = (e) => {
      if (tagPopupRef.current && !tagPopupRef.current.contains(e.target)) {
        setTagPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tagPopupOpen]);

  const mockNotifications = [
    {
      id: 'n2',
      type: 'info',
      icon: 'clock',
      title: 'Timer reminder',
      body: "You haven't logged any time today. Don't forget to track!",
      time: '4h ago',
      read: false,
    },
  ];

  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setNotifOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const d = new Date();
      setDateStr(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      setTimeStr(d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
    };
    updateDateTime();
    const id = setInterval(updateDateTime, 1000);
    return () => clearInterval(id);
  }, []);

  const handleStartTimer = () => {
    onStartTimer(taskInput.trim(), projectInput || '', taskIdInput || '');
    setTaskInput('');
    setProjectInput('');
    setTaskIdInput('');
    setTags([]);
  };

  return (
    <header
      className="px-6 flex items-center justify-between gap-4 h-14 md:h-16 shrink-0 topbar-glass"
      style={{
        transition: 'box-shadow 0.4s ease',
        ...(timerRunning ? {
          boxShadow: 'inset 0 -2px 0 0 color-mix(in srgb, var(--accent) 60%, transparent), 0 4px 24px color-mix(in srgb, var(--accent) 12%, transparent)'
        } : {})
      }}
    >
      {/* LEFT ZONE — date/time */}
      <div className="flex-shrink-0 flex flex-col items-start min-w-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <Calendar size={12} className="text-[var(--text-secondary)]" />
          <span className="font-medium text-[var(--text-secondary)]">{dateStr}</span>
          <span className="text-[var(--text-muted)] font-normal ml-1">{timeStr}</span>
        </div>
      </div>

      {/* CENTER ZONE — always-visible Toggl-style entry bar */}
      <div className="hidden md:flex flex-1 min-w-0 mx-4 justify-center">
        <div
          className="flex items-center w-full max-w-2xl gap-1.5 px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${timerRunning ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--border-default)'}`,
          }}
        >
          {timerRunning && (
            <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
          )}

          {/* Description input — always editable */}
          <input
            type="text"
            value={timerRunning ? timerTaskLabel : taskInput}
            onChange={e =>
              timerRunning
                ? onUpdateTimer({ task: e.target.value })
                : setTaskInput(e.target.value)
            }
            onKeyDown={e => {
              if (e.key === 'Enter' && !timerRunning) handleStartTimer();
            }}
            placeholder="What are you working on?"
            className="flex-1 text-sm px-0 focus:outline-none bg-transparent min-w-0"
            style={{ color: 'var(--text-primary)' }}
          />

          {/* Divider */}
          <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border-default)' }} />

          {/* Project picker */}
          <div className="relative flex-shrink-0" ref={projectPopupRef}>
            <button
              onClick={() => {
                setProjectPopupOpen(p => !p);
                setTaskPopupOpen(false);
                setTagPopupOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-[var(--bg-sunken)]"
              style={{
                color: (timerRunning ? timerProjectId : projectInput)
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
              }}
            >
              <FolderOpen size={13} />
              <span className="max-w-[80px] truncate">
                {projectList.find(
                  p => p.id === (timerRunning ? timerProjectId : projectInput)
                )?.name || 'Project'}
              </span>
            </button>

            {projectPopupOpen && (
              <div
                className="absolute top-full mt-1 left-0 w-56 z-50 rounded-xl shadow-lg overflow-hidden"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div className="p-2">
                  <input
                    autoFocus
                    type="text"
                    value={projectSearch}
                    onChange={e => setProjectSearch(e.target.value)}
                    placeholder="Find project..."
                    className="w-full text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                    style={{
                      background: 'var(--bg-sunken)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-default)',
                    }}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto pb-1">
                  <button
                    onClick={() => {
                      if (timerRunning) onUpdateTimer({ projectId: '', taskId: '' });
                      else { setProjectInput(''); setTaskIdInput(''); }
                      setProjectPopupOpen(false);
                      setProjectSearch('');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--bg-sunken)] transition-colors text-left"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No project
                  </button>
                  {projectList
                    .filter(p =>
                      p.name.toLowerCase().includes(projectSearch.toLowerCase())
                    )
                    .map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (timerRunning) onUpdateTimer({ projectId: p.id });
                          else { setProjectInput(p.id); setTaskIdInput(''); }
                          setProjectPopupOpen(false);
                          setProjectSearch('');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--bg-sunken)] transition-colors text-left"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: p.color || 'var(--accent)' }}
                        />
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Task picker */}
          <div className="relative flex-shrink-0" ref={taskPopupRef}>
            {(() => {
              const activeProjectId = timerRunning ? timerProjectId : projectInput;
              const activeTaskId = timerRunning ? timerTaskId : taskIdInput;
              const activeTask = taskList.find(t => t.id === activeTaskId);
              const filteredTasks = taskList
                .filter(t => !activeProjectId || t.projectId === activeProjectId)
                .filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()));
              const canCreate =
                taskSearch.trim().length > 0 &&
                !filteredTasks.find(
                  t => t.title.toLowerCase() === taskSearch.trim().toLowerCase()
                );

              return (
                <>
                  <button
                    onClick={() => {
                      setTaskPopupOpen(p => !p);
                      setProjectPopupOpen(false);
                      setTagPopupOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-[var(--bg-sunken)]"
                    style={{ color: activeTaskId ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    <Plus size={13} />
                    <span className="max-w-[80px] truncate">
                      {activeTask?.title || 'Task'}
                    </span>
                  </button>

                  {taskPopupOpen && (
                    <div
                      className="absolute top-full mt-1 left-0 w-56 z-50 rounded-xl shadow-lg overflow-hidden"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div className="p-2">
                        <input
                          autoFocus
                          type="text"
                          value={taskSearch}
                          onChange={e => setTaskSearch(e.target.value)}
                          placeholder="Find or create a task..."
                          className="w-full text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                          style={{
                            background: 'var(--bg-sunken)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-default)',
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && canCreate) {
                              const newTask = addTask(
                                taskSearch.trim(),
                                activeProjectId || projectList[0]?.id || ''
                              );
                              if (timerRunning) onUpdateTimer({ taskId: newTask.id, task: newTask.title });
                              else { setTaskIdInput(newTask.id); setTaskInput(newTask.title); }
                              setTaskPopupOpen(false);
                              setTaskSearch('');
                            }
                          }}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto pb-1">
                        {activeTaskId && (
                          <button
                            onClick={() => {
                              if (timerRunning) onUpdateTimer({ taskId: '' });
                              else setTaskIdInput('');
                              setTaskPopupOpen(false);
                              setTaskSearch('');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--bg-sunken)] transition-colors text-left"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            No task
                          </button>
                        )}
                        {filteredTasks.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              if (timerRunning) onUpdateTimer({ taskId: t.id, task: t.title });
                              else { setTaskIdInput(t.id); setTaskInput(t.title); }
                              setTaskPopupOpen(false);
                              setTaskSearch('');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--bg-sunken)] transition-colors text-left"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <span className="truncate">{t.title}</span>
                          </button>
                        ))}
                        {canCreate && (
                          <button
                            onClick={() => {
                              const newTask = addTask(
                                taskSearch.trim(),
                                activeProjectId || projectList[0]?.id || ''
                              );
                              if (timerRunning) onUpdateTimer({ taskId: newTask.id, task: newTask.title });
                              else { setTaskIdInput(newTask.id); setTaskInput(newTask.title); }
                              setTaskPopupOpen(false);
                              setTaskSearch('');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--bg-sunken)] transition-colors text-left"
                            style={{ color: 'var(--accent-text)' }}
                          >
                            <Plus size={11} />
                            <span>Create "{taskSearch.trim()}"</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Tags picker */}
          <div className="relative flex-shrink-0" ref={tagPopupRef}>
            <button
              onClick={() => {
                setTagPopupOpen(p => !p);
                setProjectPopupOpen(false);
                setTaskPopupOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-[var(--bg-sunken)]"
              style={{ color: tags.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}
              title="Tags"
            >
              <Tag size={13} />
              {tags.length > 0 && <span>{tags.length}</span>}
            </button>
            {tagPopupOpen && (
              <div
                className="absolute top-full mt-1 left-0 w-44 z-50 rounded-xl shadow-lg p-2"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {MOCK_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )
                    }
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-[var(--bg-sunken)] transition-colors text-left"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                      style={{
                        background: tags.includes(tag) ? 'var(--accent)' : undefined,
                        borderColor: tags.includes(tag) ? 'var(--accent)' : 'var(--border-strong)',
                      }}
                    >
                      {tags.includes(tag) && <Check size={9} style={{ color: 'var(--accent-on)' }} />}
                    </div>
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Billable toggle */}
          <button
            onClick={() => setBillable(b => !b)}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-xs transition-colors hover:bg-[var(--bg-sunken)] flex-shrink-0"
            style={{ color: billable ? 'var(--accent-text)' : 'var(--text-muted)' }}
            title={billable ? 'Billable — click to set non-billable' : 'Non-billable — click to set billable'}
          >
            <DollarSign size={13} />
          </button>
        </div>
      </div>

      {/* RIGHT ZONE — timer display + play/stop + utilities */}
      <div className="flex-shrink-0 flex items-center gap-2">

        {/* Timer display — always visible */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={
            timerRunning
              ? { background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)' }
              : { background: 'var(--bg-sunken)', border: '1px solid var(--border-default)' }
          }
        >
          {timerRunning && (
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
          )}
          <span
            className="font-mono font-bold text-sm tabular-nums"
            style={{ color: timerRunning ? 'var(--color-success)' : 'var(--text-muted)' }}
          >
            {timerRunning ? formatTimer(timerSeconds) : '00:00:00'}
          </span>
        </div>

        {/* Play / Stop button */}
        {timerRunning ? (
          <button
            onClick={() => onStopTimer?.()}
            className="flex items-center justify-center transition-all duration-200 press-on-click"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: 'rgb(220,38,38)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            aria-label="Stop timer"
          >
            <Square size={12} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleStartTimer}
            className="flex items-center justify-center transition-all duration-200 press-on-click timer-cta-pulse"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-on)',
              border: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            aria-label="Start timer"
          >
            <Play size={13} fill="currentColor" />
          </button>
        )}

        {/* Manual entry */}
        <button
          onClick={onOpenDrawer}
          title="Manual entry (N)"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-sunken)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <Plus size={14} />
        </button>

        {/* Search / command palette */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-sunken)] transition-colors"
          onClick={onOpenCommandPalette ? () => onOpenCommandPalette(true) : () => {}}
          title="Search (⌘K)"
          style={{ color: 'var(--text-muted)' }}
        >
          <Search size={15} />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(prev => !prev)}
            className="relative flex items-center justify-center transition-colors duration-150 ml-1"
            style={{ width: '32px', height: '32px', borderRadius: '8px', color: 'var(--text-muted)' }}
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold flex items-center justify-center"
                style={{ fontSize: '9px' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-80 z-50 glass-elevated rounded-2xl shadow-xl overflow-hidden animate-slide-up"
                style={{ border: '1px solid var(--border-default)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-xs font-medium"
                      style={{ color: 'var(--accent-text)' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-default)]">
                  {notifications.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 size={24} style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
                    </div>
                  ) : notifications.map(notif => {
                    let iconBg = 'bg-sky-100 text-sky-600';
                    let IconComponent = Clock;
                    if (notif.type === 'warning') { iconBg = 'bg-amber-100 text-amber-600'; IconComponent = AlertCircle; }
                    else if (notif.type === 'success') { iconBg = 'bg-emerald-100 text-emerald-600'; IconComponent = CheckCircle2; }
                    return (
                      <div
                        key={notif.id}
                        onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                        className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors"
                        style={{ background: !notif.read ? 'var(--accent-subtle)' : 'var(--bg-surface)' }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                          <IconComponent size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center">
                            <span className="truncate">{notif.title}</span>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-1.5 flex-shrink-0" />}
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{notif.body}</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{notif.time}</p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                          }}
                          className="shrink-0 w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--bg-sunken)] transition-colors mt-0.5"
                          style={{ color: 'var(--text-muted)' }}
                          title="Dismiss"
                        >×</button>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--bg-surface)] text-center">
                  <button
                    onClick={() => {
                      triggerToast('Full notification center coming soon.', 'info');
                      setNotifOpen(false);
                    }}
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
