// =============================================================================
// Topbar — sticky header: mobile menu toggle, page title, search,
// a working notifications popover, and a working user-profile dropdown.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS, ROLE_LABELS } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

function currentTitle(pathname) {
  const match = NAV_ITEMS.find((i) => pathname.startsWith(i.path));
  return match?.label || 'VendorBridge';
}

const NOTIFICATIONS = [
  { id: 1, text: 'Quotation QTN-2026-0010 received from Pragati Electricals', time: '2m ago' },
  { id: 2, text: 'PO-2026-0004 marked as Partially Received', time: '16h ago' },
  { id: 3, text: 'Invoice INV-KOS-1182 is overdue', time: '1d ago' },
];

/** Small hook: close a popover when clicking outside or pressing Escape. */
function useDismiss(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return ref;
}

export default function Topbar({ onOpenMobileNav }) {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const menuRef = useDismiss(() => setMenuOpen(false));
  const notifRef = useDismiss(() => setNotifOpen(false));

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

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
      <div className="relative ml-auto md:ml-2" ref={notifRef}>
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => { setNotifOpen((o) => !o); setMenuOpen(false); }}
          className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger-600 ring-2 ring-white" />
        </button>

        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <p className="text-sm font-semibold text-slate-800">Notifications</p>
              <span className="rounded-full bg-danger-100 px-2 py-0.5 text-[11px] font-semibold text-danger-700">
                {NOTIFICATIONS.length} new
              </span>
            </div>
            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {NOTIFICATIONS.map((n) => (
                <li key={n.id} className="px-4 py-3 hover:bg-slate-50">
                  <p className="text-sm text-slate-700">{n.text}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{n.time}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={() => { setNotifOpen(false); navigate('/activity-logs'); }}
              className="block w-full border-t border-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-primary-600 hover:bg-slate-50"
            >
              View all activity
            </button>
          </div>
        )}
      </div>

      {/* User chip + dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => { setMenuOpen((o) => !o); setNotifOpen(false); }}
          className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1 pl-1 pr-2 transition-colors hover:bg-slate-50"
        >
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
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="mt-1.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                {ROLE_LABELS[role]}
              </span>
            </div>
            <button
              onClick={() => { setMenuOpen(false); toast('Profile page coming soon'); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <User className="h-4 w-4 text-slate-400" /> My Profile
            </button>
            <button
              onClick={() => { setMenuOpen(false); toast('Settings coming soon'); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-400" /> Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}