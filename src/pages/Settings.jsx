import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Toggle from '../components/ui/Toggle';
import { ProgressBar } from '../components/ui/ProgressBar';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { ACCENTS, THEME_OPTIONS } from '../lib/theme';

export default function Settings() {
  const { keyBindings, setKeyBindings, triggerToast, theme, setTheme, accent, setAccent } = useOutletContext();
  const [activeSection, setActiveSection] = useState('workspace');
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    if (!editingKey) return;
    const handleCapture = (e) => {
      e.preventDefault();
      e.stopPropagation();

      let key = e.key;
      if (key === ' ') key = 'Space';
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) return;

      setKeyBindings(prev => ({
        ...prev,
        [editingKey]: key
      }));
      triggerToast('Shortcut updated', `Action updated to key: "${key.toUpperCase()}"`, 'success');
      setEditingKey(null);
    };

    window.addEventListener('keydown', handleCapture, true);
    return () => window.removeEventListener('keydown', handleCapture, true);
  }, [editingKey, setKeyBindings, triggerToast]);

  const navItems = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'shortcuts', label: 'Shortcuts' },
  ];

  // Workspace State — persisted
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

  return (
    <div className="px-4 md:px-6 py-4 md:py-5 h-full animate-fade-in" style={{ background: 'transparent' }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your workspace, profile, and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-52 flex-shrink-0 glass-card p-4 self-start">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        <nav className="flex md:flex-col gap-2 md:gap-1 overflow-x-auto w-full pb-2 md:pb-0">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`shrink-0 text-center md:text-left text-sm transition-colors ${isActive ? 'font-semibold rounded-lg md:rounded-l-none md:rounded-r-lg px-3 py-2' : 'rounded-lg px-3 py-2'}`}
                style={isActive ? {
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-text)',
                  borderLeft: '3px solid var(--accent)'
                } : {
                  color: 'var(--text-secondary)'
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

      {/* RIGHT CONTENT */}
      <div className="flex-1 overflow-y-auto pb-12">
        
        {/* Workspace Section */}
        {activeSection === 'workspace' && (
          <div className="glass-card p-6 space-y-5 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Workspace Settings</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Configure your organization settings</p>
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
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={dailyTarget}
                    onChange={e => setDailyTarget(e.target.value)}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hours you aim to work per day</span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Weekly Hours Target</label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={weeklyTarget}
                    onChange={e => setWeeklyTarget(e.target.value)}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Hours you aim to work per week</span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Default Hourly Rate ($/hr)</label>
                  <Input
                    type="number"
                    min="0"
                    value={billingRate}
                    onChange={e => setBillingRate(e.target.value)}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Used in billing calculations on Reports</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSaveWorkspace} variant="primary">Save Changes</Button>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="glass-card p-6 space-y-5 animate-fade-in">
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Profile</h3>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <Avatar name="Niloy Pal" size="xl" />
              <button 
                className="mt-3 text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)', hoverBackground: 'var(--bg-sunken)' }}
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
                <div className="px-3 py-2 bg-[var(--bg-sunken)] dark:bg-[var(--bg-sunken)] rounded-md text-sm text-[var(--text-secondary)] cursor-not-allowed">
                  Admin
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <Button onClick={handleSaveProfile} variant="primary">Save Profile</Button>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Email Notifications</h4>
                <div className="space-y-4">
                  <Toggle 
                    label="Invoice sent" 
                    description="Get notified when an invoice is sent" 
                    checked={notifState.emailInvoice} 
                    onChange={() => toggleNotif('emailInvoice')} 
                  />
                  <Toggle 
                    label="Overdue invoice" 
                    description="Alert when invoice becomes overdue" 
                    checked={notifState.emailOverdue} 
                    onChange={() => toggleNotif('emailOverdue')} 
                  />
                  <Toggle 
                    label="Weekly team summary" 
                    description="Sunday evening team digest" 
                    checked={notifState.emailTeamSummary} 
                    onChange={() => toggleNotif('emailTeamSummary')} 
                  />
                  <Toggle 
                    label="Weekly report" 
                    description="Auto-generated Monday morning report" 
                    checked={notifState.weeklyReport} 
                    onChange={() => toggleNotif('weeklyReport')} 
                  />
                </div>
              </div>

              <div className="pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <h4 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>In-App Notifications</h4>
                <div className="space-y-4">
                  <Toggle 
                    label="Timer reminders" 
                    description="Reminder if no timer started by 9am" 
                    checked={notifState.inAppTimer} 
                    onChange={() => toggleNotif('inAppTimer')} 
                  />
                  <Toggle 
                    label="Budget alerts" 
                    description="Alert when project hits 80% budget" 
                    checked={notifState.inAppBudget} 
                    onChange={() => toggleNotif('inAppBudget')} 
                  />
                  <Toggle 
                    label="Daily digest" 
                    description="End-of-day summary of team activity" 
                    checked={notifState.dailyDigest} 
                    onChange={() => toggleNotif('dailyDigest')} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance */}
        {activeSection === 'appearance' && (
          <div className="glass-card p-6 space-y-8 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose your theme and accent color.</p>
            </div>

            {/* Theme */}
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

            {/* Accent */}
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
          </div>
        )}

        {/* Shortcuts Section */}
        {activeSection === 'shortcuts' && (() => {
          const navShortcuts = [
            { label: 'Go to Team', kbd: ['G', keyBindings.goTeam.toUpperCase()], actionKey: 'goTeam' },
            { label: 'Go to Projects', kbd: ['G', keyBindings.goProjects.toUpperCase()], actionKey: 'goProjects' },
            { label: 'Go to Reports', kbd: ['G', keyBindings.goReports.toUpperCase()], actionKey: 'goReports' },
            { label: 'Go to Invoices', kbd: ['G', keyBindings.goInvoices.toUpperCase()], actionKey: 'goInvoices' },
            { label: 'Go to My Time', kbd: ['G', keyBindings.goMyTime.toUpperCase()], actionKey: 'goMyTime' },
            { label: 'Go to Settings', kbd: ['G', keyBindings.goSettings.toUpperCase()], actionKey: 'goSettings' },
          ];

          const timerShortcuts = [
            { label: 'Start / Stop timer', kbd: [keyBindings.toggleTimer.toUpperCase(), 'Space'], actionKey: 'toggleTimer' },
            { label: 'New manual entry', kbd: [keyBindings.newEntry.toUpperCase()], actionKey: 'newEntry' },
            { label: 'Open command palette', kbd: [keyBindings.openPalette.toUpperCase(), '⌘ K'], actionKey: 'openPalette' },
          ];

          const generalShortcuts = [
            { label: 'Close panel or drawer', kbd: ['Esc'] },
            { label: 'Open shortcuts reference', kbd: ['?'] },
            { label: 'Save current form', kbd: ['⌘', 'S'] },
          ];

          return (
            <div className="glass-card p-6 animate-fade-in">
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
