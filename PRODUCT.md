# PRODUCT.md — Chronos: Product Ground Truth

> **Who reads this:** Claude (the reasoning Brain), Antigravity (the coding agent), and any future collaborator.
> **What it is:** The single source of truth for what Chronos IS, what it does, who it's for, and what every feature must accomplish. No implementation detail lives here — this is pure product definition.

---

## 1. Product Vision

**Chronos** is a premium B2B time-tracking and team-intelligence SaaS platform. It targets startup CEOs and team leads who need verifiable, honest insight into how their team spends time — without resorting to invasive surveillance tools.

The product operates on a deceptively simple philosophy: **make it effortless to log time and impossible to fake the data.** Manual entries are always marked as such. Desktop-captured entries carry proof. Admins always know what they are looking at.

### The Positioning Statement
> *Chronos is what you get if Toggl Track had Hubstaff's accountability features, a Linear-quality design system, and a native invoice engine built in.*

---

## 2. Target Audience & Role System

Chronos is strictly organization-focused. Every user belongs to one organization and has exactly one of two roles.

### Role A — Admin (Startup CEO / Team Lead)
- Needs high-level oversight: team activity, project health, billing status
- Must be able to see who is working on what in real time
- Needs to generate and send professional invoices from tracked time
- Needs verifiable, source-tagged time data to resolve billing disputes
- Has access to the **entire** platform

### Role B — Employee
- Needs a frictionless way to log time and start/stop a live timer
- Needs to see their own progress toward daily/weekly goals
- Needs to prove they were working when questioned
- **Cannot** access: Team roster, Financial Reports, Invoices, or any company financial data
- Has a restricted sidebar and restricted dashboard

### Role-Based UI — Hard Rules
| Route | Admin | Employee |
|---|---|---|
| `/dashboard` | Full CEO Command Center | Simplified personal view |
| `/team` | ✅ Full access | ❌ Hidden from DOM |
| `/projects` | ✅ Full access | ✅ Read-only view |
| `/reports` | ✅ Full access | ❌ Hidden from DOM |
| `/invoices` | ✅ Full access | ❌ Hidden from DOM |
| `/my-time` | ✅ Full access | ✅ Full access |
| `/settings` | ✅ Full access | ✅ Limited access |

**Implementation rule:** Admin-only routes must be **absent from the DOM** for employees. Never hide them with CSS opacity or `display:none`. The `adminOnly` flag on nav items is the gating mechanism.

---

## 3. Competitive Positioning — The Four Gaps Chronos Fills

Toggl Track is the baseline competitor. Chronos specifically fills these four fatal flaws in Toggl's offering:

### Gap 1 — Goal Flexibility
- **Toggl's flaw:** Weekly goals only. No daily, monthly, or project-based targets.
- **Chronos solution:** A flexible Goal Engine allowing goals by Day, Week, Month, or Project budget. Each project card has an inline Goal Engine with a circular progress indicator, a linear progress bar with color thresholds, and a live cadence selector dropdown that updates the displayed goal type.

### Gap 2 — Trust & Source Verification
- **Toggl's flaw:** Manually entered time looks identical to live auto-tracked time. No way to distinguish.
- **Chronos solution:** Every single time entry carries an immutable **Tracking Source Badge** — either `Auto` (green, desktop-verified) or `Manual` (amber, self-reported). This badge appears everywhere: dashboard logs, team pulse, reports table, My Time entries. It cannot be hidden or overridden.

### Gap 3 — Native Invoicing
- **Toggl's flaw:** No native invoice generation. Must export data and rebuild invoices in another tool.
- **Chronos solution:** Native invoice generation with line items pulled from tracked time. Two-panel layout (list + live preview). Status pipeline (Draft → Pending Signature → Paid / Overdue).

### Gap 4 — Legal Audit Trail
- **Toggl's flaw:** No way to get client sign-off on timesheets or invoices.
- **Chronos solution:** Digital Signature toggle directly on invoices. When ON, reveals a designated "Sign here" area and a "Send for Signature" action that creates an audit trail.

### Gap 5 (Desktop-dependent) — Work Intensity Context
- **Toggl's flaw:** Only captures duration. Does not know how intensely you worked.
- **Chronos solution:** Activity Levels (keystroke/mouse data from desktop app) show a 0–100% activity score alongside every time entry. Color-coded: green (>75%), amber (40–75%), red (<40%).

---

## 4. The Hybrid Architecture

Chronos is a **two-product ecosystem**. The webapp is the command center. The desktop app is the data supercharger.

### The Webapp (Phase 1 — Current Build)
- Fully functional standalone product
- Manual time tracking via a Slide-Out Drawer
- Project management with goal tracking
- Team visibility (for admins)
- Reporting with source-based filtering
- Invoice generation with digital signature support
- Works perfectly without the desktop app; data is limited to manually-input information

### The Desktop App (Phase 2 — Not yet built)
- Optional Windows install; runs in the background
- Captures: active window titles, URLs, keystroke/mouse activity levels, periodic screenshots
- All data syncs to the webapp database
- Unlocks Activity Level bars, Proof of Work tab, and Auto-source badges on entries

### The Synergy
When both are in use, the Admin dashboard dynamically enriches data:
- A **manual** time entry = text only, amber "Manual" badge
- An **auto-tracked** entry = linked to screenshots, activity percentage, and app usage breakdown via the Proof of Work tab

---

## 5. Complete Feature Matrix

### A. Admin Dashboard — CEO Command Center
- **Macro Metric Cards (3):** Total Team Hours Today (with delta), Active Projects (with delta), Project Profitability Margin (with delta)
- **Team Pulse panel:** Live roster of non-offline employees. Each row: Avatar + name + status badge, current task (truncated), Activity Level bar (color-coded), hours today. Bars carry a browser tooltip: `"{value}% Activity (Requires Desktop App)"`.
- **Weekly Hours bar chart:** 5-day bar chart, today's bar in violet, all others neutral. Shows hours per day with total.
- **Recent Time Logs table:** Last 48 hours of all team entries. Columns: Member, Project, Task, Date, Time range, Duration, **Tracking Source Badge**, Billable, Actions.

### B. Tracking Engine & Source Distinction
- **Manual Time Entry:** Via a Slide-Out Drawer (right-side panel). Fields: Task description, Project (select), Date, Start Time, End Time, Billable toggle.
- **Auto Tracking:** Desktop app only — not in Phase 1.
- **Tracking Source Badge:** Mandatory on every time entry row across the entire app.
  - `Auto` → green badge with CPU icon
  - `Manual` → amber badge with PenLine icon
- **Proof of Work tab (Phase 2):** Screenshots + app usage breakdown per time block. Phase 1 has a placeholder UI.

### C. Flexible Goal Engine (per project card)
- Circular progress indicator showing logged vs. goal hours
- Linear progress bar with color thresholds (≥85% green, ≥50% violet, <50% amber)
- Cadence dropdown: Daily / Weekly / Monthly / Project-based
- Goal hours and cadence stored per project in mock data

### D. Reports & Export
- **Filter bar:** Start date, End date, View (Daily/Weekly/Monthly), Member filter, Project filter
- **Summary metrics (4 cards):** Total Hours, Billable Hours, Est. Revenue, Active Members
- **Daily Hours Distribution chart:** Bar chart, violet fill, team aggregate
- **Billable Split donut chart:** Violet segment = billable, neutral = non-billable, with percentage center label
- **Detailed breakdown table:** Per member, per project, per day. Totals row at bottom.
- **Export:** SplitButton component — primary action "Export to CSV", dropdown offers "Export to PDF" and "Export to Excel". Any click triggers a Toast notification.
- **Source filter (planned):** Filter results by Tracking Source (Auto / Manual only) — post-MVP.

### E. Invoice Generator & Digital Signature
- **Two-panel layout:** Left = invoice list (w-72), Right = invoice detail (flex-1).
- **Status pipeline tabs:** All | Draft | Pending Signature | Paid | Overdue. Active tab = violet tint. Empty tab shows EmptyState component.
- **Invoice detail:** Printable-style layout with sender info, Bill To, line items table, subtotal/tax/total, notes.
- **Digital Signature Toggle:** Custom Toggle component. When ON:
  - Reveals a dotted-border "Sign here" area (h-28, border-dashed, neutral-600)
  - Reveals "Send for Signature" primary button + "Copy Link" secondary button
  - Shows amber warning: invoice not processed until signature received
- **Action buttons:** "Download PDF" (ghost, left) and "Send Invoice" (primary, right) always visible in detail toolbar.
- **Create Invoice Drawer:** SlideOutDrawer titled "Create Invoice", opened by "+ New" button in list panel header.

### F. Application Shell & Navigation
- **Sidebar:** Collapsible (expanded `w-60`, collapsed `w-16`). Logo area (violet Timer icon + "Chronos"). Section label "Workspace". Nav items with active route highlighting. Bottom section: Settings, Help & Docs, User avatar + name + role.
- **Topbar:** Page title + subtitle, styled read-only `⌘K` search trigger, compound timer action group (dominant "Start Timer" primary button + subordinate "Manual Entry" secondary button), notification bell with dot indicator.
- **Global Search Modal (planned):** `⌘K` / `Ctrl+K` to open. Filters across projects, team members, time logs. Phase 1: read-only placeholder. Phase 2: functional overlay.
- **Notification panel (planned):** Slide-out or dropdown from bell icon. Not yet built.

### G. My Time (Employee + Admin)
- **Live Timer:** Large monospaced clock display, Play/Stop button, task input, project selector. Fully functional in Phase 1.5 — `setInterval` in AppShell drives shared timer state passed via Outlet context. Timer persists across page navigation. Topbar shows live ticking pill with pulsing red dot and stop button when running.
- **Personal Stats (4 cards):** Today's hours, This Week hours, Billable hours (week), Total entries. Cards include mini progress bars.
- **Week Calendar Strip:** 7-day grid with daily hours and fill bars. Dates computed dynamically from current date (Monday-based week). Clicking a day tile expands a detail panel below showing that day's time entries with project color dots, task names, time ranges, durations, TrackingSourceBadge, and billable indicators. Prev/Next week navigation arrows are UI-only.
- **My Time Entries table:** All logged time for the current user. Same column structure as dashboard logs. "+ Add Entry" opens Manual Time drawer.

### H. Team Management
- **Search bar + Grid/Table view toggle**
- **Stats row (4 cards):** Total Members, Active Now, Idle, Avg Hours/Week
- **Grid view:** Member cards with avatar, status badge, current project, hours this week, activity level bar. Hover actions: Message, View Logs.
- **Table view:** Compact rows with all key stats.
- **Invite Member button** (non-functional in Phase 1).
- **Member Profile Drill-Down:** Clicking on any team member name (on the Dashboard, the Team page grid/table, or the Reports detailed table) opens a context-aware `MemberProfileDrawer` slide-out panel from the right. This drawer displays tabbed content customized dynamically based on which page opened it:
  - `team` context (from Team page): shows *Overview*, *Time Logs*, *Projects*, and *Activity* tabs.
  - `dashboard` context (from Dashboard): shows *Overview* and *Today* tabs.
  - `reports` context (from Reports page): shows *Overview* and *Time Breakdown* tabs.
  Inside the drawer, it features detailed metrics (Today's hours, This Week's hours, Billable ratio, Total entries), a visual Activity Level bar, and interactive list breakdown widgets.

### I. Settings
- Placeholder page in Phase 1. Will contain: Workspace name, billing, API keys, notification preferences, team permissions.

---

## 6. Future Phase Requirements (Explicitly Out of Scope for Phase 1)

These are planned but must not be built or scaffolded during the Static Museum phase:

- Real timer logic (`useEffect` + `setInterval` in MyTime.jsx)
- Desktop App development (Windows, Electron/C++, SQLite sync)
- Light/Dark mode toggle (dark-only at launch)
- Mobile responsive layout (desktop-first at launch)
- Client Portals (external login for clients)
- Working `⌘K` search modal
- Working Notification panel
- Project detail page (`/projects/:id`)
- Real CSV/PDF/Excel export (Blob API)
- Settings page real content
- ProofOfWorkTab wired to real desktop data
