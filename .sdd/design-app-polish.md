# DESIGN: App Polish & Bug Fixes

## Execution Order & Dependencies

| Issue | Title | Depends On | Parallelizable |
|-------|-------|------------|----------------|
| 2 | DateTimePicker range mode | nothing | Yes |
| 4 | Drawer z-index/overflow | nothing | Yes |
| 5 | ProjectTaskPicker in drawer | nothing (PTP already exists) | Yes |
| 1 | Remove global search | nothing | Yes |
| 3 | Vercel demo fix | nothing | Yes |

**No hard dependencies between issues.** All 5 can be applied in any order.

---

## ISSUE 1 — Remove global search from Topbar

### Goal
Remove the global search bar and its state from Topbar.jsx while keeping the search icon button (⌘K command palette launcher).

### Approach chosen
Surgical removal of 4 code blocks. Simple, isolated change.

### Files affected
Only `src/components/layout/Topbar.jsx`

### Lines to remove

| Lines | What |
|-------|------|
| 83-86 | `globalQuery`, `globalSearchOpen`, `globalSearchRef` state declarations |
| 155-165 | Outside-click effect for global search |
| 181-215 | `globalResults` computation |
| 243-307 | Search UI: input + results dropdown + empty state |

### What to keep
- Search icon at lines 742-749 (⌘K command palette launcher — separate functionality)
- `Search` import from lucide-react (used by the ⌘K button)
- All props (`teamMembers`, `logs`, `projectList`, `taskList`) — still used by other features

### Risk mitigation
- Search section is entirely inline with no shared components — removal is safe
- After removal, verify the LEFT ZONE remaining elements (date/time display lines 237-241) still form valid JSX
- Props that were used only by search (`teamMembers`, `logs`) remain available for other consumers

### Testing approach
- `npm run build` must succeed
- Manual: verify ⌘K button still works at right side of topbar
- Manual: verify timer, project picker, task picker still function

---

## ISSUE 2 — DateTimePicker range mode

### Goal
Add a `range` prop to DateTimePicker that lets users pick start/end dates via two clicks.

### Current state analysis
- File: `src/components/ui/DateTimePicker.jsx` (646 lines)
- `onRangeChange` callback already exists at line 292 (passed as prop, currently unused)
- `DATE_PRESETS` array (lines 50-122) already computes date ranges for 8 presets
- Presets sidebar (lines 519-549) already calls `onRangeChange(start, end)` when a preset is clicked
- Single-select uses `handleDaySelect` (line 377): `onChange(formatDate(year, month, day))`
- Calendar state: `viewYear`, `viewMonth` driven off `parsed` via `parseDate(value)`

### Approach chosen
Add `range` prop + `rangeValue` prop. When `range={true}`:
- Ignore `value`/`onChange`; use `rangeValue`/`onRangeChange` instead
- Track `rangeSelectionPhase: 'idle' | 'start-selected' | 'done'` locally
- First click on a day sets start (visual highlight changes)
- Second click sets end; if end < start, swap; call `onRangeChange([startDate, endDate])`
- Calendar date rendering checks both start and end for highlight ranges

### Alternatives rejected
- Separate RangeDateTimePicker component — duplicating 600+ lines is high maintenance
- Third-party date range library — rejected per project policy (no new deps)

### Files affected
Only `src/components/ui/DateTimePicker.jsx`

### Data flow — new props

```jsx
// After:
<DateTimePicker
  range={true}
  rangeValue={['2026-07-01', '2026-07-15']}
  onRangeChange={([start, end]) => setStartEnd(start, end)}
/>
```

### State changes (internal)

```jsx
const [rangeSelectionPhase, setRangeSelectionPhase] = useState('idle');
// 'idle' | 'start-selected' | 'done'
```

### Calendar rendering changes
`CalendarGrid` gets new props: `range`, `rangeValue`, `rangeSelectionPhase`.

Cell rendering logic:

```jsx
const isRange = range && rangeValue?.[0] && rangeValue?.[1];
const isStart = isRange && thisStr === rangeValue[0];
const isEnd = isRange && thisStr === rangeValue[1];
const inRange = isRange && thisStr > rangeValue[0] && thisStr < rangeValue[1];
const isStartOnly = range && rangeSelectionPhase === 'start-selected' && thisStr === rangeValue?.[0];
```

Highlight styles:
- `isStart` or `isEnd` → accent background (like current `isSelected`)
- `inRange` → subtle accent-subtle background
- `isStartOnly` → accent background with a pulse/dashed border indicator

### handleDaySelect changes

```jsx
function handleDaySelect(year, month, day) {
  if (range) {
    if (rangeSelectionPhase === 'idle' || rangeSelectionPhase === 'done') {
      onRangeChange?.([startStr, startStr]);
      setRangeSelectionPhase('start-selected');
    } else {
      const [start] = rangeValue || [];
      const [s, e] = endStr < start ? [endStr, start] : [start, endStr];
      onRangeChange?.([s, e]);
      setRangeSelectionPhase('done');
    }
  } else {
    onChange?.(formatDate(year, month, day));
    setActivePanel(null);
  }
}
```

### Presets sidebar — already works
Presets call `onRangeChange(start, end)` at line 532. When `range={true}`, this correctly sets the range. Need to also set `rangeSelectionPhase` to `'done'` after a preset is clicked. Also, wrap the `onChange` call at line 533 in `if (!range)`.

### Risk mitigation
- **Backward compatibility**: `range` defaults to `undefined` (falsy), existing single-date consumers unaffected
- **Calendar view sync**: When `rangeValue` changes externally (preset picks "Last Week"), view follows the first value
- **autoOpen mode**: Works the same — calendar shows directly, just with range interaction
- **Edge case**: Empty `rangeValue` on mount (`undefined` or `[]`) — treat as 'idle' phase

### Testing approach
- `npm run build`
- Manual: Open drawer, add `range={true}` to date DateTimePicker, verify two-click selection
- Manual: Verify single-date mode still works (MyTime page)
- Manual: Verify presets work in range mode

---

## ISSUE 3 — Vercel demo localStorage init fix

### Goal
Move module-level localStorage mock initialization into React lifecycle to prevent SSR/failures in server environments.

### Current state
- `src/lib/supabase.js` lines 49-62: Module-level `try { if (!localStorage.getItem...) ... } catch`
- Called at module import time, before any React component mounts
- Can fail in environments where localStorage is unavailable

### Approach chosen
1. Remove the module-level initialization block (lines 49-62) from `supabase.js`
2. Add a `useEffect` in `AuthProvider` that seeds mock data on mount
3. Add error detection for Supabase-configured-but-tables-not-existing

### Files affected
- `src/lib/supabase.js` — remove lines 49-62
- `src/contexts/AuthContext.jsx` — add mock init useEffect; add 404 detection

### Implementation

**supabase.js**: Delete lines 49-62. Mock client functions already handle localStorage reads with try/catch.

**AuthContext.jsx**: Add to the bootstrap useEffect:

```jsx
// Inside the existing bootstrap useEffect (line 36-74), add:
if (!isSupabaseConfigured) {
  try {
    if (!localStorage.getItem('chronos_mock_initialized')) {
      localStorage.setItem('chronos_mock_initialized', 'true');
      localStorage.setItem('chronos_mock_users', JSON.stringify([...]));
      localStorage.setItem('chronos_mock_profiles', JSON.stringify([...]));
      localStorage.setItem('chronos_mock_organizations', JSON.stringify([...]));
      localStorage.setItem('chronos_mock_session', JSON.stringify({...}));
    }
  } catch (e) {
    console.error('[AuthContext] Failed to initialize mock data:', e);
  }
}
```

**For 404 detection** (Supabase configured but tables don't exist):

In `fetchProfile` (line 21-33), check `error.code === 'PGRST116'` or `error.message?.includes('does not exist')`. Add a `tablesMissing` state to AuthProvider and expose it:

```jsx
const [tablesMissing, setTablesMissing] = useState(false);

// In fetchProfile:
if (error?.code === 'PGRST116' || error?.message?.includes('does not exist')) {
  setTablesMissing(true);
}

// In context value:
tablesMissing,
```

In AppShell, add an effect that watches `tablesMissing` and calls `triggerToast`:

```jsx
const { tablesMissing } = useAuth();
useEffect(() => {
  if (tablesMissing) {
    triggerToast('Database setup required',
      'Supabase is configured but tables are missing. Apply the schema.',
      'warning');
  }
}, [tablesMissing]);
```

### Data flow
Before: `Module load → supabase.js → localStorage.setItem(...)` (module level, synchronous)
After: `React mount → AuthProvider → useEffect → localStorage.setItem(...)` (in React lifecycle)

### Risk mitigation
- localStorage writes only run in useEffect (client-side only — safe for SSR)
- Mock client functions already have try/catch for reads
- Seed data is identical to before — no functional change
- The effect has `[]` deps, runs once on mount, no render loops

### Testing approach
- `npm run build`
- Demo mode (no env vars): refresh page → verify demo user auto-logged in
- Demo mode: clear localStorage → refresh → verify mock data seeded
- Live mode (env vars): verify no localStorage mock data created

---

## ISSUE 4 — Manual entry drawer z-index/overflow

### Goal
Fix DateTimePicker dropdowns getting clipped by the modal container and z-index conflicts with the backdrop.

### Root cause
- **Bug A (z-index)**: Modal overlay is `z-50` (line 768). DateTimePicker dropdowns also use `z-50` (lines 456, 516, 605). Both at same z → whoever DOM-later wins.
- **Bug B (overflow clipping)**: Modal body has `overflow-y-auto` (line 803). DateTimePicker dropdowns use `position: absolute` inside a `position: relative` container. Chrome clips absolutely positioned elements when any ancestor has `overflow: auto`, even if that ancestor isn't the containing block.

### Approach chosen
Simple CSS-only fix:

1. **Bump z-index**: Change all DateTimePicker dropdown `z-50` to `z-[60]` (3 locations: lines 456, 516, 605)
2. **Fix overflow**: Remove `overflow-y-auto` from the modal body div (line 803) since the modal content is short enough to not need scrolling on any reasonable viewport. If this causes issues on small screens, fall back to `position: fixed` with JS-computed coordinates for the dropdown panels.

### Files affected
- `src/components/ui/DateTimePicker.jsx` — z-index bump (3 locations)
- `src/components/layout/AppShell.jsx` — remove `overflow-y-auto` from modal body (line 803)

### Implementation

**DateTimePicker.jsx lines 456, 516, 605**: Change `z-50` to `z-[60]`

**AppShell.jsx line 803**: Change `overflow-y-auto` to no overflow constraint.

Fallback if overflow recurs:
- Add `useState` for `fixedStyle` in DateTimePicker
- Before opening panel, compute trigger's `getBoundingClientRect()`
- Set `fixedStyle` with `{ position: 'fixed', top, left, zIndex: 60 }`
- Apply via inline `style` prop, replace `absolute` classes

### Risk mitigation
- Verify modal still works on mobile viewport
- Verify dropdowns appear above the modal backdrop and are fully clickable
- Verify the dropdown doesn't get clipped when modal content is scrolled

### Testing approach
- Open manual entry drawer, click date field → dropdown above backdrop, fully visible
- Click time field → same
- Scroll the modal content → dropdown stays visible and interactable
- Test on narrow viewport (320px)

---

## ISSUE 5 — ProjectTaskPicker in drawer

### Goal
Replace the plain `<Select>` for project selection in the manual entry drawer with the existing `ProjectTaskPicker` component.

### Current state
- AppShell.jsx lines 837-847: Plain `<Select>` for project selection
- `drawerEntry.projectId` is a string (project ID)
- `drawerEntry.task` is a string (task description text)
- ProjectTaskPicker.jsx exists with full inline-create functionality (251 lines)
- ProjectTaskPicker API: `{ projectId, taskId, taskText, onChange, projects, tasks, addProject, addTask }`
- ProjectTaskPicker `onChange` returns `{ projectId, taskId, taskText }`

### API mapping

| Current drawer state | ProjectTaskPicker | Mapping |
|---|---|---|
| `drawerEntry.projectId` (string) | `projectId` (string) | Direct |
| `drawerEntry.task` (string — description) | `taskText` (string — description) | Direct |
| (missing) | `taskId` (string) | Add `drawerEntry.taskId` |

### Approach chosen
Replace both the task description Input and project Select with the full ProjectTaskPicker. The PTP already supports free-text task input via its search field. Add `taskId` to the drawer state.

### Files affected
- `src/components/layout/AppShell.jsx` — replace lines 820-847

### Implementation

**1. Add import:**
```jsx
import ProjectTaskPicker from '../ProjectTaskPicker.jsx';
```

**2. Add `taskId` to drawer state init:**
```jsx
const [drawerEntry, setDrawerEntry] = useState({
  task: '', projectId: '', taskId: '', date: ..., startTime: '', endTime: '', billable: true,
});
```

**3. Replace lines 820-847 (task description + project) with:**
```jsx
<ProjectTaskPicker
  projectId={drawerEntry.projectId}
  taskId={drawerEntry.taskId}
  taskText={drawerEntry.task}
  onChange={({ projectId, taskId, taskText }) => {
    setDrawerEntry(prev => ({ ...prev, projectId, taskId, taskText }));
  }}
  projects={projectList}
  tasks={taskList}
  addProject={addProject}
  addTask={addTask}
/>
```

**4. Update all drawer reset points** (lines 775, 793, 813, 918):
Add `taskId: ''` to the reset object.

**5. Update save logic (line 927-954)** — optionally include `taskId` in the new log entry.

### Data flow
- `drawerEntry.projectId` → ProjectTaskPicker `projectId`
- `drawerEntry.taskId` → ProjectTaskPicker `taskId`
- `drawerEntry.task` → ProjectTaskPicker `taskText`
- User picks project/task → PTP fires `onChange` → `setDrawerEntry` updates all three

### Risk mitigation
- The `task` (description text) remains populated, so existing save logic works unchanged
- `taskId` is additive — doesn't break anything that was using `drawerEntry.task`
- ProjectTaskPicker's dropdowns also have `z-50` — z-index bump from Issue 4 will cover them too
- The Input and Select imports may become unused — check and remove if so

### Testing approach
- Open drawer → ProjectTaskPicker renders with projects list
- Select a project → task input/search appears
- Type a task description → verify `drawerEntry.task` updates
- Select an existing task → verify both `taskId` and `task` set
- Create new task inline → verify it appears and is selectable
- Create new project inline → verify it appears
- Save entry → verify log is created with all data

---

## Component Tree Changes

### Before (drawer modal)
```
<div className="fixed inset-0 z-50">        ← backdrop
  <div className="max-w-md">                  ← card
    <div> Task description Input </div>
    <div> Project Select </div>              ← <option> list
    <div className="overflow-y-auto">
      <div> DateTimePicker </div>
      <div>
        DateTimePicker (time)
        DateTimePicker (time)
      </div>
    </div>
  </div>
</div>
```

### After (drawer modal)
```
<div className="fixed inset-0 z-50">           ← backdrop
  <div className="max-w-md">                    ← card (no overflow constraint)
    <div>
      <ProjectTaskPicker />                   ← replaces Input + Select
    </div>
    <div>                                      ← no overflow-y-auto
      <div> DateTimePicker (z-[60]) </div>
      <div>
        DateTimePicker (time, z-[60])
        DateTimePicker (time, z-[60])
      </div>
    </div>
  </div>
</div>
```

---

## CSS/Visual Changes Summary

| File | Change | Location |
|------|--------|----------|
| DateTimePicker.jsx | `z-50` → `z-[60]` | Lines 456, 516, 605 |
| AppShell.jsx | Remove `overflow-y-auto` | Line 803 |

---

## Cross-issue Dependencies

- Issue 4 (z-index fix) and Issue 5 (ProjectTaskPicker) are independent but BOTH affect the drawer modal
- ProjectTaskPicker dropdowns also have `z-50` (line 106, 190) — these will also benefit from the z-index bump in Issue 4 if they exhibit similar issues. If needed, apply the same `z-50` → `z-[60]` change in ProjectTaskPicker.jsx
- Issue 2 (range mode) has zero interaction with the other issues — it's purely additive

---

## Rollback Plan

Each issue is in separate files or clearly demarcated regions. If any issue causes problems:
- **Issue 1**: Revert Topbar.jsx changes
- **Issue 2**: Revert DateTimePicker.jsx changes (remove `range`/`rangeValue` handling)
- **Issue 3**: Revert supabase.js (restore lines 49-62) + AuthContext.jsx
- **Issue 4**: Revert z-index in DateTimePicker.jsx + restore overflow in AppShell.jsx
- **Issue 5**: Revert AppShell.jsx changes (restore Input+Select, remove ProjectTaskPicker)
