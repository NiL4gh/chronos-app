import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m - 1, day: d };
}

function formatDate(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// ─── TimeWheel ──────────────────────────────────────────
function TimeWheel({ value, min, max, onChange, label }) {
  const ref = useRef(null);
  const items = [];
  for (let i = min; i <= max; i++) items.push(i);

  useEffect(() => {
    if (!ref.current) return;
    const idx = items.indexOf(value);
    if (idx < 0) return;
    const itemH = 32;
    ref.current.scrollTop = idx * itemH;
  }, [value]);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const itemH = 32;
    const idx = Math.round(ref.current.scrollTop / itemH);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped] !== value) onChange(items[clamped]);
  }, [items, value, onChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-disabled)' }}>{label}</span>
      <div
        className="relative w-12 overflow-hidden rounded-xl"
        style={{
          height: '96px',
          background: 'var(--bg-sunken)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: '32px',
            height: '32px',
            background: 'var(--accent-subtle)',
            borderTop: '1px solid var(--accent-border)',
            borderBottom: '1px solid var(--accent-border)',
          }}
        />
        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll"
          style={{
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div style={{ height: '32px', scrollSnapAlign: 'start', flexShrink: 0 }} />
          {items.map((v) => (
            <div
              key={v}
              onClick={() => onChange(v)}
              className="flex items-center justify-center cursor-pointer transition-colors duration-100"
              style={{
                height: '32px',
                scrollSnapAlign: 'start',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '14px',
                fontWeight: v === value ? '700' : '400',
                color: v === value ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {pad(v)}
            </div>
          ))}
          <div style={{ height: '32px', scrollSnapAlign: 'start', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}

// ─── CalendarGrid ────────────────────────────────────────
function CalendarGrid({ year, month, selectedDate, onSelect, slideDir }) {
  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
  const selStr = selectedDate ? formatDate(selectedDate.year, selectedDate.month, selectedDate.day) : null;

  const animClass = slideDir === 'next'
    ? 'animate-calendar-next'
    : slideDir === 'prev'
    ? 'animate-calendar-prev'
    : 'animate-fade-in';

  return (
    <div className={animClass}>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase py-1"
            style={{ color: 'var(--text-disabled)' }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const thisStr = formatDate(year, month, day);
          const isSelected = thisStr === selStr;
          const isToday = thisStr === todayStr;

          return (
            <button
              key={day}
              onClick={() => onSelect(year, month, day)}
              className="h-8 w-full rounded-lg text-sm font-medium transition-all duration-100 flex items-center justify-center hover:bg-[var(--bg-sunken)]"
              style={{
                background: isSelected
                  ? 'var(--accent)'
                  : isToday
                  ? 'var(--accent-subtle)'
                  : 'transparent',
                color: isSelected
                  ? '#ffffff'
                  : isToday
                  ? 'var(--accent-text)'
                  : 'var(--text-secondary)',
                border: isSelected
                  ? '1px solid var(--accent)'
                  : isToday
                  ? '1px solid var(--accent-border)'
                  : '1px solid transparent',
                fontWeight: isSelected ? '700' : isToday ? '600' : '400',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DateTimePicker ──────────────────────────────────────
export default function DateTimePicker({
  value = '',
  timeValue = '',
  onChange,
  onTimeChange,
  showTime = false,
  placeholder = 'Select date',
  label,
  mode = 'date', // 'date' | 'datetime' | 'time'
}) {
  const [activePanel, setActivePanel] = useState(null); // null | 'date' | 'time'
  const [slideDir, setSlideDir] = useState(null);
  const containerRef = useRef(null);
  const dateTriggerRef = useRef(null);
  const timeTriggerRef = useRef(null);
  const [dateOpenUp, setDateOpenUp] = useState(false);
  const [timeOpenUp, setTimeOpenUp] = useState(false);

  // Calendar view state
  const todayDate = new Date();
  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState(parsed?.year || todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? todayDate.getMonth());

  // Time state
  const [hours, setHours] = useState(() => {
    if (!timeValue) return 9;
    const [h] = timeValue.split(':').map(Number);
    return isNaN(h) ? 9 : h;
  });
  const [minutes, setMinutes] = useState(() => {
    if (!timeValue) return 0;
    const [, m] = timeValue.split(':').map(Number);
    return isNaN(m) ? 0 : m;
  });

  // Sync time outward — only when user actively changes hours/minutes
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    onTimeChange?.(`${pad(hours)}:${pad(minutes)}`);
  }, [hours, minutes]);

  // Sync calendar view when value prop changes
  useEffect(() => {
    const p = parseDate(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // When time panel closes in mode=time, commit current wheel value to parent
  const prevActivePanel = useRef(null);
  useEffect(() => {
    if (mode === 'time' && prevActivePanel.current === 'time' && activePanel === null) {
      onTimeChange?.(`${pad(hours)}:${pad(minutes)}`);
    }
    prevActivePanel.current = activePanel;
  }, [activePanel]);

  // Close on outside click
  useEffect(() => {
    if (!activePanel) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setActivePanel(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activePanel]);

  // Close on Escape
  useEffect(() => {
    if (!activePanel) return;
    const handler = (e) => { if (e.key === 'Escape') setActivePanel(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activePanel]);

  const goToPrevMonth = () => {
    setSlideDir('prev');
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    setSlideDir('next');
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDaySelect = (year, month, day) => {
    onChange?.(formatDate(year, month, day));
    setActivePanel(null);
  };

  const displayValue = parsed
    ? `${MONTHS[parsed.month].slice(0, 3)} ${parsed.day}, ${parsed.year}`
    : placeholder;

  const timeDisplay = (showTime || mode === 'time') ? `${pad(hours)}:${pad(minutes)}` : '';

  return (
    <div ref={containerRef} className="relative inline-flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}

      {/* Trigger Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {mode !== 'time' && (
          <button
            ref={dateTriggerRef}
            type="button"
            onClick={() => {
              if (activePanel === 'date') {
                setActivePanel(null);
              } else {
                if (dateTriggerRef.current) {
                  const rect = dateTriggerRef.current.getBoundingClientRect();
                  setDateOpenUp(rect.bottom > window.innerHeight / 2);
                }
                setActivePanel('date');
              }
            }}
            className="glass-interactive rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-2 transition-all duration-150 hover:bg-[var(--bg-sunken)] w-full justify-center"
            style={{
              background: 'var(--bg-surface)',
              border: activePanel === 'date' ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{displayValue}</span>
          </button>
        )}

        {(showTime || mode === 'time') && (
          <button
            ref={timeTriggerRef}
            type="button"
            onClick={() => {
              if (activePanel === 'time') {
                setActivePanel(null);
              } else {
                if (timeTriggerRef.current) {
                  const rect = timeTriggerRef.current.getBoundingClientRect();
                  setTimeOpenUp(rect.bottom > window.innerHeight / 2);
                }
                setActivePanel('time');
              }
            }}
            className="glass-interactive rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-2 transition-all duration-150 hover:bg-[var(--bg-sunken)] w-full justify-center"
            style={{
              background: 'var(--bg-surface)',
              border: activePanel === 'time' ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{timeDisplay}</span>
          </button>
        )}
      </div>

      {/* Inline time panel for mode=time (avoids overflow clipping in drawers) */}
      {mode === 'time' && activePanel === 'time' && (
        <div
          className="animate-slide-up glass-elevated rounded-xl p-4 flex flex-col items-center gap-3 mt-1"
        >
          <div className="flex items-center justify-center gap-3">
            <TimeWheel
              value={hours}
              min={0}
              max={23}
              onChange={setHours}
              label="Hour"
            />
            <span className="text-xl font-mono font-bold mt-4"
              style={{ color: 'var(--text-muted)' }}>:</span>
            <TimeWheel
              value={minutes}
              min={0}
              max={59}
              onChange={setMinutes}
              label="Min"
            />
          </div>
          <button
            onClick={() => {
              onTimeChange?.(`${pad(hours)}:${pad(minutes)}`);
              setActivePanel(null);
            }}
            className="w-full text-xs font-semibold py-1.5 rounded-lg transition-all duration-150"
            style={{
              background: 'var(--accent)',
              color: '#fff',
            }}
          >
            Set Time
          </button>
        </div>
      )}

      {/* Dropdown panels (absolute, for date/datetime modes) */}
      {mode !== 'time' && (
        <div className="relative">
          {/* Calendar Panel */}
          {activePanel === 'date' && (
            <div
              className={`animate-slide-up glass-elevated rounded-xl p-4 ${dateOpenUp ? 'absolute bottom-full mb-2 left-0 z-50' : 'absolute top-full mt-2 left-0 z-50'}`}
              style={{ width: '280px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goToPrevMonth}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:bg-[var(--bg-sunken)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={goToNextMonth}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:bg-[var(--bg-sunken)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <CalendarGrid
                year={viewYear}
                month={viewMonth}
                selectedDate={parsed}
                onSelect={handleDaySelect}
                slideDir={slideDir}
              />

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    const t = new Date();
                    handleDaySelect(t.getFullYear(), t.getMonth(), t.getDate());
                    setViewYear(t.getFullYear());
                    setViewMonth(t.getMonth());
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150 hover:bg-[var(--bg-sunken)] font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  Today
                </button>
              </div>
            </div>
          )}

          {/* Time Panel */}
          {activePanel === 'time' && (
            <div
              className={`flex flex-col items-center gap-3 animate-slide-up glass-elevated rounded-xl p-4 ${timeOpenUp ? 'absolute bottom-full mb-2 left-0 z-50' : 'absolute top-full mt-2 left-0 z-50'}`}
              style={{ width: '220px' }}
            >
              <div className="flex items-center justify-center gap-3">
                <TimeWheel
                  value={hours}
                  min={0}
                  max={23}
                  onChange={setHours}
                  label="Hour"
                />
                <span className="text-xl font-mono font-bold mt-4"
                  style={{ color: 'var(--text-muted)' }}>:</span>
                <TimeWheel
                  value={minutes}
                  min={0}
                  max={59}
                  onChange={setMinutes}
                  label="Min"
                />
              </div>
              <button
                onClick={() => {
                  onTimeChange?.(`${pad(hours)}:${pad(minutes)}`);
                  setActivePanel(null);
                }}
                className="w-full text-xs font-semibold py-1.5 rounded-lg transition-all duration-150"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                }}
              >
                Set Time
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
