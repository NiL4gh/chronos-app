import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import MyTime from './pages/MyTime';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="team" element={<Team />} />
        <Route path="projects" element={<Projects />} />
        <Route path="reports" element={<Reports />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="my-time" element={<MyTime />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
