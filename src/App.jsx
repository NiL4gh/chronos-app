import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import MyTime from './pages/MyTime';
import Settings from './pages/Settings';
import DesktopHelper from './pages/DesktopHelper';

export default function App() {
  return (
    <Routes>
      <Route path="/desktop-helper" element={<DesktopHelper />} />
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="team" element={<Team />} />
        <Route path="projects" element={<Projects />} />
        <Route path="reports" element={<Reports />} />
        <Route path="my-time" element={<MyTime />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
