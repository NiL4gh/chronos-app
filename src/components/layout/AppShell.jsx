import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import ProjectTaskPicker from '../ProjectTaskPicker.jsx';
import SlideOutDrawer from '../ui/SlideOutDrawer.jsx';
import Toast from '../ui/Toast.jsx';
import CommandPalette from './CommandPalette.jsx';
import { SettingsContent } from '../../pages/Settings.jsx';
import Input from '../ui/Input.jsx';
import DateTimePicker from '../ui/DateTimePicker.jsx';
import Button from '../ui/Button.jsx';
import { projects, tasks, timeLogs, invoices, teamMembers } from '../../data/mockData.js';
import { Clock, X } from 'lucide-react';
import { getStoredTheme, getStoredAccent, applyTheme, applyAccent, watchSystemTheme } from '../../lib/theme.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import OnboardingWorkspace from './OnboardingWorkspace.jsx';

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
  const { isAdmin, orgId, user, refreshProfile } = useAuth();

  // Role is derived from real auth — no more client-side toggle
  const activeRole = isAdmin ? 'admin' : 'employee';

  // Demo Mode state
  const [demoMode, setDemoMode] = useState(() => {
    if (!isSupabaseConfigured) return true;
    try {
      return localStorage.getItem('chronos_demo_mode') === 'true';
    } catch {
      return false;
    }
  });

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
    task: '', projectId: '', taskId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true,
  });
  const [pendingClose, setPendingClose] = useState(false);
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);

  // Returns true when the manual entry form has user-entered data worth confirming
  const hasMeaningfulEntry = useCallback((entry) => {
    return (entry.task && entry.task.trim().length >= 3) || (entry.startTime && entry.endTime);
  }, []);

  // Shared logs state
  const [logs, setLogsState] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos_demo_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return timeLogs;
  });

  const setLogs = useCallback((updater) => {
    setLogsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (demoMode) {
        try {
          localStorage.setItem('chronos_demo_logs', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  }, [demoMode]);

  // Shared invoices state
  const [invoiceList, setInvoiceListState] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos_demo_invoices');
      if (saved) return JSON.parse(saved);
    } catch {}
    return invoices;
  });

  // Shared projects / tasks state
  const [projectList, setProjectListState] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos_demo_projects');
      if (saved) return JSON.parse(saved);
    } catch {}
    return projects;
  });
  const [taskList, setTaskListState] = useState(() => {
    try {
      const saved = localStorage.getItem('chronos_demo_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return tasks;
  });

  // Custom setters to auto-persist to Supabase
  const setProjectList = useCallback((updater) => {
    setProjectListState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!demoMode && user && orgId) {
        const newItems = next.filter(n => !prev.some(p => p.id === n.id));
        newItems.forEach(async (proj) => {
          const { error } = await supabase.from('projects').insert({
            id: proj.id.startsWith('p-') ? undefined : proj.id,
            name: proj.name,
            client: proj.client,
            description: proj.description || '',
            status: proj.status,
            color: proj.color,
            goal_type: proj.goalType,
            goal_hours: proj.goalHours,
            budget: proj.budget,
            spent: proj.spent,
            due_date: proj.dueDate,
            org_id: orgId,
            created_by: user.id
          });
          if (error) console.error('[AppShell] Supabase project insert error:', error.message);
        });
      } else if (demoMode) {
        try {
          localStorage.setItem('chronos_demo_projects', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  }, [demoMode, user, orgId]);

  const setTaskList = useCallback((updater) => {
    setTaskListState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!demoMode && user && orgId) {
        const newItems = next.filter(n => !prev.some(p => p.id === n.id));
        newItems.forEach(async (task) => {
          const { error } = await supabase.from('tasks').insert({
            id: task.id.startsWith('task-') ? undefined : task.id,
            title: task.title,
            project_id: task.projectId || null,
            status: task.status,
            priority: task.priority,
            assigned_to: user.id,
            created_by: user.id,
            description: task.description || '',
            org_id: orgId
          });
          if (error) console.error('[AppShell] Supabase task insert error:', error.message);
        });
      } else if (demoMode) {
        try {
          localStorage.setItem('chronos_demo_tasks', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  }, [demoMode, user, orgId]);

  const setInvoiceList = useCallback((updater) => {
    setInvoiceListState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!demoMode && user && orgId) {
        const newItems = next.filter(n => !prev.some(p => p.id === n.id));
        newItems.forEach(async (inv) => {
          const { error } = await supabase.from('invoices').insert({
            id: inv.id.startsWith('inv-') ? undefined : inv.id,
            invoice_number: inv.invoiceNumber,
            project_id: inv.projectId || null,
            client_name: inv.client?.name || '',
            client_email: inv.client?.email || '',
            client_address: inv.client?.address || '',
            issue_date: inv.issueDate,
            due_date: inv.dueDate,
            status: inv.status,
            requires_signature: inv.requiresSignature,
            subtotal: inv.subtotal,
            tax: inv.tax,
            total: inv.total,
            notes: inv.notes || '',
            line_items: inv.lineItems || [],
            org_id: orgId
          });
          if (error) console.error('[AppShell] Supabase invoice insert error:', error.message);
        });
      } else if (demoMode) {
        try {
          localStorage.setItem('chronos_demo_invoices', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  }, [demoMode, user, orgId]);

  // Load all live data from Supabase
  useEffect(() => {
    if (demoMode) {
      return;
    }

    if (!user || !orgId) {
      setProjectListState([]);
      setTaskListState([]);
      setInvoiceListState([]);
      setLogsState([]);
      return;
    }

    const loadData = async () => {
      // 1. Projects
      const { data: dbProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('org_id', orgId);
      
      const mappedProjects = (dbProjects || []).map(p => ({
        id: p.id,
        name: p.name,
        client: p.client || 'Internal',
        description: p.description || '',
        status: p.status,
        color: p.color,
        goalType: p.goal_type,
        goalHours: Number(p.goal_hours || 0),
        loggedHours: Number(p.logged_hours || 0),
        budget: Number(p.budget || 0),
        spent: Number(p.spent || 0),
        dueDate: p.due_date,
        tags: p.tags || [],
        members: []
      }));
      setProjectListState(mappedProjects);

      // 2. Tasks
      const { data: dbTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('org_id', orgId);
      
      const mappedTasks = (dbTasks || []).map(t => {
        const p = mappedProjects.find(proj => proj.id === t.project_id);
        return {
          id: t.id,
          title: t.title,
          projectId: t.project_id,
          projectName: p?.name || '',
          assignedTo: t.assigned_to,
          assignedToName: 'You',
          createdBy: t.created_by,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
          timeLogged: Number(t.time_logged || 0),
          description: t.description || ''
        };
      });
      setTaskListState(mappedTasks);

      // 3. Logs
      const { data: dbLogs } = await supabase
        .from('time_logs')
        .select('*')
        .eq('org_id', orgId);
      
      const mappedLogs = (dbLogs || []).map(l => {
        const p = mappedProjects.find(proj => proj.id === l.project_id);
        const started = new Date(l.started_at);
        const ended = l.ended_at ? new Date(l.ended_at) : null;
        
        return {
          id: l.id,
          userId: l.user_id,
          userName: user?.email || 'You',
          projectId: l.project_id,
          projectName: p?.name || '',
          task: l.description || 'Auto Tracked Task',
          date: l.started_at.slice(0, 10),
          startTime: started.toTimeString().slice(0, 5),
          endTime: ended ? ended.toTimeString().slice(0, 5) : '',
          duration: Number(l.duration_hours || 0),
          source: l.source,
          billable: l.billable,
          tags: l.tags || []
        };
      });
      setLogsState(mappedLogs);

      // 4. Invoices
      const { data: dbInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('org_id', orgId);
      
      const mappedInvoices = (dbInvoices || []).map(i => {
        const p = mappedProjects.find(proj => proj.id === i.project_id);
        return {
          id: i.id,
          invoiceNumber: i.invoice_number,
          client: {
            name: i.client_name || '',
            email: i.client_email || '',
            address: i.client_address || ''
          },
          project: p?.name || '',
          projectId: i.project_id,
          issueDate: i.issue_date,
          dueDate: i.due_date,
          status: i.status,
          requiresSignature: i.requires_signature,
          subtotal: Number(i.subtotal || 0),
          tax: Number(i.tax || 0),
          total: Number(i.total || 0),
          notes: i.notes || '',
          lineItems: i.line_items || []
        };
      });
      setInvoiceListState(mappedInvoices);
    };

    loadData();
  }, [demoMode, user, orgId]);

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
  const triggerToast = useCallback((title, message = '', variant = 'success', action) => {
    setToast({ visible: true, title, message, variant, action });
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
  const [timerStart, setTimerStart] = useState(() => {
    try {
      const saved = localStorage.getItem('timer_start');
      return saved ? Number(saved) : 0;
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



  // Persist timer state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timer_running', String(timerRunning));
      localStorage.setItem('timer_start', String(timerStart));
      localStorage.setItem('timer_task', timerTaskLabel);
      localStorage.setItem('timer_project', timerProjectId);
      localStorage.setItem('timer_task_id', timerTaskId);
    } catch {}
  }, [timerRunning, timerStart, timerTaskLabel, timerProjectId, timerTaskId]);

  const startTimer = useCallback((task = '', projectId = '', taskId = '') => {
    setTimerTaskLabel(task);
    setTimerProjectId(projectId);
    setTimerTaskId(taskId);
    setTimerRunning(true);
    setTimerStart(Date.now());
  }, []);

  const updateTimer = useCallback(({ task, projectId, taskId }) => {
    if (task !== undefined) setTimerTaskLabel(task);
    if (projectId !== undefined) setTimerProjectId(projectId);
    if (taskId !== undefined) setTimerTaskId(taskId);
  }, []);

  const stopTimer = useCallback(async () => {
    setTimerRunning(false);
    if (timerStart > 0) {
      const elapsedMs = Date.now() - timerStart;
      const proj = projectList.find(p => p.id === timerProjectId) || projectList[0];
      const startStr = new Date(timerStart).toTimeString().slice(0, 5);
      const endStr = new Date().toTimeString().slice(0, 5);
      const durationHours = Number((elapsedMs / 3600000).toFixed(2)) || 0.01;

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
        const startedAt = new Date(timerStart).toISOString();
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
    setTimerStart(0);
    setTimerTaskId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_start');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_task_id');
    } catch {}
  }, [timerStart, timerTaskLabel, timerProjectId, projectList, triggerToast, user, orgId]);

  // Guarded stop timer — shows in-app confirm if > 5 min
  const guardedStopTimer = useCallback(() => {
    if (timerStart > 0 && (Date.now() - timerStart) / 1000 > 300) {
      setStopConfirmOpen(true);
      return;
    }
    stopTimer();
  }, [timerStart, stopTimer]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerStart(0);
    setTimerTaskLabel('');
    setTimerProjectId('');
    setTimerTaskId('');
    try {
      localStorage.removeItem('timer_running');
      localStorage.removeItem('timer_start');
      localStorage.removeItem('timer_task');
      localStorage.removeItem('timer_project');
      localStorage.removeItem('timer_task_id');
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
        if (drawerOpen && hasMeaningfulEntry(drawerEntry)) {
          setPendingClose(true);
        } else {
          setDrawerOpen(false);
          setPendingClose(false);
        }
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
    timerRunning, timerStart, timerTaskLabel, timerProjectId, timerTaskId,
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
    demoMode, setDemoMode,
  };

  if (user && !orgId) {
    return <OnboardingWorkspace onWorkspaceCreated={refreshProfile} />;
  }

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
            timerStart={timerStart}
            timerTaskLabel={timerTaskLabel}
            timerProjectId={timerProjectId}
            timerTaskId={timerTaskId}
            onStopTimer={guardedStopTimer}
            onStartTimer={startTimer}
            onUpdateTimer={updateTimer}
            projectList={projectList}
            taskList={taskList}
            teamMembers={teamMembers}
            logs={logs}
            addProject={addProject}
            addTask={addTask}
            triggerToast={triggerToast}
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-5 animate-fade-in">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Manual Time Entry Modal */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => {
            if (hasMeaningfulEntry(drawerEntry)) {
              setPendingClose(true);
            } else {
              setDrawerOpen(false);
              setDrawerEntry({ task: '', projectId: '', taskId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-slide-up"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
              <span className="text-sm font-bold text-[var(--text-primary)]">Log Time Entry</span>
              <button
                onClick={() => {
                  if (hasMeaningfulEntry(drawerEntry)) {
                    setPendingClose(true);
                  } else {
                    setDrawerOpen(false);
                    setDrawerEntry({ task: '', projectId: '', taskId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
                  }
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-5 space-y-5">
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
                      setDrawerEntry({ task: '', projectId: '', taskId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
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

              {/* Project & Task */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Project & Task
                </label>
                <ProjectTaskPicker
                  projectId={drawerEntry.projectId}
                  taskId={drawerEntry.taskId}
                  taskText={drawerEntry.task}
                  onChange={(update) => setDrawerEntry(prev => ({ ...prev, ...update }))}
                  projects={projectList}
                  tasks={taskList}
                  addProject={addProject}
                  addTask={addTask}
                />
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
                setDrawerEntry({ task: '', projectId: '', taskId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });
              }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  const { task, projectId, taskId, date, startTime, endTime } = drawerEntry;
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
                    taskId,
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
                  setDrawerEntry({ task: '', projectId: '', taskId: '', date: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', billable: true });

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
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              You have {timerStart > 0 ? Math.floor((Date.now() - timerStart) / 60000) : 0} minutes tracked. This entry will be saved to your logs.
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
          className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div className="absolute inset-0 z-0" onClick={() => setSettingsOpen(false)} />
          <div
            className="relative z-10 w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
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
              demoMode={demoMode}
              setDemoMode={setDemoMode}
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
        action={toast.action}
        onDismiss={dismissToast}
      />
    </div>
  );
}
