import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import SlideOutDrawer from '../ui/SlideOutDrawer.jsx';
import Toast from '../ui/Toast.jsx';
import CommandPalette from './CommandPalette.jsx';
import { SettingsContent } from '../../pages/Settings.jsx';
import Input, { Select } from '../ui/Input.jsx';
import DateTimePicker from '../ui/DateTimePicker.jsx';
import Button from '../ui/Button.jsx';
import { projects, tasks, timeLogs, invoices } from '../../data/mockData.js';
import { Clock, X } from 'lucide-react';
import { getStoredTheme, getStoredAccent, applyTheme, applyAccent, watchSystemTheme } from '../../lib/theme.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { supabase } from '../../lib/supabase.js';

// ─── Role ───────────────────────────────────────────────
const ROLES = ['admin', 'employee'];

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function AppShell() {
  const navigate = useNavigate();
  const { isAdmin, orgId, user } = useAuth();

  // Role is derived from real auth — no more client-side toggle
  const activeRole = isAdmin ? 'admin' : 'employee';

  // Sidebar expand state (persisted to localStorage)
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    try {
      return localStorage.getItem('sidebar_expanded') === 'true';
    } catch {
      return false;
    }
  });

  // Manual time drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState({
    task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true,
  });
  const [pendingClose, setPendingClose] = useState(false);
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);

  // Shared logs state
  const [logs, setLogs] = useState(timeLogs);

  // Shared invoices state
  const [invoiceList, setInvoiceList] = useState(invoices);

  // Shared projects / tasks state
  const [projectList, setProjectList] = useState(projects);
  const [taskList, setTaskList] = useState(tasks);

  const addProject = useCallback((name) => {
    const proj = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      client: 'Internal',
      description: '',
      status: 'active',
      dueDate: null,
      budget: 0,
      spent: 0,
      loggedHours: 0,
      goalHours: 40,
      goalType: 'project',
      members: [],
      tags: [],
      color: `hsl(${Math.floor(Math.random() * 360)}, 60%, 55%)`,
    };
    setProjectList(prev => [proj, ...prev]);
    return proj;
  }, []);

  const addTask = useCallback((title, projectId) => {
    const proj = projectList.find(p => p.id === projectId);
    const task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      projectId,
      projectName: proj?.name || '',
      assignedTo: 'u1',
      assignedToName: 'Priya Sharma',
      createdBy: 'u1',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      timeLogged: 0,
      description: '',
    };
    setTaskList(prev => [task, ...prev]);
    return task;
  }, [projectList]);

  // Shared global date state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);

  // Help drawer state
  const [helpOpen, setHelpOpen] = useState(false);

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Theme + accent state (pre-paint script already applied the stored values)
  const [theme, setTheme] = useState(getStoredTheme);
  const [accent, setAccent] = useState(getStoredAccent);

  // Keybindings state
  const [keyBindings, setKeyBindings] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos_keybindings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      toggleTimer: 't',
      newEntry: 'n',
      openPalette: 'p',
      goTeam: 't',
      goProjects: 'p',
      goReports: 'r',
      goInvoices: 'i',
      goMyTime: 'm',
      goSettings: 's',
    };
  });

  const lastKeyRef = useRef('');

  // Sync theme + accent to the document and localStorage
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { applyAccent(accent); }, [accent]);

  // When following the OS, re-apply on system preference change
  useEffect(() => {
    if (theme !== 'system') return undefined;
    return watchSystemTheme(() => applyTheme('system'));
  }, [theme]);

  // Persist key bindings
  useEffect(() => {
    try {
      localStorage.setItem('chronos_keybindings', JSON.stringify(keyBindings));
    } catch {}
  }, [keyBindings]);

  // Toast
  const [toast, setToast] = useState({ visible: false, title: '', message: '', variant: 'success' });
  const triggerToast = useCallback((title, message = '', variant = 'success') => {
    setToast({ visible: true, title, message, variant });
  }, []);
  const dismissToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Command palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Live timer — persisted to localStorage
  const [timerRunning, setTimerRunning] = useState(() => {
    try { return localStorage.getItem('timer_running') === 'true'; } catch { return false; }
  });
  const [timerSeconds, setTimerSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem('timer_seconds');
      const savedAt = localStorage.getItem('timer_saved_at');
      if (saved && savedAt && localStorage.getItem('timer_running') === 'true') {
        const elapsed = Math.floor((Date.now() - Number(savedAt)) / 1000);
        return Number(saved) + elapsed;
      }
      return Number(saved) || 0;
    } catch { return 0; }
  });
  const [timerTaskLabel, setTimerTaskLabel] = useState(() => {
    try { return localStorage.getItem('timer_task') || ''; } catch { return ''; }
  });
  const [timerProjectId, setTimerProjectId] = useState(() => {
    try { return localStorage.getItem('timer_project') || ''; } catch { return ''; }
  });
  const [timerTaskId, setTimerTaskId] = useState(() => {
    try { return localStorage.getItem('timer_task_id') || ''; } catch { return ''; }
  });

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Persist timer state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timer_running', String(timerRunning));
      localStorage.setItem('timer_seconds', String(timerSeconds));
      localStorage.setItem('timer_task', timerTaskLabel);
      localStorage.setItem('timer_project', timerProjectId);
      localStorage.setItem('timer_task_id', timerTaskId);
      localStorage.setItem('timer_saved_at', String(Date.now()));
    } catch {}
  }, [timerRunning, timerSeconds, timerTaskLabel, timerProjectId, timerTaskId]);

  const startTimer = useCallback((task = '', projectId = '', taskId = '') => {
    setTimerTaskLabel(task);
    setTimerProjectId(projectId);
    setTimerTaskId(taskId);
    setTimerRunning(true);
  }, []);

  const updateTimer = useCallback(({ task, projectId, taskId }) => {
    if (task !== undefined) setTimerTaskLabel(task);
    if (projectId !== undefined) setTimerProjectId(projectId);
    if (taskId !== undefined) setTimerTaskId(taskId);
  }, []);

  const stopTimer = useCallback(async () => {
    setTimerRunning(false);
    if (timerSeconds > 0) {
      const proj = projectList.find(p => p.id === timerProjectId) || projectList[0];
      const startMs = Date.now() - timerSeconds * 1000;
      const startStr = new Date(startMs).toTimeString().slice(0, 5);
      const endStr = new Date().toTimeString().slice(0, 5);
      const durationHours = Number((timerSeconds / 3600).toFixed(2)) || 0.01;

      // Optimistic local update — always visible immediately
      const newLog = {
        id: `log-${Date.now()}`,
        userId: user?.id || 'u1',
        userName: user?.email || 'You',
        projectName: proj?.name || '',
        projectId: proj?.id || '',
        task: timerTaskLabel || 'Auto Tracked Task',
        date: new Date().toISOString().slice(0, 10),
        startTime: startStr,
        endTime: endStr,
        duration: durationHours,
        source: 'auto',
        billable: true,
      };
      setLogs(prev => [newLog, ...prev]);

      // Persist to Supabase if logged in
      if (user && orgId) {
        const startedAt = new Date(startMs).toISOString();
        const endedAt = new Date().toISOString();
        const { error } = await supabase.from('time_logs').insert({
          org_id: orgId,
          user_id: user.id,
          project_id: proj?.id || null,
          description: timerTaskLabel || 'Auto Tracked Task',
          started_at: startedAt,
          ended_at: endedAt,
          duration_hours: durationHours,
          source: 'auto',
          billable: true,
        });
        if (error) {
          console.error('[AppShell] stopTimer Supabase error:', error.message);
          triggerToast('Sync warning', 'Entry saved locally but not synced. Check your connection.', 'warning');
        } else {
          triggerToast('Timer saved', `Logged ${durationHours}h to ${proj?.name || 'project'}.`, 'success');
        }
      } else {
        triggerToast('Timer saved', `Logged ${durationHours}h to ${proj?.name || 'project'}.`, 'success');
      }
    }
    setTimerSeconds(0);
    setTimerTaskId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_seconds');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_task_id');
      localStorage.removeItem('timer_saved_at');
    } catch {}
  }, [timerSeconds, timerTaskLabel, timerProjectId, projectList, triggerToast, user, orgId]);

  // Guarded stop timer — shows in-app confirm if > 5 min
  const guardedStopTimer = useCallback(() => {
    if (timerSeconds > 300) {
      setStopConfirmOpen(true);
      return;
    }
    stopTimer();
  }, [timerSeconds, stopTimer]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimerTaskLabel('');
    setTimerProjectId('');
    setTimerTaskId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_seconds');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_task_id');
      localStorage.removeItem('timer_saved_at');
    } catch {}
  }, []);

  // ─── Global keyboard shortcuts ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in an input/textarea/select
      const tag = e.target.tagName;
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

      // ⌘K / Ctrl+K — command palette (always)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(v => !v);
        return;
      }

      if (inField) return;

      const key = e.key.toLowerCase();
      const prevKey = lastKeyRef.current.toLowerCase();

      // Sequential go shortcuts
      if (prevKey === 'g') {
        if (key === keyBindings.goTeam.toLowerCase() && activeRole === 'admin') {
          navigate('/team');
          lastKeyRef.current = '';
          return;
        }
        if (key === keyBindings.goProjects.toLowerCase()) {
          navigate('/projects');
          lastKeyRef.current = '';
          return;
        }
        if (key === keyBindings.goReports.toLowerCase() && activeRole === 'admin') {
          navigate('/reports');
          lastKeyRef.current = '';
          return;
        }
        if (key === keyBindings.goInvoices.toLowerCase() && activeRole === 'admin') {
          navigate('/invoices');
          lastKeyRef.current = '';
          return;
        }
        if (key === keyBindings.goMyTime.toLowerCase()) {
          navigate('/my-time');
          lastKeyRef.current = '';
          return;
        }
        if (key === keyBindings.goSettings.toLowerCase()) {
          navigate('/settings');
          lastKeyRef.current = '';
          return;
        }
      }

      // Single-key shortcuts
      if (key === keyBindings.toggleTimer.toLowerCase() || e.key === ' ') {
        if (e.key === ' ') e.preventDefault();
        if (timerRunning) guardedStopTimer();
        else startTimer();
      } else if (key === keyBindings.newEntry.toLowerCase()) {
        setDrawerOpen(true);
      } else if (key === keyBindings.openPalette.toLowerCase()) {
        setCommandPaletteOpen(true);
      } else if (e.key === 'Escape') {
        setDrawerOpen(false);
        setCommandPaletteOpen(false);
        setHelpOpen(false);
      }

      lastKeyRef.current = e.key;
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [timerRunning, startTimer, guardedStopTimer, activeRole, keyBindings, navigate]);

  // Electron global hotkey listener
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const handleShortcut = (e, arg) => {
          if (arg === 'toggle-timer') {
            if (timerRunning) stopTimer();
            else startTimer();
          }
        };
        ipcRenderer.on('global-shortcut', handleShortcut);
        return () => {
          ipcRenderer.removeListener('global-shortcut', handleShortcut);
        };
      } catch (err) {
        console.error(err);
      }
    }
  }, [timerRunning, startTimer, stopTimer]);

  // ─── Outlet context ──────────────────────────────────
  const outletContext = {
    timerRunning, timerSeconds, timerTaskLabel, timerProjectId, timerTaskId,
    startTimer, stopTimer: guardedStopTimer, resetTimer, updateTimer,
    triggerToast,
    activeRole,
    theme, setTheme, accent, setAccent,
    keyBindings, setKeyBindings,
    logs, setLogs,
    invoiceList, setInvoiceList,
    setDrawerOpen,
    drawerEntry, setDrawerEntry,
    onOpenHelp: () => setHelpOpen(true),
    currentWeekStart, setCurrentWeekStart,
    selectedDate, setSelectedDate,
    projectList, setProjectList, addProject,
    taskList, setTaskList, addTask,
  };

  return (
    <div
      className="flex min-h-screen h-screen overflow-hidden relative"
      style={{ minHeight: '100vh' }}
    >
      {/* Sidebar */}
      <Sidebar
        activeRole={activeRole}
        triggerToast={triggerToast}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        setTheme={setTheme}
        expanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded(v => {
          try {
            localStorage.setItem('sidebar_expanded', String(!v));
          } catch {}
          return !v;
        })}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden pb-16 md:pb-0">

        {/* Topbar */}
        <div className="relative z-50">
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenDrawer={() => setDrawerOpen(true)}
            timerRunning={timerRunning}
            timerSeconds={timerSeconds}
            timerTaskLabel={timerTaskLabel}
            timerProjectId={timerProjectId}
            timerTaskId={timerTaskId}
            onStopTimer={guardedStopTimer}
            onStartTimer={startTimer}
            onUpdateTimer={updateTimer}
            projectList={projectList}
            taskList={taskList}
            addProject={addProject}
            addTask={addTask}
            triggerToast={triggerToast}
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Manual Time Entry Modal */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => {
            const { task, projectId, startTime, endTime } = drawerEntry;
            if (task || projectId || startTime || endTime) {
              setPendingClose(true);
            } else {
              setDrawerOpen(false);
              setDrawerEntry({ task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
              <span className="text-sm font-bold text-[var(--text-primary)]">Log Time Entry</span>
              <button
                onClick={() => {
                  const { task, projectId, startTime, endTime } = drawerEntry;
                  if (task || projectId || startTime || endTime) {
                    setPendingClose(true);
                  } else {
                    setDrawerOpen(false);
                    setDrawerEntry({ task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
                  }
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-5 space-y-5 overflow-y-auto">
              {/* Discard confirmation banner */}
              {pendingClose && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-default)' }}>
                  <span className="text-sm text-[var(--text-secondary)]">Discard unsaved entry?</span>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setPendingClose(false)}>Keep editing</Button>
                    <Button variant="danger" size="sm" onClick={() => {
                      setPendingClose(false);
                      setDrawerOpen(false);
                      setDrawerEntry({ task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
                    }}>Discard</Button>
                  </div>
                </div>
              )}

              {/* Task Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  What did you work on?
                </label>
                <Input
                  placeholder="e.g. Client call, Design review…"
                  value={drawerEntry.task}
                  onChange={e => setDrawerEntry(prev => ({ ...prev, task: e.target.value }))}
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Project
                </label>
                <Select
                  className="w-full"
                  value={drawerEntry.projectId}
                  onChange={e => setDrawerEntry(prev => ({ ...prev, projectId: e.target.value }))}
                >
                  <option value="">— Select a project —</option>
                  {projectList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>

              {/* When */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  When did you work?
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[var(--text-secondary)] w-16 shrink-0">Date</label>
                    <div className="flex-1">
                      <DateTimePicker
                        value={drawerEntry.date}
                        onChange={val => setDrawerEntry(prev => ({ ...prev, date: val }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[var(--text-secondary)] w-16 shrink-0">From</label>
                    <div className="relative inline-flex items-center flex-1">
                      <DateTimePicker
                        mode="time"
                        timeValue={drawerEntry.startTime}
                        onTimeChange={val => setDrawerEntry(prev => ({ ...prev, startTime: val }))}
                      />
                    </div>
                    <span className="text-sm text-[var(--text-muted)] px-1">–</span>
                    <label className="text-xs text-[var(--text-secondary)] shrink-0 mr-2">to</label>
                    <div className="relative inline-flex items-center flex-1">
                      <DateTimePicker
                        mode="time"
                        timeValue={drawerEntry.endTime}
                        onTimeChange={val => setDrawerEntry(prev => ({ ...prev, endTime: val }))}
                      />
                    </div>
                  </div>
                  {(() => {
                    const { startTime, endTime } = drawerEntry;
                    if (!startTime || !endTime) return null;
                    const [sH, sM] = startTime.split(':').map(Number);
                    const [eH, eM] = endTime.split(':').map(Number);
                    const sMin = sH * 60 + sM;
                    const eMin = eH * 60 + eM;
                    if (eMin > sMin) {
                      const diff = eMin - sMin;
                      const durationString = Math.floor(diff / 60) > 0 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff % 60}m`;
                      return (
                        <div style={{ paddingLeft: '4.5rem' }}>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)' }}>
                            <Clock size={11} className="shrink-0" />
                            <span>{durationString}</span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div style={{ paddingLeft: '4.5rem' }}>
                        <p className="text-xs text-red-500 mt-1">End time must be after start time</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border-default)]">
              <Button variant="ghost" size="sm" onClick={() => {
                setPendingClose(false);
                setDrawerOpen(false);
                setDrawerEntry({ task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
              }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  const { task, projectId, date, startTime, endTime } = drawerEntry;
                  if (!task || !projectId || !startTime || !endTime) {
                    triggerToast('Validation Error', 'Please fill in all fields.', 'warning');
                    return;
                  }
                  const proj = projectList.find(p => p.id === projectId) || projectList[0];
                  const [startH, startM] = startTime.split(':').map(Number);
                  const [endH, endM] = endTime.split(':').map(Number);
                  const startMin = startH * 60 + startM;
                  const endMin = endH * 60 + endM;
                  let diffMin = endMin - startMin;
                  if (diffMin < 0) diffMin += 1440;
                  const duration = Number((diffMin / 60).toFixed(2));

                  // Optimistic local update
                  const newLog = {
                    id: `log-${Date.now()}`,
                    userId: user?.id || 'u1',
                    userName: user?.email || 'You',
                    projectName: proj.name,
                    projectId: proj.id,
                    task,
                    date,
                    startTime,
                    endTime,
                    duration,
                    source: 'manual',
                    billable: true,
                  };
                  setLogs(prev => [newLog, ...prev]);
                  setDrawerOpen(false);
                  setDrawerEntry({ task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });

                  // Persist to Supabase
                  if (user && orgId) {
                    const startedAt = new Date(`${date}T${startTime}:00`).toISOString();
                    const endedAt   = new Date(`${date}T${endTime}:00`).toISOString();
                    const { error } = await supabase.from('time_logs').insert({
                      org_id: orgId,
                      user_id: user.id,
                      project_id: proj.id,
                      description: task,
                      started_at: startedAt,
                      ended_at: endedAt,
                      duration_hours: duration,
                      source: 'manual',
                      billable: true,
                    });
                    if (error) {
                      console.error('[AppShell] manual entry Supabase error:', error.message);
                      triggerToast('Sync warning', 'Saved locally but not synced.', 'warning');
                    } else {
                      triggerToast('Time entry saved', 'Your entry has been logged.', 'success');
                    }
                  } else {
                    triggerToast('Time entry saved', 'Your entry has been logged.', 'success');
                  }
                }}
              >
                Save Entry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(path) => { navigate(path); setCommandPaletteOpen(false); }}
        />
      )}

      {/* Help & Documentation Drawer */}
      <SlideOutDrawer
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Help & Documentation"
        footer={
          <Button variant="primary" onClick={() => setHelpOpen(false)}>
            Got it
          </Button>
        }
      >
        <div className="space-y-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div>
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">⏱️ Live Timer</h3>
            <p className="mb-2">
              Click <strong>Start Timer</strong> in the top bar — the timer starts immediately, no fields required. While it's running, click the pill in the center of the top bar to add a description, pick a project, or assign a task. Press{' '}
              <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">T</kbd>{' '}
              or <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">Space</kbd> to toggle the timer from anywhere (when not typing).
            </p>
            <p>Stopping saves the entry automatically to My Time.</p>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">✏️ Manual Time Entry</h3>
            <p className="mb-2">
              Click the <strong>+</strong> button next to Start Timer (or press <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">N</kbd>) to log time retroactively. Fill in what you worked on, choose a project, set the date, and type or scroll the start and end times. Save and Cancel are in the drawer header so they're always visible.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">📁 Projects & Tasks</h3>
            <p className="mb-2">
              Projects and tasks can be created on the fly — you don't need to go to the Projects page first. Whenever you see a project or task picker (top bar timer, manual entry drawer), the last item in the list is <strong>Create new project</strong> or <strong>Create "[name]"</strong>. Anything created here appears on the Projects page immediately.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">📅 My Time</h3>
            <p className="mb-2">
              Switch between <strong>List</strong>, <strong>Calendar</strong>, <strong>Timesheet</strong>, and <strong>Table</strong> views using the icons at the top right. Use the <strong>Week / Month</strong> toggle to change how much time is shown at once. Click the date label to jump directly to any date — no need to arrow through weeks one at a time.
            </p>
            <p>In Calendar view, overlapping entries sit side by side rather than on top of each other. Clicking any entry opens its detail card.</p>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">🛡️ Auto vs Manual badges</h3>
            <p>
              Every time entry carries a source badge: <span className="font-semibold text-emerald-600">Auto</span> (started with the live timer) or <span className="font-semibold text-amber-600">Manual</span> (entered via the drawer). The badge is read-only and cannot be changed.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)]">⌨️ Keyboard shortcuts</h3>
            <ul className="space-y-1">
              <li><kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">T</kbd> / <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">Space</kbd> — start / stop timer</li>
              <li><kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">N</kbd> — new manual entry</li>
              <li><kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">⌘K</kbd> / <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">Ctrl K</kbd> — command palette</li>
              <li><kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">G M</kbd> — go to My Time &nbsp; <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">G P</kbd> — Projects &nbsp; <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">G R</kbd> — Reports</li>
              <li><kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">Esc</kbd> — close any open panel or drawer</li>
            </ul>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Customize shortcuts in Settings → Keyboard Shortcuts.</p>
          </div>
        </div>
      </SlideOutDrawer>

      {/* Stop Timer Confirmation */}
      {stopConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div
            className="rounded-2xl p-6 shadow-2xl w-80 space-y-4 animate-fade-in"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Stop timer?
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              You have {Math.floor(timerSeconds / 60)} minutes tracked. This entry will be saved to your log.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setStopConfirmOpen(false)}>Keep running</Button>
              <Button variant="primary" size="sm" onClick={() => { setStopConfirmOpen(false); stopTimer(); }}>Stop & save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div className="absolute inset-0 z-0" onClick={() => setSettingsOpen(false)} />
          <div
            className="relative z-10 w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
            style={{
              height: '90vh',
              maxHeight: '720px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
          >
            <SettingsContent
              keyBindings={keyBindings}
              setKeyBindings={setKeyBindings}
              triggerToast={triggerToast}
              theme={theme}
              setTheme={setTheme}
              accent={accent}
              setAccent={setAccent}
              onClose={() => setSettingsOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
        onDismiss={dismissToast}
      />
    </div>
  );
}
