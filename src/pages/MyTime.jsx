import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Play, Square, Plus, MoreHorizontal, Clock, Target, Calendar, ChevronLeft, ChevronRight,
  Edit3, Trash2, Copy, DollarSign, RotateCcw,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge'
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table'
import { timeLogs, projects } from '../data/mockData'
import EmptyState from '../components/ui/EmptyState'

export default function MyTime() {
  const { timerRunning, timerSeconds, startTimer, stopTimer, logs, setLogs, setDrawerOpen, triggerToast } = useOutletContext()
  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0')
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const [currentTask, setCurrentTask] = useState('')
  const [expandedDate, setExpandedDate] = useState(new Date().toISOString().split('T')[0])
  const [baseDate, setBaseDate] = useState(new Date())
  const [contextMenu, setContextMenu] = useState({ open: false, logId: null, x: 0, y: 0 })
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25
  const contextRef = useRef(null)

  const myLogs = logs.filter(l => l.userId === 'u1')

  const todayStr = new Date().toISOString().split('T')[0]
  const totalToday = myLogs
    .filter(l => l.date === todayStr)
    .reduce((a, l) => a + l.duration, 0)

  const totalWeek = myLogs.reduce((a, l) => a + l.duration, 0)

  // Pagination
  const totalPages = Math.ceil(myLogs.length / PAGE_SIZE)
  const paginatedLogs = myLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Detect if viewing current week
  const isCurrentWeek = (() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
    monday.setHours(0,0,0,0)
    const baseDayOfWeek = baseDate.getDay()
    const baseMonday = new Date(baseDate)
    baseMonday.setDate(baseDate.getDate() - ((baseDayOfWeek + 6) % 7))
    baseMonday.setHours(0,0,0,0)
    return monday.getTime() === baseMonday.getTime()
  })()

  // Close context menu on click outside
  useEffect(() => {
    const handler = (e) => {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContextMenu({ open: false, logId: null, x: 0, y: 0 })
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDeleteEntry = (logId) => {
    setLogs(prev => prev.filter(l => l.id !== logId))
    setContextMenu({ open: false, logId: null, x: 0, y: 0 })
    triggerToast('Entry deleted', '', 'success')
  }

  const handleEditEntry = (logId) => {
    const entry = logs.find(l => l.id === logId)
    if (!entry) return
    // Open drawer pre-populated — we pass data through the drawer opener
    setDrawerOpen(true)
    setContextMenu({ open: false, logId: null, x: 0, y: 0 })
    triggerToast('Edit mode', 'Modify the entry in the drawer and save.', 'info')
  }

  const handleToggleBillable = (logId) => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, billable: !l.billable } : l))
    setContextMenu({ open: false, logId: null, x: 0, y: 0 })
    triggerToast('Billable status updated', '', 'success')
  }

  const handleDuplicate = (logId) => {
    const entry = logs.find(l => l.id === logId)
    if (!entry) return
    const dup = { ...entry, id: `log-${Date.now()}`, date: new Date().toISOString().split('T')[0] }
    setLogs(prev => [dup, ...prev])
    setContextMenu({ open: false, logId: null, x: 0, y: 0 })
    triggerToast('Entry duplicated', '', 'success')
  }

  return (
    <div style={{ background: 'transparent' }} className="px-4 md:px-6 py-4 md:py-5 animate-fade-in space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">My Time</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Track your work and manage time entries.
        </p>
      </div>

      {/* ── Live Timer ──────────────────────────────────────────────────────── */}
      <div 
        className="glass-card p-6" 
        style={{ 
          borderLeft: timerRunning ? '3px solid #10b981' : '3px solid var(--border-strong)',
          boxShadow: timerRunning ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Timer display */}
          <div className="flex-1 pl-0 md:pl-4">
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
          <div className="w-full md:w-44">
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
              className="w-full md:w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
            >
              <Square size={18} />
            </button>
          ) : (
            <Button
              variant="primary"
              onClick={() => startTimer(currentTask)}
              className="w-full md:w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            >
              <Play size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Personal Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today', value: totalToday.toFixed(1) + 'h', sub: 'of 8h goal', pct: Math.round((totalToday / 8) * 100) },
          { label: 'This Week', value: totalWeek.toFixed(1) + 'h', sub: 'of 40h goal', pct: Math.round((totalWeek / 40) * 100) },
          { label: 'Billable (week)', value: myLogs.filter(l => l.billable).reduce((a, l) => a + l.duration, 0).toFixed(1) + 'h', sub: '100% billable', pct: 100 },
          { label: 'Entries (week)', value: myLogs.length, sub: 'time entries', pct: null },
        ].map(s => (
          <div key={s.label} className="glass-card p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight font-sans">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.sub}</p>
            {s.pct !== null && (
              <div className="mt-3 h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
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
          <button
            onClick={() => {
              setBaseDate(prev => {
                const d = new Date(prev);
                d.setDate(prev.getDate() - 7);
                return d;
              });
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <h3 className="text-sm font-medium text-[var(--text-primary)] flex-1 text-center">
            {(() => {
              const dayOfWeek = baseDate.getDay();
              const monday = new Date(baseDate);
              monday.setDate(baseDate.getDate() - ((dayOfWeek + 6) % 7));
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              return `Week of ${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
            })()}
          </h3>
          <button
            onClick={() => {
              setBaseDate(prev => {
                const d = new Date(prev);
                d.setDate(prev.getDate() + 7);
                return d;
              });
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
          {!isCurrentWeek && (
            <button
              onClick={() => setBaseDate(new Date())}
              className="w-7 h-7 rounded-md flex items-center justify-center text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors duration-150 cursor-pointer"
              title="Return to current week"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
        <div className="overflow-x-auto w-full pb-2">
          <div className="grid grid-cols-7 gap-2 min-w-[500px]">
            {(() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const dayOfWeek = baseDate.getDay();
            const monday = new Date(baseDate);
            monday.setDate(baseDate.getDate() - ((dayOfWeek + 6) % 7));
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
                className="flex flex-col items-center p-3 rounded-lg transition-colors duration-150 cursor-pointer"
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
      </div>

      {expandedDate && (
        <div className="glass-card p-4 animate-fade-in" style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {new Date(expandedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <span className="font-mono text-sm text-[var(--text-primary)] font-semibold">
              {myLogs.filter(l => l.date === expandedDate).reduce((a, l) => a + l.duration, 0).toFixed(1)}h
            </span>
          </div>
          <div className="space-y-2">
            {myLogs.filter(l => l.date === expandedDate).length === 0 ? (
              <EmptyState icon={Clock} title="No entries for this day" description="Start the timer or add a manual entry." />
            ) : (
              myLogs.filter(l => l.date === expandedDate).map(entry => (
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
      <div className="mt-6 border-t border-[var(--border-default)] pt-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">My Time Entries</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">All your logged time this period</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            <Plus size={13} />
            Add Entry
          </Button>
        </div>
        <div className="overflow-x-auto w-full">
          <div className="min-w-[800px]">
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
            {paginatedLogs.map(log => (
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
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setContextMenu({
                          open: true,
                          logId: log.id,
                          x: rect.left - 140,
                          y: rect.bottom + 4,
                        })
                      }}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-[var(--border-default)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, myLogs.length)} of {myLogs.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-sunken)', border: '1px solid var(--border-default)' }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${
                    page === i + 1 ? 'bg-amber-500 text-white' : ''
                  }`}
                  style={page !== i + 1 ? { color: 'var(--text-secondary)', background: 'var(--bg-sunken)' } : {}}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-sunken)', border: '1px solid var(--border-default)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.open && (
        <div
          ref={contextRef}
          className="fixed z-50 glass-elevated rounded-xl py-1.5 w-44 animate-fade-in shadow-xl"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            border: '1px solid var(--border-default)',
          }}
        >
          <button
            onClick={() => handleEditEntry(contextMenu.logId)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Edit3 size={13} /> Edit Entry
          </button>
          <button
            onClick={() => handleDuplicate(contextMenu.logId)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Copy size={13} /> Duplicate
          </button>
          <button
            onClick={() => handleToggleBillable(contextMenu.logId)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] transition-colors"
          >
            <DollarSign size={13} /> Toggle Billable
          </button>
          <div className="my-1 h-px" style={{ background: 'var(--border-default)' }} />
          <button
            onClick={() => handleDeleteEntry(contextMenu.logId)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} /> Delete Entry
          </button>
        </div>
      )}
    </div>
  )
}
