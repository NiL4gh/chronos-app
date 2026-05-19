import React, { useState, useEffect, useCallback } from 'react';
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
import { projects } from '../../data/mockData.js';
import { AlertTriangle } from 'lucide-react';

// ─── Role ───────────────────────────────────────────────
const ROLES = ['admin', 'employee'];

export default function AppShell() {
  const navigate = useNavigate();

  // Role
  const [activeRole, setActiveRole] = useState('admin');

  // Sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Manual time drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEntry, setDrawerEntry] = useState({
    task: '', projectId: '', date: '', startTime: '', endTime: '', billable: false,
  });

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

  // Live timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTaskLabel, setTimerTaskLabel] = useState('');
  const [timerProjectId, setTimerProjectId] = useState('');

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const startTimer = useCallback((task = '', projectId = '') => {
    setTimerTaskLabel(task);
    setTimerProjectId(projectId);
    setTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimerTaskLabel('');
    setTimerProjectId('');
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

      switch (e.key) {
        case 't':
        case 'T':
          // Toggle timer
          if (timerRunning) stopTimer();
          else startTimer();
          break;
        case 'n':
        case 'N':
          // Open new time entry drawer
          setDrawerOpen(true);
          break;
        case 'p':
        case 'P':
          // Open command palette focused on projects
          setCommandPaletteOpen(true);
          break;
        case ' ':
          // Space — toggle timer
          e.preventDefault();
          if (timerRunning) stopTimer();
          else startTimer();
          break;
        case 'Escape':
          setDrawerOpen(false);
          setCommandPaletteOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [timerRunning, startTimer, stopTimer]);

  // ─── Outlet context ──────────────────────────────────
  const outletContext = {
    timerRunning, timerSeconds, timerTaskLabel, timerProjectId,
    startTimer, stopTimer, resetTimer,
    triggerToast,
    activeRole,
  };

  const isEmployee = activeRole === 'employee';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-base)', minHeight: '100vh' }}
    >
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        activeRole={activeRole}
        onRoleSwitch={() => setActiveRole(r => r === 'admin' ? 'employee' : 'admin')}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

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
        <Topbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenDrawer={() => setDrawerOpen(true)}
          timerRunning={timerRunning}
          timerSeconds={timerSeconds}
          timerTaskLabel={timerTaskLabel}
          onStopTimer={stopTimer}
          onStartTimer={() => startTimer()}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Manual Time Entry Drawer */}
      <SlideOutDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
                setDrawerOpen(false);
                triggerToast('Time entry saved', 'Your entry has been logged.', 'success');
              }}
            >
              Save Entry
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Task Description
            </label>
            <Input
              placeholder="What did you work on?"
              value={drawerEntry.task}
              onChange={e => setDrawerEntry(prev => ({ ...prev, task: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Project
            </label>
            <Select
              className="w-full"
              value={drawerEntry.projectId}
              onChange={e => setDrawerEntry(prev => ({ ...prev, projectId: e.target.value }))}
            >
              <option value="">Select project…</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <DateTimePicker
            label="Date"
            value={drawerEntry.date}
            onChange={date => setDrawerEntry(prev => ({ ...prev, date }))}
            placeholder="Select date"
          />
          <div className="grid grid-cols-2 gap-3">
            <DateTimePicker
              label="Start Time"
              value=""
              timeValue={drawerEntry.startTime}
              onChange={() => {}}
              onTimeChange={t => setDrawerEntry(prev => ({ ...prev, startTime: t }))}
              showTime={true}
              placeholder="Start"
            />
            <DateTimePicker
              label="End Time"
              value=""
              timeValue={drawerEntry.endTime}
              onChange={() => {}}
              onTimeChange={t => setDrawerEntry(prev => ({ ...prev, endTime: t }))}
              showTime={true}
              placeholder="End"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Billable</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Count toward client invoice</p>
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
