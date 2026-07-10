import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import MyTime from '../pages/MyTime';
import Projects from '../pages/Projects';
import Tasks from '../pages/Tasks';
import Settings from '../pages/Settings';
import Team from '../pages/Team';
import Reports from '../pages/Reports';
import Dashboard from '../pages/Dashboard';
import Invoices from '../pages/Invoices';
import DesktopHelper from '../pages/DesktopHelper';

/**
 * Route definitions for the main authenticated app.
 * Extracted from App.jsx to separate routing from app bootstrap.
 * 
 * Notes:
 * - /login and /signup are handled by the Auth Gateway (not here)
 * - /desktop-helper is standalone, no auth required
 * - All other routes require authentication via ProtectedRoute
 * - Admin-only routes use ProtectedRoute with adminOnly prop
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone desktop helper — no shell, no auth */}
      <Route path="/desktop-helper" element={<DesktopHelper />} />

      {/* Protected app shell — all nested routes require auth */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/my-time" replace />} />

        {/* Available to all authenticated users */}
        <Route path="my-time" element={<MyTime />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="settings" element={<Settings />} />

        {/* Admin-only routes — ProtectedRoute enforces at the route level */}
        <Route
          path="team"
          element={
            <ProtectedRoute adminOnly>
              <Team />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute adminOnly>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices"
          element={
            <ProtectedRoute adminOnly>
              <Invoices />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/my-time" replace />} />
    </Routes>
  )
}