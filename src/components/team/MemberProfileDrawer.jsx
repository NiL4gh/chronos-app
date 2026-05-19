import { useState, useEffect } from 'react';
import SlideOutDrawer from '../ui/SlideOutDrawer';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { ActivityBar, ProgressBar } from '../ui/ProgressBar';
import TrackingSourceBadge from '../ui/TrackingSourceBadge';
import { timeLogs, projects } from '../../data/mockData';
import { Clock, FolderKanban, BarChart2, Activity } from 'lucide-react';

// Context controls which tabs are shown:
// 'team'      → Overview, Time Logs, Projects, Activity
// 'dashboard' → Overview, Today
// 'reports'   → Overview, Time Breakdown

const TAB_CONFIG = {
  team: ['Overview', 'Time Logs', 'Projects', 'Activity'],
  dashboard: ['Overview', 'Today'],
  reports: ['Overview', 'Time Breakdown'],
};

const StatusColors = {
  active: 'success',
  idle: 'warning',
  offline: 'neutral',
};

const MemberProfileDrawer = ({ member, context = 'team', initialTab = 'Overview', isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, member]);

  if (!member) return null;

  const tabs = TAB_CONFIG[context] || TAB_CONFIG.team;

  // Filter time logs for this member
  const memberLogs = timeLogs.filter((log) => log.userId === member.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = memberLogs.filter((log) => log.date === todayStr);
  const memberProjects = projects.filter((p) => p.members.includes(member.id));

  const totalHoursWeek = member.hoursWeek;
  const totalHoursToday = member.hoursToday;
  const billableLogs = memberLogs.filter((l) => l.billable);
  const billableHours = billableLogs.reduce((sum, l) => sum + l.duration, 0);

  return (
    <SlideOutDrawer isOpen={isOpen} onClose={onClose} title="Member Profile">
      <div className="space-y-5">
        {/* Header — always shown */}
        <div className="flex items-start gap-4 pb-5 border-b border-[var(--border-default)]">
          <div className="relative">
            <Avatar name={member.name} size="lg" />
            <span
              className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 ${
                member.status === 'active' ? 'bg-emerald-500 status-dot-pulse' :
                member.status === 'idle' ? 'bg-amber-400' : ''
              }`}
              style={{
                borderColor: 'var(--bg-surface)',
                ...(member.status !== 'active' && member.status !== 'idle' ? { background: 'var(--border-strong)' } : {})
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{member.name}</h3>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{member.role}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{member.email}</p>
            <div className="mt-2">
              <Badge variant={StatusColors[member.status]}>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Today', value: totalHoursToday.toFixed(1) + 'h' },
            { label: 'This Week', value: totalHoursWeek.toFixed(1) + 'h' },
            { label: 'Billable', value: billableHours.toFixed(1) + 'h' },
            { label: 'Entries', value: memberLogs.length },
          ].map(s => (
            <div key={s.label} className="bg-[var(--bg-sunken)] rounded-lg p-3">
              <p className="font-mono text-lg font-semibold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--border-default)] -mx-6 px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors duration-150 ${
                activeTab === tab
                  ? 'border-[var(--accent)] text-[var(--accent-text)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pt-2">

          {/* ── OVERVIEW tab ── */}
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              {/* Activity level */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-[var(--text-muted)]">Activity Level</p>
                  <span className="font-mono text-sm text-[var(--text-primary)]">{member.activityLevel}%</span>
                </div>
                <ActivityBar value={member.activityLevel} title={`${member.activityLevel}% Activity`} />
              </div>

              {/* Current task */}
              <div className="glass-card p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1">Currently working on</p>
                <p className="text-sm text-[var(--text-primary)] font-medium">{member.currentTask}</p>
                <p className="text-xs text-[var(--accent-text)] mt-1">{member.currentProject}</p>
              </div>
            </div>
          )}

          {/* ── TIME LOGS tab ── */}
          {activeTab === 'Time Logs' && (
            <div className="space-y-2">
              {memberLogs.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No time entries found.</p>
              ) : memberLogs.map((log) => (
                <div key={log.id} className="glass-card p-3 hover:bg-[var(--bg-sunken)] transition-colors duration-100">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm text-[var(--text-primary)] font-medium leading-tight">{log.task}</p>
                    <TrackingSourceBadge source={log.source} />
                  </div>
                  <p className="text-xs text-[var(--accent-text)]">{log.projectName}</p>
                  <div className="flex items-center gap-3 mt-2 border-t border-[var(--border-default)] pt-2">
                    <span className="font-mono text-xs text-[var(--text-muted)]">{log.date}</span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">{log.startTime}–{log.endTime}</span>
                    <span className="font-mono text-xs text-[var(--text-primary)] font-semibold">{log.duration}h</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PROJECTS tab ── */}
          {activeTab === 'Projects' && (
            <div className="space-y-2">
              {memberProjects.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No projects assigned.</p>
              ) : memberProjects.map((project) => {
                const pct = Math.round((project.loggedHours / project.goalHours) * 100);
                return (
                  <div key={project.id} className="glass-card p-4 hover:bg-[var(--bg-sunken)] transition-colors duration-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <p className="text-sm font-medium text-[var(--text-primary)]">{project.name}</p>
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded border font-medium ${
                        project.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-[var(--bg-sunken)] text-[var(--text-muted)] border-[var(--border-default)]'
                      }`}>{project.status}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-2">{project.client}</p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--text-muted)]">Progress</span>
                      <span className="font-mono text-xs text-[var(--text-primary)]">{project.loggedHours}h / {project.goalHours}h</span>
                    </div>
                    <ProgressBar percent={pct} />
                  </div>
                );
              })}
            </div>
          )}

          {/* ── ACTIVITY tab ── */}
          {activeTab === 'Activity' && (
            <div className="space-y-3">
              <div className="glass-card p-4">
                <p className="text-xs text-[var(--text-muted)] mb-3">Weekly Activity Heatmap</p>
                <div className="grid grid-cols-5 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                    const val = [72, 45, 88, 60, member.activityLevel][i];
                    const color = val > 75 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-red-500';
                    return (
                      <div key={day} className="text-center">
                        <div className={`h-16 rounded-md ${color} mb-1`} style={{ opacity: val / 100 }} />
                        <p className="text-xs text-[var(--text-muted)]">{day}</p>
                        <p className="font-mono text-xs text-[var(--text-primary)]">{val}%</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-3 text-center">Full activity data requires Chronos Desktop App</p>
              </div>
            </div>
          )}

          {/* ── TODAY tab (dashboard context) ── */}
          {activeTab === 'Today' && (
            <div className="space-y-2">
              {todayLogs.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No entries logged today.</p>
              ) : todayLogs.map((log) => (
                <div key={log.id} className="glass-card p-3 hover:bg-[var(--bg-sunken)] transition-colors duration-100">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{log.task}</p>
                    <TrackingSourceBadge source={log.source} />
                  </div>
                  <p className="text-xs text-[var(--accent-text)]">{log.projectName}</p>
                  <span className="font-mono text-xs text-[var(--text-primary)] font-semibold">{log.duration}h</span>
                </div>
              ))}
            </div>
          )}

          {/* ── TIME BREAKDOWN tab (reports context) ── */}
          {activeTab === 'Time Breakdown' && (
            <div className="space-y-3">
              <div className="glass-card p-4">
                <p className="text-xs text-[var(--text-muted)] mb-3">Hours by Project</p>
                {memberProjects.map((project) => {
                  const projectLogs = memberLogs.filter((l) => l.projectId === project.id);
                  const hours = projectLogs.reduce((sum, l) => sum + l.duration, 0);
                  if (hours === 0) return null;
                  const maxHours = 8;
                  const pct = Math.min(100, Math.round((hours / maxHours) * 100));
                  return (
                    <div key={project.id} className="mb-3 last:mb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-primary)]">{project.name}</span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">{hours.toFixed(1)}h</span>
                      </div>
                      <ProgressBar percent={pct} />
                    </div>
                  );
                })}
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--text-muted)]">Billable ratio</p>
                  <p className="font-mono text-sm text-[var(--text-primary)]">
                    {memberLogs.length > 0
                      ? Math.round((billableLogs.length / memberLogs.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </SlideOutDrawer>
  );
};

export default MemberProfileDrawer;
