// =============================================================================
// RFQ — Request for Quotation register with budget, due date and status.
// =============================================================================
import { useMemo, useState } from 'react';
import { Search, Plus, FileQuestion, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import AiRfqModal from './AiRfqModal';
import { usePermissions } from '../../hooks/usePermissions';
import { RFQS } from '../../data/mockData';
import { MODULES } from '../../utils/constants';
import { formatCompactINR, formatDate, daysUntil } from '../../utils/formatters';

export default function RFQ() {
  const [query, setQuery] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const { canCreate } = usePermissions();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RFQS;
    return RFQS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.rfqNumber.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [query]);

  const columns = [
    {
      key: 'rfqNumber',
      header: 'RFQ',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold text-primary-700">{r.rfqNumber}</p>
          <p className="truncate text-xs text-slate-500" title={r.title}>{r.title}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (r) => <span className="text-slate-600">{r.category}</span> },
    {
      key: 'budget',
      header: 'Budget',
      align: 'right',
      render: (r) => <span className="font-semibold text-slate-900">{formatCompactINR(r.budget)}</span>,
    },
    {
      key: 'quotationsReceived',
      header: 'Quotes',
      align: 'center',
      render: (r) => (
        <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {r.quotationsReceived}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (r) => {
        const d = daysUntil(r.dueDate);
        return (
          <div>
            <p className="text-slate-700">{formatDate(r.dueDate)}</p>
            <p className="text-xs text-slate-400">{d >= 0 ? `${d} day(s) left` : `${Math.abs(d)} day(s) ago`}</p>
          </div>
        );
      },
    },
    { key: 'priority', header: 'Priority', align: 'center', render: (r) => <StatusBadge status={r.priority} /> },
    { key: 'status', header: 'Status', align: 'center', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Request for Quotation"
        subtitle={`${RFQS.length} RFQs across all categories`}
        actions={
          canCreate(MODULES.RFQ) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiOpen(true)}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3.5 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
              >
                <Sparkles className="h-4 w-4" /> AI Draft
              </button>
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                <Plus className="h-4 w-4" /> New RFQ
              </button>
            </div>
          )
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search RFQ number, title or category…"
          className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        emptyIcon={FileQuestion}
        emptyTitle="No RFQs found"
        emptyDescription="Try adjusting your search query."
      />

      <AiRfqModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onUseDraft={(draft) => toast.success(`Draft ready: "${draft.title}" — wire to the New RFQ form to publish.`)}
      />
    </div>
  );
}
