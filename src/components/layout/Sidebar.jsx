import { NavLink } from 'react-router-dom';
import {
  Timer,
  LayoutDashboard,
  Users,
  FolderKanban,
  BarChart2,
  FileText,
  Clock,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import Avatar from '../ui/Avatar';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', adminOnly: false },
  { label: 'Team', icon: Users, to: '/team', adminOnly: true },
  { label: 'Projects', icon: FolderKanban, to: '/projects', adminOnly: false },
  { label: 'Reports', icon: BarChart2, to: '/reports', adminOnly: true },
  { label: 'Invoices', icon: FileText, to: '/invoices', adminOnly: true },
  { label: 'My Time', icon: Clock, to: '/my-time', adminOnly: false },
];

const Sidebar = ({ collapsed, onToggle, role = 'admin', currentRole, onRoleChange }) => {
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin');

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 border ${
      isActive
        ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 border-transparent'
    } ${collapsed ? 'justify-center' : ''}`;

  return (
    <div
      className={`flex flex-col h-full bg-neutral-950 border-r border-neutral-800 transition-all duration-300 shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-14 border-b border-neutral-800 px-4 shrink-0 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
          <Timer size={15} className="text-violet-400" />
        </div>
        {!collapsed && <span className="text-sm font-semibold text-neutral-100 tracking-tight">Chronos</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 px-3 pb-2">Workspace</p>
        )}
        {visibleItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass} title={collapsed ? item.label : undefined}>
            <item.icon size={16} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-neutral-800 pt-3">
        <NavLink to="/settings" className={navLinkClass} title={collapsed ? 'Settings' : undefined}>
          <Settings size={16} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        
        <a
          href="#"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 border border-transparent text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 ${collapsed ? 'justify-center' : ''}`}
        >
          <HelpCircle size={16} />
          {!collapsed && <span>Help &amp; Docs</span>}
        </a>

        {/* Role Switcher */}
        {!collapsed ? (
          <div className="px-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-1.5">Viewing as</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onRoleChange('admin')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 border ${
                  currentRole === 'admin'
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    : 'text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <ShieldCheck size={14} />
                Admin
              </button>
              <button
                onClick={() => onRoleChange('employee')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 border ${
                  currentRole === 'employee'
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                    : 'text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <User size={14} />
                Employee
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-2 mb-3">
            <button
              title={currentRole === 'admin' ? 'Admin mode' : 'Employee mode'}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-400 border border-violet-500/20"
            >
              {currentRole === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
            </button>
          </div>
        )}

        {/* User stub */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <Avatar name="Niloy Pal" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-300 truncate">Niloy Pal</p>
              <p className="text-xs text-neutral-600 truncate capitalize">{role}</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent transition-colors duration-150 ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
