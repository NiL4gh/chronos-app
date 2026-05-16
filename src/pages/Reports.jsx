import { useState } from 'react'
import {
  Download, ChevronDown, CalendarDays, Filter,
  TrendingUp, Clock, DollarSign, Users,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SplitButton from '../components/ui/SplitButton';
import { useOutletContext } from 'react-router-dom';
import Badge from '../components/ui/Badge'
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table'
import { reportRows, projects } from '../data/mockData'

const viewOptions = ['Daily', 'Weekly', 'Monthly']
const memberOptions = ['All Members', 'Priya Sharma', 'Marcus Webb', 'Aiko Tanaka', 'Daniel Osei', 'Sofia Reyes']
const projectOptions = ['All Projects', ...projects.map(p => p.name)]

function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-neutral-600">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none rounded-lg border border-neutral-700 bg-neutral-800 pl-3 pr-8 py-2 text-sm text-neutral-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 cursor-pointer"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
      </div>
    </div>
  )
}

function DateInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-neutral-600">{label}</label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150"
      />
    </div>
  )
}

export default function Reports() {
  const { triggerToast } = useOutletContext();
  const [startDate, setStartDate] = useState('2025-05-06')
  const [endDate, setEndDate] = useState('2025-05-12')
  const [view, setView] = useState('Weekly')
  const [member, setMember] = useState('All Members')
  const [project, setProject] = useState('All Projects')

  const totalHours = reportRows.reduce((a, r) => a + r.total, 0)
  const billableHours = reportRows.reduce((a, r) => a + r.billable, 0)
  const billablePct = Math.round((billableHours / totalHours) * 100)
  const revenue = billableHours * 162.5 // blended rate

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const dailyTotals = days.map(d => reportRows.reduce((a, r) => a + r[d.toLowerCase()], 0))
  const maxDaily = Math.max(...dailyTotals)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Query / Filter Bar ──────────────────────────────────────────────── */}
      <Card padding="p-4">
        <div className="flex items-end gap-4 flex-wrap">
          <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
          <div className="flex items-end pb-2 text-neutral-600">
            <span className="text-xs">→</span>
          </div>
          <DateInput label="End Date" value={endDate} onChange={setEndDate} />

          <div className="w-px h-8 bg-neutral-700 self-end mb-0.5" />

          <FilterSelect label="View" options={viewOptions} value={view} onChange={setView} />
          <FilterSelect label="Member" options={memberOptions} value={member} onChange={setMember} />
          <FilterSelect label="Project" options={projectOptions} value={project} onChange={setProject} />

          <div className="flex items-end gap-2 ml-auto">
            <Button variant="secondary" size="sm">
              <Filter size={13} />
              Apply Filters
            </Button>
            <SplitButton
              onExport={(format) =>
                triggerToast('Export started', `Your ${format.toUpperCase()} file will download shortly.`, 'success')
              }
            />
          </div>
        </div>
      </Card>

      {/* ── Summary Metrics ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1) + 'h', icon: Clock, sub: 'across all members' },
          { label: 'Billable Hours', value: billableHours.toFixed(1) + 'h', icon: TrendingUp, sub: `${billablePct}% of total` },
          { label: 'Est. Revenue', value: '$' + revenue.toLocaleString('en-US', { maximumFractionDigits: 0 }), icon: DollarSign, sub: 'at blended rate' },
          { label: 'Active Members', value: reportRows.length, icon: Users, sub: 'contributed this period' },
        ].map(s => (
          <Card key={s.label} padding="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                <s.icon size={14} className="text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold font-mono text-neutral-100">{s.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
            <p className="text-xs text-neutral-600 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Daily Chart + Billable breakdown ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2" padding="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-medium text-neutral-100">Daily Hours Distribution</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Team aggregate — {view} view</p>
            </div>
            <Badge variant="neutral">{startDate} → {endDate}</Badge>
          </div>
          <div className="flex items-end gap-3 h-36">
            {days.map((day, i) => {
              const hours = dailyTotals[i]
              const pct = (hours / maxDaily) * 100
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-mono text-neutral-500">{hours.toFixed(1)}</span>
                  <div className="w-full rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: '96px' }}>
                    <div
                      className="w-full rounded-t-md bg-violet-500/70 hover:bg-violet-500 transition-colors duration-200"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-600">{day}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card padding="p-6">
          <h3 className="text-base font-medium text-neutral-100 mb-1">Billable Split</h3>
          <p className="text-xs text-neutral-500 mb-6">Billable vs. non-billable</p>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="-rotate-90 w-28 h-28">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#262626" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#8b5cf6" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - billablePct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#262626" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 40 * (1 - billablePct / 100)} ${2 * Math.PI * 40}`}
                  strokeDashoffset={`-${2 * Math.PI * 40 * billablePct / 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold font-mono text-neutral-100">{billablePct}%</span>
                <span className="text-xs text-neutral-600">billable</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-xs text-neutral-400">Billable</span>
                </div>
                <span className="text-xs font-mono text-neutral-300">{billableHours.toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-700" />
                  <span className="text-xs text-neutral-400">Non-billable</span>
                </div>
                <span className="text-xs font-mono text-neutral-300">{(totalHours - billableHours).toFixed(1)}h</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Detailed Table ──────────────────────────────────────────────────── */}
      <Card padding="p-0">
        <div className="px-6 pt-5 pb-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-neutral-100">Detailed Breakdown</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Per member, per project — {view} view</p>
          </div>
          <Button variant="secondary" size="sm">
            <Download size={13} />
            Export Table
          </Button>
        </div>
        <Table>
          <TableHead>
            <Th>Member</Th>
            <Th>Project</Th>
            {days.map(d => <Th key={d}>{d}</Th>)}
            <Th>Total</Th>
            <Th>Billable</Th>
            <Th>Rate</Th>
          </TableHead>
          <TableBody>
            {reportRows.map((row, i) => (
              <Tr key={i}>
                <Td><span className="font-medium text-neutral-200">{row.member}</span></Td>
                <Td><span className="text-neutral-400">{row.project}</span></Td>
                {days.map(d => (
                  <Td key={d}><span className="font-mono">{row[d.toLowerCase()]}h</span></Td>
                ))}
                <Td><span className="font-mono font-semibold text-neutral-100">{row.total}h</span></Td>
                <Td>
                  <span className={`font-mono ${row.billable > 0 ? 'text-emerald-400' : 'text-neutral-600'}`}>
                    {row.billable}h
                  </span>
                </Td>
                <Td>
                  <Badge variant={row.billable > 0 ? 'violet' : 'neutral'}>
                    {row.billable > 0 ? '100%' : '0%'}
                  </Badge>
                </Td>
              </Tr>
            ))}
            {/* Totals row */}
            <Tr className="border-t-2 border-neutral-700 bg-neutral-800/40">
              <Td><span className="font-semibold text-neutral-100">Total</span></Td>
              <Td></Td>
              {days.map(d => (
                <Td key={d}>
                  <span className="font-mono font-medium text-neutral-200">
                    {reportRows.reduce((a, r) => a + r[d.toLowerCase()], 0).toFixed(1)}h
                  </span>
                </Td>
              ))}
              <Td><span className="font-mono font-bold text-neutral-50">{totalHours.toFixed(1)}h</span></Td>
              <Td><span className="font-mono font-bold text-emerald-400">{billableHours.toFixed(1)}h</span></Td>
              <Td>
                <Badge variant="violet">{billablePct}%</Badge>
              </Td>
            </Tr>
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
