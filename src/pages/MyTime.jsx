import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Play, Square, Plus, MoreHorizontal, Clock, Target, Calendar, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge'
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table'
import { timeLogs, projects } from '../data/mockData'
import EmptyState from '../components/ui/EmptyState'

const myLogs = timeLogs.filter(l => l.userId === 'u1')

export default function MyTime() {
  const { timerRunning, timerSeconds, startTimer, stopTimer } = useOutletContext()
  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0')
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const [currentTask, setCurrentTask] = useState('')
  const [expandedDate, setExpandedDate] = useState(new Date().toISOString().split('T')[0])
  const [showManualEntry, setShowManualEntry] = useState(false)

  const totalToday = myLogs
    .filter(l => l.date === '2025-05-12')
    .reduce((a, l) => a + l.duration, 0)

  const totalWeek = myLogs.reduce((a, l) => a + l.duration, 0)

  return (
    <div style={{ background: 'var(--bg-base)' }} className="px-8 py-6 animate-fade-in space-y-6">

      {/* ── Live Timer ──────────────────────────────────────────────────────── */}
      <div 
        className="glass-card p-6" 
        style={{ 
          borderLeft: timerRunning ? '3px solid #10b981' : '3px solid var(--border-strong)',
          boxShadow: timerRunning ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none'
        }}
      >
        <div className="flex items-center gap-6">
          {/* Timer display */}
          <div className="flex-1 pl-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${timerRunning ? 'bg-emerald-500 animate-pulse-dot' : 'bg-[var(--text-muted)]'}`} />
              <span className={`text-xs font-medium transition-colors duration-300 ${timerRunning ? 'text-emerald-600' : 'text-[var(--text-muted)]'}`}>{timerRunning ? 'Timer running' : 'Timer stopped'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-mono font-semibold tabular-nums tracking-tight text-[var(--text-primary)]">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          {/* Task input */}
          <div className="flex-1">
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block uppercase tracking-wider">What are you working on?</label>
            <Input
              value={currentTask}
              onChange={e => setCurrentTask(e.target.value)}
              placeholder="e.g. Hero section responsive layout..."
            />
          </div>

          {/* Project select */}
          <div className="w-44">
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block uppercase tracking-wider">Project</label>
            <Select className="w-full">
              {projects.filter(p => p.status === 'active').map(p => (
                <option key={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>

          {/* Controls */}
          {timerRunning ? (
            <button
              onClick={() => stopTimer()}
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
            >
              <Square size={18} />
            </button>
          ) : (
            <Button
              variant="primary"
              onClick={() => startTimer(currentTask)}
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            >
              <Play size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Personal Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Today', value: totalToday.toFixed(1) + 'h', sub: 'of 8h goal', pct: Math.round((totalToday / 8) * 100) },
          { label: 'This Week', value: totalWeek.toFixed(1) + 'h', sub: 'of 40h goal', pct: Math.round((totalWeek / 40) * 100) },
          { label: 'Billable (week)', value: myLogs.filter(l => l.billable).reduce((a, l) => a + l.duration, 0).toFixed(1) + 'h', sub: '100% billable', pct: 100 },
          { label: 'Entries (week)', value: myLogs.length, sub: 'time entries', pct: null },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-2xl font-semibold font-mono text-[var(--text-primary)]">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
            <p className="text-xs text-[var(--text-secondary)]">{s.sub}</p>
            {s.pct !== null && (
              <div className="mt-2 h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${Math.min(100, s.pct)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Week calendar strip ─────────────────────────────────────────────── */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150">
            <ChevronLeft size={14} />
          </button>
          <h3 className="text-sm font-medium text-[var(--text-primary)] flex-1 text-center">Timesheet</h3>
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {(() => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
            const monday = new Date(today);
            monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
            const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return Array.from({ length: 7 }, (_, i) => {
              const d = new Date(monday);
              d.setDate(monday.getDate() + i);
              const fullDate = d.toISOString().split('T')[0];
              const dayLogs = myLogs.filter(l => l.date === fullDate);
              const hours = dayLogs.reduce((a, l) => a + l.duration, 0);
              return { day: DAY_LABELS[i], date: String(d.getDate()), fullDate, hours, isToday: fullDate === todayStr };
            });
          })().map(d => {
            const pct = (d.hours / 8) * 100
            const isExpanded = expandedDate === d.fullDate
            
            let style = { background: 'var(--bg-sunken)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' };
            if (isExpanded) {
              style = { background: 'var(--accent)', border: '1px solid transparent', color: 'white' };
            } else if (d.isToday) {
              style = { background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)' };
            }
            
            return (
              <button
                key={d.day}
                onClick={() => setExpandedDate(isExpanded ? null : d.fullDate)}
                className="flex flex-col items-center p-3 rounded-lg transition-colors duration-150"
                style={style}
              >
                <span className={`text-xs font-medium mb-1 ${isExpanded ? 'text-white' : d.isToday ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`}>{d.day}</span>
                <span className={`text-lg font-semibold mb-2 ${isExpanded ? 'text-white' : d.isToday ? 'text-[var(--accent-text)]' : d.hours > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{d.date}</span>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div
                    className={`h-full rounded-full ${isExpanded ? 'bg-white' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <span className={`text-xs font-mono mt-1.5 ${isExpanded ? 'text-white' : 'text-[var(--text-muted)]'}`}>{d.hours > 0 ? d.hours + 'h' : '—'}</span>
              </button>
            )
          })}
        </div>
      </div>

      {expandedDate && (
        <div className="glass-card p-4 animate-fade-in" style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {new Date(expandedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <span className="font-mono text-sm text-[var(--text-primary)] font-semibold">
              {timeLogs.filter(l => l.userId === 'u1' && l.date === expandedDate).reduce((a, l) => a + l.duration, 0).toFixed(1)}h
            </span>
          </div>
          <div className="space-y-2">
            {timeLogs.filter(l => l.userId === 'u1' && l.date === expandedDate).length === 0 ? (
              <EmptyState icon={Clock} title="No entries for this day" description="Start the timer or add a manual entry." />
            ) : (
              timeLogs.filter(l => l.userId === 'u1' && l.date === expandedDate).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-[var(--border-default)] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: projects.find(p => p.id === entry.projectId)?.color || '#525252' }} />
                    <span className="text-sm text-[var(--text-primary)] font-medium">{entry.task}</span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-xs text-[var(--text-muted)]">{entry.projectName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--text-secondary)]">{entry.startTime} – {entry.endTime}</span>
                    <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">{entry.duration}h</span>
                    <TrackingSourceBadge source={entry.source} />
                    {entry.billable && <span className="text-emerald-600 text-xs">$</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── My Time Logs ───────────────────────────────────────────────────── */}
      <div className="glass-card p-0">
        <div className="px-6 pt-5 pb-4 border-b border-[var(--border-default)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-[var(--text-primary)]">My Time Entries</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">All your logged time this period</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowManualEntry(s => !s)}>
            <Plus size={13} />
            {showManualEntry ? 'Cancel' : 'Add Entry'}
          </Button>
        </div>
        {showManualEntry && (
          <div className="px-6 py-4 border-b border-[var(--border-default)]">
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
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">Project</Th>
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">Task</Th>
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">Date</Th>
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">Start</Th>
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">End</Th>
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">Duration</Th>
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">Source</Th>
            <Th className="text-[var(--text-muted)] text-xs uppercase tracking-wider">Billable</Th>
            <Th></Th>
          </TableHead>
          <TableBody>
            {myLogs.map(log => (
              <Tr key={log.id}>
                <Td><span className="font-medium text-[var(--text-primary)]">{log.projectName}</span></Td>
                <Td><span className="text-[var(--text-secondary)] max-w-[200px] truncate block">{log.task}</span></Td>
                <Td><span className="font-mono text-xs text-[var(--text-muted)]">{log.date}</span></Td>
                <Td><span className="font-mono text-xs text-[var(--text-muted)]">{log.startTime}</span></Td>
                <Td><span className="font-mono text-xs text-[var(--text-muted)]">{log.endTime}</span></Td>
                <Td><span className="font-mono font-medium text-[var(--text-primary)]">{log.duration}h</span></Td>
                <Td><TrackingSourceBadge source={log.source} /></Td>
                <Td>
                  <Badge variant={log.billable ? 'success' : 'neutral'}>
                    {log.billable ? 'Billable' : 'Non-bill.'}
                  </Badge>
                </Td>
                <Td>
                  <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150">
                    <MoreHorizontal size={14} />
                  </button>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
