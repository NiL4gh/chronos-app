import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Play, Square, Plus, MoreHorizontal, Clock, ChevronLeft, ChevronRight,
  Edit3, Trash2, Copy, DollarSign, RotateCcw, List, AlignLeft, AlignJustify,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import TrackingSourceBadge from '../components/ui/TrackingSourceBadge'
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table'
import { timeLogs, projects } from '../data/mockData'
import EmptyState from '../components/ui/EmptyState'

const PROJECT_COLORS = [
  '#f59e0b', '#10b981', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
]

function getProjectColor(projectId) {
  const proj = projects.find(p => p.id === projectId)
  return proj?.color || PROJECT_COLORS[0]
}

export default function MyTime() {
  const { timerRunning, timerSeconds, startTimer, stopTimer, logs, setLogs, setDrawerOpen, triggerToast } = useOutletContext()

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0')
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const [currentTask, setCurrentTask] = useState('')
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '')
  const todayStr = new Date().toISOString().split('T')[0]
  const [expandedDate, setExpandedDate] = useState(todayStr)
  const [baseDate, setBaseDate] = useState(new Date())
  const [contextMenu, setContextMenu] = useState({ open: false, logId: null, x: 0, y: 0 })
  const [viewMode, setViewMode] = useState('timeline')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25
  const contextRef = useRef(null)

  const myLogs = logs.filter(l => l.userId === 'u1')

  const totalToday = myLogs
    .filter(l => l.date === todayStr)
    .reduce((a, l) => a + l.duration, 0)

  const totalWeek = myLogs.reduce((a, l) => a + l.duration, 0)
  const billableWeek = myLogs.filter(l => l.billable).reduce((a, l) => a + l.duration, 0)
  const billablePct = totalWeek > 0 ? Math.round((billableWeek / totalWeek) * 100) : 0

  const totalPages = Math.ceil(myLogs.length / PAGE_SIZE)
  const paginatedLogs = myLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
    const dup = { ...entry, id: `log-${Date.now()}`, date: todayStr }
    setLogs(prev => [dup, ...prev])
    setContextMenu({ open: false, logId: null, x: 0, y: 0 })
    triggerToast('Entry duplicated', '', 'success')
  }

  // Build week days
  const weekDays = (() => {
    const dayOfWeek = baseDate.getDay()
    const monday = new Date(baseDate)
    monday.setDate(baseDate.getDate() - ((dayOfWeek + 6) % 7))
    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const fullDate = d.toISOString().split('T')[0]
      const dayLogs = myLogs.filter(l => l.date === fullDate)
      const hours = dayLogs.reduce((a, l) => a + l.duration, 0)
      return { day: DAY_LABELS[i], date: String(d.getDate()), fullDate, hours, isToday: fullDate === todayStr }
    })
  })()

  const weekLabel = (() => {
    const dayOfWeek = baseDate.getDay()
    const monday = new Date(baseDate)
    monday.setDate(baseDate.getDate() - ((dayOfWeek + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return `Week of ${monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
  })()

  // Timeline rendering
  const TIMELINE_START = 7  // 7 AM
  const TIMELINE_END   = 21 // 9 PM
  const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START

  const parseTime = (t) => {
    if (!t) return TIMELINE_START
    const [h, m] = t.split(':').map(Number)
    return h + (m / 60)
  }

  const activeDateLogs = myLogs.filter(l => l.date === (expandedDate || todayStr))

  const timelineBlocks = (() => {
    const logsWithPos = activeDateLogs.map(log => ({
      ...log,
      startH: parseTime(log.startTime),
      endH: parseTime(log.endTime),
    })).filter(l => l.endH > TIMELINE_START && l.startH < TIMELINE_END)
      .sort((a, b) => a.startH - b.startH)

    const columns = []
    logsWithPos.forEach(log => {
      let placed = false
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1]
        if (lastInCol.endH <= log.startH) {
          columns[i].push(log)
          log._col = i
          placed = true
          break
        }
      }
      if (!placed) {
        log._col = columns.length
        columns.push([log])
      }
    })

    const numCols = Math.max(columns.length, 1)
    return { blocks: logsWithPos, numCols }
  })()

  const expandedDateLabel = expandedDate
    ? new Date(expandedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  const expandedDateTotal = myLogs.filter(l => l.date === expandedDate).reduce((a, l) => a + l.duration, 0)

  // Group logs by date for list view
  const logsByDate = myLogs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {})
  const sortedDates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in">

      {/* ── Top Controls Row ─────────────────────────────────── */}
      <div className="px-5 pt-5 pb-0 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">My Time</h1>
          <span className="text-xs font-medium text-[var(--text-muted)] hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* List / Timeline toggle — prominent */}
          <div className="flex items-center bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <AlignJustify size={13} />
              List
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                viewMode === 'timeline'
                  ? 'bg-white shadow-sm text-amber-600'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <AlignLeft size={13} />
              Timeline
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            <Plus size={13} />
            Add Entry
          </Button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* ── Timer Row (inline, compact) ─────────────────────── */}
        <div
          className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{
            borderLeft: timerRunning ? '3px solid #10b981' : '3px solid var(--border-strong)',
          }}
        >
          {/* Timer display */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`w-2 h-2 rounded-full transition-colors ${timerRunning ? 'bg-emerald-500 animate-pulse-dot' : 'bg-[var(--text-muted)]'}`} />
            <span className="text-2xl font-mono font-bold tabular-nums text-[var(--text-primary)] tracking-tight">
              {formatTimer(timerSeconds)}
            </span>
            <span className={`text-xs font-medium ${timerRunning ? 'text-emerald-600' : 'text-[var(--text-muted)]'}`}>
              {timerRunning ? 'Tracking' : 'Stopped'}
            </span>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-[var(--border-default)]" />

          {/* Task + Project inputs */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={currentTask}
                onChange={e => setCurrentTask(e.target.value)}
                placeholder="What are you working on?"
                className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-sunken)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
                style={{ fontSize: '13px' }}
              />
            </div>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-sunken)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] shrink-0 max-w-[140px]"
            >
              {projects.filter(p => p.status === 'active').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Controls */}
          {timerRunning ? (
            <button
              onClick={() => stopTimer()}
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'rgb(220,38,38)' }}
            >
              <Square size={15} />
            </button>
          ) : (
            <button
              onClick={() => startTimer(currentTask || 'Working...', selectedProject)}
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all timer-cta-pulse press-on-click"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
              }}
            >
              <Play size={15} fill="currentColor" />
            </button>
          )}
        </div>

        {/* ── Stats Row (compact) ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Today', value: totalToday.toFixed(1) + 'h', sub: 'of 8h goal', pct: Math.min(100, Math.round((totalToday / 8) * 100)) },
            { label: 'This Week', value: totalWeek.toFixed(1) + 'h', sub: 'of 40h goal', pct: Math.min(100, Math.round((totalWeek / 40) * 100)) },
            { label: 'Billable', value: billableWeek.toFixed(1) + 'h', sub: billablePct + '% billable', pct: billablePct },
            { label: 'Entries', value: myLogs.length, sub: 'all time', pct: null },
          ].map(s => (
            <div key={s.label} className="glass-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight font-sans">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.sub}</p>
              {s.pct !== null && (
                <div className="progress-track mt-2.5">
                  <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Week Calendar Strip (Date Pills) ──────────────── */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setBaseDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() - 7); return d; })}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs font-medium text-[var(--text-secondary)] flex-1 text-center">{weekLabel}</span>
            {!isCurrentWeek && (
              <button
                onClick={() => setBaseDate(new Date())}
                className="w-6 h-6 rounded-md flex items-center justify-center text-amber-500 hover:bg-amber-50 transition-colors"
                title="Back to current week"
              >
                <RotateCcw size={11} />
              </button>
            )}
            <button
              onClick={() => setBaseDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() + 7); return d; })}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Date pills */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(d => {
              const isActive = expandedDate === d.fullDate
              const pct = Math.min(100, (d.hours / 8) * 100)
              return (
                <button
                  key={d.fullDate}
                  onClick={() => setExpandedDate(isActive ? null : d.fullDate)}
                  className={`date-pill ${isActive ? 'active' : ''} ${d.isToday && !isActive ? 'today' : ''}`}
                >
                  <span className="day-label">{d.day}</span>
                  <span className="date-num">{d.date}</span>
                  <div className="pill-bar">
                    <div className="pill-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="hour-count">{d.hours > 0 ? `${d.hours.toFixed(1)}h` : '—'}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Timeline or List View ──────────────────────────── */}
        {viewMode === 'timeline' ? (
          <div className="glass-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  {expandedDate ? expandedDateLabel : 'Today\'s Timeline'}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {activeDateLogs.length} entries · {expandedDateTotal.toFixed(1)}h total
                </p>
              </div>
              {activeDateLogs.length === 0 && (
                <span className="text-xs text-[var(--text-muted)] italic">No entries for this day</span>
              )}
            </div>

            {/* Timeline grid */}
            <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
              <div className="relative" style={{ minHeight: `${TIMELINE_HOURS * 60}px` }}>
                {/* Hour lines */}
                {Array.from({ length: TIMELINE_HOURS + 1 }, (_, i) => {
                  const hour = TIMELINE_START + i
                  const top = (i / TIMELINE_HOURS) * 100
                  return (
                    <div
                      key={hour}
                      className="absolute w-full flex items-start"
                      style={{ top: `${top}%` }}
                    >
                      <span className="text-[10px] font-medium text-[var(--text-muted)] w-12 shrink-0 -mt-2 font-mono">
                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </span>
                      <div className="flex-1 border-t border-dashed border-[var(--border-default)]" />
                    </div>
                  )
                })}

                {/* Time blocks */}
                <div className="absolute" style={{ left: '52px', right: 0, top: 0, bottom: 0 }}>
                  {timelineBlocks.blocks.map(log => {
                    const clampedStart = Math.max(log.startH, TIMELINE_START)
                    const clampedEnd = Math.min(log.endH, TIMELINE_END)
                    const top = ((clampedStart - TIMELINE_START) / TIMELINE_HOURS) * 100
                    const height = Math.max(((clampedEnd - clampedStart) / TIMELINE_HOURS) * 100, 2)
                    const colWidth = 100 / timelineBlocks.numCols
                    const left = (log._col || 0) * colWidth
                    const color = getProjectColor(log.projectId)

                    return (
                      <div
                        key={log.id}
                        className="timeline-block"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          left: `${left}%`,
                          width: `calc(${colWidth}% - 6px)`,
                          background: color + '18',
                          borderLeftColor: color,
                        }}
                      >
                        <div className="text-[11px] font-semibold truncate" style={{ color }}>{log.task}</div>
                        <div className="text-[10px] opacity-70 font-mono mt-0.5" style={{ color }}>{log.startTime} – {log.endTime}</div>
                        {height > 4 && (
                          <div className="text-[10px] opacity-60 truncate mt-0.5" style={{ color }}>{log.projectName}</div>
                        )}
                      </div>
                    )
                  })}

                  {activeDateLogs.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <EmptyState icon={Clock} title="No entries" description="Select a day with logged time or add a new entry." />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── List View ── */
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">All Time Entries</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{myLogs.length} entries logged</p>
              </div>
            </div>

            <div className="divide-y divide-[var(--border-default)]">
              {sortedDates.slice(0, 14).map(date => {
                const dateLogs = logsByDate[date]
                const dateTotal = dateLogs.reduce((a, l) => a + l.duration, 0)
                const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'short', day: 'numeric'
                })
                return (
                  <div key={date}>
                    {/* Date header */}
                    <div className="px-4 py-2.5 flex items-center justify-between bg-[var(--bg-sunken)]">
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
                      <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{dateTotal.toFixed(1)}h</span>
                    </div>
                    {/* Log entries */}
                    {dateLogs.map(log => {
                      const color = getProjectColor(log.projectId)
                      return (
                        <div
                          key={log.id}
                          className="px-4 py-2.5 flex items-center gap-3 hover:bg-[var(--bg-sunken)] transition-colors group"
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-[var(--text-primary)] truncate block">{log.task}</span>
                            <span className="text-xs text-[var(--text-muted)]">{log.projectName}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:block">{log.startTime} – {log.endTime}</span>
                            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{log.duration.toFixed(1)}h</span>
                            <TrackingSourceBadge source={log.source} />
                            {log.billable && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Bill</span>}
                            <button
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setContextMenu({ open: true, logId: log.id, x: rect.left - 140, y: rect.bottom + 4 })
                              }}
                              className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.open && (
        <div
          ref={contextRef}
          className="fixed z-50 glass-elevated rounded-xl py-1.5 w-44 animate-fade-in shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y, border: '1px solid var(--border-default)' }}
        >
          <button onClick={() => handleEditEntry(contextMenu.logId)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] transition-colors">
            <Edit3 size={13} /> Edit Entry
          </button>
          <button onClick={() => handleDuplicate(contextMenu.logId)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] transition-colors">
            <Copy size={13} /> Duplicate
          </button>
          <button onClick={() => handleToggleBillable(contextMenu.logId)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-sunken)] hover:text-[var(--text-primary)] transition-colors">
            <DollarSign size={13} /> Toggle Billable
          </button>
          <div className="my-1 h-px" style={{ background: 'var(--border-default)' }} />
          <button onClick={() => handleDeleteEntry(contextMenu.logId)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} /> Delete Entry
          </button>
        </div>
      )}
    </div>
  )
}
