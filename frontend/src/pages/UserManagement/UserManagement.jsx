// =============================================================================
// UserManagement — team directory with roles, departments and status.
// Admin-only module (route is permission-gated in App.jsx).
// =============================================================================
import { useMemo, useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { USER_DIRECTORY } from '../../data/mockData';
import { ROLE_LABELS, MODULES } from '../../utils/constants';
import { formatRelativeTime, getInitials } from '../../utils/formatters';

export default function UserManagement() {
  const [query, setQuery] = useState('');
  const { canCreate } = usePermissions();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USER_DIRECTORY;
    return USER_DIRECTORY.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        (ROLE_LABELS[u.role] || '').toLowerCase().includes(q)
    );
  }, [query]);

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${u.avatarColor || 'bg-slate-500'}`}>
            {getInitials(u.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{u.name}</p>
            <p className="truncate text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
          {ROLE_LABELS[u.role] || u.role}
        </span>
      ),
    },
    { key: 'designation', header: 'Designation', render: (u) => <span className="text-slate-600">{u.designation}</span> },
    { key: 'department', header: 'Department', render: (u) => <span className="text-slate-600">{u.department}</span> },
    {
      key: 'lastLogin',
      header: 'Last Active',
      render: (u) => <span className="text-slate-500">{u.lastLogin ? formatRelativeTime(u.lastLogin) : '—'}</span>,
    },
    { key: 'status', header: 'Status', align: 'center', render: (u) => <StatusBadge status={u.status} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle={`${USER_DIRECTORY.length} users with platform access`}
        actions={
          canCreate(MODULES.USER_MANAGEMENT) && (
            <button className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              <UserPlus className="h-4 w-4" /> Invite User
            </button>
          )
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, role or department…"
          className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        emptyIcon={Users}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search query."
      />
    </div>
  );
}
