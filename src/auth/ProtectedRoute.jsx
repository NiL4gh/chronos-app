import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Wraps any route that requires a logged-in user.
 * - While the session is loading → show nothing (avoids flash).
 * - If no session → redirect to /login, preserving the attempted URL.
 * - If `adminOnly` is true and the user is an employee → redirect to /my-time.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { session, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-base)' }}>
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/my-time" replace />;
  }

  return children;
}
