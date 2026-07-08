# Manual test plan — `feat/auth-access-hardening`

## Browser test

1. Visit http://localhost:5173 (or live URL).
2. Sign in as `l.lawliet.620@gmail.com` (Google OAuth).
3. Confirm: app skips OnboardingWorkspace and goes to /my-time OR (if user actually has org_id=null) shows OnboardingWorkspace form.
4. If they see OnboardingWorkspace: type a workspace name and submit.
5. Verify: NO raw PostgreSQL error appears. App transitions to /my-time.
6. Refresh: app stays on /my-time (state correctly persisted).

## Expected outcomes

- The OnboardingWorkspace banner no longer shows raw `new row violates row-level security policy for table "organizations"`.
- Friendly error mapping kicks in if anything else fails.

## Known partial-fix gap

The migration fixes `org_insert WITH CHECK (true)` so the INSERT statement itself no
longer throws. However, the application uses `.insert().select().single()` to capture
the new org id. The `.select().single()` step goes through `org_members_read` policy
`(id = my_org_id())`, which still rejects the read for a fresh NULL-org user until their
profile.org_id is updated.

Net effect when a brand-new signup submits:
- INSERT: succeeds (no 42501 from INSERT itself)
- `.select()`: returns 0 rows because `id <> my_org_id()` (canary has no org yet)
- `.single()`: throws `PGRST116` (Cannot coerce the result to a single JSON object)
- OnboardingWorkspace catch: `friendlyAuthError` translates → user sees
  `"Setup incomplete. Please contact support."`

This is a graceful UX failure (no SQLSTATE leakage) but does NOT satisfy AC2
"Post-submit, app transitions to sidebar + topbar in one render".

## Follow-up recommendation

A second SQL migration is needed to widen `org_members_read` so a freshly-authenticated
user can SELECT the org they just inserted in the same request, OR replace the
`.insert().select().single()` pattern in OnboardingWorkspace / Signup with a different
org-id retrieval mechanism (e.g., fetching via plain `INSERT` + a separate query after
the profile-update transaction commits).

Out of scope for this change (`apply-guide.md` did not include `org_members_read`).
