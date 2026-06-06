// =============================================================================
// ActivityLogs — chronological audit trail across all modules.
// =============================================================================
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  LogIn,
  LogOut,
  Download,
  RefreshCw,
  Activity,
  Search,
} from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import { ACTIVITY_LOGS } from '../../data/mockData';
import { ACTIVITY_TYPES } from '../../utils/constants';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';

const TYPE_META = {
  [ACTIVITY_TYPES.CREATE]: { icon: Plus, tone: 'bg-primary-50 text-primary-600' },
  [ACTIVITY_TYPES.UPDATE]: { icon: Pencil, tone: 'bg-warning-50 text-warning-600' },
  [ACTIVITY_TYPES.DELETE]: { icon: Trash2, tone: 'bg-danger-50 text-danger-600' },
  [ACTIVITY_TYPES.APPROVE]: { icon: Check, tone: 'bg-success-50 text-success-600' },
  [ACTIVITY_TYPES.REJECT]: { icon: X, tone: 'bg-danger-50 text-danger-600' },
  [ACTIVITY_TYPES.LOGIN]: { icon: LogIn, tone: 'bg-slate-100 text-slate-600' },
  [ACTIVITY_TYPES.LOGOUT]: { icon: LogOut, tone: 'bg-slate-100 text-slate-600' },
  [ACTIVITY_TYPES.EXPORT]: { icon: Download, tone: 'bg-primary-50 text-primary-600' },
  [ACTIVITY_TYPES.STATUS_CHANGE]: { icon: RefreshCw, tone: 'bg-warning-50 text-warning-600' },
};

export default function ActivityLogs() {
  const [query, setQuery] = useState('');

  const logs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? ACTIVITY_LOGS.filter(
          (l) =>
            l.description.toLowerCase().includes(q) ||
            l.actor.toLowerCase().includes(q) ||
            l.module.toLowerCase().includes(q)
        )
      : ACTIVITY_LOGS;
    return [...base].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [query]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Activity Logs" subtitle="Full audit trail of actions across VendorBridge" />

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activity, actor or module…"
          className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={Activity} title="No activity found" description="Try adjusting your search query." />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <ol className="space-y-5">
            {logs.map((log) => {
              const meta = TYPE_META[log.type] || TYPE_META[ACTIVITY_TYPES.UPDATE];
              const Icon = meta.icon;
              return (
                <li key={log.id} className="flex gap-3">
                  <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">{log.description}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      <span className="font-medium text-slate-500">{log.actor}</span> · {log.module} ·{' '}
                      {formatDateTime(log.timestamp)} · {formatRelativeTime(log.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
