import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderKanban, BarChart3,
  FileText, Clock, Settings, HelpCircle, Timer,
  ChevronLeft, ChevronRight, UserCog, ChevronUp, ChevronDown,
  Sun, Moon, CheckSquare, LogOut
} from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { resolveTheme } from '../../lib/theme.js';

const NAV_ITEMS = [
  { to: '/my-time',   icon: Clock,           label: 'My Time',     adminOnly: false, shortcut: 'G M', section: 'General' },
  { to: '/reports',   icon: BarChart3,       label: 'Reports',     adminOnly: false, shortcut: 'G R', section: 'Workspace' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects',    adminOnly: false, shortcut: 'G P', section: 'Workspace' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks',       adminOnly: false, shortcut: 'G K', section: 'Workspace' },
  { to: '/team',      icon: Users,           label: 'Team',        adminOnly: false, shortcut: 'G T', section: 'Workspace' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   adminOnly: false, shortcut: 'G D', section: 'General',   hidden: true },
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

export default function Sidebar({
  activeRole,
  triggerToast,
  onOpenHelp,
  onOpenSettings,
  theme,
  setTheme,
  expanded = false,
  onToggleExpand
}) {
  const collapsed = !expanded;
  const onToggleCollapse = onToggleExpand;
  const isAdmin = activeRole === 'admin';
  const visibleNav = NAV_ITEMS.filter(item => !item.hidden && (!item.adminOnly || isAdmin));
  const [hoverToggle, setHoverToggle] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { displayName, user, signOut } = useAuth();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setProfileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
    <div
      className={[
        'hidden md:flex relative flex-col h-full shrink-0 transition-all duration-300 ease-in-out z-[60]',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      <aside
        className="w-full h-full flex flex-col relative"
        style={{ 
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border-default)',
        }}
      >
      {/* Logo */}
      <div className="flex items-center px-4 py-4 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
            <Timer size={15} className="text-amber-500" />
          </div>
          {!collapsed && (
            <span className="text-xl font-black text-[var(--text-primary)] tracking-tight truncate">
              Chronos
            </span>
          )}
        </div>
      </div>      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1">
        {['General', 'Workspace'].map((section, idx) => (
          <React.Fragment key={section}>
            {!collapsed && (
              <div className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] ${idx > 0 ? 'mt-4' : ''}`}>
                {section}
              </div>
            )}
            {visibleNav.filter(item => item.section === section).map(({ to, icon: Icon, label, shortcut }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => [
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'flex items-center gap-3 rounded-xl mx-3 px-3 py-2.5 text-sm font-semibold text-[var(--accent-text)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] transition-colors shadow-sm'
                    : 'flex items-center gap-3 rounded-xl mx-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] border border-transparent transition-colors'
                ].join(' ')}
                title={collapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      className={isActive ? "flex-shrink-0 text-[var(--text-primary)]" : "flex-shrink-0 text-[var(--text-muted)]"}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{label}</span>
                        {shortcut && (
                          <span className="text-[10px] font-mono text-[var(--text-disabled)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                            {shortcut}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </nav>



      {/* Bottom section */}
      <div
        className="py-2 space-y-0.5 shrink-0"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => {
          if (to === '#') {
            return (
              <button
                key={label}
                onClick={onOpenHelp}
                className={[
                  collapsed ? 'justify-center' : '',
                  'w-[calc(100%-24px)] flex items-center gap-3 rounded-xl mx-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] border border-transparent transition-colors'
                ].join(' ')}
                title={collapsed ? label : undefined}
              >
                <Icon size={16} className="flex-shrink-0 text-[var(--text-muted)]" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          }
          if (to === '/settings') {
            return (
              <button
                key={label}
                onClick={onOpenSettings}
                className={[
                  collapsed ? 'justify-center' : '',
                  'w-[calc(100%-24px)] flex items-center gap-3 rounded-xl mx-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] border border-transparent transition-colors'
                ].join(' ')}
                title={collapsed ? label : undefined}
              >
                <Icon size={16} className="flex-shrink-0 text-[var(--text-muted)]" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          }
          return (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => [
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'flex items-center gap-3 rounded-xl mx-3 px-3 py-2.5 text-sm font-semibold text-[var(--accent-text)] bg-[var(--accent-subtle)] border border-[var(--accent-border)] transition-colors shadow-sm'
                  : 'flex items-center gap-3 rounded-xl mx-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] border border-transparent transition-colors'
              ].join(' ')}
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={isActive ? "flex-shrink-0 text-[var(--text-primary)]" : "flex-shrink-0 text-[var(--text-muted)]"}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Quick dark mode toggle */}
        {!collapsed && setTheme && (() => {
          const isDark = resolveTheme(theme) === 'dark';
          return (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-[calc(100%-16px)] flex items-center gap-3 rounded-lg mx-2 px-3 py-2 text-sm font-medium transition-colors duration-150"
              style={{
                background: 'transparent',
                color: 'var(--text-tertiary)',
                borderLeft: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-sunken)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              {isDark ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
              <span className="truncate">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          );
        })()}
        {collapsed && setTheme && (() => {
          const isDark = resolveTheme(theme) === 'dark';
          return (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center justify-center rounded-lg mx-2 px-3 py-2 transition-colors duration-150"
              style={{
                background: 'transparent',
                color: 'var(--text-tertiary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-sunken)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          );
        })()}

        {/* User stub + Dropdown */}
        <div className="relative mx-2 mt-1">
          {/* Backdrop to close click-away */}
          {profileOpen && (
            <div 
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setProfileOpen(false)}
            />
          )}

          {/* Trigger button */}
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className={[
              'w-[calc(100%-24px)] flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 mx-3',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
            style={{
              borderTop: '1px solid var(--border-default)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-sunken)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Avatar name={displayName || 'User'} size="sm" />
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {displayName || 'User'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {activeRole === 'admin' ? 'Admin' : 'Employee'}
                  </p>
                </div>
                <ChevronDown 
                  size={14} 
                  className={[
                    'text-[var(--text-muted)] transition-transform duration-150 shrink-0',
                    profileOpen ? 'transform rotate-180' : ''
                  ].join(' ')} 
                />
              </>
            )}
          </button>

          {/* Dropdown panel */}
          {profileOpen && (
            <div 
              className={`glass-elevated rounded-xl p-2 shadow-lg min-w-[180px] z-50 ${collapsed ? 'absolute bottom-full left-full ml-2' : 'absolute bottom-full left-0 right-0 mb-2'}`}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              {/* User info header */}
              <div className="px-3 py-2 border-b border-[var(--border-default)] mb-1 text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{displayName || 'User'}</p>
                <p className="text-xs text-[var(--text-muted)]">{user?.email || ''}</p>
              </div>

              {/* 4. Settings link */}
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onOpenSettings?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors text-left text-[var(--text-secondary)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-sunken)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Settings size={13} className="shrink-0" />
                <span>Settings</span>
              </button>

              {/* 6. Help link */}
              <button
                onClick={() => {
                  if (onOpenHelp) {
                    onOpenHelp();
                  } else if (triggerToast) {
                    triggerToast('Help docs coming soon.', 'info');
                  } else {
                    alert('Help docs coming soon.');
                  }
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors text-left text-[var(--text-secondary)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-sunken)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <HelpCircle size={13} className="shrink-0" />
                <span>Help & Docs</span>
              </button>

              {/* Sign Out */}
              <div className="border-t border-[var(--border-default)] mt-1 pt-1">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await signOut();
                    navigate('/login', { replace: true });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors text-left"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut size={13} className="shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>      {/* closes relative mx-2 mt-1 user wrapper */}
      </div>        {/* closes py-2 space-y-0.5 bottom section */}
      </aside>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        onMouseEnter={() => setHoverToggle(true)}
        onMouseLeave={() => setHoverToggle(false)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 z-[60]"
        style={{
          background: hoverToggle ? 'var(--bg-sunken)' : 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--text-secondary)',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>

    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-default)] flex items-center justify-around px-2 py-2 h-16" style={{ background: 'var(--bg-surface)' }}>
      <NavLink to="/dashboard" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive
          ? 'text-[var(--text-active)] bg-[var(--bg-active)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`
      }>
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>
      <NavLink to="/my-time" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive
          ? 'text-[var(--text-active)] bg-[var(--bg-active)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`
      }>
        <Clock size={20} />
        <span className="text-[10px] font-medium">My Time</span>
      </NavLink>
      <NavLink to="/tasks" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive
          ? 'text-[var(--text-active)] bg-[var(--bg-active)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`
      }>
        <CheckSquare size={20} />
        <span className="text-[10px] font-medium">Tasks</span>
      </NavLink>
      {activeRole === 'admin' && (
        <NavLink to="/team" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive
            ? 'text-[var(--text-active)] bg-[var(--bg-active)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`
        }>
          <Users size={20} />
          <span className="text-[10px] font-medium">Team</span>
        </NavLink>
      )}
      <NavLink to="/settings" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive
          ? 'text-[var(--text-active)] bg-[var(--bg-active)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`
      }>
        <Settings size={20} />
        <span className="text-[10px] font-medium">Settings</span>
      </NavLink>
    </nav>
    </>
  );
}
