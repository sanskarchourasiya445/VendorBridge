// =============================================================================
// PurchaseOrders — issued PO register with vendor, value and delivery status.
// =============================================================================
import { useMemo, useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { PURCHASE_ORDERS } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function PurchaseOrders() {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PURCHASE_ORDERS;
    return PURCHASE_ORDERS.filter(
      (p) =>
        p.poNumber.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q)
    );
  }, [query]);

  const columns = [
    {
      key: 'poNumber',
      header: 'PO Number',
      render: (p) => (
        <div>
          <p className="font-semibold text-primary-700">{p.poNumber}</p>
          <p className="text-xs text-slate-500">{p.items.length} line item(s)</p>
        </div>
      ),
    },
    { key: 'vendorName', header: 'Vendor', render: (p) => <span className="text-slate-700">{p.vendorName}</span> },
    {
      key: 'issuedDate',
      header: 'Issued',
      render: (p) => <span className="text-slate-600">{formatDate(p.issuedDate)}</span>,
    },
    {
      key: 'expectedDelivery',
      header: 'Expected',
      render: (p) => <span className="text-slate-600">{formatDate(p.expectedDelivery)}</span>,
    },
    {
      key: 'grandTotal',
      header: 'Value',
      align: 'right',
      render: (p) => <span className="font-semibold text-slate-900">{formatCurrency(p.grandTotal)}</span>,
    },
    { key: 'status', header: 'Status', align: 'center', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Purchase Orders" subtitle={`${PURCHASE_ORDERS.length} purchase orders issued`} />

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search PO number or vendor…"
          className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        emptyIcon={ShoppingCart}
        emptyTitle="No purchase orders found"
        emptyDescription="Try adjusting your search query."
      />
    </div>
  );
}
