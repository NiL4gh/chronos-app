# CONTEXT.md — Chronos Codebase Ground Truth

> **Who reads this:** Antigravity (the coding agent) and Claude (the reasoning Brain).
> **What it is:** The accurate, verified state of every file in the repository. This is the single source of truth about what HAS been built and what HAS NOT. If it isn't listed as complete here, treat it as not existing.
>
> **Last verified:** 2026-05-21 (DateTimePicker mode=time + Projects due date picker upgrade)
> **DESIGN STATUS:** All UI components and pages have been rewritten to use the warm-light palette. See DESIGN.md for the design system specification.

---

## Repository Structure

```
chronos-app/
  index.html                  ← Google Fonts loads Inter (variable wght@300;400;500;600;700;800;900) + JetBrains Mono (wght@400;500;600) via two preconnect + link tags. DM Sans and DM Mono links are gone.
  package.json                ← React 18, Vite 5, React Router v6, Lucide React, Tailwind CSS 3 (Node 20.x specified, Rollup optionalDependencies configured for platform-specific binaries)
  .npmrc                      ← Sets legacy-peer-deps=true to ensure stable, reliable builds on Vercel
  tailwind.config.js          ← fontFamily.sans extended with Inter, fontFamily.mono with JetBrains Mono. animation and keyframes blocks added for bar-grow and status-pulse.
  postcss.config.js
  vite.config.js
  src/
    index.css                 ← Full rewrite. Radial mesh gradient on body background (3 warm amber radial-gradient layers, background-attachment: fixed). True glassmorphism utility classes (.glass-card backdrop-filter blur 12px, .glass-elevated blur 20px, .glass-interactive blur 10px with hover lift). New animation keyframes: bar-grow, status-pulse, pulse-ring, arc-draw. New utility classes: .lift-on-hover, .press-on-click, .status-dot-pulse, .timer-cta-pulse. Staggered bar grow delay classes .animate-bar-grow-delay-1 through -5. Font vars updated to Inter and JetBrains Mono.
    main.jsx                  ← BrowserRouter + <App />
    App.jsx                   ← Route definitions (Settings registered, role-based layout support)
    components/
      layout/
        AppShell.jsx          ← Unchanged from prior state. Still manages timer state, role switching, toast, CommandPalette, Outlet context.
        Sidebar.jsx           ← Keyboard shortcuts hint strip REMOVED. All other logic unchanged: collapse toggle, adminOnly nav gating, role switcher, user stub, Settings link, nav routes.
        Topbar.jsx            ← Full redesign. Height h-16. Frosted glass background (rgba(255,255,255,0.80) + backdrop-filter blur 16px). Three zones: LEFT: bold page title (font-weight 700, 15px) + dynamic date chip (amber tint, computed from new Date() — not hardcoded). CENTER: search bar with amber focus glow, w-80. RIGHT: "Start Timer" amber gradient button with pulse ring animation (.timer-cta-pulse class), icon-only "+" Manual button (32×32), live timer pill (green tint + pulsing red dot + mono counter) when running, square stop button (red tint) when running, notification bell with "3" count badge.
        DateTimePicker.jsx    ← Full rewrite to support `mode` prop (`'date' | 'datetime' | 'time'`). When mode=time: hides calendar button, shows only clock button, renders inline time wheel panel (not absolute, avoiding overflow clipping in drawers). isMounted guard prevents onTimeChange firing on mount. prevActivePanel ref commits value when panel closes. Set Time confirm button inside time panel. useEffect syncs viewYear/viewMonth when value prop changes. Calendar trigger pill is now w-full justify-center. Absolute dropdown panels (calendar + datetime time panel) wrapped in <div className="relative"> for proper positioning. All color refs use CSS vars.
        CommandPalette.jsx    ← COMPLETE — unchanged from prior state.
      ui/
        Avatar.jsx            ← COMPLETE
        Badge.jsx             ← COMPLETE
        Button.jsx            ← COMPLETE
        Card.jsx              ← COMPLETE
        Input.jsx             ← COMPLETE (exports Input and Select, uses CSS variables)
        ProgressBar.jsx       ← COMPLETE (exports ActivityBar, ProgressBar, CircularProgress)
        Table.jsx             ← COMPLETE (exports Table, TableHead, Th, TableBody, Tr, Td)
        Toggle.jsx            ← COMPLETE
        TrackingSourceBadge.jsx ← COMPLETE
        SlideOutDrawer.jsx    ← COMPLETE
        SplitButton.jsx       ← COMPLETE
        Toast.jsx             ← COMPLETE
        EmptyState.jsx        ← COMPLETE
      invoices/
        ProofOfWorkTab.jsx    ← COMPLETE — unchanged from prior state.
      team/
        MemberProfileDrawer.jsx ← Status dot on avatar header updated: active = bg-emerald-500 + status-dot-pulse class (pulsing), idle = bg-amber-400 (static), offline = var(--border-strong) (static). w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 borderColor var(--bg-surface). All other logic unchanged. Still used from: Dashboard recent logs table (member name click) and Team page (member card/row click). NOT used from: Dashboard Team Pulse, Reports page.
    pages/
      Dashboard.jsx           ← FULL REWRITE. Cadence toggle (Today / This Week / This Month) at top — state: cadence, filters all metrics. Four KPI cards: Total Hours, Billable Utilization %, Est. Revenue, Uninvoiced Hours. All cards glass-interactive, clickable to expand inline breakdown panel below the card row (expandedCard state). Needs Attention widget: auto-computes overdue invoices, over-budget projects, members with 0 hours today, pending signature invoices — each item clickable with triggerToast. Weekly bar chart: animated bars (animate-bar-grow + staggered delays), hover tooltips (glass-elevated absolute), bar click sets selectedBarDate and shows inline day detail panel below chart. Team Pulse: all 8 members, sorted active-first, each row has status dot (emerald pulse / amber static / gray static), utilization % (hoursToday/8×100), ActivityBar. Member row click toggles INLINE expansion below that row (selectedPulseMember state) showing stat chips + current project + last 2 entries. NO MemberProfileDrawer called from Team Pulse. Recent Time Logs table unchanged — member name click here still opens MemberProfileDrawer. Employee role: hides Needs Attention, Team Pulse, Revenue card, Uninvoiced card.
      Team.jsx                ← COMPLETE — unchanged from prior state (inline split panel already implemented in P6 of the previous session).
      Projects.jsx            ← COMPLETE + health flags added. getHealthFlag() computed per card at render time. Conditions: spent/budget ≥ 0.9 → "Over Budget" danger badge; ≥ 0.8 → "Budget Risk" warning badge; daysUntilDue ≤ 7 AND goalPct < 0.8 → "Due Soon" warning badge; daysUntilDue < 0 → "Overdue" danger badge. Badge renders top-right of card header as ml-auto element. **New Project creation drawer** is now fully implemented with SlideOutDrawer, handleCreateProject, and DateTimePicker for Due Date (replaces native Input type=date). DateTimePicker imported.
      Reports.jsx             ← FULL REWRITE. Filter bar: Start date, End date (default: 14 days ago to today), Member select, Project select — all drive filteredLogs. Four summary metric cards (same inline expansion pattern as Dashboard). Daily Hours Bar chart: animated bars, hover tooltips, bar click shows inline day detail panel. Billable Split SVG donut: segment click sets selectedDonutSegment, filters breakdown table, highlights selected segment (stroke-width + opacity). Detailed breakdown table: grouped by member, member section header clickable → inline split panel right side (selectedReportsMember state, w-80, two tabs: Overview + Time Breakdown). NO MemberProfileDrawer anywhere in this file. Totals row: amber-tinted background. SplitButton export unchanged.
      Invoices.jsx            ← COMPLETE — unchanged from prior state.
      MyTime.jsx              ← COMPLETE — unchanged from prior state.
      Settings.jsx            ← FULL REWRITE. Two-column layout: left nav sidebar (w-52, glass-card) + right content (flex-1). Seven sections selectable via left nav (activeSection state): 1. Workspace — org name, industry, timezone, date format, default billing rate. Save → triggerToast success. 2. Profile — avatar, name, email (read-only), job title. 3. Notifications — Toggle rows for 7 notification preferences, grouped into Email and In-App sub-sections. 4. Appearance — Theme cards (Light active, Dark coming soon), Density pills (Comfortable/Compact/Cozy), Sidebar toggle. 5. Shortcuts — Full keyboard shortcut reference table, grouped: Navigation (T,P,R,I,M,G+S), Timer (Space,N,⌘K), General (Esc,?,⌘S). Styled kbd tags. 6. Integrations — 6 integration cards (Slack, Google Calendar, Jira, GitHub, Gmail, Zoom) all with "Coming Soon" badges. 7. Billing — Current plan card (Pro, $29/mo, 8 members), usage progress bars (members 8/10, storage 2.4/5GB), Danger Zone card with red border.
    data/
      mockData.js             ← EXPANDED. teamMembers: 8 members total (u1–u8). u7 = Priya Sharma (Designer, active, activityLevel 88, hoursToday 5.5, hoursWeek 28, hourlyRate 90, availableHoursPerWeek 40). u8 = James Liu (QA Engineer, idle, activityLevel 22, hoursToday 1.0, hoursWeek 12, hourlyRate 70, availableHoursPerWeek 40). All u1–u6 members now have hourlyRate and availableHoursPerWeek fields added. projects: 7 total (p1–p7). p6 = Brand Redesign (Internal client, active, color #8b5cf6, monthly goal 60h, logged 51h, budget $8000, spent $7200, due 2026-05-28, members [u7]). p7 = API Integration (DataStream Inc, active, color #0ea5e9, project goal 120h, logged 44h, budget $15000, spent $5800, due 2026-07-01, members [u8, u3]). timeLogs: 24 entries spanning last 14 days, mix of u1–u6, all projects, auto/manual sources, billable/non-billable. New export: billingRates = { default: 95 }. invoices and dashboardMetrics and reportRows: unchanged.
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
All MVP Phase 1 requirements complete. Visual polish (Passes 1–6 of the Warm Light redesign) complete across all pages and components. DateTimePicker is now light-mode compatible with decoupled date/time panels. MemberProfileDrawer used only from: Dashboard recent logs table, Team page. Settings.jsx is now a real 7-section page. Project health flags are live on Projects page.

- **AppShell.jsx** — Manages side menu collapse, global manual time drawer state, role-restricted styling, amber warning banner when logged in as employee, global toast notification display, shared live timer state (timerRunning, timerSeconds, timerTaskLabel, timerProjectId, startTimer, stopTimer, resetTimer) passed to pages via Outlet context, commandPaletteOpen state with ⌘K/Ctrl+K global shortcut, CommandPalette rendered at root level.
- **Sidebar.jsx** — Provides navigation options gated by administrative privilege (`adminOnly` flags) and displays the user avatar stub (linked to Niloy Pal). Keyboard shortcuts hint strip removed.
- **Topbar.jsx** — Redesigned with a compound **"Start Timer"** + **"Manual"** action group, live timer pill when running, dynamic date chip, search bar, and notification bell.
- **Dashboard.jsx** — Cadence toggle (Today/Week/Month). Four KPI cards that expand inline. Needs Attention action queue widget. Weekly bar chart with animated bars and inline day detail panel. Team Pulse with inline expansion. Personal-only data gating and feature hiding for Employee role.
- **Team.jsx** — Roster list featuring grid and table view toggle, search criteria, and clickable member items that reveal the member profile drawer or inline split panel.
- **Projects.jsx** — Goal Engine with interactive cadences, goal percentage thresholds, project health flags (Over Budget, Budget Risk, Due Soon, Overdue), and an integrated EmptyState. New Project creation drawer fully functional: SlideOutDrawer with form fields (name, client, description, status, due date via DateTimePicker, budget). Adds new project to projectData state on submit.
- **Reports.jsx** — Multi-control filter bar driving filteredLogs. Interactive SVG Donut chart and Daily Hours Bar chart with drill-down. Detailed breakdown table with member headers opening an inline right-side split panel.
- **Invoices.jsx** — Interactive billing component featuring a two-panel layout, invoice status tabs, a Create Invoice drawer, and a secure client "Sign here" digital signature toggle.
- **MyTime.jsx** — Primary timer workspace. Live timer display synced to AppShell shared state via `useOutletContext`. Play/stop button calls `startTimer`/`stopTimer` from context. Expandable per-day timeline below strip shows filtered entries.
- **Settings.jsx** — Full 7-section settings page (Workspace, Profile, Notifications, Appearance, Shortcuts, Integrations, Billing) with two-column layout and keyboard shortcuts reference.
- **ProofOfWorkTab.jsx** — Work proof interface displaying application usage charts and diagnostic mock screenshots.
- **MemberProfileDrawer.jsx** — Header avatar has absolute status dot with emerald status-dot-pulse for active members. Used from Team page and Dashboard recent logs table.

---

## What Is Incomplete or Missing
- Real timer persistence across page refresh (expected — state in React memory only)
- ProofOfWorkTab.jsx remains Phase 2 placeholder
- Desktop App (Phase 2)
- Working CSV/PDF/Excel export (Blob API) — currently triggers toast
- Settings changes do not persist (local state only, no backend)
- Integration cards are all "Coming Soon"
- Notification bell panel not yet built (shows count badge only)
- Light/Dark mode toggle UI exists in Settings but dark mode not yet wired (Phase 2)

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
  id: string,             // 'u1' through 'u8'
  name: string,
  role: string,           // job title
  email: string,
  status: 'active' | 'idle' | 'offline',
  activityLevel: number,  // 0–100, drives ActivityBar color
  currentProject: string,
  currentTask: string,    // task description or 'Offline'
  hoursToday: number,
  hoursWeek: number,
  hourlyRate: number,
  availableHoursPerWeek: number,
  avatar: null,           // Phase 2: will hold image URL
}
```

### projects[]
```js
{
  id: string,             // 'p1' through 'p7'
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
