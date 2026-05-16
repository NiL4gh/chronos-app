import { Cpu, PenLine } from 'lucide-react'

/**
 * TrackingSourceBadge — Reusable badge for Auto vs Manual time entries.
 * DO NOT alter the class structure (Golden Rule).
 */
export default function TrackingSourceBadge({ source }) {
  if (source === 'auto') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Cpu size={10} />
        Auto
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <PenLine size={10} />
      Manual
    </span>
  )
}
