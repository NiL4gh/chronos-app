import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { X } from 'lucide-react';
import Toggle from '../components/ui/Toggle';
import { ProgressBar } from '../components/ui/ProgressBar';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { ACCENTS, THEME_OPTIONS } from '../lib/theme';
import { isSupabaseConfigured } from '../lib/supabase';

export function SettingsContent({ keyBindings, setKeyBindings, triggerToast, theme, setTheme, accent, setAccent, demoMode, setDemoMode, onClose }) {
  const [activeSection, setActiveSection] = useState('personal');
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    if (!editingKey) return;
    const handleCapture = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let key = e.key;
      if (key === ' ') key = 'Space';
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return;
      setKeyBindings(prev => ({ ...prev, [editingKey]: key }));
      triggerToast('Shortcut updated', `Action updated to key: "${key.toUpperCase()}"`, 'success');
      setEditingKey(null);
    };
    window.addEventListener('keydown', handleCapture, true);
    return () => window.removeEventListener('keydown', handleCapture, true);
  }, [editingKey, setKeyBindings, triggerToast]);

  const navItems = [
    { id: 'personal',   label: 'Personal Details' },
    { id: 'time',       label: 'Time Preferences' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'calendar',   label: 'Calendar & Integrations' },
    { id: 'tracking',   label: 'Tracking & Desktop' },
    { id: 'shortcuts',  label: 'Keyboard Shortcuts' },
  ];

  // Workspace/Time state — persisted
  const [orgName, setOrgName] = useState(() => {
    try { return localStorage.getItem('ws_orgName') || 'Chronos Demo Co.'; } catch { return 'Chronos Demo Co.'; }
  });
  const [industry, setIndustry] = useState(() => {
    try { return localStorage.getItem('ws_industry') || 'Technology'; } catch { return 'Technology'; }
  });
  const [timezone, setTimezone] = useState(() => {
    try { return localStorage.getItem('ws_timezone') || 'UTC'; } catch { return 'UTC'; }
  });
  const [dateFormat, setDateFormat] = useState(() => {
    try { return localStorage.getItem('ws_dateFormat') || 'MM/DD/YYYY'; } catch { return 'MM/DD/YYYY'; }
  });
  const [billingRate, setBillingRate] = useState(() => {
    try { return localStorage.getItem('ws_billingRate') || '95'; } catch { return '95'; }
  });
  const [dailyTarget, setDailyTarget] = useState(() => {
    try { return localStorage.getItem('ws_dailyTarget') || '8'; } catch { return '8'; }
  });
  const [weeklyTarget, setWeeklyTarget] = useState(() => {
    try { return localStorage.getItem('ws_weeklyTarget') || '40'; } catch { return '40'; }
  });

  const handleSaveWorkspace = () => {
    try {
      localStorage.setItem('ws_orgName', orgName);
      localStorage.setItem('ws_industry', industry);
      localStorage.setItem('ws_timezone', timezone);
      localStorage.setItem('ws_dateFormat', dateFormat);
      localStorage.setItem('ws_billingRate', billingRate);
      localStorage.setItem('ws_dailyTarget', dailyTarget);
      localStorage.setItem('ws_weeklyTarget', weeklyTarget);
    } catch {}
    triggerToast("Settings saved", "Workspace settings updated.", "success");
  };

  const handleSaveProfile = () => {
    triggerToast("Settings saved", "Profile settings updated.", "success");
  };

  // Notifications State
  const [notifState, setNotifState] = useState({
    emailInvoice: true,
    emailOverdue: true,
    emailTeamSummary: false,
    inAppTimer: true,
    inAppMention: true,
    inAppBudget: true,
    weeklyReport: false,
    dailyDigest: true
  });
  const toggleNotif = (key) => setNotifState(p => ({ ...p, [key]: !p[key] }));

  // Appearance State
  const [density, setDensity] = useState('comfortable');
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  const handleToggleDemo = () => {
    const nextVal = !demoMode;
    setDemoMode(nextVal);
    try {
      localStorage.setItem('chronos_demo_mode', String(nextVal));
    } catch {}
    triggerToast(
      nextVal ? 'Demo Mode Enabled' : 'Demo Mode Disabled',
      'Reloading to apply changes...',
      'success'
    );
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClearDemoData = () => {
    try {
      localStorage.setItem('chronos_demo_projects', JSON.stringify([]));
      localStorage.setItem('chronos_demo_tasks', JSON.stringify([]));
      localStorage.setItem('chronos_demo_logs', JSON.stringify([]));
      localStorage.setItem('chronos_demo_invoices', JSON.stringify([]));
      triggerToast('Demo Data Cleared', 'App reset to a clean slate.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadSampleData = () => {
    try {
      localStorage.removeItem('chronos_demo_projects');
      localStorage.removeItem('chronos_demo_tasks');
      localStorage.removeItem('chronos_demo_logs');
      localStorage.removeItem('chronos_demo_invoices');
      triggerToast('Sample Data Restored', 'Reloading app to apply changes...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>

      {/* Modal header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-sunken)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close settings"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left nav */}
        <div
          className="w-52 flex-shrink-0 py-4 px-3 overflow-y-auto"
          style={{ borderRight: '1px solid var(--border-default)' }}
        >
          <nav className="flex flex-col gap-0.5">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className="text-left text-sm px-3 py-2 rounded-lg transition-colors"
                  style={isActive ? {
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-text)',
                    fontWeight: 600,
                    borderLeft: '3px solid var(--accent)',
                  } : {
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-sunken)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Personal Details — was 'profile' */}
          {activeSection === 'personal' && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Personal Details</h3>
              <div className="flex flex-col items-center justify-center mb-6">
                <Avatar name="Niloy Pal" size="xl" />
                <button
                  className="mt-3 text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => triggerToast("Photo upload coming in Phase 2", "", "info")}
                >
                  Upload Photo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                  <Input defaultValue="Niloy Pal" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
                  <Input defaultValue="niloy@example.com" disabled />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Job Title</label>
                  <Input defaultValue="Lead Engineer" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Role</label>
                  <div className="px-3 py-2 rounded-md text-sm cursor-not-allowed" style={{ background: 'var(--bg-sunken)', color: 'var(--text-secondary)' }}>
                    Admin
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <Button onClick={handleSaveProfile} variant="primary">Save Profile</Button>
              </div>
            </div>
          )}

          {/* Time Preferences — was 'workspace' */}
          {activeSection === 'time' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Time Preferences</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Configure your organization and billing settings</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Organization Name</label>
                  <Input value={orgName} onChange={e => setOrgName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Industry</label>
                  <Select value={industry} onChange={e => setIndustry(e.target.value)}>
                    {['Technology', 'Agency', 'Consulting', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Timezone</label>
                  <Select value={timezone} onChange={e => setTimezone(e.target.value)}>
                    {['UTC', 'UTC+6 (Dhaka)', 'UTC+5:30 (IST)', 'UTC-5 (EST)', 'UTC-8 (PST)'].map(o => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Date Format</label>
                  <Select value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                    {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(o => <option key={o} value={o}>{o}</option>)}
                  </Select>
                </div>
              </div>
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Hours & Billing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Daily Hours Target</label>
                    <Input type="number" min="1" max="24" value={dailyTarget} onChange={e => setDailyTarget(e.target.value)} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hours you aim to work per day</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Weekly Hours Target</label>
                    <Input type="number" min="1" max="168" value={weeklyTarget} onChange={e => setWeeklyTarget(e.target.value)} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hours you aim to work per week</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Default Hourly Rate ($/hr)</label>
                    <Input type="number" min="0" value={billingRate} onChange={e => setBillingRate(e.target.value)} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Used in billing calculations on Reports</span>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Button onClick={handleSaveWorkspace} variant="primary">Save Changes</Button>
              </div>
            </div>
          )}

          {/* Appearance — unchanged */}
          {activeSection === 'appearance' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose your theme and accent color.</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Theme</label>
                <div className="inline-flex rounded-lg p-1 gap-1" style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-default)' }}>
                  {THEME_OPTIONS.map(opt => {
                    const active = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                        style={active
                          ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }
                          : { color: 'var(--text-secondary)' }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Accent color</label>
                <div className="flex items-center gap-3">
                  {ACCENTS.map(a => {
                    const active = accent === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAccent(a.id)}
                        title={a.label}
                        aria-label={a.label}
                        className="w-8 h-8 rounded-full transition-transform"
                        style={{
                          background: a.color,
                          transform: active ? 'scale(1.12)' : 'scale(1)',
                          boxShadow: active ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${a.color}` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Demo Mode</label>
                <Toggle
                  label="Enable Demo Mode"
                  description={
                    isSupabaseConfigured
                      ? "Populate the app with pre-filled mock data for testing and preview."
                      : "Populate the app with pre-filled mock data (Required — Supabase environment variables are missing)."
                  }
                  checked={demoMode}
                  onChange={handleToggleDemo}
                  disabled={!isSupabaseConfigured}
                />

                {demoMode && (
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={handleClearDemoData}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-85 active:scale-[0.98]"
                      style={{
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        color: '#ef4444'
                      }}
                    >
                      Clear All Demo Data
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSampleData}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-85 active:scale-[0.98]"
                      style={{
                        borderColor: 'var(--accent-border)',
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent-text)'
                      }}
                    >
                      Load Sample Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar & Integrations — new stub */}
          {activeSection === 'calendar' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Calendar & Integrations</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Connect external calendars to sync your time entries.</p>
              </div>
              <div
                className="rounded-xl p-5"
                style={{ border: '1px solid var(--border-default)', background: 'var(--bg-sunken)' }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Google Calendar</p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Sync meetings from Google Calendar as time entries.</p>
                <button
                  onClick={() => triggerToast('Coming soon', 'Calendar sync is in development.', 'info')}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                >
                  Connect Google Calendar
                </button>
              </div>
              <div
                className="rounded-xl p-5"
                style={{ border: '1px solid var(--border-default)', background: 'var(--bg-sunken)' }}
              >
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Outlook Calendar</p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Sync meetings from Outlook to Chronos.</p>
                <button
                  onClick={() => triggerToast('Coming soon', 'Calendar sync is in development.', 'info')}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                >
                  Connect Outlook
                </button>
              </div>
            </div>
          )}

          {/* Tracking & Desktop — was 'notifications' + desktop stub */}
          {activeSection === 'tracking' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Tracking & Desktop</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage notifications and desktop tracking preferences.</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Email Notifications</h4>
                <div className="space-y-4">
                  <Toggle label="Invoice sent" description="Get notified when an invoice is sent" checked={notifState.emailInvoice} onChange={() => toggleNotif('emailInvoice')} />
                  <Toggle label="Overdue invoice" description="Alert when invoice becomes overdue" checked={notifState.emailOverdue} onChange={() => toggleNotif('emailOverdue')} />
                  <Toggle label="Weekly team summary" description="Sunday evening team digest" checked={notifState.emailTeamSummary} onChange={() => toggleNotif('emailTeamSummary')} />
                  <Toggle label="Weekly report" description="Auto-generated Monday morning report" checked={notifState.weeklyReport} onChange={() => toggleNotif('weeklyReport')} />
                </div>
              </div>
              <div className="pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <h4 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>In-App Notifications</h4>
                <div className="space-y-4">
                  <Toggle label="Timer reminders" description="Reminder if no timer started by 9am" checked={notifState.inAppTimer} onChange={() => toggleNotif('inAppTimer')} />
                  <Toggle label="Budget alerts" description="Alert when project hits 80% budget" checked={notifState.inAppBudget} onChange={() => toggleNotif('inAppBudget')} />
                  <Toggle label="Daily digest" description="End-of-day summary of team activity" checked={notifState.dailyDigest} onChange={() => toggleNotif('dailyDigest')} />
                </div>
              </div>
              <div
                className="rounded-xl p-5 border-t pt-4"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <div
                  className="rounded-xl p-5"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--bg-sunken)' }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Desktop Agent</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Automatic idle detection and app tracking — coming soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts — unchanged */}
          {activeSection === 'shortcuts' && (() => {
            const navShortcuts = [
              { label: 'Go to Team',       kbd: ['G', keyBindings.goTeam.toUpperCase()],       actionKey: 'goTeam' },
              { label: 'Go to Projects',   kbd: ['G', keyBindings.goProjects.toUpperCase()],   actionKey: 'goProjects' },
              { label: 'Go to Reports',    kbd: ['G', keyBindings.goReports.toUpperCase()],    actionKey: 'goReports' },
              { label: 'Go to Invoices',   kbd: ['G', keyBindings.goInvoices.toUpperCase()],   actionKey: 'goInvoices' },
              { label: 'Go to My Time',    kbd: ['G', keyBindings.goMyTime.toUpperCase()],     actionKey: 'goMyTime' },
              { label: 'Go to Settings',   kbd: ['G', keyBindings.goSettings.toUpperCase()],   actionKey: 'goSettings' },
            ];
            const timerShortcuts = [
              { label: 'Start / Stop timer',       kbd: [keyBindings.toggleTimer.toUpperCase(), 'Space'], actionKey: 'toggleTimer' },
              { label: 'New manual entry',         kbd: [keyBindings.newEntry.toUpperCase()],             actionKey: 'newEntry' },
              { label: 'Open command palette',     kbd: [keyBindings.openPalette.toUpperCase(), '⌘ K'],  actionKey: 'openPalette' },
            ];
            const generalShortcuts = [
              { label: 'Close panel or drawer',   kbd: ['Esc'] },
              { label: 'Open shortcuts reference', kbd: ['?'] },
              { label: 'Save current form',        kbd: ['⌘', 'S'] },
            ];
            return (
              <div className="animate-fade-in">
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Use these shortcuts to navigate Chronos faster</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Navigation</h4>
                    <div className="space-y-1">
                      {navShortcuts.map((s, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b animate-fade-in" style={{ borderColor: 'var(--border-default)' }}>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {s.kbd.map(k => (
                                <kbd key={k} className="rounded-md px-2 py-0.5 text-xs font-mono" style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>{k}</kbd>
                              ))}
                            </div>
                            {s.actionKey && (
                              <button
                                onClick={() => setEditingKey(s.actionKey)}
                                className="text-xs text-amber-500 hover:text-amber-600 font-semibold cursor-pointer min-w-[70px] text-right"
                              >
                                {editingKey === s.actionKey ? 'Press key...' : 'Customize'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Timer</h4>
                      <div className="space-y-1">
                        {timerShortcuts.map((s, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b animate-fade-in" style={{ borderColor: 'var(--border-default)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                {s.kbd.map(k => (
                                  <kbd key={k} className="rounded-md px-2 py-0.5 text-xs font-mono" style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>{k}</kbd>
                                ))}
                              </div>
                              {s.actionKey && (
                                <button
                                  onClick={() => setEditingKey(s.actionKey)}
                                  className="text-xs text-amber-500 hover:text-amber-600 font-semibold cursor-pointer min-w-[70px] text-right"
                                >
                                  {editingKey === s.actionKey ? 'Press key...' : 'Customize'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>General</h4>
                      <div className="space-y-1">
                        {generalShortcuts.map((s, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-default)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                            <div className="flex gap-1">
                              {s.kbd.map(k => (
                                <kbd key={k} className="rounded-md px-2 py-0.5 text-xs font-mono" style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>{k}</kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { keyBindings, setKeyBindings, triggerToast, theme, setTheme, accent, setAccent, demoMode, setDemoMode } = useOutletContext();
  return (
    <div className="px-4 md:px-6 py-4 md:py-5 h-full animate-fade-in">
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
        onClose={null}
      />
    </div>
  );
}
