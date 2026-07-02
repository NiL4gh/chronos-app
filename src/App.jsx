import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import MyTime from './pages/MyTime';
import Settings from './pages/Settings';
import DesktopHelper from './pages/DesktopHelper';

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Standalone desktop helper — no shell, no auth */}
      <Route path="/desktop-helper" element={<DesktopHelper />} />

      {/* Protected app shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
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
  );
}
