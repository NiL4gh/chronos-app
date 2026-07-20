import { Routes, Route, Navigate } from 'react-router-dom';
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
 * Parent layout route (AppShell) provides the shell via <Outlet>.
 *
 * Notes:
 * - /login and /signup are handled by the Auth Gateway (not here)
 * - /desktop-helper is standalone, no auth required
 * - All other routes require authentication (enforced by the parent layout)
 * - Admin-only routes use ProtectedRoute with adminOnly prop
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/my-time" replace />} />

      <Route path="my-time" element={<MyTime />} />
      <Route path="projects" element={<Projects />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="settings" element={<Settings />} />

      {/* Admin-only routes */}
      <Route path="team" element={<ProtectedRoute adminOnly><Team /></ProtectedRoute>} />
      <Route path="reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
      <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
      <Route path="invoices" element={<ProtectedRoute adminOnly><Invoices /></ProtectedRoute>} />

      {/* Standalone page — no shell, no auth */}
      <Route path="desktop-helper" element={<DesktopHelper />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/my-time" replace />} />
    </Routes>
  )
}
