import React, { useState, useEffect } from 'react';
import { Play, Square, Activity, MousePointer2, Keyboard, LayoutGrid, Maximize2, Crosshair, Clock } from 'lucide-react';

export default function DesktopHelper() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Mock activity feed
  const activities = [
    { id: 1, app: 'VS Code - index.css', duration: '2m 14s', time: '10:42 AM' },
    { id: 2, app: 'Google Chrome - React Docs', duration: '5m 30s', time: '10:36 AM' },
    { id: 3, app: 'Figma - Chronos UI', duration: '12m 05s', time: '10:24 AM' }
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-transparent text-[var(--text-primary)] overflow-hidden font-sans relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-[var(--bg-base)] overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[80%] bg-amber-500/20 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-amber-500/15 rounded-full blur-[80px] animate-pulse" />
      </div>

      {/* Header / Timer Controls */}
      <div className="px-4 pt-6 pb-4 flex flex-col items-center justify-center border-b border-white/10 m-2 rounded-2xl shadow-xl" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>
        <div className="text-4xl font-bold tabular-nums tracking-tight mb-2">
          {formatTime(seconds)}
        </div>
        <div className="flex items-center gap-3 w-full">
          <input
            type="text"
            placeholder="What are you working on?"
            className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-amber-500 transition-colors backdrop-blur-md"
          />
          <button
            onClick={() => setRunning(!running)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              running
                ? 'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20'
                : 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600'
            }`}
          >
            {running ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Input Meters */}
        <div className="p-3 rounded-xl flex gap-4 shadow-lg border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
              <span className="flex items-center gap-1.5"><Keyboard size={12} /> Keyboard</span>
              <span>75%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-sunken)] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-bar-grow" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
              <span className="flex items-center gap-1.5"><MousePointer2 size={12} /> Mouse</span>
              <span>42%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-sunken)] rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full animate-bar-grow" style={{ width: '42%' }}></div>
            </div>
          </div>
        </div>

        {/* Screenshot Widget */}
        <div className="p-3 rounded-xl relative overflow-hidden group shadow-lg border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <Crosshair size={12} /> Last Capture
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)]">2 mins ago</span>
          </div>
          
          <div className="relative rounded-lg overflow-hidden border border-[var(--border-default)] bg-[var(--bg-sunken)] aspect-video flex items-center justify-center">
            {/* Mock screenshot representation */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-sky-500/10"></div>
            <LayoutGrid size={24} className="text-[var(--text-muted)] opacity-50" />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Maximize2 size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-3 rounded-xl shadow-lg border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            <Activity size={12} /> Activity Log
          </div>
          
          <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-[var(--border-default)]">
            {activities.map((act, i) => (
              <div key={act.id} className="flex gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold truncate pr-2 text-[var(--text-primary)]">
                      {act.app}
                    </p>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{act.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <Clock size={10} />
                    <span>{act.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="px-4 py-2 border-t border-[var(--border-default)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-emerald-500 status-dot-pulse' : 'bg-neutral-400'}`}></span>
          {running ? 'Tracking Active' : 'Idle'}
        </span>
        <span>v0.1.0</span>
      </div>
    </div>
  );
}
