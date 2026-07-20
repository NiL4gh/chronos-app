# Chronos Pocket Guide
> Guardrails distilled from systematic-debugging, modern-web-guidance, browser-debugging, work-unit-commits, writing-plans

## I — Root-Cause Tracing Tree
**When:** Something broke and you don’t know why.
**What:** Peel symptoms away to find the root.

```thinking
Root Cause Trace

States
1) Current: [TBD]
2) Previous healthy: [TBD]

Learner
What changed between states?
[list commits, deploys, user flows, props, environment]

Experiments
1)
   - Setup: [TBD]
   - Trigger: [TBD]
   - Expect: [TBD]
   - Actual: [TBD]
   → Hypothesis: [TBD]

Root Cause Decision
→✅ Root cause found: [TBD]
→🔍 Deeper experiment needed: [TBD]
```

## II — React Lifecycle Checklist
**When:** A prop change isn’t triggering re-render.
**What:** Answer every branch.

```markdown
- Is the effect cleanup firing correctly?
- Is the effect spying stale closures?
- Is the component memoized?
- Is prop diffing working?
- Is setState sequential?
```

## III — Browser Inspector Heuristics
**When:** HTML/CSS/Network/Console are silent.
**What:** Look where you haven’t.

```markdown
- Network tab: request timing + payload size
- Console filter: hidden errors (verbose=on)
- Elements hover: computed styles
- Elements hover: layout overflows
```

## IV — Render Tier Check
**When:** Rendering feels sluggish.
**What:** Separate async from sync work.

```markdown
Render Trace Baseline
1) Time slice utilization: [TBD]
2) Task priority ladder: [TBD]
3) State update timing: [TBD]
✅ Pass: idle at frame boundaries
```

## V — Commit Unit Checklist
**When:** Ready to commit.
**What:** One reviewable narrative.

```markdown
- One logical change per commit
- Covered by tests if non-trivial
- Reviewable on GitHub diff
- Atomic (all-or-none)
```

## VI — Multi-File Plan Template
**When:** planning a 3+ file change.

```markdown
## Architect Mode Plan

Intent
- What exactly are we building?

Scope
- Which files will change?
- What’s the intended behavior?

Approach
- How is this implemented?

Rollback
- When to revert?

Tests
- How is this verified?
```

## VII — Self-Verification Checklist (AGENTS.md Tier 0-3)
**When:** Before saying *done*.

```markdown
✅ Tier 0 — Read State Machine (before writing)
   - [ ] Mapped every state variable, effect, branch in `<thinking>`

✅ Tier 1 — Variable + Branch Scan
   - [ ] Every variable is initialized, used, updated in every branch
   - [ ] Every branch is covered, has default

✅ Tier 2 — State Lifecycle Trace
   - [ ] Ran a prop change trace, user action trace, async failure trace

✅ Tier 3 — Visual/Layout Check
   - [ ] Check z-index, mobile breakpoint, overflow, focus trap, loading/empty/error states
```