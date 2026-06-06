// =============================================================================
// VendorBridge — Sidebar
// Dark (#0f172a), collapsible, role-aware navigation with active states,
// a brand logo, and a user footer with logout.
// =============================================================================
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileSearch,
  ReceiptText,
  CheckCircle2,
  ClipboardList,
  FileText,
  BarChart3,
  History,
  Users,
  ChevronLeft,
  LogOut,
  Boxes,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, APP_TAGLINE, ROLE_LABELS } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

// Resolve the icon name stored in NAV_ITEMS to an actual lucide component.
const ICONS = {
  LayoutDashboard,
  Building2,
  FileSearch,
  ReceiptText,
  CheckCircle2,
  ClipboardList,
  FileText,
  BarChart3,
  History,
  Users,
};

export default function Sidebar({ collapsed = false, onToggleCollapse, onNavigate }) {
  const { allowedNavItems } = usePermissions();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={clsx(
        'flex h-full flex-col bg-sidebar text-sidebar-text transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 shadow-[0_4px_14px_-2px_rgba(26,86,219,0.6)]">
          <Boxes className="h-5 w-5 text-white" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <p className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-white">
              {APP_NAME}
            </p>
            <p className="truncate text-[11px] font-medium text-sidebar-muted">{APP_TAGLINE}</p>
          </div>
        )}
        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="ml-auto hidden rounded-md p-1.5 text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-white lg:block"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="mx-auto mt-3 hidden rotate-180 rounded-md p-1.5 text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-white lg:block"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
            Menu
          </p>
        )}
        {allowedNavItems.map((item) => {
          const Icon = ICONS[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  collapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-primary-600 text-white shadow-[0_6px_18px_-6px_rgba(26,86,219,0.7)]'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active accent bar */}
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/80" />
                  )}
                  <Icon
                    className={clsx(
                      'h-[18px] w-[18px] shrink-0 transition-transform',
                      !isActive && 'group-hover:scale-110'
                    )}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={clsx(
            'flex items-center gap-3 rounded-lg p-2',
            collapsed ? 'justify-center' : 'bg-sidebar-hover/60'
          )}
        >
          <div
            className={clsx(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
              user?.avatarColor || 'bg-primary-600'
            )}
          >
            {getInitials(user?.name || 'User')}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[11px] text-sidebar-muted">
                {ROLE_LABELS[role] || 'Member'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="rounded-md p-1.5 text-sidebar-muted transition-colors hover:bg-danger-600 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="mt-2 flex w-full items-center justify-center rounded-md p-2 text-sidebar-muted transition-colors hover:bg-danger-600 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
