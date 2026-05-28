import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Play, Square, Plus, AlertCircle, CheckCircle2, Clock, Calendar, X } from 'lucide-react';
import { projects } from '../../data/mockData.js';

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

export default function Topbar({
  onOpenCommandPalette,
  onOpenDrawer,
  timerRunning,
  timerSeconds,
  timerTaskLabel,
  timerProjectId,
  onStopTimer,
  onStartTimer,
  triggerToast = () => {},
}) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: 'Chronos', subtitle: '' };
  
  const [hoverSearch, setHoverSearch] = useState(false);
  const [hoverBell, setHoverBell] = useState(false);
  
  const [notifOpen, setNotifOpen] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [projectInput, setProjectInput] = useState('');

  const getAppShellStartTimer = () => {
    try {
      const header = document.querySelector('header');
      if (!header) return null;
      const key = Object.keys(header).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactContainer$'));
      if (!key) return null;
      let fiber = header[key];
      while (fiber) {
        if (fiber.type && fiber.type.name === 'AppShell') {
          let hook = fiber.memoizedState;
          while (hook) {
            if (hook.memoizedState && Array.isArray(hook.memoizedState)) {
              const fn = hook.memoizedState[0];
              if (typeof fn === 'function' && (fn.name === 'startTimer' || fn.toString().includes('setTimerTaskLabel'))) {
                return fn;
              }
            }
            hook = hook.next;
          }
        }
        fiber = fiber.return;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const getAppShellTimerProjectId = () => {
    try {
      const header = document.querySelector('header');
      if (!header) return null;
      const key = Object.keys(header).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactContainer$'));
      if (!key) return null;
      let fiber = header[key];
      while (fiber) {
        if (fiber.type && fiber.type.name === 'AppShell') {
          let hook = fiber.memoizedState;
          let states = [];
          while (hook) {
            states.push(hook.memoizedState);
            hook = hook.next;
          }
          for (let i = 0; i < states.length - 3; i++) {
            if (typeof states[i] === 'boolean' && typeof states[i+1] === 'number' && typeof states[i+2] === 'string') {
              return states[i+3];
            }
          }
        }
        fiber = fiber.return;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleStartWithTask = () => {
    if (!taskInput.trim()) {
      setIsExpanded(true);
      return;
    }
    const realStartTimer = getAppShellStartTimer() || onStartTimer;
    realStartTimer(taskInput.trim(), projectInput || null);
    setIsExpanded(false);
    setTaskInput('');
    setProjectInput('');
  };

  const activeProjectId = getAppShellTimerProjectId() || timerProjectId;

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
      const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      setDateStr(d.toLocaleDateString('en-US', dateOptions));
      
      const timeOptions = { hour: 'numeric', minute: '2-digit' };
      setTimeStr(d.toLocaleTimeString(undefined, timeOptions));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header
      className="px-6 flex items-center justify-between gap-4 h-14 md:h-16 shrink-0 topbar-glass"
      style={timerRunning ? {
        boxShadow: 'inset 0 -2px 0 0 rgba(245, 158, 11, 0.4)'
      } : {}}
    >
      {/* LEFT ZONE — Page identity */}
      <div className="flex-shrink-0 flex flex-col items-start min-w-0">
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <Calendar size={12} className="text-[var(--text-secondary)]" />
          <span className="font-medium text-[var(--text-secondary)]">{dateStr}</span>
          <span className="text-[var(--text-muted)] font-normal ml-1">{timeStr}</span>
        </div>
      </div>

      {/* CENTER ZONE — Active Task */}
      <div className="hidden md:flex flex-1 max-w-sm mx-auto justify-center">
        {timerRunning ? (() => {
          const matchedProject = projects.find(p => p.id === activeProjectId);
          const projectName = matchedProject ? matchedProject.name : null;
          return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] bg-white max-w-xs cursor-default">
              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[160px]">
                {timerTaskLabel || 'Working...'}
              </span>
              <span className="text-[var(--text-muted)] text-xs flex-shrink-0">·</span>
              <span className="text-xs text-[var(--text-muted)] truncate max-w-[80px] flex-shrink-0">
                {projectName || 'No project'}
              </span>
            </div>
          );
        })() : (
          !isExpanded ? (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-sunken)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all duration-150 cursor-pointer text-sm animate-fade-in"
              onClick={() => setIsExpanded(true)}
            >
              <Play size={13} />
              <span>What are you working on?</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 max-w-md w-full animate-fade-in">
              <input
                autoFocus
                type="text"
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setIsExpanded(false);
                    setTaskInput('');
                    setProjectInput('');
                  }
                  if (e.key === 'Enter' && taskInput.trim()) {
                    handleStartWithTask();
                  }
                }}
                placeholder="What are you working on?"
                className="flex-1 text-sm px-3 py-1.5 rounded-xl border border-[var(--border-focus)] bg-white focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-w-0"
              />
              <select
                value={projectInput}
                onChange={e => setProjectInput(e.target.value)}
                className="text-sm px-2 py-1.5 rounded-xl border border-[var(--border-default)] bg-white text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] flex-shrink-0 max-w-[140px]"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setTaskInput('');
                  setProjectInput('');
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] p-1 rounded-lg hover:bg-[var(--bg-sunken)] flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )
        )}
      </div>

      {/* RIGHT ZONE — Timer CTA group */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {!timerRunning ? (
          <>
            <button
              onClick={() => {
                if (timerRunning) return;
                if (!isExpanded) {
                  setIsExpanded(true);
                } else {
                  handleStartWithTask();
                }
              }}
              className="timer-cta-pulse press-on-click flex items-center justify-center gap-1.5 transition-all duration-150"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '36px',
                padding: '0 16px',
                color: 'white',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.01em',
                boxShadow: '0 2px 8px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
              }}
            >
              <Play size={13} fill="currentColor" />
              Start Timer
            </button>
            <button
              onClick={onOpenDrawer}
              title="Manual entry (N)"
              className="hidden md:flex items-center justify-center transition-colors duration-150"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-sunken)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-surface)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Plus size={14} />
            </button>
          </>
        ) : (
          <>
            <div
              className="flex items-center gap-2 px-4"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '8px',
                height: '36px'
              }}
            >
              <div className="relative flex items-center justify-center w-3 h-3 ml-1 flex-shrink-0">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </div>
              <span 
                className="font-sans font-bold text-sm tabular-nums text-emerald-800 dark:text-emerald-400"
                style={{ letterSpacing: '0.02em' }}
              >
                {formatTimer(timerSeconds)}
              </span>
            </div>
            <button
              onClick={() => {
                onStopTimer?.();
                setIsExpanded(false);
                setTaskInput('');
                setProjectInput('');
              }}
              className="flex items-center justify-center transition-all duration-200 press-on-click"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'rgb(220,38,38)',
                boxShadow: '0 2px 8px rgba(239,68,68,0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Stop timer"
            >
              <Square size={12} fill="currentColor" />
            </button>
          </>
        )}

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-sunken)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-150"
          onClick={onOpenCommandPalette ? () => onOpenCommandPalette(true) : () => {}}
          title="Search (⌘K)"
        >
          <Search size={15} />
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(prev => !prev)}
            className="relative flex items-center justify-center transition-colors duration-150 ml-1"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'transparent',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={() => setHoverBell(true)}
            onMouseLeave={() => setHoverBell(false)}
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
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setNotifOpen(false)} 
              />
              
              {/* Dropdown Panel */}
              <div 
                className="absolute right-0 top-full mt-2 w-80 z-50 glass-elevated rounded-2xl shadow-xl overflow-hidden animate-slide-up"
                style={{
                  border: '1px solid var(--border-default)',
                }}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-xs text-[var(--accent-text)] hover:text-amber-600 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-default)]">
                  {notifications.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 size={24} style={{ color: 'var(--text-disabled)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
                      <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>No new notifications</p>
                    </div>
                  ) : notifications.map(notif => {
                    let iconBg = 'bg-sky-100 text-sky-600';
                    let IconComponent = Clock;
                    if (notif.type === 'warning') {
                      iconBg = 'bg-amber-100 text-amber-600';
                      IconComponent = AlertCircle;
                    } else if (notif.type === 'success') {
                      iconBg = 'bg-emerald-100 text-emerald-600';
                      IconComponent = CheckCircle2;
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-sunken)] transition-colors ${
                          !notif.read ? 'bg-[var(--accent-subtle)]' : 'bg-[var(--bg-surface)]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                          <IconComponent size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center">
                            <span className="truncate">{notif.title}</span>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-1.5 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-1">
                            {notif.time}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                          }}
                          className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] transition-colors mt-0.5"
                          title="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Panel Footer */}
                <div className="px-4 py-2.5 border-t border-[var(--border-default)] bg-[var(--bg-surface)] text-center">
                  <button
                    onClick={() => {
                      triggerToast('Full notification center coming soon.', 'info');
                      setNotifOpen(false);
                    }}
                    className="text-xs text-[var(--accent-text)] hover:text-amber-600 font-medium"
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
