import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import SlideOutDrawer from '../ui/SlideOutDrawer.jsx';
import Toast from '../ui/Toast.jsx';
import CommandPalette from './CommandPalette.jsx';
import Input, { Select } from '../ui/Input.jsx';
import DateTimePicker from '../ui/DateTimePicker.jsx';
import Button from '../ui/Button.jsx';
import Toggle from '../ui/Toggle.jsx';
import { projects, timeLogs, invoices } from '../../data/mockData.js';
import { AlertTriangle, Clock } from 'lucide-react';
import { getStoredTheme, getStoredAccent, applyTheme, applyAccent, watchSystemTheme } from '../../lib/theme.js';

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

  // Role
  const [activeRole, setActiveRole] = useState('admin');

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
    task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: false,
  });

  // Shared logs state
  const [logs, setLogs] = useState(timeLogs);

  // Shared invoices state
  const [invoiceList, setInvoiceList] = useState(invoices);

  // Shared global date state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);

  // Help drawer state
  const [helpOpen, setHelpOpen] = useState(false);

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
      localStorage.setItem('timer_saved_at', String(Date.now()));
    } catch {}
  }, [timerRunning, timerSeconds, timerTaskLabel, timerProjectId]);

  const startTimer = useCallback((task = '', projectId = '') => {
    setTimerTaskLabel(task);
    setTimerProjectId(projectId);
    setTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    if (timerSeconds > 0) {
      const proj = projects.find(p => p.id === timerProjectId) || projects[0];
      const startMs = Date.now() - timerSeconds * 1000;
      const startStr = new Date(startMs).toTimeString().slice(0, 5);
      const endStr = new Date().toTimeString().slice(0, 5);
      const durationHours = Number((timerSeconds / 3600).toFixed(2)) || 0.01;

      const newLog = {
        id: `log-${Date.now()}`,
        userId: 'u1',
        projectName: proj.name,
        projectId: proj.id,
        task: timerTaskLabel || 'Auto Tracked Task',
        date: new Date().toISOString().slice(0, 10),
        startTime: startStr,
        endTime: endStr,
        duration: durationHours,
        source: 'auto',
        billable: true
      };

      setLogs(prev => [newLog, ...prev]);
      triggerToast('Timer saved', `Logged ${durationHours}h to ${proj.name}.`, 'success');
    }
    setTimerSeconds(0);
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_seconds');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_saved_at');
    } catch {}
  }, [timerSeconds, timerTaskLabel, timerProjectId, triggerToast]);

  // Guarded stop timer — asks confirmation if > 5 min
  const guardedStopTimer = useCallback(() => {
    if (timerSeconds > 300) {
      if (!window.confirm(`You have ${Math.floor(timerSeconds / 60)} minutes tracked. Stop and save this entry?`)) {
        return;
      }
    }
    stopTimer();
  }, [timerSeconds, stopTimer]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimerTaskLabel('');
    setTimerProjectId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_seconds');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
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
    timerRunning, timerSeconds, timerTaskLabel, timerProjectId,
    startTimer, stopTimer: guardedStopTimer, resetTimer,
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
  };

  const isEmployee = activeRole === 'employee';

  return (
    <div
      className="flex min-h-screen h-screen overflow-hidden relative"
      style={{ minHeight: '100vh' }}
    >
      {/* Sidebar */}
      <Sidebar
        activeRole={activeRole}
        onRoleSwitch={() => setActiveRole(r => r === 'admin' ? 'employee' : 'admin')}
        triggerToast={triggerToast}
        onOpenHelp={() => setHelpOpen(true)}
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

        {/* Employee warning banner */}
        {isEmployee && (
          <div
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium shrink-0"
            style={{
              background: 'var(--warning-bg)',
              borderBottom: '1px solid var(--warning-border)',
              color: 'var(--warning-text)',
            }}
          >
            <AlertTriangle size={12} />
            Viewing as Employee — some sections are hidden
          </div>
        )}

        {/* Topbar */}
        <div className="relative z-50">
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenDrawer={() => setDrawerOpen(true)}
            timerRunning={timerRunning}
            timerSeconds={timerSeconds}
            timerTaskLabel={timerTaskLabel}
            onStopTimer={guardedStopTimer}
            onStartTimer={() => startTimer()}
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Manual Time Entry Drawer */}
      <SlideOutDrawer
        isOpen={drawerOpen}
        onClose={() => {
          const { task, projectId, startTime, endTime } = drawerEntry;
          const hasData = task || projectId || startTime || endTime;
          if (hasData) {
            if (!window.confirm('You have unsaved changes. Discard this entry?')) return;
          }
          setDrawerOpen(false);
          setDrawerEntry({
            task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: false,
          });
        }}
        title="Log Time Entry"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const { task, projectId, date, startTime, endTime, billable } = drawerEntry;
                if (!task || !projectId || !startTime || !endTime) {
                  triggerToast('Validation Error', 'Please fill in all fields.', 'warning');
                  return;
                }
                const proj = projects.find(p => p.id === projectId) || projects[0];

                // Calculate duration in hours
                const [startH, startM] = startTime.split(':').map(Number);
                const [endH, endM] = endTime.split(':').map(Number);
                const startMin = startH * 60 + startM;
                const endMin = endH * 60 + endM;
                let diffMin = endMin - startMin;
                if (diffMin < 0) diffMin += 1440; // overnight handling
                const duration = Number((diffMin / 60).toFixed(2));

                const newLog = {
                  id: `log-${Date.now()}`,
                  userId: 'u1',
                  projectName: proj.name,
                  projectId: proj.id,
                  task,
                  date,
                  startTime,
                  endTime,
                  duration,
                  source: 'manual',
                  billable
                };

                setLogs(prev => [newLog, ...prev]);
                setDrawerOpen(false);
                setDrawerEntry({
                  task: '', projectId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: false,
                });
                triggerToast('Time entry saved', 'Your entry has been logged.', 'success');
              }}
            >
              Save Entry
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* FIELD GROUP 1 — Task Description */}
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

          {/* FIELD GROUP 2 — Project */}
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
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>

          {/* FIELD GROUP 3 — WHEN DID YOU WORK? */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              When did you work?
            </label>
            
            <div className="space-y-3">
              {/* Date row */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--text-secondary)] w-16 shrink-0">
                  Date
                </label>
                <div className="flex-1">
                  <DateTimePicker
                    value={drawerEntry.date}
                    onChange={val => setDrawerEntry(prev => ({ ...prev, date: val }))}
                  />
                </div>
              </div>

              {/* Time range row */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--text-secondary)] w-16 shrink-0">
                  From
                </label>
                <div className="relative inline-flex items-center flex-1">
                  <DateTimePicker
                    mode="time"
                    timeValue={drawerEntry.startTime}
                    onTimeChange={val => setDrawerEntry(prev => ({ ...prev, startTime: val }))}
                  />
                </div>
                <span className="text-sm text-[var(--text-muted)] px-1">–</span>
                <label className="text-xs text-[var(--text-secondary)] shrink-0 mr-2">
                  to
                </label>
                <div className="relative inline-flex items-center flex-1">
                  <DateTimePicker
                    mode="time"
                    timeValue={drawerEntry.endTime}
                    onTimeChange={val => setDrawerEntry(prev => ({ ...prev, endTime: val }))}
                  />
                </div>
              </div>

              {/* Duration Preview and Validation */}
              {(() => {
                const { startTime, endTime } = drawerEntry;
                if (!startTime || !endTime) return null;
                
                const [startH, startM] = startTime.split(':').map(Number);
                const [endH, endM] = endTime.split(':').map(Number);
                const startMin = startH * 60 + startM;
                const endMin = endH * 60 + endM;

                if (endMin > startMin) {
                  const diff = endMin - startMin;
                  const hours = Math.floor(diff / 60);
                  const mins = diff % 60;
                  const durationString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                  return (
                    <div style={{ paddingLeft: '4.5rem' }}>
                      <div 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: 'var(--accent-subtle)',
                          border: '1px solid var(--accent-border)',
                          color: 'var(--accent-text)',
                        }}
                      >
                        <Clock size={11} className="shrink-0" />
                        <span>{durationString}</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div style={{ paddingLeft: '4.5rem' }}>
                      <p className="text-xs text-red-500 mt-1">
                        End time must be after start time
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          {/* FIELD GROUP 4 — Billable toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Billable</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Include this entry in billing calculations</p>
            </div>
            <Toggle
              checked={drawerEntry.billable}
              onChange={v => setDrawerEntry(prev => ({ ...prev, billable: v }))}
              size="md"
            />
          </div>
        </div>
      </SlideOutDrawer>

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
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)] flex items-center gap-1.5">⏱️ Live Timer & Logs</h3>
            <p className="mb-2">
              Start tracking time instantly by clicking the **Start Timer** amber CTA in the Topbar or pressing the <kbd className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">T</kbd> key (or your custom shortcut).
            </p>
            <p>
              When running, a live ticking indicator is displayed in the Topbar. Clicking stop automatically creates a verified, auditable <strong>Auto-tracked log</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)] flex items-center gap-1.5">🛡️ Trust & Source Verification</h3>
            <p className="mb-2">
              Chronos distinguishes between verified tracking and manual entry:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <span className="font-semibold text-emerald-600">Auto (CPU icon):</span> Logged automatically by the live timer or desktop app. Fully auditable and trusted.
              </li>
              <li>
                <span className="font-semibold text-amber-600">Manual (Pen icon):</span> Entered retroactively via the drawer or timesheet strip.
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)] flex items-center gap-1.5">🎯 Project Goal Engine</h3>
            <p className="mb-2">
              Each project card features an embedded Goal tracking circle. The colors update dynamically based on progress:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong className="text-emerald-500">Emerald:</strong> Above 85% of budget/goal.</li>
              <li><strong className="text-amber-500">Amber:</strong> Under 85% of budget/goal.</li>
              <li><strong className="text-red-500">Red:</strong> Over budget/goal.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)] flex items-center gap-1.5">✍️ Invoicing & Digital Signatures</h3>
            <p className="mb-2">
              Create professional client bills directly from tracked timesheets.
            </p>
            <p>
              Enable the <strong>Digital Signature</strong> toggle to reveal a signature drawing pad where clients can sign invoices electronically before payment.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)] flex items-center gap-1.5">🖥️ Desktop App Integration</h3>
            <p className="mb-2">
              Chronos is available as a lightweight desktop application (Electron).
            </p>
            <p>
              It integrates natively with your OS taskbar, supports custom keyboard shortcuts global to your machine, and provides a continuous autologging background service. Run <code className="font-mono text-xs px-1 py-0.5 rounded bg-[var(--bg-sunken)] border border-[var(--border-default)]">npm run electron:dev</code> to launch it locally.
            </p>
          </div>
        </div>
      </SlideOutDrawer>

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
