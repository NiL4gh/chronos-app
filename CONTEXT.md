# CONTEXT.md — Chronos Codebase Ground Truth

> **Who reads this:** Antigravity (the coding agent) and Claude (the reasoning Brain).
> **What it is:** The accurate, verified state of every file in the repository. This is the single source of truth about what HAS been built and what HAS NOT. If it isn't listed as complete here, treat it as not existing.
>
> **Last verified:** 2026-05-17 (full codebase audit after Niloy Pal name update and component implementation completion)

---

## Repository Structure

```
chronos-app/
  index.html                  ← DM Sans font loaded via Google Fonts link tag
  package.json                ← React 18, Vite 5, React Router v6, Lucide React, Tailwind CSS 3 (Node 20.x specified)
  .npmrc                      ← Sets legacy-peer-deps=true to ensure stable, reliable builds on Vercel
  tailwind.config.js          ← Custom animations: animate-fade-in, animate-pulse-dot
  postcss.config.js
  vite.config.js
  src/
    index.css                 ← Keyframe definitions for fade-in and pulse-dot
    main.jsx                  ← BrowserRouter + <App />
    App.jsx                   ← Route definitions (Settings registered, role-based layout support)
    components/
      layout/
        AppShell.jsx          ← Sidebar + Topbar + main content area (Full Toast, drawer state, role switching support, shared timer state: timerRunning/timerSeconds/timerTaskLabel/timerProjectId/startTimer/stopTimer/resetTimer passed via Outlet context, commandPaletteOpen state, ⌘K global shortcut)
        Sidebar.jsx           ← Nav items, collapse toggle, user stub (Gated by active role, Settings link active, role switcher moved here — two stacked buttons above user stub, icon-only when collapsed)
        Topbar.jsx            ← Page titles, search (opens CommandPalette on click), compound timer group (live ticking pill when running, Square stop button, Start Timer when stopped), role switcher pill REMOVED
      ui/
        Avatar.jsx            ← COMPLETE
        Badge.jsx             ← COMPLETE
        Button.jsx            ← COMPLETE
        Card.jsx              ← COMPLETE
        Input.jsx             ← COMPLETE (exports Input and Select, optimized with [color-scheme:dark])
        ProgressBar.jsx       ← COMPLETE (exports ActivityBar, ProgressBar, CircularProgress)
        Table.jsx             ← COMPLETE (exports Table, TableHead, Th, TableBody, Tr, Td)
        Toggle.jsx            ← COMPLETE
        TrackingSourceBadge.jsx ← COMPLETE
        SlideOutDrawer.jsx    ← COMPLETE
        SplitButton.jsx       ← COMPLETE
        Toast.jsx             ← COMPLETE
        EmptyState.jsx        ← COMPLETE
    pages/
      Dashboard.jsx           ← COMPLETE (clickable member profiles, personal-only data gating for employee role)
      Team.jsx                ← COMPLETE (search, Grid/Table toggle, stats, clickable member profiles, drawerInitialTab state controls which MemberProfileDrawer tab opens, View Logs opens on 'Time Logs' tab, Message fires mailto: link)
      Projects.jsx            ← COMPLETE (GoalEngine with cadence dropdown, EmptyState integration, summary stats value-first layout, ProjectCard hover tint, elevated Edit Goal button, stat label contrast fixes)
      Reports.jsx             ← COMPLETE (detailed breakdown, clickable member profiles, SplitButton export, triggerToast integration, metric card icon borders, violet underline accents, bar chart background track with minHeight guard, filter bar border-neutral-700/60, group class on table rows)
      Invoices.jsx            ← COMPLETE (two-panel, status pipeline tabs, signature area, "Sign here" toggle, Create Invoice drawer, invoice list item client-name-first layout, detail toolbar with font-mono invoice number + inline StatusBadge + violet accent, detail body summary card replaces redundant invoice number)
      MyTime.jsx              ← COMPLETE (live timer synced to AppShell context via useOutletContext, formatTimer helper, expandable per-day timeline panel below week strip, week dates computed dynamically from current date, timer card left-border accent transitions emerald when running, day tile base borders visible, separator dot in expanded panel entries)
      Settings.jsx            ← COMPLETE (workspace settings placeholder cards)
    components/
      invoices/
        ProofOfWorkTab.jsx    ← COMPLETE (desktop integration mock screenshots and app usage tracker)
      team/
        MemberProfileDrawer.jsx ← COMPLETE (context-aware member profile side drawer, accepts initialTab prop (string: 'Overview', 'Time Logs', etc.), useEffect resets tab on member/initialTab change, status dot on avatar header, elevated surface cards bg-neutral-800/60, todayStr computed dynamically)
      layout/
        CommandPalette.jsx    ← COMPLETE (⌘K command palette, searches projects + teamMembers from mockData, navigate on select, ESC to close, backdrop click to close)
      layout/
        CommandPalette.jsx    ← COMPLETE (⌘K command palette, searches projects + teamMembers from mockData, navigate on select, ESC to close)
    data/
      mockData.js             ← COMPLETE (teamMembers, projects, timeLogs, invoices, dashboardMetrics, reportRows)
```

---

## What Is Fully Working

### UI Components (src/components/ui/)
All the following components are implemented, frozen, and must not have their Tailwind classes changed:

- **Avatar.jsx** — Renders initials from name, auto-colors from name hash, sizes: xs/sm/md/lg/xl
- **Badge.jsx** — Variants: success (emerald), warning (amber), danger (red), info (sky), neutral (gray), violet
- **Button.jsx** — Variants: primary, secondary, ghost, danger, success. Sizes: sm, md, lg. Uses `forwardRef`.
- **Card.jsx** — Exports: `Card` (default, accepts `padding` and `className`), `CardHeader`, `CardTitle`, `CardDescription`
- **Input.jsx** — Exports: `Input` (default), `Select`. Standard form inputs with focus ring and `[color-scheme:dark]` utility to properly dark-theme native date/time pickers.
- **ProgressBar.jsx** — Exports: `ActivityBar` (color by activity value, always needs `title` tooltip), `ProgressBar` (color by goal %), `CircularProgress` (SVG ring with center label)
- **Table.jsx** — Exports: `Table`, `TableHead`, `Th`, `TableBody`, `Tr`, `Td`
- **Toggle.jsx** — Sizes: sm/md/lg. Props: `checked`, `onChange`, `label`, `description`, `size`
- **TrackingSourceBadge.jsx** — Props: `source` ('auto' | 'manual'). Auto = green CPU icon. Manual = amber PenLine icon.
- **SlideOutDrawer.jsx** — Premium drawer component sliding from the right, with customizable header, footer, body, backdrop click-dismissal, and Escape key listeners.
- **SplitButton.jsx** — High-fidelity split button that triggers a toast on export option selection.
- **Toast.jsx** — Dynamic toast notification component with auto-dismissal after 4000ms.
- **EmptyState.jsx** — Clean placeholder graphic for tabs or lists with no active records.

### Pages and Layouts
- **AppShell.jsx** — Manages side menu collapse, global manual time drawer state, role-restricted styling, amber warning banner when logged in as employee, global toast notification display, shared live timer state (timerRunning, timerSeconds, timerTaskLabel, timerProjectId, startTimer, stopTimer, resetTimer) passed to pages via Outlet context, commandPaletteOpen state with ⌘K/Ctrl+K global shortcut, CommandPalette rendered at root level.
- **Sidebar.jsx** — Provides navigation options gated by administrative privilege (`adminOnly` flags) and displays the user avatar stub (linked to Niloy Pal).
- **Topbar.jsx** — Redesigned with a compound **"Start Timer"** + **"Manual"** action group and an in-memory **Admin/Employee role switcher pill**.
- **Dashboard.jsx** — Fully gated dashboard that hides the Team Pulse module in Employee view and filters the time log database to personal logs only (`userId === 'u1'`). Member profiles are clickable.
- **Team.jsx** — Roster list featuring grid and table view toggle, search criteria, and clickable member items that reveal the member profile drawer.
- **Projects.jsx** — Showcases the Goal Engine with interactive cadences, goal percentage thresholds, and an integrated EmptyState replacement for unmatched filters.
- **Reports.jsx** — Features a dynamic data summary grid, billable percentage charts, detailed time tracking metrics, clickable member names, and SplitButton exports.
- **Invoices.jsx** — Interactive billing component featuring a two-panel layout, invoice status tabs, a Create Invoice drawer, and a secure client "Sign here" digital signature toggle.
- **MyTime.jsx** — Primary timer workspace. Live timer display synced to AppShell shared state via `useOutletContext`. Play/stop button calls `startTimer`/`stopTimer` from context. Week strip dates computed dynamically (Monday-based, current week). Expandable per-day timeline below strip shows filtered entries with project color dot, task name, separator dot, project name, time range, duration, TrackingSourceBadge, and billable indicator. Timer card shows emerald left-border accent when running.
- **Settings.jsx** — Workspace settings module containing basic metadata card placeholders.
- **ProofOfWorkTab.jsx** — Work proof interface displaying application usage charts and diagnostic mock screenshots.
- **MemberProfileDrawer.jsx** — Modular side drawer with context-aware tabbed navigation. Accepts `initialTab` (string) prop — valid values are tab label strings from TAB_CONFIG. useEffect resets activeTab on member/initialTab change. Header avatar has absolute status dot (emerald/amber/neutral). All inner cards use bg-neutral-800/60 border-neutral-700/60 to be visible against the drawer bg-neutral-900 background. todayStr computed dynamically — no hardcoded dates.

### Mock Data (src/data/mockData.js)
All arrays are fully populated and exported:
- `teamMembers` — 6 members (u1–u6) with status, activityLevel, currentProject, currentTask, hoursToday, hoursWeek
- `projects` — 5 projects (p1–p5) with goalType, goalHours, loggedHours, budget, spent, dueDate, members, tags
- `timeLogs` — 8 entries mixing 'auto' and 'manual' sources
- `invoices` — 3 invoices (pending, overdue, paid) with full line items
- `dashboardMetrics` — today totals, delta values, weeklyHours array
- `reportRows` — 5 rows for Reports page table

---

## What Is Incomplete or Missing
- All MVP Phase 1 requirements have been successfully met and are fully functional.
- Visual polish pass (P6, P6B, P6C) is complete across all pages.
- Settings.jsx remains a placeholder — real content (workspace name, billing, API keys, notifications, permissions) is Phase 2.
- ProofOfWorkTab.jsx remains a Phase 2 placeholder — requires desktop app data.
- Real timer persistence (reset on page refresh) is expected behavior in Phase 1 — state lives in React memory only.

---

## Route Map

| Path | Component | Status | Role |
|---|---|---|---|
| `/dashboard` | `Dashboard.jsx` | ✅ Registered | Admin + Employee |
| `/team` | `Team.jsx` | ✅ Registered | Admin only |
| `/projects` | `Projects.jsx` | ✅ Registered | Admin + Employee |
| `/reports` | `Reports.jsx` | ✅ Registered | Admin only |
| `/invoices` | `Invoices.jsx` | ✅ Registered | Admin only |
| `/my-time` | `MyTime.jsx` | ✅ Registered | Admin + Employee |
| `/settings` | `Settings.jsx` | ✅ Registered | Admin + Employee |

---

## Data Schema Reference

### teamMembers[]
```js
{
  id: string,             // 'u1' through 'u6'
  name: string,
  role: string,           // job title
  email: string,
  status: 'active' | 'idle' | 'offline',
  activityLevel: number,  // 0–100, drives ActivityBar color
  currentProject: string,
  currentTask: string,    // task description or 'Offline'
  hoursToday: number,
  hoursWeek: number,
  avatar: null,           // Phase 2: will hold image URL
}
```

### projects[]
```js
{
  id: string,             // 'p1' through 'p5'
  name: string,
  client: string,
  status: 'active' | 'paused' | 'completed',
  color: string,          // hex color for project dot indicator
  goalType: 'daily' | 'weekly' | 'monthly' | 'project',
  goalHours: number,
  loggedHours: number,
  budget: number,         // in USD
  spent: number,          // in USD
  dueDate: string,        // 'YYYY-MM-DD'
  members: string[],      // array of teamMember ids
  description: string,
  tags: string[],
}
```

### timeLogs[]
```js
{
  id: string,
  userId: string,         // ref to teamMembers[].id
  userName: string,
  projectId: string,      // ref to projects[].id
  projectName: string,
  task: string,
  date: string,           // 'YYYY-MM-DD'
  startTime: string,      // 'HH:MM'
  endTime: string,        // 'HH:MM'
  duration: number,       // hours, decimal
  source: 'auto' | 'manual',
  billable: boolean,
}
```

### invoices[]
```js
{
  id: string,
  invoiceNumber: string,  // 'INV-YYYY-NNN'
  client: { name, email, address },
  project: string,
  issueDate: string,
  dueDate: string,
  status: 'pending' | 'overdue' | 'paid',
  requiresSignature: boolean,
  lineItems: [{ description, hours, rate, total }],
  subtotal: number,
  tax: number,
  total: number,
  notes: string,
}
```

---

## Desktop App Data Schema (Phase 2 — Do Not Implement in Phase 1)

This schema exists as a comment block in `mockData.js`. Do not use these fields in any Phase 1 component.

```js
// screenshots: Array<{ id, userId, timestamp, imageUrl, projectId, blurred }>
// appUsage:    Array<{ userId, date, app, duration, category, projectId }>
// ProofOfWorkTab.jsx will consume these in Phase 2.
```
