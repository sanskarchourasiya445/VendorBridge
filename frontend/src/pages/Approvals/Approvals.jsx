// =============================================================================
// Approvals — decision queue. Approvers can approve/reject pending items;
// state updates locally with toast feedback (persistence lands in a later phase).
// =============================================================================
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, ClipboardCheck, Filter } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { usePermissions } from '../../hooks/usePermissions';
import { APPROVALS } from '../../data/mockData';
import { APPROVAL_STATUS, MODULES } from '../../utils/constants';
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatDate, humanize } from '../../utils/formatters';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: APPROVAL_STATUS.PENDING, label: 'Pending' },
  { key: APPROVAL_STATUS.APPROVED, label: 'Approved' },
  { key: APPROVAL_STATUS.REJECTED, label: 'Rejected' },
];

export default function Approvals() {
  const navigate = useNavigate();
  const { canApprove } = usePermissions();
  const allowed = canApprove(MODULES.APPROVALS);
  const [items, setItems] = useState(APPROVALS);
  const [filter, setFilter] = useState('all');

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  const decide = (id, status) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status, decidedDate: new Date().toISOString().slice(0, 10) } : i
      )
    );
    const verb = status === APPROVAL_STATUS.APPROVED ? 'approved' : 'rejected';
    toast.success(`Request ${verb} successfully.`);
  };

  const pendingCount = items.filter((i) => i.status === APPROVAL_STATUS.PENDING).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Approvals"
        subtitle={`${pendingCount} item(s) awaiting your decision`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors " +
              (filter === f.key
                ? "bg-primary-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nothing to review"
          description="There are no items matching this filter."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/approvals/${a.id}`)}
              className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {humanize(a.type)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {a.refNumber}
                  </span>
                  <StatusBadge status={a.priority} />
                </div>
                <p className="mt-1.5 truncate font-semibold text-slate-900">
                  {a.title}
                </p>
                <p className="text-xs text-slate-500">
                  Requested by {a.requestedBy} · {formatDate(a.requestedDate)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(a.amount)}
                </span>
                {a.status === APPROVAL_STATUS.PENDING && allowed ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decide(a.id, APPROVAL_STATUS.REJECTED)}
                      onClick={(e) => {
                        e.stopPropagation();
                        decide(a.id, APPROVAL_STATUS.APPROVED);
                      }}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-1.5 text-sm font-semibold text-danger-700 hover:bg-danger-100"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                    <button
                      onClick={() => decide(a.id, APPROVAL_STATUS.APPROVED)}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-success-700"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  </div>
                ) : (
                  <StatusBadge status={a.status} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
