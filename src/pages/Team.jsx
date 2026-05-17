import { useState } from 'react'
import { Search, UserPlus, MoreHorizontal, Mail, Shield, Clock } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { ActivityBar } from '../components/ui/ProgressBar'
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table'
import { teamMembers } from '../data/mockData'
import MemberProfileDrawer from '../components/team/MemberProfileDrawer';

function StatusDot({ status }) {
  const colors = { active: 'bg-emerald-500', idle: 'bg-amber-500', offline: 'bg-neutral-600' }
  return <span className={`w-2 h-2 rounded-full shrink-0 ${colors[status] ?? colors.offline}`} />
}

export default function Team() {
  const [profileMember, setProfileMember] = useState(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState('Overview');
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')

  const filtered = teamMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  )

  const statusVariant = { active: 'success', idle: 'warning', offline: 'neutral' }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-64 rounded-lg border border-neutral-700 bg-neutral-800 pl-8 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150"
            />
          </div>
          <div className="flex rounded-lg border border-neutral-700 overflow-hidden">
            {['grid', 'table'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${view === v ? 'bg-neutral-700 text-neutral-100' : 'bg-transparent text-neutral-500 hover:text-neutral-300'}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <Button variant="primary" size="sm">
          <UserPlus size={13} />
          Invite Member
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: teamMembers.length },
          { label: 'Active Now', value: teamMembers.filter(m => m.status === 'active').length },
          { label: 'Idle', value: teamMembers.filter(m => m.status === 'idle').length },
          { label: 'Avg Hours / Week', value: (teamMembers.reduce((a, m) => a + m.hoursWeek, 0) / teamMembers.length).toFixed(1) + 'h' },
        ].map(stat => (
          <Card key={stat.label} padding="p-4" className="flex flex-col gap-1.5">
            <p className="text-2xl font-semibold font-mono text-neutral-100 tracking-tight">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
            <div className="h-px w-8 bg-violet-500/30 rounded-full mt-0.5" />
          </Card>
        ))}
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(member => (
            <Card key={member.id} padding="p-5" className="group hover:border-neutral-700 hover:bg-neutral-800/30 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={member.name} size="lg" />
                    <StatusDot status={member.status} className="absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div>
                    <button
                      onClick={() => { setDrawerInitialTab('Overview'); setProfileMember(member); }}
                      className="text-sm font-medium text-neutral-200 hover:text-violet-400 transition-colors duration-150 text-left"
                    >
                      {member.name}
                    </button>
                    <p className="text-xs text-neutral-500">{member.role}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-neutral-300">
                  <MoreHorizontal size={15} />
                </button>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Status</span>
                  <Badge variant={statusVariant[member.status] ?? 'neutral'}>
                    <StatusDot status={member.status} />
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Project</span>
                  <span className="text-xs text-neutral-400 truncate ml-2">{member.currentProject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Hours this week</span>
                  <span className="text-xs font-mono text-neutral-300">{member.hoursWeek}h</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-neutral-600">Activity level</span>
                  <span className="text-xs font-mono text-neutral-500">{member.activityLevel}%</span>
                </div>
                <ActivityBar value={member.activityLevel} />
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-2">
                <button
                  onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors duration-150"
                >
                  <Mail size={12} />
                  Message
                </button>
                <button
                  onClick={() => { setDrawerInitialTab('Time Logs'); setProfileMember(member); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs text-violet-400/70 hover:text-violet-400 hover:bg-violet-500/10 transition-colors duration-150"
                >
                  <Clock size={12} />
                  View Logs
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <Card padding="p-0">
          <Table>
            <TableHead>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Current Project</Th>
              <Th>Today</Th>
              <Th>This Week</Th>
              <Th>Activity</Th>
              <Th></Th>
            </TableHead>
            <TableBody>
              {filtered.map(member => (
                <Tr key={member.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name} size="sm" />
                      <div>
                        <button
                          onClick={() => { setDrawerInitialTab('Overview'); setProfileMember(member); }}
                          className="font-medium text-neutral-200 hover:text-violet-400 transition-colors duration-150"
                        >
                          {member.name}
                        </button>
                        <p className="text-xs text-neutral-600">{member.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><span className="text-neutral-400">{member.role}</span></Td>
                  <Td>
                    <Badge variant={statusVariant[member.status] ?? 'neutral'}>
                      <StatusDot status={member.status} />
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </Td>
                  <Td><span className="text-neutral-400">{member.currentProject}</span></Td>
                  <Td><span className="font-mono text-neutral-300">{member.hoursToday}h</span></Td>
                  <Td><span className="font-mono text-neutral-300">{member.hoursWeek}h</span></Td>
                  <Td>
                    <div className="w-24">
                      <ActivityBar value={member.activityLevel} />
                    </div>
                  </Td>
                  <Td>
                    <button className="text-neutral-600 hover:text-neutral-300 transition-colors duration-150">
                      <MoreHorizontal size={14} />
                    </button>
                  </Td>
                </Tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <MemberProfileDrawer
        member={profileMember}
        context="team"
        initialTab={drawerInitialTab}
        isOpen={profileMember !== null}
        onClose={() => setProfileMember(null)}
      />
    </div>
  )
}
