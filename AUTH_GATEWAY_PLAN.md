# Auth Gateway Separation — Implementation Plan

**Goal:** Separate login/signup/org onboarding from the main Time Tracker app into a standalone Auth Gateway. This reduces initial bundle size for unauthenticated users, enables independent deployment, and cleanly separates auth concerns.

---

## Current Architecture

```
main.jsx
  └─ AuthProvider (loads Supabase, fetches profile, manages session)
      └─ HashRouter
          └─ App
              ├─ /login, /signup (public routes)
              └─ / (ProtectedRoute → AppShell → all app routes)
                  └─ AppShell checks orgId → shows OnboardingWorkspace if null
```

## Target Architecture

### Option A: Single Repo, Code-Split (Recommended for now)
```
src/
  gateway/                    # Auth Gateway (lazy-loaded chunk)
    AppGateway.jsx            # Routes: /login, /signup, /onboarding
    AuthProviderGateway.jsx   # Minimal auth provider (session only)
    Login.jsx, Signup.jsx, OnboardingGateway.jsx
  
  app/                        # Main App (lazy-loaded chunk)
    mainApp.jsx               # Entry point after auth
    AuthProviderApp.jsx       # Full auth provider (profile, org, role)
    AppShell.jsx, pages/...
  
  main.jsx                    # Root: decides which to load
```

### Option B: Separate Projects (Future)
- `chronos-gateway` — deployed to `auth.chronos.app`
- `chronos-app` — deployed to `app.chronos.app`
- Shared Supabase project, shared `supabase/schema.sql`

**Decision:** Start with **Option A** (code-split in monorepo). Can extract to Option B later without rewriting components.

---

## Implementation Chunks (Reviewable Units)

Each chunk = 1 PR, 1 review checkpoint, ≤300 lines changed.

### Chunk 1: Extract Gateway Components (No routing changes)
**Files to create:**
- `src/gateway/` directory
- `src/gateway/AuthProviderGateway.jsx` — minimal provider (session only, no profile fetch)
- `src/gateway/LoginGateway.jsx` — copy of `Login.jsx` with gateway imports
- `src/gateway/SignupGateway.jsx` — copy of `Signup.jsx` with gateway imports
- `src/gateway/OnboardingGateway.jsx` — copy of `OnboardingWorkspace.jsx`
- `src/gateway/AppGateway.jsx` — routes for gateway pages
- `src/gateway/index.css` — minimal styles (or reuse design tokens)

**Files to modify:**
- None (existing auth files untouched)

**Verification:** `npm run build` succeeds, gateway components render in isolation.

---

### Chunk 2: Create Gateway Entry Point & Lazy Loading
**Files to create:**
- `src/gateway/mainGateway.jsx` — Vite entry for gateway chunk
- `vite.config.gateway.js` — gateway build config (or extend main config)

**Files to modify:**
- `vite.config.js` — add gateway entry, configure code splitting
- `index.html` — add gateway mount point (or use dynamic import in main.jsx)

**Verification:** `npm run build` produces separate `gateway-[hash].js` chunk.

---

### Chunk 3: Root Router Switch (main.jsx)
**Files to modify:**
- `src/main.jsx` — replace `AuthProvider` + `App` with logic:
  ```jsx
  // Pseudo-code
  const [gatewayLoaded, setGatewayLoaded] = useState(false);
  
  // Check session via lightweight Supabase call (no AuthProvider)
  const hasSession = await checkSessionLite();
  
  if (!hasSession) {
    // Lazy-load gateway
    const { AppGateway } = await import('./gateway/AppGateway');
    return <AppGateway onAuthSuccess={() => setGatewayLoaded(true)} />;
  }
  
  // Load main app
  const { AppProvider, App } = await import('./app/mainApp');
  return <AppProvider><App /></AppProvider>;
  ```

**Verification:** Unauthenticated user sees Login; authenticated user loads main app.

---

### Chunk 4: Main App Refactor (Extract AppShell into AppProvider)
**Files to create:**
- `src/app/AuthProviderApp.jsx` — full provider (profile, org, role, refreshProfile)
- `src/app/mainApp.jsx` — wraps routes with AuthProviderApp + AppShell

**Files to modify:**
- `src/App.jsx` → move to `src/app/AppRoutes.jsx` (route definitions only)
- `src/components/layout/AppShell.jsx` — remove `OnboardingWorkspace` logic (handled by gateway)
- `src/auth/AuthContext.jsx` — keep as-is (used by AppProviderApp)

**Verification:** Authenticated flow works end-to-end: login → org exists → main app loads.

---

### Chunk 5: Onboarding Flow Handoff
**Files to modify:**
- `src/gateway/OnboardingGateway.jsx` — on success, call `onAuthSuccess()` from Chunk 3
- `src/gateway/SignupGateway.jsx` — after org creation, call `onAuthSuccess()`
- Remove `OnboardingWorkspace` import from `AppShell.jsx` (already done in Chunk 4)

**Verification:** New user: Signup → Onboarding → Main App (no blank screen).

---

### Chunk 6: Cleanup & Demo Mode Sync
**Files to modify:**
- `src/auth/supabase.js` — ensure demo mode works in both gateway and app
- Remove unused auth exports from main bundle
- Update `src/data/mockData.js` imports if needed

**Verification:** Demo mode works in both gateway and main app.

---

### Chunk 7: Electron & Vercel Config
**Files to modify:**
- `electron/main.cjs` — load gateway URL first, then app URL after auth
- `.vercel/project.json` — ensure both chunks deploy correctly
- `vercel.json` — rewrites for gateway routes

**Verification:** `npm run electron:dev` works; Vercel preview deploys both chunks.

---

## RLS / Supabase Considerations

| Current Policy | Gateway Impact |
|----------------|----------------|
| `org_insert` (authenticated, check true) | Works — gateway uses same Supabase client |
| `org_members_read` (id = my_org_id()) | Works — profile fetch happens in main app |
| `my_org_id()` helper | Unchanged — called after profile exists |
| Profile trigger (`handle_new_user`) | Unchanged — runs on signup |

**No schema changes needed** for gateway separation.

---

## Dependencies Between Chunks

```
Chunk 1 (Gateway Components)
    ↓
Chunk 2 (Gateway Build Entry)
    ↓
Chunk 3 (Root Router Switch) ← depends on 1, 2
    ↓
Chunk 4 (Main App Refactor) ← depends on 3
    ↓
Chunk 5 (Onboarding Handoff) ← depends on 3, 4
    ↓
Chunk 6 (Cleanup) ← depends on 5
    ↓
Chunk 7 (Electron/Vercel) ← depends on 6
```

---

## Review Checkpoints

| Checkpoint | What to Verify |
|------------|----------------|
| After Chunk 1 | Gateway components render, no TypeScript errors, styles match |
| After Chunk 2 | Separate gateway chunk generated, `npm run build` passes |
| After Chunk 3 | Unauth → Login; Auth → Main App; no double-load |
| After Chunk 4 | All protected routes work, profile/org loaded, timer works |
| After Chunk 5 | New user: Signup → Onboarding → /my-time (no blank screen) |
| After Chunk 6 | Demo mode works in both contexts; no console errors |
| After Chunk 7 | Electron opens to login; Vercel deploys both chunks |

---

## Open Questions (Need Your Input)

1. **Monorepo vs Separate Repo** — Start with code-split (Option A), extract later?
2. **Session Check Strategy** — `supabase.auth.getSession()` in main.jsx (fast, no provider) vs. lightweight `AuthProviderGateway`?
3. **Shared Design Tokens** — Gateway imports `index.css` (full tokens) or minimal subset?
4. **Electron Deep Linking** — Handle `chronos://auth/callback` in gateway or main app?
5. **Vercel Dual Deploy** — Keep single project with rewrites, or split to `chronos-gateway` + `chronos-app` projects?

---

## Estimated Effort

| Chunk | Est. Lines Changed | Est. Time |
|-------|-------------------|-----------|
| 1 | ~200 (new files) | 1 session |
| 2 | ~50 (config) | 0.5 session |
| 3 | ~80 (main.jsx + logic) | 1 session |
| 4 | ~150 (refactor) | 1 session |
| 5 | ~60 (handoff logic) | 0.5 session |
| 6 | ~40 (cleanup) | 0.5 session |
| 7 | ~60 (config) | 0.5 session |
| **Total** | **~640** | **5 sessions** |

---

## Next Steps

1. **Approve this plan** — confirm chunk breakdown, architecture choice (Option A), and review cadence
2. **Start Chunk 1** — create `src/gateway/` with extracted components
3. **Review Checkpoint 1** — verify gateway components in isolation

---

*Plan created: 2026-07-09*  
*Based on: AGENTS.md current state, git history, Engram session summaries #159, #92, #102, #122*