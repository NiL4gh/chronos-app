import { useState } from 'react'
import {
  Play, Square, Plus, MoreHorizontal, Clock, Target, Calendar, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge'
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table'
import { timeLogs, projects } from '../data/mockData'

const myLogs = timeLogs.filter(l => l.userId === 'u1')

export default function MyTime() {
  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsed, setElapsed] = useState('00:00:00')
  const [currentTask, setCurrentTask] = useState('')
  const [showManualEntry, setShowManualEntry] = useState(false)

  const totalToday = myLogs
    .filter(l => l.date === '2025-05-12')
    .reduce((a, l) => a + l.duration, 0)

  const totalWeek = myLogs.reduce((a, l) => a + l.duration, 0)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Live Timer ──────────────────────────────────────────────────────── */}
      <Card padding="p-6">
        <div className="flex items-center gap-6">
          {/* Timer display */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${timerRunning ? 'bg-emerald-500 animate-pulse-dot' : 'bg-neutral-700'}`} />
              <span className="text-xs text-neutral-500">{timerRunning ? 'Timer running' : 'Timer stopped'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-mono font-semibold text-neutral-100 tabular-nums tracking-tight">
                {timerRunning ? '01:24:38' : elapsed === '00:00:00' ? '00:00:00' : elapsed}
              </span>
            </div>
          </div>

          {/* Task input */}
          <div className="flex-1">
            <label className="text-xs text-neutral-600 mb-1.5 block">What are you working on?</label>
            <input
              value={currentTask}
              onChange={e => setCurrentTask(e.target.value)}
              placeholder="e.g. Hero section responsive layout..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150"
            />
          </div>

          {/* Project select */}
          <div className="w-44">
            <label className="text-xs text-neutral-600 mb-1.5 block">Project</label>
            <select className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 cursor-pointer">
              {projects.filter(p => p.status === 'active').map(p => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Controls */}
          <button
            onClick={() => setTimerRunning(r => !r)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-150 shrink-0 ${
              timerRunning
                ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            {timerRunning ? <Square size={18} /> : <Play size={18} />}
          </button>
        </div>
      </Card>

      {/* ── Personal Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Today', value: totalToday.toFixed(1) + 'h', sub: 'of 8h goal', pct: Math.round((totalToday / 8) * 100) },
          { label: 'This Week', value: totalWeek.toFixed(1) + 'h', sub: 'of 40h goal', pct: Math.round((totalWeek / 40) * 100) },
          { label: 'Billable (week)', value: myLogs.filter(l => l.billable).reduce((a, l) => a + l.duration, 0).toFixed(1) + 'h', sub: '100% billable', pct: 100 },
          { label: 'Entries (week)', value: myLogs.length, sub: 'time entries', pct: null },
        ].map(s => (
          <Card key={s.label} padding="p-4">
            <p className="text-2xl font-semibold font-mono text-neutral-100">{s.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
            <p className="text-xs text-neutral-700">{s.sub}</p>
            {s.pct !== null && (
              <div className="mt-2 h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.pct >= 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                  style={{ width: `${Math.min(100, s.pct)}%` }}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ── Week calendar strip ─────────────────────────────────────────────── */}
      <Card padding="p-4">
        <div className="flex items-center gap-2 mb-4">
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors duration-150">
            <ChevronLeft size={14} />
          </button>
          <h3 className="text-sm font-medium text-neutral-300 flex-1 text-center">Week of May 6 – 12, 2025</h3>
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors duration-150">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[
            { day: 'Mon', date: '6', hours: 7.5 },
            { day: 'Tue', date: '7', hours: 8.0 },
            { day: 'Wed', date: '8', hours: 6.5 },
            { day: 'Thu', date: '9', hours: 7.5 },
            { day: 'Fri', date: '10', hours: 2.5 },
            { day: 'Sat', date: '11', hours: 0 },
            { day: 'Sun', date: '12', hours: 2.7, isToday: true },
          ].map(d => {
            const pct = (d.hours / 8) * 100
            return (
              <div
                key={d.day}
                className={`flex flex-col items-center p-3 rounded-lg ${d.isToday ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-neutral-800 border border-transparent'} transition-colors duration-150 cursor-default`}
              >
                <span className={`text-xs font-medium mb-1 ${d.isToday ? 'text-violet-400' : 'text-neutral-500'}`}>{d.day}</span>
                <span className={`text-lg font-semibold mb-2 ${d.isToday ? 'text-violet-300' : d.hours > 0 ? 'text-neutral-300' : 'text-neutral-700'}`}>{d.date}</span>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.isToday ? 'bg-violet-500' : 'bg-neutral-600'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-neutral-600 mt-1.5">{d.hours > 0 ? d.hours + 'h' : '—'}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* ── My Time Logs ───────────────────────────────────────────────────── */}
      <Card padding="p-0">
        <div className="px-6 pt-5 pb-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-neutral-100">My Time Entries</h3>
            <p className="text-xs text-neutral-500 mt-0.5">All your logged time this period</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowManualEntry(s => !s)}>
            <Plus size={13} />
            {showManualEntry ? 'Cancel' : 'Add Entry'}
          </Button>
        </div>
        {showManualEntry && (
          <div className="px-6 py-4 border-b border-neutral-800">
            <div className="flex items-end gap-4">
              <div className="w-36">
                <Input type="date" label="Date" />
              </div>
              <div className="w-28">
                <Input type="time" label="Start" />
              </div>
              <div className="w-28">
                <Input type="time" label="End" />
              </div>
              <div className="flex-1">
                <Input placeholder="Task description" label="Task" />
              </div>
              <div className="w-36">
                <Input label="Project" placeholder="Select project" />
              </div>
              <Button variant="primary" size="sm">Save</Button>
            </div>
          </div>
        )}
        <Table>
          <TableHead>
            <Th>Project</Th>
            <Th>Task</Th>
            <Th>Date</Th>
            <Th>Start</Th>
            <Th>End</Th>
            <Th>Duration</Th>
            <Th>Source</Th>
            <Th>Billable</Th>
            <Th></Th>
          </TableHead>
          <TableBody>
            {myLogs.map(log => (
              <Tr key={log.id}>
                <Td><span className="font-medium text-neutral-300">{log.projectName}</span></Td>
                <Td><span className="text-neutral-400 max-w-[200px] truncate block">{log.task}</span></Td>
                <Td><span className="font-mono text-xs text-neutral-500">{log.date}</span></Td>
                <Td><span className="font-mono text-xs text-neutral-500">{log.startTime}</span></Td>
                <Td><span className="font-mono text-xs text-neutral-500">{log.endTime}</span></Td>
                <Td><span className="font-mono font-medium text-neutral-200">{log.duration}h</span></Td>
                <Td><TrackingSourceBadge source={log.source} /></Td>
                <Td>
                  <Badge variant={log.billable ? 'success' : 'neutral'}>
                    {log.billable ? 'Billable' : 'Non-bill.'}
                  </Badge>
                </Td>
                <Td>
                  <button className="text-neutral-700 hover:text-neutral-400 transition-colors duration-150">
                    <MoreHorizontal size={14} />
                  </button>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
