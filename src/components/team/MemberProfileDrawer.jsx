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
      {/* Header — always shown */}
      <div className="flex items-start gap-4 pb-5 border-b border-neutral-800">
        <div className="relative">
          <Avatar name={member.name} size="lg" />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-900 ${
            member.status === 'active' ? 'bg-emerald-500' :
            member.status === 'idle' ? 'bg-amber-500' : 'bg-neutral-600'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-100">{member.name}</h3>
          <p className="text-sm text-neutral-400 mt-0.5">{member.role}</p>
          <p className="text-xs text-neutral-600 mt-0.5">{member.email}</p>
          <div className="mt-2">
            <Badge variant={StatusColors[member.status]}>
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-800 -mx-6 px-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors duration-150 ${
              activeTab === tab
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
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
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-700/60 bg-neutral-800/60 p-4">
                <p className="text-xs text-neutral-500 mb-1">Today</p>
                <p className="font-mono text-xl font-semibold text-neutral-100">{totalHoursToday.toFixed(1)}h</p>
              </div>
              <div className="rounded-lg border border-neutral-700/60 bg-neutral-800/60 p-4">
                <p className="text-xs text-neutral-500 mb-1">This Week</p>
                <p className="font-mono text-xl font-semibold text-neutral-100">{totalHoursWeek.toFixed(1)}h</p>
              </div>
              <div className="rounded-lg border border-neutral-700/60 bg-neutral-800/60 p-4">
                <p className="text-xs text-neutral-500 mb-1">Billable (week)</p>
                <p className="font-mono text-xl font-semibold text-neutral-100">{billableHours.toFixed(1)}h</p>
              </div>
              <div className="rounded-lg border border-neutral-700/60 bg-neutral-800/60 p-4">
                <p className="text-xs text-neutral-500 mb-1">Total Entries</p>
                <p className="font-mono text-xl font-semibold text-neutral-100">{memberLogs.length}</p>
              </div>
            </div>

            {/* Activity level */}
            <div className="rounded-lg border border-neutral-700/60 bg-neutral-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-neutral-400">Activity Level</p>
                <span className="font-mono text-sm text-neutral-300">{member.activityLevel}%</span>
              </div>
              <ActivityBar value={member.activityLevel} title={`${member.activityLevel}% Activity`} />
            </div>

            {/* Current task */}
            <div className="rounded-lg border border-neutral-700/60 bg-neutral-800/60 p-4">
              <p className="text-xs text-neutral-500 mb-1">Currently working on</p>
              <p className="text-sm text-neutral-200">{member.currentTask}</p>
              <p className="text-xs text-violet-400 mt-1">{member.currentProject}</p>
            </div>
          </div>
        )}

        {/* ── TIME LOGS tab ── */}
        {activeTab === 'Time Logs' && (
          <div className="space-y-2">
            {memberLogs.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">No time entries found.</p>
            ) : memberLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-neutral-700/60 bg-neutral-800/60 p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm text-neutral-200 font-medium leading-tight">{log.task}</p>
                  <TrackingSourceBadge source={log.source} />
                </div>
                <p className="text-xs text-violet-400">{log.projectName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-mono text-xs text-neutral-500">{log.date}</span>
                  <span className="font-mono text-xs text-neutral-500">{log.startTime}–{log.endTime}</span>
                  <span className="font-mono text-xs text-neutral-300 font-semibold">{log.duration}h</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROJECTS tab ── */}
        {activeTab === 'Projects' && (
          <div className="space-y-2">
            {memberProjects.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">No projects assigned.</p>
            ) : memberProjects.map((project) => {
              const pct = Math.round((project.loggedHours / project.goalHours) * 100);
              return (
                <div key={project.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                    <p className="text-sm font-medium text-neutral-200">{project.name}</p>
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded border font-medium ${
                      project.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-neutral-700/50 text-neutral-400 border-neutral-700'
                    }`}>{project.status}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">{project.client}</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-neutral-500">Progress</span>
                    <span className="font-mono text-xs text-neutral-400">{project.loggedHours}h / {project.goalHours}h</span>
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
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-xs text-neutral-500 mb-3">Weekly Activity Heatmap</p>
              <div className="grid grid-cols-5 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                  const val = [72, 45, 88, 60, member.activityLevel][i];
                  const color = val > 75 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={day} className="text-center">
                      <div className={`h-16 rounded-md ${color} opacity-${Math.round(val / 10) * 10} mb-1`} style={{ opacity: val / 100 }} />
                      <p className="text-xs text-neutral-600">{day}</p>
                      <p className="font-mono text-xs text-neutral-500">{val}%</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-600 mt-3 text-center">Full activity data requires Chronos Desktop App</p>
            </div>
          </div>
        )}

        {/* ── TODAY tab (dashboard context) ── */}
        {activeTab === 'Today' && (
          <div className="space-y-2">
            {todayLogs.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-8">No entries logged today.</p>
            ) : todayLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm text-neutral-200">{log.task}</p>
                  <TrackingSourceBadge source={log.source} />
                </div>
                <p className="text-xs text-violet-400">{log.projectName}</p>
                <span className="font-mono text-xs text-neutral-300 font-semibold">{log.duration}h</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TIME BREAKDOWN tab (reports context) ── */}
        {activeTab === 'Time Breakdown' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-xs text-neutral-500 mb-3">Hours by Project</p>
              {memberProjects.map((project) => {
                const projectLogs = memberLogs.filter((l) => l.projectId === project.id);
                const hours = projectLogs.reduce((sum, l) => sum + l.duration, 0);
                if (hours === 0) return null;
                const maxHours = 8;
                const pct = Math.min(100, Math.round((hours / maxHours) * 100));
                return (
                  <div key={project.id} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-300">{project.name}</span>
                      <span className="font-mono text-xs text-neutral-400">{hours.toFixed(1)}h</span>
                    </div>
                    <ProgressBar percent={pct} />
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">Billable ratio</p>
                <p className="font-mono text-sm text-neutral-200">
                  {memberLogs.length > 0
                    ? Math.round((billableLogs.length / memberLogs.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </SlideOutDrawer>
);
};

export default MemberProfileDrawer;
