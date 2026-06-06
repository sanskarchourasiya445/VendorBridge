// =============================================================================
// Quotations — vendor quotation register + AI-assisted comparison.
// Tab 1 "Register": flat searchable list of all received quotations.
// Tab 2 "Compare":  side-by-side comparison per RFQ with AI recommendation.
// =============================================================================
import { useMemo, useState } from 'react';
import { Search, FileText, List, GitCompareArrows } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import QuotationCompare from './QuotationCompare';
import { QUOTATIONS } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TABS = [
  { id: 'register', label: 'Register', icon: List },
  { id: 'compare', label: 'Compare', icon: GitCompareArrows },
];

export default function Quotations() {
  const [tab, setTab] = useState('register');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUOTATIONS;
    return QUOTATIONS.filter(
      (qt) =>
        qt.quotationNumber.toLowerCase().includes(q) ||
        qt.vendorName.toLowerCase().includes(q) ||
        qt.rfqNumber.toLowerCase().includes(q)
    );
  }, [query]);

  const columns = [
    {
      key: 'quotationNumber',
      header: 'Quotation',
      render: (q) => (
        <div className="min-w-0">
          <p className="font-semibold text-primary-700">{q.quotationNumber}</p>
          <p className="text-xs text-slate-500">against {q.rfqNumber}</p>
        </div>
      ),
    },
    { key: 'vendorName', header: 'Vendor', render: (q) => <span className="text-slate-700">{q.vendorName}</span> },
    {
      key: 'submittedDate',
      header: 'Submitted',
      render: (q) => <span className="text-slate-600">{formatDate(q.submittedDate)}</span>,
    },
    {
      key: 'deliveryDays',
      header: 'Delivery',
      align: 'center',
      render: (q) => <span className="text-slate-600">{q.deliveryDays} days</span>,
    },
    {
      key: 'grandTotal',
      header: 'Grand Total',
      align: 'right',
      render: (q) => <span className="font-semibold text-slate-900">{formatCurrency(q.grandTotal)}</span>,
    },
    { key: 'status', header: 'Status', align: 'center', render: (q) => <StatusBadge status={q.status} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Quotations" subtitle={`${QUOTATIONS.length} quotations received from vendors`} />

      {/* Tabs */}
      <div className="mb-5 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              tab === id ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'register' ? (
        <>
          <div className="mb-4 relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quotation, vendor or RFQ…"
              className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            emptyIcon={FileText}
            emptyTitle="No quotations found"
            emptyDescription="Try adjusting your search query."
          />
        </>
      ) : (
        <QuotationCompare />
      )}
    </div>
  );
}
