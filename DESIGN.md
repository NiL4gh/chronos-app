# DESIGN.md — Chronos Design System Ground Truth

> **STATUS: ACTIVE DESIGN SYSTEM — Warm Light Glassmorphism Overhaul Complete.**
> All UI components, pages, layouts, and tokens have been upgraded to the Antigravity Warm Light design system (Passes 1–6).

---

## The Golden Rule — UI Component Integrity

All `src/components/ui/` components have been rewritten for the warm light palette (Pass P1-Revised). They remain frozen after that rewrite. Same rules apply: do not alter Tailwind classes on any `ui/` component.

---

## Product Aesthetic — Warm Light Glassmorphism

Chronos targets startup CEOs and team leads. Work is stressful. The UI must not add to that stress.

The aesthetic is **"Warm Light Glassmorphism"** — a premium light-mode interface inspired by Notion's calm whitespace combined with modern SaaS depth. Cards float above a subtly warm mesh-gradient background using true CSS backdrop-filter glassmorphism. Everything feels layered, tactile, and alive.

Key principles:
- **Warm light always.** Background is a fixed radial mesh gradient of subtle amber/cream orbs on near-white #fafaf8. Not flat white.
- **True glassmorphism.** Cards use `backdrop-filter: blur()` against the gradient background — the glass is visible because the background gives it something to blur against.
- **One accent color.** Amber (#f59e0b / amber-400) is the sole saturated primary action color. Violet is gone.
- **Dramatic typographic weight contrast.** XL stats at font-weight 900, labels at font-weight 600 with wide tracking, body at 400, captions at 300. The weight scale communicates hierarchy before color does.
- **Interaction has physics.** Cards lift on hover (translateY -1px). Buttons press on click (scale 0.97). Panels animate with cubic-bezier spring curves. Nothing snaps.
- **Every click reveals something.** No dead surfaces. Drawers for creation only. Everything else expands inline or in split panels.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 (functional components + hooks only) |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.x (JIT mode) + CSS custom properties in index.css |
| Routing | React Router v6 |
| Icons | Lucide React (`lucide-react@^0.383.0`) — no other icon library |
| Font | Inter & JetBrains Mono (Google Fonts) via `index.html` link tags |
| State (Phase 1) | React `useState` / `useReducer` only. No external state library. |
| Data (Phase 1) | All data from `src/data/mockData.js`. Zero real API calls. |

---

## Color System — Warm Light Palette

All colors are defined as CSS custom properties in `index.css` and referenced via Tailwind's arbitrary value syntax or direct CSS variables.

### Background Layers
Background (app shell):   body radial mesh gradient on #fafaf8 base
Surface (cards):          rgba(255,255,255,0.72) + backdrop-filter
Surface elevated:         rgba(255,255,255,0.88) + backdrop-filter
Surface sunken:           var(--bg-sunken) = #f0ede8
Overlay:                  rgba(255,255,255,0.95)

CSS variable names (defined in :root in index.css):
--bg-base:        #fafaf8
--bg-surface:     #ffffff
--bg-elevated:    #fdfcfb
--bg-sunken:      #f0ede8
--bg-overlay:     #fffffe
--border-default: #e8e3dc
--border-strong:  #d4cdc4
--border-focus:   #f59e0b
--text-primary:   #1c1917
--text-secondary: #57534e
--text-tertiary:  #78716c
--text-muted:     #a8a29e
--text-disabled:  #c7bfb8
--text-inverse:   #fafaf9
--accent:         #f59e0b   (amber — hover: #d97706)
--accent-hover:   #d97706
--accent-subtle:  #fef3c7
--accent-border:  #fcd34d
--accent-text:    #92400e

### Semantic Colors
Success:  text #166534  bg #f0fdf4  border #bbf7d0
Warning:  text #92400e  bg #fffbeb  border #fde68a
Danger:   text #9f1239  bg #fff1f2  border #fecdd3
Info:     text #1e40af  bg #eff6ff  border #bfdbfe

### Approved Tailwind Color Classes (Exhaustive)
amber-*, emerald-*, red-*, yellow-*, blue-*, white
neutral-* only for layout/structural Tailwind (padding, flex, etc.)
NO neutral-* for color values — use CSS vars instead.

---

## Typography

Font Family:
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace

Scale:
  XL Stat:        text-3xl font-black (weight 900) font-mono
  Page Title:     text-base font-bold (weight 700) tracking-tight
  Section Header: text-xs font-semibold uppercase tracking-widest color var(--text-muted)
  Card Title:     text-base font-semibold (weight 600)
  Body:           text-sm font-normal (weight 400)
  Caption/Meta:   text-xs font-light (weight 300)
  Table Header:   text-xs font-semibold uppercase tracking-wider
  Table Cell:     text-sm color var(--text-secondary)
  Data/Numbers:   font-mono text-sm color var(--text-primary)
  Timer Display:  text-4xl font-mono font-semibold tabular-nums tracking-tight

---

## Spacing — 8pt Grid

Base unit: 4px. All spacing values are multiples of 8px (2 base units).

| Context | Value |
|---|---|
| Card padding (standard) | p-6 (24px) |
| Card padding (compact metric) | p-4 (16px) |
| Section gaps | space-y-6 (24px) |
| Grid gaps | gap-4 (16px) or gap-6 (24px) |
| Sidebar expanded | w-60 (240px) |
| Sidebar collapsed | w-16 (64px) |
| Topbar height | h-16 (64px) |
| Page padding | px-6 py-5 |
| Table cell | px-4 py-3 |
| Form field gaps | space-y-4 |
| Icon standard | size={16} |
| Icon dense | size={13} or size={14} |

---

## Component Token Reference

### Glass Utilities
.glass-card:
  background: rgba(255,255,255,0.72)
  backdrop-filter: blur(12px) + -webkit- prefix
  border: 1px solid rgba(255,255,255,0.88)
  border-radius: 12px
  box-shadow: 0 1px 3px rgba(28,25,23,0.05),
              0 4px 16px rgba(28,25,23,0.06),
              inset 0 1px 0 rgba(255,255,255,0.9)

.glass-elevated:
  background: rgba(255,255,255,0.88)
  backdrop-filter: blur(20px) + -webkit- prefix
  border: 1px solid rgba(255,255,255,0.95)
  border-radius: 12px
  box-shadow: 0 4px 12px rgba(28,25,23,0.07),
              0 12px 32px rgba(28,25,23,0.08),
              inset 0 1px 0 rgba(255,255,255,1)

.glass-interactive:
  background: rgba(255,255,255,0.65)
  backdrop-filter: blur(10px) + -webkit- prefix
  border: 1px solid rgba(255,255,255,0.82)
  border-radius: 12px
  transition: box-shadow, border-color, background, transform 0.18s ease
  hover: background rgba(255,255,255,0.82), translateY(-1px), deeper shadow

### New Interaction Utilities
.lift-on-hover — transition transform+shadow 0.18s ease, hover: translateY(-2px) + shadow-md
.press-on-click — active: scale(0.97) transition 0.08s ease
.status-dot-pulse — animation status-pulse 2.5s infinite (emerald glow pulse for active member status dots)
.timer-cta-pulse — ::after pseudo with pulse-ring animation (ambient ring pulse around Start Timer button)

---

## Animations (defined in index.css + tailwind.config.js)

Existing: fade-in, pulse-dot

New additions:
bar-grow: scaleY 0→1 from bottom, 0.5s ease-out (used on bar chart bars with staggered delay classes .animate-bar-grow-delay-1 through -5 at 50ms increments)
status-pulse: opacity 1→0.85→1 with emerald box-shadow glow, 2.5s cubic-bezier infinite
pulse-ring: scale 1→1.09, opacity 0.55→0, 2.5s ease-out infinite (::after on .timer-cta-pulse — ambient ring on Start Timer)
arc-draw: stroke-dashoffset animation for SVG arc charts

---

## Topbar
Topbar height: h-16. Frosted glass background (rgba(255,255,255,0.80) + backdrop-filter blur 16px).

STOPPED STATE:
  "Start Timer": amber gradient button (135deg #f59e0b→#d97706), class timer-cta-pulse for pulse ring, height 36px, font-weight 600
  "+ Manual": 32×32 icon-only button, secondary style, Plus icon size 14

RUNNING STATE:
  Live pill: rgba(16,185,129,0.08) bg, border rgba(16,185,129,0.25), pulsing red dot + mono timer counter in emerald-900 text
  Stop: 32×32 red-tinted square button, Square icon size 14

Notification bell: 32×32, Bell icon size 15, count badge w-4 h-4 rounded-full bg-red-500 text-white text-[9px] showing "3" (mock)

---

## Status Dot Spec

STATUS INDICATORS:
Used on: Team Pulse rows, MemberProfileDrawer avatar header, Team page member cards.

Active:  w-2.5 h-2.5 (or w-3 h-3 in drawer) rounded-full bg-emerald-500, class status-dot-pulse border-2 white/surface border
Idle:    same size, bg-amber-400, NO animation
Offline: same size, style background var(--border-strong), NO animation

Position: absolute bottom-0 right-0 on avatar wrapper (relative)

---

## Settings Page Layout

Two-column: w-52 left nav (glass-card) + flex-1 right content.
Left nav active item: amber left-border 3px + accent-subtle bg.
Section content: glass-card p-6, space-y-5.
Shortcut kbd tags: rounded-md px-2 py-0.5 text-xs font-mono bg var(--bg-sunken) border var(--border-strong) text var(--text-primary)

---

## Button System

```jsx
// Primary (amber CTA — timer, create, confirm)
className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-semibold transition-all duration-150"

// Secondary (outlined)
className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--border-default)] hover:bg-[var(--bg-sunken)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all duration-150"

// Ghost (minimal)
className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-sunken)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm font-medium transition-all duration-150"
```

Size overrides: `size="sm"` → `px-3 py-1.5 text-xs` | `size="lg"` → `px-5 py-2.5 text-base`

---

## Badge System

```jsx
// Success
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-green-400/10 text-green-300 border border-green-400/20"

// Warning
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-yellow-400/10 text-yellow-300 border border-yellow-400/20"

// Danger
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-red-400/10 text-red-300 border border-red-400/20"

// Info
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-blue-400/10 text-blue-300 border border-blue-400/20"

// Neutral
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-white/5 text-[var(--text-muted)] border border-[var(--border-subtle)]"

// Accent (amber)
className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20"
```

---

## Tracking Source Badge

```jsx
// Auto — verified
<span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-green-400/10 text-green-300 border border-green-400/20">
  <Cpu size={10} /> Auto
</span>

// Manual — self-reported
<span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
  <PenLine size={10} /> Manual
</span>
```

---

## SlideOutDrawer

Used ONLY for forms (creating entries, creating invoices). NOT for viewing information.

```jsx
// Panel
className="fixed inset-y-0 right-0 z-50 w-full max-w-md backdrop-blur-xl bg-[var(--bg-elevated)] border-l border-[var(--border-interactive)] shadow-2xl shadow-black/60 flex flex-col transition-transform duration-300 ease-in-out"
```

---

## Split Panel (Inline Detail View)

Used for all information drill-downs (member profiles, project details). Replaces sidebar drawer for viewing.
List panel:  flex-shrink-0 w-[38%]  (collapses when detail is open)
Detail panel: flex-1  (expands inline, part of page layout, not an overlay)
Transition:  width transition 250ms ease-out on list panel

---

## Nav Item States
Active:   bg-[var(--bg-sunken)] text-[var(--accent-text)] border border-[var(--border-default)]
Inactive: text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] border border-transparent

---

## Keyboard Shortcuts (Global)

| Key | Action |
|---|---|
| T | Start/stop timer |
| N | Open new time entry drawer |
| P | Focus project search |
| R | Go to Reports |
| I | Go to Invoices |
| M | Go to My Time |
| G+S | Go to Settings |
| Space | Start/stop timer (when not in an input) |
| Escape | Close any open drawer/panel/modal |
| ? | Open shortcuts reference in Settings |
| ⌘K / Ctrl+K | Open command palette |
