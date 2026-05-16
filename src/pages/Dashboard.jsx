import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Clock, TrendingUp, TrendingDown, Layers, DollarSign,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Zap,
} from 'lucide-react'
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { ActivityBar } from '../components/ui/ProgressBar'
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge'
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table'
import { dashboardMetrics, teamMembers, timeLogs } from '../data/mockData'
import MemberProfileDrawer from '../components/team/MemberProfileDrawer';

function MetricCard({ icon: Icon, label, value, delta, unit = '', accentColor = 'text-violet-400' }) {
  const isPositive = delta >= 0
  return (
    <Card padding="p-5" className="animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-neutral-800`}>
          <Icon size={16} className={accentColor} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta)}{typeof delta === 'number' && delta % 1 !== 0 ? '' : ''}
        </span>
      </div>
      <p className="text-2xl font-semibold text-neutral-100 font-mono tracking-tight">
        {value}<span className="text-sm font-normal text-neutral-500 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
    </Card>
  )
}

function StatusDot({ status }) {
  const map = {
    active: 'bg-emerald-500 animate-pulse-dot',
    idle: 'bg-amber-500',
    offline: 'bg-neutral-700',
  }
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${map[status] ?? map.offline}`} />
}

function StatusBadge({ status }) {
  const map = { active: 'success', idle: 'warning', offline: 'neutral' }
  return <Badge variant={map[status] ?? 'neutral'}><StatusDot status={status} />{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

export default function Dashboard() {
  const { role } = useOutletContext();
  const [profileMember, setProfileMember] = useState(null);
  const m = dashboardMetrics
  const recentLogs = timeLogs.slice(0, 7)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Metric Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        <MetricCard
          icon={Clock}
          label="Total Team Hours Today"
          value={m.totalHoursToday}
          delta={m.totalHoursTodayDelta}
          unit="hrs"
          accentColor="text-violet-400"
        />
        <MetricCard
          icon={Layers}
          label="Active Projects"
          value={m.activeProjects}
          delta={m.activeProjectsDelta}
          accentColor="text-sky-400"
        />
        <MetricCard
          icon={DollarSign}
          label="Project Profitability Margin"
          value={`${m.profitabilityMargin}%`}
          delta={m.profitabilityDelta}
          accentColor="text-emerald-400"
        />
      </div>

      {/* ── Team Pulse + Weekly Bar Chart ──────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-6">

        {/* Team Pulse — admin only */}
        {role === 'admin' && (
        <Card className="col-span-3" padding="p-0">
          <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Pulse</CardTitle>
                <CardDescription>Live activity — updates every 30s</CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                <span className="text-xs text-neutral-600">Live</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-neutral-800/60">
            {teamMembers.filter(m => m.status !== 'offline').map(member => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-neutral-800/30 transition-colors duration-100">
                <Avatar name={member.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <button
                      onClick={() => setProfileMember(member)}
                      className="text-sm font-medium text-neutral-200 hover:text-violet-400 transition-colors duration-150 text-left"
                    >
                      {member.name}
                    </button>
                    <StatusBadge status={member.status} />
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{member.currentTask}</p>
                </div>
                <div className="w-28 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-600">{member.projectName}</span>
                    <span className="text-xs font-mono text-neutral-500">{member.activityLevel}%</span>
                  </div>
                  <ActivityBar value={member.activityLevel} />
                </div>
                <div className="w-16 text-right shrink-0">
                  <p className="text-sm font-mono text-neutral-300">{member.hoursToday}h</p>
                  <p className="text-xs text-neutral-600">today</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        )}

        {/* Weekly Hours — 2/5 */}
        <Card className="col-span-2" padding="p-6">
          <CardHeader>
            <div>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Team hours by day</CardDescription>
            </div>
            <Badge variant="violet">
              <Zap size={10} />
              {m.weeklyHours.reduce((a, b) => a + b.hours, 0).toFixed(1)}h total
            </Badge>
          </CardHeader>

          {/* Mini bar chart */}
          <div className="flex items-end gap-2 h-28 mt-2">
            {m.weeklyHours.map((d, i) => {
              const max = Math.max(...m.weeklyHours.map(x => x.hours))
              const pct = (d.hours / max) * 100
              const isToday = i === m.weeklyHours.length - 1
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-mono text-neutral-500">{d.hours}</span>
                  <div className="w-full rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-700 ${isToday ? 'bg-violet-500' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? 'text-violet-400 font-medium' : 'text-neutral-600'}`}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── Recent Time Logs ───────────────────────────────────────────────── */}
      <Card padding="p-0">
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <CardTitle>Recent Time Logs</CardTitle>
            <CardDescription>All team entries from the last 48 hours</CardDescription>
          </div>
          <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors duration-150">
            View all →
          </button>
        </div>
        <Table>
          <TableHead>
            <Th>Member</Th>
            <Th>Project</Th>
            <Th>Task</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Duration</Th>
            <Th>Source</Th>
            <Th>Billable</Th>
            <Th></Th>
          </TableHead>
          <TableBody>
            {(role === 'employee' ? recentLogs.filter(log => log.userId === 'u1') : recentLogs).map(log => (
              <Tr key={log.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={log.userName} size="sm" />
                    <span className="font-medium text-neutral-200">{log.userName}</span>
                  </div>
                </Td>
                <Td>
                  <span className="text-neutral-400">{log.projectName}</span>
                </Td>
                <Td>
                  <span className="max-w-[200px] truncate block text-neutral-300">{log.task}</span>
                </Td>
                <Td>
                  <span className="font-mono text-neutral-500 text-xs">{log.date}</span>
                </Td>
                <Td>
                  <span className="font-mono text-neutral-500 text-xs">{log.startTime} – {log.endTime}</span>
                </Td>
                <Td>
                  <span className="font-mono font-medium text-neutral-200">{log.duration}h</span>
                </Td>
                <Td>
                  <TrackingSourceBadge source={log.source} />
                </Td>
                <Td>
                  <Badge variant={log.billable ? 'success' : 'neutral'}>
                    {log.billable ? 'Billable' : 'Non-bill.'}
                  </Badge>
                </Td>
                <Td>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-neutral-600 hover:text-neutral-300">
                    <MoreHorizontal size={14} />
                  </button>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </Card>
      <MemberProfileDrawer
        member={profileMember}
        context="dashboard"
        isOpen={profileMember !== null}
        onClose={() => setProfileMember(null)}
      />
    </div>
  )
}
