# Skill Registry — chronos-app

**Built**: 2026-07-06
**Scope**: Project-level
**Note**: No project-level skill directories exist. All skills are user-level.

## Convention Files

- `C:\Users\niloy\Documents\Time Tracker\AGENTS.md` — Project AGENTS.md
- `C:\Users\niloy\Documents\Time Tracker\CLAUDE.md` — Authoritative ops guide
- `C:\Users\niloy\Documents\Time Tracker\chronos-app\AGENTS.md` — Chronos project memory
- `C:\Users\niloy\.config\opencode\AGENTS.md` — Global opencode rules

## User-Level Skills (opencode)

| Skill | Trigger | Path |
|-------|---------|------|
| atomic-command-execution | Ensures shell execution safety by preventing dangerous command chaining and enforcing atomic, single-step operations | `~/.config/opencode/skills/atomic-command-execution/SKILL.md` |
| brainstorming | Creative work — exploring user intent, requirements and design before implementation | `~/.config/opencode/skills/brainstorming/SKILL.md` |
| branch-pr | Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review | `~/.config/opencode/skills/branch-pr/SKILL.md` |
| browser-debugging | Browser debugging workflow for web apps and extensions — console, network, DOM, CDP | `~/.config/opencode/skills/browser-debugging/SKILL.md` |
| caveman | Communication style — cuts conversational filler and pleasantries for maximum token/time efficiency | `~/.config/opencode/skills/caveman/SKILL.md` |
| chained-pr | PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review focus | `~/.config/opencode/skills/chained-pr/SKILL.md` |
| cognitive-doc-design | Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-facing docs | `~/.config/opencode/skills/cognitive-doc-design/SKILL.md` |
| comment-writer | Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub comments | `~/.config/opencode/skills/comment-writer/SKILL.md` |
| context-compaction | Prevents context window flooding by enforcing log budgeting and intelligent output filtering | `~/.config/opencode/skills/context-compaction/SKILL.md` |
| customize-opencode | Use ONLY when editing opencode's own configuration files | Built-in |
| dispatching-parallel-agents | Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies | `~/.config/opencode/skills/dispatching-parallel-agents/SKILL.md` |
| executing-plans | Use when you have a written implementation plan to execute in a separate session with review checkpoints | `~/.config/opencode/skills/executing-plans/SKILL.md` |
| finishing-a-development-branch | Use when implementation is complete, all tests pass, and you need to decide how to integrate the work | `~/.config/opencode/skills/finishing-a-development-branch/SKILL.md` |
| go-testing | Trigger: Go tests, go test coverage, Bubbletea teatest, golden files | `~/.config/opencode/skills/go-testing/SKILL.md` |
| issue-creation | Create Gentle AI issues with issue-first checks. Trigger: creating GitHub issues, bug reports, or feature requests | `~/.config/opencode/skills/issue-creation/SKILL.md` |
| judgment-day | Trigger: judgment day, dual review, adversarial review, juzgar | `~/.config/opencode/skills/judgment-day/SKILL.md` |
| modern-web-guidance | Frontend best practices — responsive design, a11y, performance, modern CSS/JS, React patterns | `~/.config/opencode/skills/modern-web-guidance/SKILL.md` |
| plan-first-reflection | Forces the agent to enter a mandatory reflection phase before executing any action or writing any code | `~/.config/opencode/skills/plan-first-reflection/SKILL.md` |
| ponytail | Governs architectural decisions. Prioritizes simplicity, YAGNI, standard libraries, and avoids over-engineering | `~/.config/opencode/skills/ponytail/SKILL.md` |
| receiving-code-review | Use when receiving code review feedback, before implementing suggestions | `~/.config/opencode/skills/receiving-code-review/SKILL.md` |
| requesting-code-review | Use when completing tasks, implementing major features, or before merging to verify work meets requirements | `~/.config/opencode/skills/requesting-code-review/SKILL.md` |
| skill-creator | Trigger: new skills, agent instructions, documenting AI usage patterns | `~/.config/opencode/skills/skill-creator/SKILL.md` |
| skill-improver | Trigger: improve skills, audit skills, refactor skills, skill quality | `~/.config/opencode/skills/skill-improver/SKILL.md` |
| subagent-driven-development | Use when executing implementation plans with independent tasks in the current session | `~/.config/opencode/skills/subagent-driven-development/SKILL.md` |
| systematic-debugging | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes | `~/.config/opencode/skills/systematic-debugging/SKILL.md` |
| test-driven-correction | Implements a relentless verification loop, running tests and self-correcting on failures | `~/.config/opencode/skills/test-driven-correction/SKILL.md` |
| test-driven-development | Use when implementing any feature or bugfix, before writing implementation code | `~/.config/opencode/skills/test-driven-development/SKILL.md` |
| using-git-worktrees | Use when starting feature work that needs isolation from current workspace | `~/.config/opencode/skills/using-git-worktrees/SKILL.md` |
| using-superpowers | Use when starting any conversation — establishes how to find and use skills | `~/.config/opencode/skills/using-superpowers/SKILL.md` |
| verification-before-completion | Use when about to claim work is complete, fixed, or passing, before committing or creating PRs | `~/.config/opencode/skills/verification-before-completion/SKILL.md` |
| work-unit-commits | Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs | `~/.config/opencode/skills/work-unit-commits/SKILL.md` |
| writing-plans | Use when you have a spec or requirements for a multi-step task, before touching code | `~/.config/opencode/skills/writing-plans/SKILL.md` |
| writing-skills | Use when creating new skills, editing existing skills, or verifying skills work before deployment | `~/.config/opencode/skills/writing-skills/SKILL.md` |

## User-Level Skills (other locations)

| Skill | Trigger | Path |
|-------|---------|------|
| sentry-cli | Guide for using the Sentry CLI to interact with Sentry from the command line | `~/.claude/skills/sentry-cli/SKILL.md` |
| supabase | Use when doing ANY task involving Supabase products, client libraries, auth, RLS, CLI, MCP | `~/.agents/skills/supabase/SKILL.md` |
| supabase-postgres-best-practices | Postgres performance optimization and best practices from Supabase | `~/.agents/skills/supabase-postgres-best-practices/SKILL.md` |

## Excluded Skills

| Skill | Reason |
|-------|--------|
| sdd-apply, sdd-archive, sdd-design, sdd-explore, sdd-init, sdd-onboard, sdd-propose, sdd-spec, sdd-tasks, sdd-verify | SDD internal skills — excluded per registry rules |
| _shared | Shared references — excluded per registry rules |
| skill-registry | Registry management skill — excluded per registry rules |
