// =============================================================================
// Vendors — searchable vendor master list with rating, spend and status.
// =============================================================================
import { useMemo, useState } from 'react';
import { Search, Plus, Building2, Star, Download } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { VENDORS } from '../../data/mockData';
import { MODULES } from '../../utils/constants';
import { formatCompactINR, getInitials, colorFromString } from '../../utils/formatters';

export default function Vendors() {
  const [query, setQuery] = useState('');
  const { canCreate, canExport } = usePermissions();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VENDORS;
    return VENDORS.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.gstin.toLowerCase().includes(q)
    );
  }, [query]);

  const columns = [
    {
      key: 'name',
      header: 'Vendor',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: colorFromString(v.name) }}
          >
            {getInitials(v.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{v.name}</p>
            <p className="text-xs text-slate-500">{v.code} · {v.contactPerson}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (v) => <span className="text-slate-600">{v.category}</span> },
    {
      key: 'location',
      header: 'Location',
      render: (v) => (
        <span className="text-slate-600">{v.city}, {v.state}</span>
      ),
    },
    { key: 'gstin', header: 'GSTIN', render: (v) => <span className="font-mono text-xs text-slate-500">{v.gstin}</span> },
    {
      key: 'rating',
      header: 'Rating',
      align: 'center',
      render: (v) => (
        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
          <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
          {v.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'totalSpend',
      header: 'Total Spend',
      align: 'right',
      render: (v) => <span className="font-semibold text-slate-900">{formatCompactINR(v.totalSpend)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (v) => <StatusBadge status={v.status} />,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Vendors"
        subtitle={`${VENDORS.length} vendors in your supplier network`}
        actions={
          <>
            {canExport(MODULES.VENDORS) && (
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Download className="h-4 w-4" /> Export
              </button>
            )}
            {canCreate(MODULES.VENDORS) && (
              <button className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                <Plus className="h-4 w-4" /> Add Vendor
              </button>
            )}
          </>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vendors, category, city or GSTIN…"
          className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        emptyIcon={Building2}
        emptyTitle="No vendors found"
        emptyDescription="Try adjusting your search query."
      />
    </div>
  );
}
