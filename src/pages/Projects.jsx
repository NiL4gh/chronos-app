import { useState } from 'react'
import {
  Plus, ChevronDown, MoreHorizontal, Target, Calendar,
  Users, DollarSign, AlertTriangle, CheckCircle2, PauseCircle, FolderKanban,
} from 'lucide-react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar'
import { projects, teamMembers } from '../data/mockData'

const goalTypeOptions = ['Daily', 'Weekly', 'Monthly', 'Project-based']

const statusConfig = {
  active: { variant: 'success', icon: CheckCircle2, label: 'Active' },
  paused: { variant: 'warning', icon: PauseCircle, label: 'Paused' },
  completed: { variant: 'neutral', icon: CheckCircle2, label: 'Completed' },
}

function GoalEngine({ project, onUpdateGoal }) {
  const [open, setOpen] = useState(false)
  const [goalType, setGoalType] = useState(
    project.goalType.charAt(0).toUpperCase() + project.goalType.slice(1).replace('-', ' ')
  )

  const pct = Math.round((project.loggedHours / project.goalHours) * 100)

  return (
    <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
      {/* Circular progress */}
      <CircularProgress
        value={project.loggedHours}
        max={project.goalHours}
        size={56}
        strokeWidth={5}
        label={`${pct}%`}
      />

      {/* Goal text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Target size={12} className="text-neutral-500" />
          <span className="text-xs text-neutral-500">
            Goal: <span className="text-neutral-300 font-medium">{project.goalHours}h</span>
            <span className="text-neutral-600"> / {goalType.toLowerCase()}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ProgressBar
            value={project.loggedHours}
            max={project.goalHours}
            showPercent={false}
            className="flex-1"
          />
          <span className="text-xs font-mono text-neutral-500 shrink-0">
            {project.loggedHours}h / {project.goalHours}h
          </span>
        </div>
      </div>

      {/* Edit Goal dropdown */}
      <div className="relative shrink-0">
        <button
          onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-700 hover:border-neutral-600 bg-transparent text-xs text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
        >
          Edit Goal
          <ChevronDown size={11} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-neutral-700 bg-neutral-800 shadow-xl shadow-black/40 z-10 overflow-hidden animate-fade-in">
            <div className="px-3 py-2 border-b border-neutral-700">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Goal Cadence</p>
            </div>
            {goalTypeOptions.map(opt => (
              <button
                key={opt}
                onClick={() => { setGoalType(opt); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors duration-100 flex items-center justify-between
                  ${goalType === opt
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
              >
                {opt}
                {goalType === opt && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  const cfg = statusConfig[project.status] ?? statusConfig.active
  const StatusIcon = cfg.icon
  const budgetPct = Math.round((project.spent / project.budget) * 100)
  const memberDetails = project.members.map(id => teamMembers.find(m => m.id === id)).filter(Boolean)

  return (
    <Card padding="p-5" className="group hover:border-neutral-700 transition-colors duration-150 flex flex-col gap-0">
      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          <div>
            <h3 className="text-sm font-medium text-neutral-100">{project.name}</h3>
            <p className="text-xs text-neutral-600 mt-0.5">{project.client}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cfg.variant}>
            <StatusIcon size={10} />
            {cfg.label}
          </Badge>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-neutral-300">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-500 mb-4 line-clamp-2">{project.description}</p>

      {/* Tags */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {project.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-500 text-xs border border-neutral-700">
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-neutral-600 mb-0.5">Budget</p>
          <p className="text-sm font-mono font-medium text-neutral-300">${(project.budget / 1000).toFixed(0)}k</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-0.5">Spent</p>
          <p className={`text-sm font-mono font-medium ${budgetPct > 85 ? 'text-red-400' : 'text-neutral-300'}`}>
            ${(project.spent / 1000).toFixed(1)}k
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-0.5">Due</p>
          <p className="text-sm font-mono text-neutral-400">{project.dueDate.slice(5)}</p>
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex -space-x-2">
          {memberDetails.map(m => (
            <Avatar key={m.id} name={m.name} size="xs" className="ring-2 ring-neutral-900" />
          ))}
        </div>
        <span className="text-xs text-neutral-600">{memberDetails.length} member{memberDetails.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Goal Engine */}
      <GoalEngine project={project} />
    </Card>
  )
}

export default function Projects() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'active', 'paused'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                filter === f
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 border border-transparent'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-neutral-600">
                {f === 'all' ? projects.length : projects.filter(p => p.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm">
          <Plus size={13} />
          New Project
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: Target },
          { label: 'Active', value: projects.filter(p => p.status === 'active').length, icon: CheckCircle2 },
          { label: 'Total Budget', value: '$' + (projects.reduce((a, p) => a + p.budget, 0) / 1000).toFixed(0) + 'k', icon: DollarSign },
          { label: 'Total Hours Logged', value: projects.reduce((a, p) => a + p.loggedHours, 0).toFixed(0) + 'h', icon: Calendar },
        ].map(s => (
          <Card key={s.label} padding="p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={13} className="text-neutral-600" />
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
            <p className="text-xl font-semibold font-mono text-neutral-100">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="No projects match the selected filter. Try switching to a different tab."
        />
      )}
    </div>
  )
}
