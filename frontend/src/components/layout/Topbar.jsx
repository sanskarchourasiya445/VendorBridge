// =============================================================================
// Topbar — sticky header: mobile menu toggle, breadcrumb-ish title, search,
// notifications, and the signed-in user chip.
// =============================================================================
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS, ROLE_LABELS } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

function currentTitle(pathname) {
  const match = NAV_ITEMS.find((i) => pathname.startsWith(i.path));
  return match?.label || 'VendorBridge';
}

export default function Topbar({ onOpenMobileNav }) {
  const { user, role } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h2 className="text-base font-semibold text-slate-800">{currentTitle(pathname)}</h2>

      {/* Search */}
      <div className="ml-auto hidden items-center md:flex">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors, POs, invoices…"
            className="w-72 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative ml-auto rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:ml-2"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger-600 ring-2 ring-white" />
      </button>

      {/* User chip */}
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1 pl-1 pr-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
            user?.avatarColor || 'bg-primary-600'
          }`}
        >
          {getInitials(user?.name || 'User')}
        </div>
        <div className="hidden leading-tight sm:block">
          <p className="text-[13px] font-semibold text-slate-800">{user?.name}</p>
          <p className="text-[11px] text-slate-500">{ROLE_LABELS[role]}</p>
        </div>
      </div>
    </header>
  );
}
