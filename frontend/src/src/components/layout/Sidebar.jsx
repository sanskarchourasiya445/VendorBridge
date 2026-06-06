// =============================================================================
// VendorBridge — Sidebar
// Dark, collapsible, role-aware navigation. The user footer is now an
// interactive menu (My Profile / Sign out) plus a quick sign-out icon.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
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
  ChevronUp,
  LogOut,
  User,
  Boxes,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, APP_TAGLINE, ROLE_LABELS } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

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

  const [menuOpen, setMenuOpen] = useState(false);
  const footerRef = useRef(null);

  // Close the footer menu on outside click / Escape.
  useEffect(() => {
    function onDoc(e) {
      if (footerRef.current && !footerRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
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

      {/* User footer (interactive) */}
      <div className="relative border-t border-sidebar-border p-3" ref={footerRef}>
        {/* Pop-up menu */}
        {menuOpen && !collapsed && (
          <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-lg border border-sidebar-border bg-[#111c33] shadow-xl">
            <div className="border-b border-sidebar-border px-3 py-2">
              <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[11px] text-sidebar-muted">{user?.email}</p>
            </div>
            <button
              onClick={() => { setMenuOpen(false); toast('Profile page coming soon'); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-white"
            >
              <User className="h-4 w-4" /> My Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-300 hover:bg-danger-600 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full items-center gap-3 rounded-lg bg-sidebar-hover/60 p-2 text-left transition-colors hover:bg-sidebar-hover"
          >
            <div
              className={clsx(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                user?.avatarColor || 'bg-primary-600'
              )}
            >
              {getInitials(user?.name || 'User')}
            </div>
            <div className="min-w-0 flex-1 animate-fade-in">
              <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[11px] text-sidebar-muted">{ROLE_LABELS[role] || 'Member'}</p>
            </div>
            <ChevronUp className={clsx('h-4 w-4 text-sidebar-muted transition-transform', menuOpen && 'rotate-180')} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-muted transition-colors hover:bg-danger-600 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}