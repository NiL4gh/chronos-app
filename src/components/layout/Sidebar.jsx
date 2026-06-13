import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderKanban, BarChart3,
  FileText, Clock, Settings, HelpCircle, Timer,
  ChevronLeft, ChevronRight, UserCog, ChevronUp, ChevronDown,
  Sun, Moon, CheckSquare
} from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   adminOnly: false, shortcut: 'G D', section: 'General',   hidden: true },
  { to: '/my-time',   icon: Clock,           label: 'My Time',     adminOnly: false, shortcut: 'G M', section: 'General' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks',       adminOnly: false, section: 'Workspace', hidden: true },
  { to: '/team',      icon: Users,           label: 'Team',        adminOnly: true,  shortcut: 'G T', section: 'Workspace', hidden: true },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects',    adminOnly: false, shortcut: 'G P', section: 'Workspace' },
  { to: '/reports',   icon: BarChart3,       label: 'Reports',     adminOnly: false, shortcut: 'G R', section: 'Workspace' },
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
  onRoleSwitch, 
  triggerToast, 
  onOpenHelp, 
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
        {!collapsed && setTheme && (
          <button
            onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
            }}
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
            {theme === 'dark' ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
            <span className="truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}
        {collapsed && setTheme && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

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
            <Avatar name="Niloy Pal" size="sm" />
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    Niloy Pal
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
          {profileOpen && !collapsed && (
            <div 
              className="absolute bottom-full left-0 right-0 mb-2 z-50 glass-elevated rounded-xl p-2 shadow-lg min-w-[180px]"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              {/* 1. User info header */}
              <div className="px-3 py-2 border-b border-[var(--border-default)] mb-1 text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Niloy Pal</p>
                <p className="text-xs text-[var(--text-muted)]">niloy@company.com</p>
              </div>

              {/* 2. Role switch section header */}
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] text-left">
                SWITCH ROLE
              </div>

              {/* 3. Two role option buttons */}
              {['admin', 'employee'].map((thisRole) => {
                const isCurrent = activeRole === thisRole;
                return (
                  <button
                    key={thisRole}
                    onClick={() => {
                      if (!isCurrent) {
                        onRoleSwitch();
                      }
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors text-left"
                    style={
                      isCurrent
                        ? { background: 'var(--accent-subtle)', color: 'var(--accent-text)' }
                        : { color: 'var(--text-secondary)' }
                    }
                    onMouseEnter={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.background = 'var(--bg-sunken)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full border border-[var(--border-strong)] shrink-0" />
                      )}
                      <div>
                        <div className={isCurrent ? 'font-semibold' : ''}>
                          {thisRole === 'admin' ? 'Admin View' : 'Employee View'}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {thisRole === 'admin' ? 'Full access' : 'Personal view'}
                        </div>
                      </div>
                    </div>
                    {isCurrent && <span className="text-xs">✓</span>}
                  </button>
                );
              })}

              {/* 4. Divider */}
              <div className="border-t border-[var(--border-default)] my-1" />

              {/* 5. Settings link */}
              <button
                onClick={() => {
                  navigate('/settings');
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
            </div>
          )}
        </div>
      </div>
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

    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border-default)] flex items-center justify-around px-2 py-2 h-16">
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
