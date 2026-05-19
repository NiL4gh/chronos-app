import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Toggle from '../components/ui/Toggle';
import { ProgressBar } from '../components/ui/ProgressBar';
import Input, { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { 
  MessageSquare, Calendar, Layers, GitBranch, Mail, Video, Sun, Moon 
} from 'lucide-react';

export default function Settings() {
  const { triggerToast } = useOutletContext();
  const [activeSection, setActiveSection] = useState('workspace');

  const navItems = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'shortcuts', label: 'Shortcuts' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'billing', label: 'Billing' }
  ];

  // Workspace State
  const [orgName, setOrgName] = useState('Chronos Demo Co.');
  const [industry, setIndustry] = useState('Technology');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [billingRate, setBillingRate] = useState('95');

  const handleSaveWorkspace = () => {
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
    <div className="flex px-8 py-6 gap-6 h-full animate-fade-in" style={{ background: 'var(--bg-base)' }}>
      {/* LEFT SIDEBAR */}
      <div className="w-52 flex-shrink-0 glass-card p-4 self-start">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`text-left text-sm transition-colors ${isActive ? 'font-semibold rounded-r-lg pl-3 pr-3 py-2' : 'rounded-lg px-3 py-2'}`}
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
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Default Billing Rate</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <Input type="number" value={billingRate} onChange={e => setBillingRate(e.target.value)} className="w-24" />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/hr</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
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

        {/* Appearance Section */}
        {activeSection === 'appearance' && (
          <div className="glass-card p-6 space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
            
            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Theme</h4>
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div className="glass-interactive p-4 rounded-xl text-center flex flex-col items-center border border-amber-500 bg-amber-500/5 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-amber-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <Sun size={24} className="mb-2 text-amber-500" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Light</span>
                </div>
                <div className="glass-interactive p-4 rounded-xl text-center flex flex-col items-center opacity-50 cursor-not-allowed relative">
                  <div className="absolute top-2 right-2">
                    <Badge variant="neutral" className="text-[10px]">Coming soon</Badge>
                  </div>
                  <Moon size={24} className="mb-2" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Density</h4>
              <div className="flex items-center gap-2 p-1 rounded-lg w-fit" style={{ background: 'var(--bg-sunken)' }}>
                {['Comfortable', 'Compact', 'Cozy'].map(d => {
                  const val = d.toLowerCase();
                  const isActive = density === val;
                  return (
                    <button
                      key={d}
                      onClick={() => setDensity(val)}
                      className={`px-4 py-1.5 text-sm rounded-md transition-colors ${isActive ? 'bg-amber-500 text-white shadow-sm' : ''}`}
                      style={!isActive ? { color: 'var(--text-secondary)' } : {}}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Sidebar</h4>
              <Toggle 
                label="Collapsed by default" 
                description="Start the app with a minimized sidebar layout" 
                checked={collapsedSidebar} 
                onChange={setCollapsedSidebar} 
              />
            </div>
          </div>
        )}

        {/* Shortcuts Section */}
        {activeSection === 'shortcuts' && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Use these shortcuts to navigate Chronos faster</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Navigation</h4>
                <div className="space-y-1">
                  {[
                    { label: 'Go to Team', kbd: ['T'] },
                    { label: 'Go to Projects', kbd: ['P'] },
                    { label: 'Go to Reports', kbd: ['R'] },
                    { label: 'Go to Invoices', kbd: ['I'] },
                    { label: 'Go to My Time', kbd: ['M'] },
                    { label: 'Go to Settings', kbd: ['G', 'S'] },
                  ].map((s, i) => (
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

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Timer</h4>
                  <div className="space-y-1">
                    {[
                      { label: 'Start / Stop timer', kbd: ['Space'] },
                      { label: 'New manual entry', kbd: ['N'] },
                      { label: 'Open command palette', kbd: ['⌘', 'K'] },
                    ].map((s, i) => (
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

                <div>
                  <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>General</h4>
                  <div className="space-y-1">
                    {[
                      { label: 'Close panel or drawer', kbd: ['Esc'] },
                      { label: 'Open shortcuts reference', kbd: ['?'] },
                      { label: 'Save current form', kbd: ['⌘', 'S'] },
                    ].map((s, i) => (
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
        )}

        {/* Integrations Section */}
        {activeSection === 'integrations' && (
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Integrations</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Connect your tools to Chronos</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { name: 'Slack', desc: 'Get notified in your Slack workspace', icon: MessageSquare },
                { name: 'Google Calendar', desc: 'Sync meetings as time entries', icon: Calendar },
                { name: 'Jira', desc: 'Link time entries to Jira tickets', icon: Layers }, // instructions said Trello (Layers) then list says Jira. I'll use Layers for Jira as instructed
                { name: 'GitHub', desc: 'Auto-log time from commits and PRs', icon: GitBranch },
                { name: 'Gmail', desc: 'Turn emails into time entries', icon: Mail },
                { name: 'Zoom', desc: 'Auto-log meeting durations', icon: Video },
              ].map(integration => (
                <div key={integration.name} className="glass-interactive p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ border: '1px solid var(--border-default)', background: 'var(--bg-sunken)' }}>
                      <integration.icon size={20} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{integration.name}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{integration.desc}</p>
                    </div>
                  </div>
                  <Badge variant="neutral">Coming Soon</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Section */}
        {activeSection === 'billing' && (
          <div className="glass-card p-6 animate-fade-in space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Billing & Plan</h3>
              
              <div className="p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 glass-elevated">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Pro Plan</h4>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>$29/month · billed monthly</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>8 members · 7 projects · Unlimited invoices</p>
                </div>
                <Button variant="secondary">Manage Plan</Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Current Usage</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Team Members</span>
                    <span>8/10 (80%)</span>
                  </div>
                  <ProgressBar value={80} max={100} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Projects</span>
                    <span>7/unlimited</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
                    <div className="h-full rounded-full bg-emerald-500 w-1/4" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>Storage</span>
                    <span>2.4GB/5GB (48%)</span>
                  </div>
                  <ProgressBar value={48} max={100} />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-5 rounded-xl mt-8" style={{ border: '1px solid var(--danger-border)', background: 'var(--danger-subtle)' }}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--danger-text)' }}>Danger Zone</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Export all data</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Download a complete export of your workspace</p>
                  </div>
                  <Button variant="ghost">Export Data</Button>
                </div>
                <div className="h-px w-full my-2" style={{ background: 'var(--danger-border)', opacity: 0.2 }} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Delete workspace</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Permanently delete all data</p>
                  </div>
                  <button 
                    onClick={() => triggerToast("Action required", "Please contact support to delete your workspace.", "warning")}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: '#fee2e2', color: '#ef4444' }}
                  >
                    Delete Workspace
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// Ensure the CheckCircle2 icon is defined for appearance
function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
