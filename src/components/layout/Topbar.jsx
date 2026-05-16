import { useLocation } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react';
import Button from '../ui/Button';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Good morning, Alex' },
  '/team': { title: 'Team', subtitle: 'Manage your workspace members' },
  '/projects': { title: 'Projects', subtitle: 'Track goals and project health' },
  '/reports': { title: 'Reports', subtitle: 'Time and billing analytics' },
  '/invoices': { title: 'Invoices', subtitle: 'Manage client invoices' },
  '/my-time': { title: 'My Time', subtitle: 'Your personal time log' },
  '/settings': { title: 'Settings', subtitle: 'Workspace configuration' },
};

const Topbar = ({ onLogTime }) => {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: 'Chronos', subtitle: '' };

  return (
    <div className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-neutral-800 bg-neutral-950">
      {/* Left: Page title */}
      <div>
        <h1 className="text-sm font-semibold text-neutral-100 leading-none">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{meta.subtitle}</p>
        )}
      </div>

      {/* Right: Search + Bell + Log Time */}
      <div className="flex items-center gap-3">
        {/* Search — read-only placeholder */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
          <input
            readOnly
            placeholder="Search projects, tasks, or team members..."
            className="w-72 rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-16 py-2 text-sm text-neutral-600 placeholder-neutral-600 outline-none cursor-default hover:border-neutral-700 transition-colors duration-150"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-700 pointer-events-none">⌘K</kbd>
        </div>

        {/* Notification bell */}
        <button className="relative w-8 h-8 rounded-md flex items-center justify-center text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors duration-150">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500"></span>
        </button>

        {/* Log Time */}
        <Button variant="primary" size="sm" onClick={onLogTime}>
          <Plus size={14} />
          Log Time
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
