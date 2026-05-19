import React, { useState } from 'react';
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
  const [hoverToggle, setHoverToggle] = useState(false);

  return (
    <aside
      className={[
        'relative flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
      style={{ 
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          >
            <Timer size={15} style={{ color: 'var(--accent)' }} />
          </div>
          {!collapsed && (
            <span className="text-base font-semibold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
              Chronos
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {!collapsed && (
          <p className="text-xs uppercase tracking-widest px-4 mb-1" style={{ color: 'var(--text-muted)' }}>
            Workspace
          </p>
        )}

        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => [
              'flex items-center gap-3 rounded-lg mx-2 px-3 py-2 text-sm font-medium transition-colors duration-150',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent-subtle)' : 'transparent',
              color: isActive ? 'var(--accent-text)' : 'var(--text-tertiary)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'var(--bg-sunken)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>



      {/* Bottom section */}
      <div
        className="py-2 space-y-0.5 shrink-0"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) => [
              'flex items-center gap-3 rounded-lg mx-2 px-3 py-2 text-sm font-medium transition-colors duration-150',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent-subtle)' : 'transparent',
              color: isActive ? 'var(--accent-text)' : 'var(--text-tertiary)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'var(--bg-sunken)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Role switcher */}
        {!collapsed ? (
          <div className="flex items-center gap-1 mx-2 px-2 py-1 mt-2">
            <button
              onClick={() => { if (activeRole !== 'admin') onRoleSwitch(); }}
              className="flex-1 flex justify-center text-xs rounded-md px-2 py-1 border transition-colors"
              style={activeRole === 'admin' ? {
                background: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)'
              } : {
                background: 'var(--bg-sunken)', color: 'var(--text-muted)', border: '1px solid transparent'
              }}
            >
              Admin
            </button>
            <button
              onClick={() => { if (activeRole !== 'employee') onRoleSwitch(); }}
              className="flex-1 flex justify-center text-xs rounded-md px-2 py-1 border transition-colors"
              style={activeRole === 'employee' ? {
                background: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)'
              } : {
                background: 'var(--bg-sunken)', color: 'var(--text-muted)', border: '1px solid transparent'
              }}
            >
              Employee
            </button>
          </div>
        ) : (
          <button
            onClick={onRoleSwitch}
            className="w-full flex items-center justify-center gap-3 rounded-md mx-2 px-2 py-1 text-xs transition-colors duration-150 border mt-2"
            style={{
              background: 'var(--bg-sunken)',
              color: 'var(--text-muted)',
              border: '1px solid transparent',
              width: 'calc(100% - 16px)',
            }}
          >
            <UserCog size={16} />
          </button>
        )}

        {/* User stub */}
        <div
          className={[
            'flex items-center gap-3 px-4 py-3 mt-1',
            'cursor-default select-none',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
          style={{
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <Avatar name="Niloy Pal" size="sm" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                Niloy Pal
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {activeRole === 'admin' ? 'Admin' : 'Employee'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        onMouseEnter={() => setHoverToggle(true)}
        onMouseLeave={() => setHoverToggle(false)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 z-10"
        style={{
          background: hoverToggle ? 'var(--border-default)' : 'var(--bg-sunken)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-tertiary)',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
