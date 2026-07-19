import React, { useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { supabase } from './auth/supabase'
import './index.css'

/**
 * Error boundary so a runtime error renders a visible message
 * instead of a blank page during development.
 */
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[Chronos] Runtime error:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
          <div
            className="max-w-md w-full rounded-2xl p-6 shadow-xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <h2 className="text-lg font-semibold mb-2">Something went wrong.</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Open DevTools (F12) → Console for full error details.
            </p>
            <pre
              className="text-xs p-3 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap break-all"
              style={{ background: 'var(--bg-sunken)', color: 'var(--text-secondary)' }}
            >
              {String(this.state.error?.stack ?? this.state.error?.message ?? this.state.error)}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Lightweight session check — no AuthProvider, no profile fetch.
 * Returns true if a valid Supabase session exists (including demo mode).
 */
async function checkSessionLite() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session?.user
  } catch {
    return false
  }
}

/**
 * Fetch profile for the current user to check org_id.
 * Returns profile object or null.
 */
async function fetchProfileForSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', session.user.id)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

/**
 * Loading fallback while gateway/app chunks load.
 * Uses design tokens from index.css.
 */
function LoadingFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
          style={{ background: 'var(--accent)', boxShadow: '0 0 24px var(--accent-subtle)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'white' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading Chronos…</p>
      </div>
    </div>
  )
}

// Lazy-load the Auth Gateway chunk (only when no session or needs onboarding)
const Gateway = lazy(() =>
  import('./gateway/mainGateway').then((mod) => ({
    default: mod.AppGateway,
  }))
)

// Lazy-load the Main App chunk (new app structure in src/app/)
const MainApp = lazy(() => import('./app/mainApp'))

/**
 * Root component — decides whether to load the Auth Gateway or the Main App
 * based on whether a session exists AND whether the user has an organization.
 * 
 * Flow:
 * 1. checkSessionLite() → no session → load Gateway (login/signup)
 * 2. Session exists → fetchProfileForSession() 
 *    - has org_id → load Main App
 *    - no org_id → load Gateway (onboarding)
 * 3. Gateway onAuthSuccess() → re-check session + profile → load Main App
 */
function Root() {
  const [state, setState] = useState('checking') // 'checking' | 'gateway' | 'app'

  useEffect(() => {
    let mounted = true

    async function initialize() {
      const hasSession = await checkSessionLite()

      if (!mounted) return

      if (!hasSession) {
        setState('gateway')
        return
      }

      // Session exists — check if user has organization
      const profile = await fetchProfileForSession()

      if (!mounted) return

      if (profile?.org_id) {
        setState('app')
      } else {
        // User authenticated but no organization — needs onboarding
        setState('gateway')
      }
    }

    initialize()
    return () => { mounted = false }
  }, [])

  // Still checking — show loading
  if (state === 'checking') {
    return <LoadingFallback />
  }

  // No session OR session exists but no org → load Auth Gateway (lazy).
  // Gateway depends on the parent's HashRouter.
  if (state === 'gateway') {
    return (
      <HashRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Gateway onAuthSuccess={() => setState('checking')} />
        </Suspense>
      </HashRouter>
    )
  }

  // Session exists + has org → load Main App.
  // MainApp provides its own HashRouter internally — DO NOT wrap here.
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MainApp />
    </Suspense>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Root />
    </RootErrorBoundary>
  </React.StrictMode>
)