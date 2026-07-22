import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './auth/supabase'
import './index.css'

// Lazy-load pages
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Onboarding = lazy(() => import('./gateway/OnboardingGateway'))
const MainApp = lazy(() => import('./app/mainApp'))

/**
 * Check if user has an active session
 */
async function checkSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session?.user
  } catch {
    return false
  }
}

/**
 * Get user's profile to check if they have an organization
 */
async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('[Profile Error]', error.message)
      return null
    }
    return data
  } catch (e) {
    console.error('[Profile Exception]', e)
    return null
  }
}

/**
 * Protected route wrapper - redirects to login if no session
 */
function ProtectedRoute({ children, requireOrg = false }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const hasSession = await checkSession()
      
      if (!hasSession) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const profile = await getProfile(session.user.id)

      if (requireOrg && !profile?.org_id) {
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }

      setAuthorized(true)
      setLoading(false)
    }

    checkAuth()
  }, [requireOrg])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" 
               style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  if (!authorized) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Loading fallback for lazy-loaded components
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
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

/**
 * Main App Component
 */
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Protected app routes */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute requireOrg={true}>
                <MainApp />
              </ProtectedRoute>
            }
          />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}