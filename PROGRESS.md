# PROGRESS.md – Chronos Project Progress Summary

## ✅ Completed (Verified)
- **AppShell.jsx**: Removed animated gradient mesh and integrated premium `DateTimePicker` components for manual entry date selection. Replaced both native `<input type="time">` elements (startTime, endTime) in the Log Time Entry drawer with `<DateTimePicker mode="time">` using inline time wheel panels (not absolute-positioned, to avoid `overflow-y-auto` clipping).
- **Invoices.jsx**: Replaced native `<Input type="date">` fields with `DateTimePicker` for **Issue Date** and **Due Date** in the Create Invoice drawer.
- **Projects.jsx**: Replaced native `<Input type="date">` for **Due Date** in the New Project creation drawer with `DateTimePicker`. Imported `DateTimePicker`.
- **DateTimePicker.jsx** — Multiple improvements:
  - Added `mode` prop (`'date' | 'datetime' | 'time'`). When `mode === 'time'`: hides calendar button, shows only the clock button.
  - Added `isMounted` ref guard to prevent `onTimeChange` firing on initial mount (prevents clobbering empty state with default `09:00`).
  - Added `prevActivePanel` ref effect to commit time value when the panel closes.
  - Added **"Set Time"** confirm button inside the time panel.
  - Added **inline (non-absolute) time panel** for `mode="time"` to avoid clipping by drawer overflow-y-auto.
  - Fixed broken JSX syntax in the `mode !== 'time'` dropdown section (missing `<div className="relative">` wrapper caused compile error). Repaired with correct wrapper and valid JSX structure.
  - Added `useEffect` to sync `viewYear`/`viewMonth` when the `value` prop changes externally (fixes invisible selected date issue on re-open).
  - Added `w-full justify-center` to the Calendar trigger pill button for consistent layout across all usages.
- **index.css**: Removed `input[type="time"]` from the `::-webkit-calendar-picker-indicator { display: none }` suppression rule (only `date` type now suppressed).
- **Team.jsx**: Converted status badges to borderless glass pills; compact metric card layout (3-column); adjusted activity level sections.

## ❌ Incomplete / Pending
- **Real Timer Persistence** – timer state does not survive page refresh.
- **Desktop Helper Integration** – data from the desktop app (screenshots, activity levels) not yet wired into the Team detail panel.
- **CSV/PDF/Excel Export** – currently triggers a toast; actual file generation not implemented.
- **Settings Persistence** – changes are only in‑memory; no backend storage.
- **Notification Panel** – bell badge shows count, but the dropdown panel is not built.
- **Light/Dark Mode Toggle** – UI exists in Settings, but dark mode styling is not wired.
- **ProofOfWorkTab (Phase 2)** – placeholder UI remains; real data integration pending.
- **Integration Cards** – still marked "Coming Soon"; API connections not implemented.

## 📋 Next Steps for Future Session
1. Implement timer state persistence (e.g., `localStorage` sync).
2. Wire desktop helper data schema to `MemberProfileDrawer` and Team panel.
3. Build actual CSV/PDF/Excel export functionality using Blob API.
4. Persist Settings changes to a mock JSON file or backend stub.
5. Develop notification panel UI and connect to mock notification data.
6. Finish Light/Dark mode toggle wiring (CSS variable switch).
7. Replace ProofOfWorkTab placeholder with real screenshots and activity data.
8. Connect Integration cards to their respective service APIs (Slack, Google Calendar, etc.).

---
**References**
- Modified files:
  - [AppShell.jsx](file:///c:/Users/niloy/Documents/Time%20Tracker/chronos-app/src/components/layout/AppShell.jsx)
  - [DateTimePicker.jsx](file:///c:/Users/niloy/Documents/Time%20Tracker/chronos-app/src/components/ui/DateTimePicker.jsx)
  - [Invoices.jsx](file:///c:/Users/niloy/Documents/Time%20Tracker/chronos-app/src/pages/Invoices.jsx)
  - [Projects.jsx](file:///c:/Users/niloy/Documents/Time%20Tracker/chronos-app/src/pages/Projects.jsx)
  - [Team.jsx](file:///c:/Users/niloy/Documents/Time%20Tracker/chronos-app/src/pages/Team.jsx)
  - [index.css](file:///c:/Users/niloy/Documents/Time%20Tracker/chronos-app/src/index.css)
- Design docs: [DESIGN.md](file:///c:/Users/niloy/Documents/Time%20Tracker/chronos-app/DESIGN.md)
