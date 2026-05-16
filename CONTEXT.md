# CONTEXT.md — Chronos Time Tracker: Ground Truth Document

---

## ⚠️ THE GOLDEN RULE

> **CRITICAL WARNING FOR ALL FUTURE AI AGENTS AND DEVELOPERS:**
>
> You are **STRICTLY FORBIDDEN** from altering the core design system classes, component wrappers, or layout primitives defined in this document and implemented in `src/components/ui/`. These tokens represent the deliberate, reviewed aesthetic of the product.
>
> **You MAY:**
> - Edit internal logic, state, and data-fetching inside page components.
> - Pass new props to existing UI components.
> - Add new data to `src/data/mockData.js`.
> - Create new page-level components that *consume* the design system.
>
> **You MAY NOT:**
> - Change the Tailwind classes on `<Button>`, `<Card>`, `<Badge>`, `<Input>`, `<Toggle>`, or `<Table>` wrappers.
> - Introduce new color classes outside the approved palette.
> - Override `font-family`, `letter-spacing`, or base typography settings.
> - Add `!important` overrides anywhere.
> - Replace Lucide icons with any other icon library.
>
> Violating the Golden Rule will introduce visual inconsistency that degrades the premium feel of the product. When in doubt, ask.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 (functional components + hooks only) |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.x (JIT mode, custom config) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Font | DM Sans (Google Fonts) — display headings via `font-display`; body via `font-sans` |
| State (Phase 1) | React `useState` / `useReducer` only. No external state library. |
| Data (Phase 1) | All data from `src/data/mockData.js`. Zero real API calls. |

---

## Color Palette

```
Background (app shell):  bg-neutral-950   (#0a0a0a)
Surface (cards):         bg-neutral-900   (#171717)
Surface elevated:        bg-neutral-800   (#262626)
Border:                  border-neutral-800 / border-neutral-700
Text primary:            text-neutral-50  (#fafafa)
Text secondary:          text-neutral-400 (#a3a3a3)
Text muted:              text-neutral-600 (#525252)

Accent (primary):        bg-violet-500    (#8b5cf6)  — hover: bg-violet-400
Accent text:             text-violet-400
Accent border:           border-violet-500/40

Success:                 text-emerald-400 / bg-emerald-500/10 border-emerald-500/20
Warning:                 text-amber-400   / bg-amber-500/10   border-amber-500/20
Danger:                  text-red-400     / bg-red-500/10     border-red-500/20
Info:                    text-sky-400     / bg-sky-500/10     border-sky-500/20
```

**Principle:** Dark-first. One strong violet accent. Everything else is neutral grays. Semantic colors are *always* desaturated (10% opacity backgrounds). Never use a raw saturated color as a background fill.

---

## Typography

```
Font Family:
  --font-sans:    'DM Sans', sans-serif
  --font-mono:    'DM Mono', monospace

Scale (Tailwind classes):
  Page Title:      text-2xl font-semibold tracking-tight text-neutral-50
  Section Header:  text-sm font-semibold uppercase tracking-widest text-neutral-500
  Card Title:      text-base font-medium text-neutral-100
  Body:            text-sm text-neutral-300
  Caption/Meta:    text-xs text-neutral-500
  Table Header:    text-xs font-semibold uppercase tracking-wider text-neutral-500
  Table Cell:      text-sm text-neutral-300
  Monospace/Data:  font-mono text-sm text-neutral-200
```

---

## Design Tokens — Component Classes

### Button

```jsx
// Primary
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">

// Secondary (outlined)
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors duration-150">

// Ghost
<button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-sm font-medium transition-colors duration-150">

// Danger
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors duration-150">
```

### Card

```jsx
// Default card
<div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">

// Elevated (modals, dropdowns)
<div className="rounded-xl border border-neutral-700 bg-neutral-800 p-6 shadow-xl shadow-black/40">

// Metric card (compact)
<div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
```

### Input

```jsx
<input className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150">

// Select
<select className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-150 cursor-pointer">
```

### Badge

```jsx
// Auto (success)
<span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">

// Manual (warning)
<span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">

// Active (info)
<span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">

// Idle (neutral)
<span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-neutral-700/50 text-neutral-400 border border-neutral-700">
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

---

## Spacing & Layout Rules

| Context | Rule |
|---|---|
| Card internal padding | `p-6` (large), `p-5` (metric), `p-4` (compact) |
| Section vertical gaps | `space-y-6` between major sections |
| Grid column gaps | `gap-6` for card grids |
| Sidebar width (expanded) | `w-60` |
| Sidebar width (collapsed) | `w-16` |
| Topbar height | `h-14` |
| Page content padding | `px-8 py-6` |
| Table cell padding | `px-4 py-3` |
| Form field gaps | `space-y-4` |
| Inline icon size | `16px` (Lucide `size={16}`) or `size={14}` for captions |

---

## File Structure

```
vercel.json
src/
  components/
    invoices/
      ProofOfWorkTab.jsx
    ui/
      Button.jsx
      Card.jsx
      Badge.jsx
      Input.jsx
      Toggle.jsx
      Table.jsx
      TrackingSourceBadge.jsx
      Avatar.jsx
      ProgressBar.jsx
      SlideOutDrawer.jsx
      SplitButton.jsx
      Toast.jsx
      EmptyState.jsx
    layout/
      AppShell.jsx
      Sidebar.jsx
      Topbar.jsx
    team/
      MemberProfileDrawer.jsx
  pages/
    Dashboard.jsx
    Team.jsx
    Projects.jsx
    Reports.jsx
    Invoices.jsx
    MyTime.jsx
    Settings.jsx
  data/
    mockData.js
  App.jsx
  main.jsx
```

---

## Route Map

| Path | Component | Role |
|---|---|---|
| `/dashboard` | `Dashboard.jsx` | CEO Command Center |
| `/team` | `Team.jsx` | Team roster + status |
| `/projects` | `Projects.jsx` | Project list + goal engine |
| `/reports` | `Reports.jsx` | Export + analytics |
| `/invoices` | `Invoices.jsx` | Invoice generator |
| `/my-time` | `MyTime.jsx` | Personal time log |
| `/settings` | `Settings.jsx` | Workspace settings |

---

## Implementation Status

**Mark as COMPLETE:**
- `SlideOutDrawer.jsx` — ✅ COMPLETE
- `SplitButton.jsx` — ✅ COMPLETE
- `Toast.jsx` — ✅ COMPLETE
- `EmptyState.jsx` — ✅ COMPLETE
- `Settings.jsx` — ✅ COMPLETE
- `src/components/invoices/ProofOfWorkTab.jsx` — ✅ COMPLETE

**Mark as COMPLETE (previously INCOMPLETE):**
- `AppShell.jsx` — Toast state, triggerToast, SlideOutDrawer state, role prop all wired
- `Sidebar.jsx` — adminOnly flags, role filtering, Settings link fixed to /settings
- `Topbar.jsx` — Log Time wired, search input fixed to spec
- `App.jsx` — /settings route registered, role="admin" passed to AppShell
- `Reports.jsx` — SplitButton replacing plain button, triggerToast wired
- `Invoices.jsx` — Pipeline tabs, EmptyState, Create Invoice drawer, "Sign here" fix

**Recent Architecture Updates:**
- `App.jsx` — role state lives here, passed as prop to AppShell with onRoleChange setter
- `AppShell.jsx` — accepts onRoleChange, passes it to Topbar, shows amber employee-view banner when role = 'employee'
- `Topbar.jsx` — compound timer action group (Start Timer primary + Manual sub-button), role switcher pill (Admin/Employee toggle)
- `Dashboard.jsx` — consumes role from outlet context; hides Team Pulse in employee view; filters time logs to userId 'u1' in employee view; member names clickable
- `Team.jsx` — member names clickable (grid + table), opens MemberProfileDrawer with context='team'
- `Reports.jsx` — member names clickable, opens MemberProfileDrawer with context='reports'
- `Input.jsx` — [color-scheme:dark] added so native date pickers render correctly on dark background
- `src/components/team/MemberProfileDrawer.jsx` — ✅ COMPLETE. Context-sensitive member profile drawer with tabs.

**Role System Implementation:**
- role state is in App.jsx, defaults to 'admin'
- Mock current user is u1 (Niloy Pal) for employee view scoping
- Switcher in Topbar: two-button pill, no login required
- Employee view: amber banner, restricted sidebar (Team/Reports/Invoices absent from DOM), personal-only data
