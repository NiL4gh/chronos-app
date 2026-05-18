import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderKanban, BarChart3,
  FileText, Clock, Settings, HelpCircle, Timer,
  ChevronLeft, ChevronRight, UserCog,
} from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   adminOnly: false, shortcut: null },
  { to: '/team',      icon: Users,           label: 'Team',        adminOnly: true,  shortcut: null },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects',    adminOnly: false, shortcut: null },
  { to: '/reports',   icon: BarChart3,       label: 'Reports',     adminOnly: true,  shortcut: null },
  { to: '/invoices',  icon: FileText,        label: 'Invoices',    adminOnly: true,  shortcut: null },
  { to: '/my-time',   icon: Clock,           label: 'My Time',     adminOnly: false, shortcut: null },
];

const BOTTOM_NAV = [
  { to: '/settings', icon: Settings,   label: 'Settings' },
  { to: '#',         icon: HelpCircle, label: 'Help & Docs' },
];

const SHORTCUTS = [
  { key: 'T',   label: 'Toggle timer' },
  { key: 'N',   label: 'New entry' },
  { key: 'P',   label: 'Search' },
  { key: '⌘K',  label: 'Command' },
];

export default function Sidebar({ collapsed, onToggleCollapse, activeRole, onRoleSwitch }) {
  const isAdmin = activeRole === 'admin';
  const visibleNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className={[
        'relative flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out glass-subtle',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
      style={{ borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-14 px-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.30)',
              boxShadow: '0 0 12px rgba(245,158,11,0.15)',
            }}
          >
            <Timer size={15} className="text-amber-400" />
          </div>
          {!collapsed && (
            <span className="text-base font-semibold tracking-tight text-[var(--text-primary)] truncate">
              Chronos
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-2 pt-1"
            style={{ color: 'var(--text-disabled)' }}>
            Workspace
          </p>
        )}

        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => [
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
              'border',
              isActive
                ? 'bg-amber-400/10 text-amber-300 border-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 border-transparent',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Keyboard shortcut hints */}
      {!collapsed && (
        <div
          className="mx-2 mb-2 rounded-xl p-3"
          style={{
            background: 'rgba(255,200,120,0.04)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-disabled)' }}>
            Shortcuts
          </p>
          <div className="space-y-1">
            {SHORTCUTS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <kbd
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(255,200,120,0.08)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom section */}
      <div
        className="px-2 py-2 space-y-0.5 shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) => [
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 border',
              isActive
                ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 border-transparent',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {/* Role switcher */}
        <button
          onClick={onRoleSwitch}
          title={collapsed ? `Switch to ${activeRole === 'admin' ? 'Employee' : 'Admin'}` : undefined}
          className={[
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 border',
            'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-white/5',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
          style={{ color: 'var(--text-muted)' }}
        >
          <UserCog size={16} className="shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {activeRole === 'admin' ? 'Admin view' : 'Employee view'}
            </span>
          )}
        </button>

        {/* User stub */}
        <div
          className={[
            'flex items-center gap-3 px-3 py-2 rounded-xl mt-1',
            'cursor-default select-none',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
          style={{
            background: 'rgba(255,200,120,0.04)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Avatar name="Niloy Pal" size="sm" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                Niloy Pal
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {activeRole === 'admin' ? 'Admin' : 'Employee'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 z-10"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-interactive)',
          color: 'var(--text-muted)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.30)',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
