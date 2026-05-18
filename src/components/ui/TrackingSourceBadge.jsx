import React from 'react';
import { Cpu, PenLine } from 'lucide-react';

export default function TrackingSourceBadge({ source = 'manual' }) {
  if (source === 'auto') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
        <Cpu size={10} />
        Auto
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
      <PenLine size={10} />
      Manual
    </span>
  );
}
