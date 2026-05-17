# DESIGN.md — Chronos Design System Ground Truth

> **THE GOLDEN RULE — READ THIS FIRST:**
>
> You are **STRICTLY FORBIDDEN** from altering the Tailwind classes on any component in `src/components/ui/`. These classes are the deliberate, reviewed aesthetic of the product. They represent frozen design decisions.
>
> **You MAY:** Edit internal logic, state, and data-fetching inside page components. Pass new props to existing UI components. Add new data to `mockData.js`. Create new page-level components that consume the design system.
>
> **You MAY NOT:** Change Tailwind classes on `<Button>`, `<Card>`, `<Badge>`, `<Input>`, `<Toggle>`, `<Table>`, `<Avatar>`, `<ProgressBar>`, `<TrackingSourceBadge>`, `<SlideOutDrawer>`, `<SplitButton>`, `<Toast>`, or `<EmptyState>`. Introduce color classes outside the approved palette. Override `font-family`, `letter-spacing`, or base typography. Add `!important` anywhere. Replace Lucide icons with any other icon library.
>
> **CONTEXT.md and DESIGN.md always win. When in doubt, ask the Brain.**

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 (functional components + hooks only) |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.x (JIT mode) |
| Routing | React Router v6 |
| Icons | Lucide React (`lucide-react@^0.383.0`) — no other icon library |
| Font | DM Sans (Google Fonts) via `index.html` link tag |
| State (Phase 1) | React `useState` / `useReducer` only. No external state library. |
| Data (Phase 1) | All data from `src/data/mockData.js`. Zero real API calls. |

---

## Design Philosophy

The aesthetic is **"Data-Dense but Incredibly Clean"** — think Linear, Vercel, or modern fintech dashboards. Every decision subordinates visual decoration to data legibility.

Key principles:
- **Dark-first always.** No light mode exists yet.
- **One accent color.** Violet-500 is the only saturated color used as a positive/primary action color. Everything else is neutral grays.
- **Desaturated semantic colors.** Success/warning/danger are always shown at 10% opacity background + colored text. Never a raw saturated fill.
- **No full-page navigation for data entry.** All creation/editing happens in Slide-Out Drawers. New pages are never created for forms.
- **Never leave blank space.** Empty states always show an icon, title, description, and a primary action.
- **Monospace for data.** All numbers, time values, durations, and monetary values use `font-mono`.

---

## Color Palette

```
Background (app shell):   bg-neutral-950    (#0a0a0a)
Surface (cards):          bg-neutral-900    (#171717)
Surface elevated:         bg-neutral-800    (#262626)
Border subtle:            border-neutral-800
Border stronger:          border-neutral-700

Text primary:             text-neutral-50   (#fafafa)
Text secondary:           text-neutral-400  (#a3a3a3)
Text body:                text-neutral-300
Text muted / captions:    text-neutral-500
Text disabled / hint:     text-neutral-600

Accent (primary):         bg-violet-500     (#8b5cf6)  — hover: bg-violet-400
Accent text:              text-violet-400
Accent tint background:   bg-violet-500/10
Accent border:            border-violet-500/20 or border-violet-500/40

Success:   text-emerald-400 / bg-emerald-500/10 / border-emerald-500/20
Warning:   text-amber-400   / bg-amber-500/10   / border-amber-500/20
Danger:    text-red-400     / bg-red-500/10     / border-red-500/20
Info:      text-sky-400     / bg-sky-500/10     / border-sky-500/20
```

**Approved palette classes (exhaustive):**
`neutral-*`, `violet-*`, `emerald-*`, `amber-*`, `red-*`, `sky-*`

No other color classes are permitted. No `blue-*`, `indigo-*`, `green-*`, `yellow-*`, `orange-*`, `pink-*`, `rose-*`, `teal-*`, `cyan-*`, `purple-*`, `fuchsia-*`, `lime-*`, `slate-*`, `zinc-*`, `stone-*`, `gray-*`.

---

## Typography

```
Font Family:
  --font-sans:   'DM Sans', sans-serif
  --font-mono:   'DM Mono', monospace  (fallback: ui-monospace, monospace)

Scale (Tailwind classes):
  Page Title:       text-2xl font-semibold tracking-tight text-neutral-50
  Section Header:   text-sm font-semibold uppercase tracking-widest text-neutral-500
  Card Title:       text-base font-medium text-neutral-100
  Body:             text-sm text-neutral-300
  Caption / Meta:   text-xs text-neutral-500
  Table Header:     text-xs font-semibold uppercase tracking-wider text-neutral-500
  Table Cell:       text-sm text-neutral-300
  Data / Numbers:   font-mono text-sm text-neutral-200
  Large Stat:       text-2xl font-semibold font-mono text-neutral-100
  XL Stat:          text-3xl font-bold text-neutral-100 tracking-tight
  Timer Display:    text-4xl font-mono font-semibold text-neutral-100 tabular-nums tracking-tight
```

---

## Spacing & Layout Rules

| Context | Rule |
|---|---|
| Card internal padding | `p-6` (large), `p-5` (metric/content), `p-4` (compact) |
| Section vertical gaps | `space-y-6` between major page sections |
| Card grid gaps | `gap-6` |
| Summary stat grid gaps | `gap-4` |
| Sidebar width (expanded) | `w-60` |
| Sidebar width (collapsed) | `w-16` |
| Topbar height | `h-14` |
| Page content padding | `px-8 py-6` |
| Table cell padding | `px-4 py-3` |
| Form field gaps (drawer) | `space-y-5` |
| Inline icon size (standard) | `size={16}` |
| Inline icon size (caption/dense) | `size={13}` or `size={14}` |
| SlideOutDrawer width | `w-full max-w-md` — never override |
| SlideOutDrawer z-index | backdrop `z-40`, panel `z-50` |
| Toast z-index | `z-[100]` — above all drawers and modals |

---

## Component Token Reference

### Button

```jsx
// Primary — main positive action
className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"

// Secondary — outlined, secondary action
className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"

// Ghost — minimal, tertiary action
className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"

// Danger — destructive action
className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"

// Success — positive confirmation action
className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
```

**Size overrides (applied on top of variant):**
- `size="sm"` → `px-3 py-1.5 text-xs`
- `size="lg"` → `px-5 py-2.5 text-base`

### Card

```jsx
// Default card
className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"

// Metric card (compact)
className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"

// Elevated (modals, dropdowns)
className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 shadow-xl shadow-black/40"

// Card with zero padding (table/list cards — padding applied per-section inside)
className="rounded-xl border border-neutral-800 bg-neutral-900"
```

`Card.jsx` accepts a `padding` prop (`"p-6"` default, or any string like `"p-5"`, `"p-4"`, `"p-0"`). Also accepts `className` for layout overrides (span, col, etc.).

### Badge

```jsx
// Success — emerald
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"

// Warning — amber
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"

// Danger — red
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"

// Info — sky
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20"

// Neutral — gray
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-neutral-700/50 text-neutral-400 border border-neutral-700"

// Violet — accent
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20"
```

### Input

```jsx
// Standard text / date / time input (optimized with color-scheme for native dark-theming of picker dropdowns)
className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 [color-scheme:dark]"

// Select
className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 cursor-pointer"

// Date / Time input (explicitly style-optimized)
className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 [color-scheme:dark]"

// Topbar Search (read-only placeholder — Phase 1)
// Must have Search icon left (size=13, text-neutral-600) and ⌘K kbd right.
// readOnly attribute required. No onChange or onClick in Phase 1.
<div className="relative">
  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
  <input
    readOnly
    placeholder="Search projects, tasks, or team members..."
    className="w-72 rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-16 py-2 text-sm text-neutral-600 placeholder-neutral-600 outline-none cursor-default hover:border-neutral-700 transition-colors duration-150"
  />
  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-700 pointer-events-none">⌘K</kbd>
</div>
```

### Table

```jsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-neutral-800">
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
    </tr>
  </thead>
  <tbody className="divide-y divide-neutral-800/50">
    <tr className="hover:bg-neutral-800/40 transition-colors duration-100">
      <td className="px-4 py-3 text-sm text-neutral-300">
    </tr>
  </tbody>
</table>
```

### ProgressBar / ActivityBar

**Color thresholds are fixed. Do not change them.**

```
LinearProgressBar — color by percentage of goal achieved:
  pct >= 85%:           bg-emerald-500   (on track / complete)
  pct >= 50% < 85%:     bg-violet-500    (in progress)
  pct < 50%:            bg-amber-500     (behind / low)

ActivityBar — color by raw activity value (0–100):
  value > 75:           bg-emerald-500   (actively working)
  value >= 40 <= 75:    bg-amber-500     (moderate activity)
  value < 40:           bg-red-500       (idle / low activity)
```

```jsx
// ActivityBar outer wrapper — MUST include title attribute for tooltip
<div
  title="{value}% Activity (Requires Desktop App)"
  className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden"
>
  <div
    className="h-full rounded-full transition-all duration-700 {color-class}"
    style={{ width: `${value}%` }}
  />
</div>

// LinearProgressBar — used in project cards
<div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
  <div
    className="h-full rounded-full transition-all duration-700 {color-class}"
    style={{ width: `${Math.min(100, pct)}%` }}
  />
</div>

// CircularProgress — SVG ring, used in GoalEngine
// Size prop controls width/height. StrokeWidth prop controls ring thickness.
// Label rendered in center as text.
```

### TrackingSourceBadge

This component is **mandatory on every time entry row** across the entire app.

```jsx
// Auto — desktop-verified
<span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  <Cpu size={10} />
  Auto
</span>

// Manual — self-reported
<span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
  <PenLine size={10} />
  Manual
</span>
```

### Avatar

```jsx
// Auto-generates a background color from the name hash.
// Sizes: xs (w-5 h-5 text-[9px]), sm (w-7 h-7 text-xs), md (w-9 h-9 text-sm), lg (w-11 h-11 text-base), xl (w-14 h-14 text-lg)
// Accepts: name (string — drives initials + color), size prop, className (for ring overlaps etc.)
```

### Toggle

```jsx
// Track — changes bg from neutral-700 (off) to violet-500 (on)
// Sizes: sm (w-8 h-4), md (w-11 h-6, default), lg (w-14 h-7)
// Thumb slides right when checked. White rounded-full.
// Focus ring: ring-2 ring-violet-500/40 ring-offset-neutral-900
// Props: checked (bool), onChange (fn), label (string, optional), description (string, optional), size
```

### SlideOutDrawer *(implemented)*

```jsx
// Backdrop
<div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200" />

// Panel
<div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl shadow-black/60 flex flex-col transition-transform duration-300 ease-in-out">

  // Header (sticky)
  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
    <h2 className="text-base font-semibold text-neutral-100">{title}</h2>
    <button className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors duration-150">
      <X size={16} />
    </button>
  </div>

  // Body (scrollable)
  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
    {children}
  </div>

  // Footer (sticky)
  <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-900">
    // Cancel = secondary button, Confirm = primary button
  </div>
</div>
```

**SlideOutDrawer rules:**
- Closes on backdrop click AND on Escape key press.
- `isOpen` prop + `onClose` callback — state lives in parent component.
- Animation: `translate-x-full` (closed) → `translate-x-0` (open). CSS transition only, no library.
- Width always `w-full max-w-md`. Never override.
- Three named drawers in the app:
  1. **"Add Manual Time"** — opened by Topbar "Log Time" button
  2. **"Edit Time Entry"** — opened by MoreHorizontal row action on time log tables
  3. **"Create Invoice"** — opened by "+ New" button in Invoices list panel header

### SplitButton *(implemented)*

```jsx
// Wrapper
<div className="relative inline-flex rounded-lg overflow-visible">

  // Main action (left segment)
  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-l-lg bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium transition-colors duration-150 border-r border-violet-400/40">
    <Download size={14} />
    Export to CSV
  </button>

  // Dropdown trigger (right segment)
  <button className="inline-flex items-center px-2.5 py-2 rounded-r-lg bg-violet-500 hover:bg-violet-400 text-white transition-colors duration-150">
    <ChevronDown size={14} />
  </button>

  // Dropdown menu (shown when trigger clicked)
  <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-neutral-700 bg-neutral-800 shadow-xl shadow-black/40 z-20 overflow-hidden">
    <button className="w-full text-left px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5 transition-colors duration-100">
      <FileText size={13} className="text-neutral-500" />Export to CSV
    </button>
    <button className="w-full text-left px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5 transition-colors duration-100">
      <FileDown size={13} className="text-neutral-500" />Export to PDF
    </button>
    <button className="w-full text-left px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 flex items-center gap-2.5 transition-colors duration-100">
      <Table2 size={13} className="text-neutral-500" />Export to Excel
    </button>
  </div>
</div>
```

**SplitButton rules:**
- Any export click fires a Toast: title = "Export started", message = "Your file will download shortly.", variant = "success".
- Dropdown closes on outside click (useEffect click-away listener inside component).
- Dropdown open/close state is internal to `SplitButton.jsx` via `useState`.

### Toast *(implemented)*

```jsx
// Fixed container (always mounted in AppShell, renders conditionally)
<div className="fixed bottom-6 right-6 z-[100] pointer-events-none">

  // Success variant
  <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3.5 shadow-xl shadow-black/40 min-w-[300px] max-w-sm animate-fade-in">
    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
      <CheckCircle2 size={11} className="text-emerald-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-neutral-100">{title}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{message}</p>
    </div>
    <button onClick={onDismiss} className="text-neutral-600 hover:text-neutral-300 transition-colors shrink-0 mt-0.5">
      <X size={14} />
    </button>
  </div>

  // Warning variant: swap emerald-* → amber-*, CheckCircle2 → AlertTriangle
</div>
```

**Toast rules:**
- Auto-dismisses after **4000ms** via `useEffect` + `setTimeout`.
- State lives in `AppShell.jsx`: `{ visible, title, message, variant }`.
- `triggerToast(title, message, variant)` is a callback passed as prop to pages that need it.
- Only one Toast visible at a time. New `triggerToast` call resets the timer and replaces content.

### EmptyState *(implemented)*

```jsx
// Props: icon (Lucide component ref), title, description, action (optional JSX)
<div className="flex flex-col items-center justify-center py-20 px-6 text-center">
  <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-5">
    <Icon size={22} className="text-neutral-600" />
  </div>
  <p className="text-sm font-medium text-neutral-300">{title}</p>
  <p className="text-xs text-neutral-600 mt-1.5 max-w-[260px] leading-relaxed">{description}</p>
  {action && <div className="mt-5">{action}</div>}
</div>
```

**EmptyState rules:**
- `icon` prop must always be a Lucide component reference (e.g., `icon={FolderKanban}`). Never an image or raw SVG string.
- `action` is optional. When provided, renders below description (typically a Button).
- Used on **Projects page** when filter tabs return zero results.
- Used on **Invoices page** when a status tab has zero invoices.

### CommandPalette

```jsx
// Backdrop — full screen, closes on click
<div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm" />

// Panel
<div className="w-full max-w-lg rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl shadow-black/60 overflow-hidden animate-fade-in">

  // Search row
  <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
    <Search size={15} className="text-neutral-500 shrink-0" />
    <input className="flex-1 bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none" />
    <kbd className="font-mono text-xs text-neutral-600 border border-neutral-700 rounded px-1.5 py-0.5">ESC</kbd>
  </div>

  // Result item
  <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-800/60 transition-colors duration-100">
    <div className="w-7 h-7 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
      <Icon size={13} className="text-neutral-400" />
    </div>
    // label: text-sm text-neutral-200 truncate
    // sublabel: text-xs text-neutral-500 truncate
    // type tag: text-xs text-neutral-600 shrink-0
  </button>

  // Footer
  <div className="flex items-center gap-4 px-4 py-2 border-t border-neutral-800">
    // hint text: text-xs text-neutral-700
  </div>
</div>
```

**CommandPalette rules:**
- z-index `z-[200]` — above everything including Toast (`z-[100]`) and drawers (`z-50`)
- Opens on: search bar click, ⌘K (Mac), Ctrl+K (Windows)
- Closes on: ESC key, backdrop click
- State lives in `AppShell.jsx` as `commandPaletteOpen`
- Data source: `projects` and `teamMembers` from `mockData.js` — no API calls
- Selecting a result navigates to the item's route and closes the palette

---

## Animations

These keyframes are defined in `index.css` and `tailwind.config.js`:

```css
@keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
.animate-pulse-dot { animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

`animate-fade-in` is applied to every page's root `<div>` and to slide-out drawer content.

---

## Invoice-Specific Design Rules

### Status Tab Styles (used in Invoices list panel)
```
Active tab:   bg-violet-500/10 text-violet-400 border border-violet-500/20
Inactive tab: text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 border border-transparent
```
These are identical to the Projects page filter tab styles.

### Invoice List Item Selection
```
Selected:     bg-violet-500/5 border-l-2 border-l-violet-500
Unselected:   border-l-2 border-l-transparent hover:bg-neutral-800/40
```

### Signature Area (when toggle is ON)
```jsx
<div className="rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-900/50 h-28 flex flex-col items-center justify-center gap-2">
  <PenLine size={18} className="text-neutral-600" />
  <p className="text-sm text-neutral-500">Sign here</p>
  <p className="text-xs text-neutral-700">Awaiting client signature via secure link</p>
</div>
```
Label is **"Sign here"** — not "Client Signature Area". `border-dashed` is mandatory.

### Invoice Detail Toolbar Button Order (left to right in right-side actions area)
1. "Download PDF" — Ghost variant with `<Download size={14} />`
2. "Send Invoice" — Primary variant with `<Send size={14} />`

---

## Nav Item Active / Inactive States

```
Active:   bg-violet-500/10 text-violet-400 border border-violet-500/20
Inactive: text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent
```

These classes apply to Sidebar NavLink items, status filter tabs, and invoice pipeline tabs. They are always the same pattern.
