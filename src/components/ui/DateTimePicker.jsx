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

// ─── Presets Date Math ──────────────────────────────────
const getToday = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d;
};

const getMondayOf = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const DATE_PRESETS = [
  {
    label: 'Today',
    getRange: () => {
      const today = getToday();
      return [today, today];
    }
  },
  {
    label: 'Yesterday',
    getRange: () => {
      const yesterday = getToday();
      yesterday.setDate(yesterday.getDate() - 1);
      return [yesterday, yesterday];
    }
  },
  {
    label: 'This Week',
    getRange: () => {
      const monday = getMondayOf(getToday());
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return [monday, sunday];
    }
  },
  {
    label: 'Last Week',
    getRange: () => {
      const thisMonday = getMondayOf(getToday());
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      return [lastMonday, lastSunday];
    }
  },
  {
    label: 'This Month',
    getRange: () => {
      const today = getToday();
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return [first, last];
    }
  },
  {
    label: 'Last Month',
    getRange: () => {
      const today = getToday();
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return [first, last];
    }
  },
  {
    label: 'Last 14 Days',
    getRange: () => {
      const today = getToday();
      const ago = new Date(today);
      ago.setDate(today.getDate() - 13);
      return [ago, today];
    }
  },
  {
    label: 'Last 30 Days',
    getRange: () => {
      const today = getToday();
      const ago = new Date(today);
      ago.setDate(today.getDate() - 29);
      return [ago, today];
    }
  }
];

// ─── TimeChipGrid ────────────────────────────────────────
// Quick-select chip grid replacing the old scroll wheel for a faster UX.
function TimeChipGrid({ hours, minutes, onPick }) {
  const QUICK_MINUTES = [0, 15, 30, 45];
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Common presets */}
      <div className="flex gap-1.5">
        {[
          { label: '9 AM', h: 9, m: 0 },
          { label: '12 PM', h: 12, m: 0 },
          { label: '5 PM', h: 17, m: 0 },
        ].map(p => (
          <button
            key={p.label}
            type="button"
            onClick={() => onPick(p.h, p.m)}
            className="flex-1 text-[10px] font-semibold py-1 rounded-md transition-all duration-100"
            style={{
              background: hours === p.h && minutes === p.m ? 'var(--accent)' : 'var(--bg-sunken)',
              color: hours === p.h && minutes === p.m ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${hours === p.h && minutes === p.m ? 'var(--accent)' : 'var(--border-default)'}`,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Hour grid: 4 columns */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest block mb-1"
          style={{ color: 'var(--text-disabled)' }}>Hour</span>
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 24 }, (_, i) => i).map(h => (
            <button
              key={h}
              type="button"
              onClick={() => onPick(h, minutes)}
              className="h-7 rounded-md text-[11px] font-medium transition-all duration-100 flex items-center justify-center"
              style={{
                background: h === hours ? 'var(--accent)' : 'transparent',
                color: h === hours ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${h === hours ? 'var(--accent)' : 'var(--border-default)'}`,
              }}
            >
              {pad(h)}
            </button>
          ))}
        </div>
      </div>
      {/* Minute chips: 4 common values */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest block mb-1"
          style={{ color: 'var(--text-disabled)' }}>Minute</span>
        <div className="grid grid-cols-4 gap-1">
          {QUICK_MINUTES.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => onPick(hours, m)}
              className="h-8 rounded-md text-xs font-medium transition-all duration-100 flex items-center justify-center"
              style={{
                background: m === minutes ? 'var(--accent)' : 'transparent',
                color: m === minutes ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${m === minutes ? 'var(--accent)' : 'var(--border-default)'}`,
              }}
            >
              {pad(m)}
            </button>
          ))}
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
              type="button"
              onClick={() => onSelect(year, month, day)}
              className="h-8 w-full rounded-lg text-sm font-medium transition-all duration-100 flex items-center justify-center hover:bg-[var(--bg-sunken)]"
              style={{
                background: isSelected
                  ? 'var(--accent)'
                  : isToday
                  ? 'var(--accent-subtle)'
                  : 'transparent',
                color: isSelected
                  ? 'var(--accent-on)'
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

function parseTypedTime(str) {
  if (!str) return null;
  const s = str.replace(/[^0-9:]/g, '');
  const parts = s.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (isNaN(h) || h < 0 || h > 23) return null;
  if (isNaN(m) || m < 0 || m > 59) return null;
  return { h, m };
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
  showPresets = false,
  onRangeChange,
  autoOpen = false,
}) {
  const [activePanel, setActivePanel] = useState(autoOpen ? (mode === 'time' ? 'time' : 'date') : null); // null | 'date' | 'time'
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
  const [typedTime, setTypedTime] = useState('');

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

      {/* Trigger Pills — hidden when autoOpen (calendar shown directly) */}
      <div className="flex items-center gap-2 flex-wrap">
        {!autoOpen && mode !== 'time' && (
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

        {!autoOpen && (showTime || mode === 'time') && (
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

      {/* Absolute time panel for mode=time */}
      {mode === 'time' && activePanel === 'time' && (
        <div
          className={`animate-slide-up glass-elevated rounded-xl p-4 flex flex-col items-center gap-3 z-50 absolute ${timeOpenUp ? 'bottom-full mb-2' : 'top-full mt-1'} left-0`}
          style={{ width: '240px' }}
        >
          {/* Typed time input with auto-colon */}
          <input
            type="text"
            value={typedTime}
            onChange={e => {
              let val = e.target.value;
              // Auto-insert colon after 2 digits if user types digits without colon
              // e.g. "93" → "9:3", "1430" → "14:30"
              const digits = val.replace(/[^0-9]/g, '');
              if (!val.includes(':') && digits.length >= 2 && val.length <= 4) {
                val = digits.slice(0, 2) + ':' + digits.slice(2, 4);
              }
              setTypedTime(val);
              const parsed = parseTypedTime(val);
              if (parsed) { setHours(parsed.h); setMinutes(parsed.m); }
            }}
            onBlur={() => {
              const parsed = parseTypedTime(typedTime);
              if (parsed) { setHours(parsed.h); setMinutes(parsed.m); onTimeChange?.(`${pad(parsed.h)}:${pad(parsed.m)}`); }
              setTypedTime('');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const parsed = parseTypedTime(typedTime);
                if (parsed) { setHours(parsed.h); setMinutes(parsed.m); onTimeChange?.(`${pad(parsed.h)}:${pad(parsed.m)}`); }
                setTypedTime('');
                setActivePanel(null);
              }
            }}
            placeholder={`${pad(hours)}:${pad(minutes)}`}
            className="w-full text-sm text-center font-mono px-2 py-1.5 rounded-lg focus:outline-none"
            style={{
              background: 'var(--bg-sunken)',
              border: '1px solid var(--border-focus)',
              color: 'var(--text-primary)',
            }}
          />
          <TimeChipGrid
            hours={hours}
            minutes={minutes}
            onPick={(h, m) => {
              setHours(h);
              setMinutes(m);
              setTypedTime('');
              onTimeChange?.(`${pad(h)}:${pad(m)}`);
              setActivePanel(null);
            }}
          />
        </div>
      )}

      {/* Dropdown panels (absolute, for date/datetime modes) */}
      {mode !== 'time' && (
        <div className="relative">
          {/* Calendar Panel */}
          {activePanel === 'date' && (
            <div
              className={`animate-slide-up glass-elevated rounded-xl p-4 flex ${autoOpen ? '' : dateOpenUp ? 'absolute bottom-full mb-2 left-0 z-50' : 'absolute top-full mt-2 left-0 z-50'}`}
              style={{ width: showPresets ? '440px' : '280px' }}
            >
              {/* Presets Sidebar List (showPresets=true) */}
              {showPresets && (
                <>
                  <div className="w-40 flex flex-col gap-1 pr-3 overflow-y-auto shrink-0 max-h-[260px] select-none">
                    {DATE_PRESETS.map((preset) => {
                      const [start, end] = preset.getRange();
                      const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
                      const isActive = value === startStr;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            onRangeChange?.(start, end);
                            onChange?.(startStr);
                            setActivePanel(null);
                          }}
                          className={`text-left text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-sunken)] ${
                            isActive
                              ? 'font-semibold text-[var(--accent-text)] bg-[var(--accent-subtle)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-px self-stretch border-r border-[var(--border-default)] mr-3 shrink-0" />
                </>
              )}

              {/* Right Side Calendar Grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3 select-none">
                  <button
                    type="button"
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
                    type="button"
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
                    type="button"
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
                type="button"
                onClick={() => {
                  onTimeChange?.(`${pad(hours)}:${pad(minutes)}`);
                  setActivePanel(null);
                }}
                className="w-full text-xs font-semibold py-1.5 rounded-lg transition-all duration-150"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-on)',
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
