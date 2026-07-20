# UI Flow Audit — chronos-app @ 2026-07-15

**Tier run:** simple
**Findings:** 2 total — Simple: 2 (1 real bug + 1 React/TS override note)
**Top 3 by severity:**
1. **S1 (R4)** — `setLogsToRender` passed as prop but never defined in MyTime.jsx — breaks EntryPopover delete on calendar view.
2. **S2 (R1/R2/R10)** — All other handlers/states/modals clean. Cross-module pairs (TimerContext) and `useState` toggle patterns correctly excluded by React/TS tuning.

---

## Simple tier

### Simple — High confidence

| # | Rule | Location | Finding | Suggested fix |
|---|------|----------|---------|---------------|
| S1 | **R4** (Orphaned State) | `src/pages/MyTime.jsx:721` → `src/components/mytime/EntryPopover.jsx:121` | **Orphaned setter** — `setLogsToRender` is passed to `<EntryPopover>` but is never defined in MyTime.jsx. `logsToRender` is a `useMemo` value (line 115). EntryPopover calls `setLogsToRender(newLogs)` on delete, which will throw a `ReferenceError`. | Two options: (a) Replace `setLogsToRender` with a `deleteLog` callback prop that mutates the parent's raw `logs` array; or (b) Change `logsToRender` to a `useState` to make the setter real. |
| S2 | R1/R2/R10 | All interactive components | **Clean** — All handlers have complements (`startTimer`/`stopTimer`, all open/close pairs). All boolean states use `!prev` toggle or bidirectional setters. All modals/drawers/popups have Escape, backdrop click, or Close button. Cross-module pairs (e.g., TimerContext start/stop across pages) verified. `useState` setters and `useEffect` cleanups correctly excluded per React/TS tuning rules. | None needed. |
| S3 | R4 (intentional) | `src/components/layout/TimerContext.jsx` | **Override note** — Several state keys like `activeRole`, `startTimer`, `stopTimer` are returned from custom hooks and consumed across modules. The audit marks these as intentional R4 overrides — they form cross-module complement pairs that incomplete scoped analysis would flag as orphaned. | Tag source with `// ui-flow-audit: R4 intentional — cross-module pair` if desired. |

### React/TS false-positive overrides applied

Rules embedded in the simple-tier scan to avoid flagging common React patterns:

1. `useState` setters (`setX`) are handler references, not action handlers — skip R1.
2. `setX(v => !v)` IS the inverse path — skip R2.
3. Controlled component `value` + `onChange` pairs are complementary — skip R1.
4. `useEffect` cleanup functions ARE the complement — skip R1.
5. Escape key handlers = close affordance for R10 (visible button not required).
6. Custom hook return setters (e.g., `useTimer()` → `{startTimer, stopTimer}`) form cross-module complement pairs.
7. `useMemo` values consumed in JSX are NOT orphaned — skip R4.
8. Destructured context values traced to provider — skip false R1.
9. Callback refs vs inline arrow handlers — different FP profile, skip.
10. HMR refresh artifacts — not real orphaned state.

Full reference: `skills/ui-flow-audit/references/react-ts-overrides.md`

---

## Summary

- **Simple tier:** 1 real bug (S1, High) + 1 clean pass (S2) + 1 intentional override (S3)
- **Files touched:**
  - `src/pages/MyTime.jsx` — 1 finding (S1)
  - `src/components/mytime/EntryPopover.jsx` — call site of S1
  - All other files — clean (S2)

*Treat each finding as a candidate fix. Plan → Approve → Execute one at a time. Re-run the audit after fixes to confirm.*
